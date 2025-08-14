// src/routes/+server.ts

import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database';
import { analyzeHardware } from '$lib/core/analyzer';
import type { UserHardware } from '$lib/core/types';

// [EN] Reliably detect if the app is running in a Vercel production environment.
// [IT] Rileva in modo affidabile se l'app è in esecuzione in un ambiente di produzione Vercel.
const isProduction = process.env.VERCEL_ENV === 'production';

// [EN] In-memory cache for the database queries.
// [IT] Cache in-memory per le query al database.
let cachedModelsData: any[] | null = null;
let cachedEncodersData: any[] | null = null;
let cachedVaesData: any[] | null = null;

/**
 * [EN] Handles POST requests containing user hardware data for analysis.
 * [IT] Gestisce le richieste POST contenenti i dati hardware dell'utente per l'analisi.
 */
export const POST: RequestHandler = async ({ request }) => {
	const hardwareData: UserHardware = await request.json();

	try {
		const db = await getDb();

		// [EN] Fetch specific info for the user's selected GPU using a compatible query.
		// [IT] Recupera le informazioni specifiche per la GPU selezionata usando una query compatibile.
		const gpuSql = 'SELECT * FROM gpus WHERE name = ? COLLATE NOCASE';
		const gpuResult = isProduction ? (await db.execute({ sql: gpuSql, args: [hardwareData.gpu] })).rows : await db.all(gpuSql, [hardwareData.gpu]);
		const gpuInfo = gpuResult[0];

		if (!gpuInfo) {
			return json({ success: false, message: 'GPU non trovata' }, { status: 404 });
		}

		// [EN] Fetch all necessary data using environment-aware queries, using a cache on subsequent runs.
		// [IT] Recupera tutti i dati necessari usando query consapevoli dell'ambiente, usando una cache nelle esecuzioni successive.
		if (!cachedModelsData || !cachedEncodersData || !cachedVaesData) {
			console.log('CACHE MISS - Esecuzione delle query al database...');
			const modelsSql = `
				SELECT mr.*, bm.name as model_name, bm.type as model_type, q.name as quantization_name, q.quality_score, q.priority, mr.repository
				FROM model_releases mr
				JOIN base_models bm ON mr.model_id = bm.id
				JOIN quantizations q ON mr.quantization_id = q.id
			`;
			cachedModelsData = isProduction ? (await db.execute(modelsSql)).rows : await db.all(modelsSql);

			const encodersSql = `
				SELECT ter.*, te.name as encoder_name, q.name as quantization_name, q.quality_score, q.priority, mec.model_id as compatible_with_model_id, ter.repository
				FROM text_encoder_releases ter
				JOIN text_encoders te ON ter.encoder_id = te.id
				JOIN quantizations q ON ter.quantization_id = q.id
				JOIN model_encoder_compatibility mec ON te.id = mec.encoder_id
			`;
			cachedEncodersData = isProduction ? (await db.execute(encodersSql)).rows : await db.all(encodersSql);

			const vaesSql = `
				SELECT vr.*, v.name as vae_name, q.name as quantization_name, q.quality_score, q.priority, mvc.model_id as compatible_with_model_id, vr.repository
				FROM vae_releases vr
				JOIN vaes v ON vr.vae_id = v.id
				JOIN quantizations q ON vr.quantization_id = q.id
				JOIN model_vae_compatibility mvc ON v.id = mvc.vae_id
			`;
			cachedVaesData = isProduction ? (await db.execute(vaesSql)).rows : await db.all(vaesSql);
		} else {
			console.log('CACHE HIT - Utilizzo dei dati dalla cache.');
		}

		// [EN] Call the core analysis logic with the user's hardware and all fetched data.
		// [IT] Chiama la logica di analisi principale con l'hardware dell'utente e tutti i dati recuperati.
		const analysisResults = analyzeHardware(hardwareData, gpuInfo, {
			models: cachedModelsData as any,
			encoders: cachedEncodersData as any,
			vaes: cachedVaesData as any
		});

		return json({ success: true, gpu: gpuInfo, analysis: analysisResults });
	} catch (error) {
		console.error("[API /] Errore catturato durante l'analisi:", error);
		return json({ success: false, message: 'Errore interno del server' }, { status: 500 });
	}
};