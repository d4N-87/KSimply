// src/routes/+server.ts

import type { RequestHandler, RequestEvent } from './$types'; // <-- PRIMA MODIFICA QUI
import Database from 'better-sqlite3';
import { json } from '@sveltejs/kit';

const db = new Database('ksimply.db', { readonly: true });

export const POST: RequestHandler = async ({ request }: RequestEvent) => { // <-- SECONDA MODIFICA QUI
	const hardwareData = await request.json();
	console.log('[API] Dati hardware ricevuti:', hardwareData);

	const stmt = db.prepare('SELECT * FROM gpus WHERE name = ?');
	const gpuInfo = stmt.get(hardwareData.gpu);

	console.log('[API] Risultato query GPU:', gpuInfo);

	const responseData = {
		success: true,
		gpu: gpuInfo || null
	};

	return json(responseData);
};