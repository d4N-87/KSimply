// [EN] Server-side endpoint for handling the main analysis request.
// [IT] Endpoint lato server per la gestione della richiesta di analisi principale.
// Path: src/routes/+server.ts

import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database';
import { analyzeHardware } from '$lib/core/analyzer';
import type { UserHardware } from '$lib/core/types';

/**
 * [EN] Handles POST requests containing user hardware data.
 * It queries the database for all necessary model, encoder, and VAE data,
 * then passes everything to the core `analyzeHardware` function.
 * ---
 * [IT] Gestisce le richieste POST contenenti i dati hardware dell'utente.
 * Interroga il database per tutti i dati necessari su modelli, encoder e VAE,
 * quindi passa tutto alla funzione principale `analyzeHardware`.
 */
export const POST: RequestHandler = async ({ request }) => {
	const hardwareData: UserHardware = await request.json();

	try {
		const db = await getDb();

		// [EN] Fetch specific info for the user's selected GPU.
		// [IT] Recupera le informazioni specifiche per la GPU selezionata dall'utente.
		const gpuInfoStmt = db.prepare('SELECT * FROM gpus WHERE name = :name COLLATE NOCASE');
		const gpuInfo = gpuInfoStmt.getAsObject({ ':name': hardwareData.gpu }) as any;
		gpuInfoStmt.free();
		if (!gpuInfo) {
			return json({ success: false, message: 'GPU non trovata' }, { status: 404 });
		}

		// [EN] Fetch all model releases, joining with base models and quantizations to get full details.
		// [IT] Recupera tutte le release dei modelli, unendole con i modelli base e le quantizzazioni per ottenere i dettagli completi.
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

		// [EN] Fetch all encoder releases, joining to get names, quantizations, and compatibility info.
		// [IT] Recupera tutte le release degli encoder, unendole per ottenere nomi, quantizzazioni e informazioni di compatibilità.
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

		// [EN] Fetch all VAE releases, joining to get full details and compatibility.
		// [IT] Recupera tutte le release dei VAE, unendole per ottenere dettagli completi e compatibilità.
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

		// [EN] Call the core analysis logic with the user's hardware and all fetched data.
		// [IT] Chiama la logica di analisi principale con l'hardware dell'utente e tutti i dati recuperati.
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