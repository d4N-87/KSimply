// src/routes/api/gpus/+server.ts
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database'; // Importiamo il nostro helper!

export async function GET() {
	try {
		const db = await getDb(); // Otteniamo la connessione al DB

		const stmt = db.prepare('SELECT id, name FROM gpus ORDER BY name ASC');
		const gpus = [];
		while (stmt.step()) {
			gpus.push(stmt.getAsObject());
		}
		stmt.free();
		// Non chiudiamo più il DB qui, rimane in memoria per altre richieste
		return json(gpus);
	} catch (error) {
		console.error('[API /api/gpus] Errore:', error);
		return json({ message: 'Errore nel recuperare la lista delle GPU' }, { status: 500 });
	}
}