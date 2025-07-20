// src/routes/+server.ts (VERSIONE AGGIORNATA CON JOIN PER 'priority')

import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database';
import { analyzeHardware } from '$lib/core/analyzer';
import type { UserHardware } from '$lib/core/types';

export const POST: RequestHandler = async ({ request }) => {
	const hardwareData: UserHardware = await request.json();

	try {
		const db = await getDb();
		const gpuInfoStmt = db.prepare('SELECT * FROM gpus WHERE name = :name COLLATE NOCASE');
		const gpuInfo = gpuInfoStmt.getAsObject({ ':name': hardwareData.gpu }) as any;
		gpuInfoStmt.free();
		if (!gpuInfo) {
			return json({ success: false, message: 'GPU non trovata' }, { status: 404 });
		}

		// QUERY 1: Recupera le release dei modelli con qualità E PRIORITÀ
		const modelsStmt = db.prepare(`
            SELECT mr.*, bm.name as model_name, bm.type as model_type, q.name as quantization_name, q.quality_score, q.priority
            FROM model_releases mr
            JOIN base_models bm ON mr.model_id = bm.id
            JOIN quantizations q ON mr.quantization_id = q.id
        `);
		const modelsData = [];
		while (modelsStmt.step()) {
			modelsData.push(modelsStmt.getAsObject());
		}
		modelsStmt.free();

		// QUERY 2: Recupera le release degli encoder con qualità E PRIORITÀ
		const encodersStmt = db.prepare(`
            SELECT ter.*, te.name as encoder_name, q.name as quantization_name, q.quality_score, q.priority, mec.model_id as compatible_with_model_id
            FROM text_encoder_releases ter
            JOIN text_encoders te ON ter.encoder_id = te.id
            JOIN quantizations q ON ter.quantization_id = q.id
            JOIN model_encoder_compatibility mec ON te.id = mec.encoder_id
        `);
		const encodersData = [];
		while (encodersStmt.step()) {
			encodersData.push(encodersStmt.getAsObject());
		}
		encodersStmt.free();

		// QUERY 3: Recupera le release dei VAE con qualità E PRIORITÀ
		const vaesStmt = db.prepare(`
            SELECT vr.*, v.name as vae_name, q.name as quantization_name, q.quality_score, q.priority, mvc.model_id as compatible_with_model_id
            FROM vae_releases vr
            JOIN vaes v ON vr.vae_id = v.id
            JOIN quantizations q ON vr.quantization_id = q.id
            JOIN model_vae_compatibility mvc ON v.id = mvc.vae_id
        `);
		const vaesData = [];
		while (vaesStmt.step()) {
			vaesData.push(vaesStmt.getAsObject());
		}
		vaesStmt.free();

		const analysisResults = analyzeHardware(hardwareData, gpuInfo, {
			models: modelsData as any,
			encoders: encodersData as any,
			vaes: vaesData as any
		});

		return json({ success: true, gpu: gpuInfo, analysis: analysisResults });
	} catch (error) {
		console.error("[API /] Errore catturato durante l'analisi:", error);
		return json({ success: false, message: 'Errore interno del server' }, { status: 500 });
	}
};