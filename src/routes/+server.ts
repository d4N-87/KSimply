// src/routes/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database';
import { analyzeHardware, type RawRecipe } from '$lib/core/analyzer';
import type { UserHardware } from '$lib/core/types';

export const POST: RequestHandler = async ({ request }) => {
	const hardwareData: UserHardware = await request.json();

	try {
		const db = await getDb();

		// 1. Recupera le informazioni della GPU dell'utente
		const gpuInfoStmt = db.prepare('SELECT * FROM gpus WHERE name = :name COLLATE NOCASE');
		const gpuInfo = gpuInfoStmt.getAsObject({ ':name': hardwareData.gpu }) as any;
		gpuInfoStmt.free();

		if (!gpuInfo) {
			return json({ success: false, message: 'GPU non trovata nel database' }, { status: 404 });
		}

		// 2. Recupera tutte le possibili ricette dal database
		const recipesSql = `
            SELECT
                bm.name as model_name, bm.type as model_type, bm.base_vram_cost_gb,
                q.name as quantization_name, q.vram_multiplier, q.ram_multiplier, q.quality_score,
                te.name as text_encoder_name, te.base_vram_cost_gb as text_encoder_vram_cost,
                v.name as vae_name, v.base_vram_cost_gb as vae_vram_cost
            FROM
                base_models bm
            JOIN model_quantization_compatibility mqc ON bm.id = mqc.model_id
            JOIN quantizations q ON mqc.quantization_id = q.id
            JOIN model_encoder_compatibility mec ON bm.id = mec.model_id
            JOIN text_encoders te ON mec.encoder_id = te.id
            JOIN model_vae_compatibility mvc ON bm.id = mvc.model_id
            JOIN vaes v ON mvc.vae_id = v.id;
        `;
		const recipesStmt = db.prepare(recipesSql);
		const rawRecipes: RawRecipe[] = [];
		while (recipesStmt.step()) {
			rawRecipes.push(recipesStmt.getAsObject() as RawRecipe);
		}
		recipesStmt.free();

		// 3. Esegui l'analisi
		const analysisResults = analyzeHardware(hardwareData, gpuInfo, rawRecipes);

		// 4. Restituisci i risultati al client
		const responseData = {
			success: true,
			gpu: gpuInfo,
			analysis: analysisResults
		};

		return json(responseData);
	} catch (error) {
		console.error("[API] Errore durante l'analisi:", error);
		return json({ success: false, message: 'Errore interno del server' }, { status: 500 });
	}
};