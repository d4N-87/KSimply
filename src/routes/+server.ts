// src/routes/+server.ts

import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import fs from 'fs/promises';
import path from 'path';

let SQL: SqlJsStatic | null = null;

export const POST: RequestHandler = async ({ request }) => {
	// Il payload ora contiene solo 'gpu', 'ram', e 'storage'
	const hardwareData = await request.json();
	console.log('[API] Dati hardware ricevuti:', hardwareData);

	try {
		if (!SQL) {
			console.log('[API] Inizializzazione del motore SQL.js...');
			const wasmPath = path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
			const wasmBinaryFile = await fs.readFile(wasmPath);
			const wasmBinary = wasmBinaryFile.buffer;
			SQL = await initSqlJs({ wasmBinary });
		}

		const dbFileBuffer = await fs.readFile('ksimply.db');
		const db = new SQL.Database(dbFileBuffer);
		console.log('[API] Database caricato con successo in memoria.');

		// --- MODIFICA CHIAVE ---
		// La query ora seleziona tutte le colonne necessarie (`*`) invece di fare una seconda query.
		// Questo è più efficiente.
		const sql = 'SELECT * FROM gpus WHERE name = :name COLLATE NOCASE';
		const stmt = db.prepare(sql);

		const gpuInfo = stmt.getAsObject({ ':name': hardwareData.gpu });
		stmt.free();

		console.log('[API] Risultato query GPU:', gpuInfo);

		// Ora `gpuInfo` contiene già la VRAM e tutte le altre info dal DB.
		// La risposta al client include l'oggetto completo `gpuInfo`.
		const responseData = {
			success: true,
			gpu: gpuInfo || null // Se la GPU non viene trovata, `gpuInfo` sarà `undefined`, che diventa `null`
		};

		db.close();
		return json(responseData);
	} catch (error) {
		console.error("[API] Errore durante l'operazione con il database:", error);
		return json({ success: false, message: 'Errore interno del server' }, { status: 500 });
	}
};