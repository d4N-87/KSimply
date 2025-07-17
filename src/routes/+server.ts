// src/routes/+server.ts (FINALE E FUNZIONANTE)

import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database';
import { analyzeHardware, type RawRecipe } from '$lib/core/analyzer';
import type { UserHardware } from '$lib/core/types';

export const POST: RequestHandler = async ({ request }) => {
	const hardwareData: UserHardware = await request.json();

	try {
		const db = await getDb();

		const gpuInfoStmt = db.prepare('SELECT * FROM gpus WHERE name = :name COLLATE NOCASE');
		const gpuInfo = gpuInfoStmt.getAsObject({ ':name': hardwareData.gpu }) as any;
		gpuInfoStmt.free();

		if (!gpuInfo) {
			return json({ success: false, message: 'GPU non trovata nel database' }, { status: 404 });
		}

		const recipesSql = `
            SELECT
                mr.id as model_release_id, ter.id as text_encoder_release_id, vr.id as vae_release_id,
                bm.name as model_name, bm.type as model_type, q_model.name as model_quantization,
                te.name as text_encoder_name, q_te.name as text_encoder_quantization,
                v.name as vae_name, q_vae.name as vae_quantization,
                q_model.quality_score,
                mr.file_size_gb as model_file_size,
                ter.file_size_gb as text_encoder_file_size,
                vr.file_size_gb as vae_file_size
            FROM model_releases mr
            JOIN base_models bm ON mr.model_id = bm.id
            JOIN quantizations q_model ON mr.quantization_id = q_model.id
            JOIN model_encoder_compatibility mec ON bm.id = mec.model_id
            JOIN text_encoders te ON mec.encoder_id = te.id
            JOIN text_encoder_releases ter ON te.id = ter.encoder_id
            JOIN model_vae_compatibility mvc ON bm.id = mvc.model_id
            JOIN vaes v ON mvc.vae_id = v.id
            JOIN vae_releases vr ON v.id = vr.vae_id
            JOIN quantizations q_te ON ter.quantization_id = q_te.id
            JOIN quantizations q_vae ON vr.quantization_id = q_vae.id
        `;
		const recipesStmt = db.prepare(recipesSql);
		const rawRecipes: RawRecipe[] = [];
		while (recipesStmt.step()) {
			rawRecipes.push(recipesStmt.getAsObject() as unknown as RawRecipe);
		}
		recipesStmt.free();

		// Eseguiamo l'analisi con la nuova logica
		const analysisResults = analyzeHardware(hardwareData, gpuInfo, rawRecipes);

		// Restituiamo i risultati finali al client
		const responseData = {
			success: true,
			gpu: gpuInfo,
			analysis: analysisResults
		};

		return json(responseData);
	} catch (error) {
		console.error("[API] Errore catturato durante l'analisi:", error);
		return json({ success: false, message: 'Errore interno del server' }, { status: 500 });
	}
};