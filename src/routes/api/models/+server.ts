// src/routes/api/models/+server.ts
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database';

export async function GET() {
	try {
		const db = await getDb();

		const stmt = db.prepare('SELECT name FROM base_models ORDER BY name ASC');
		const modelNames: string[] = [];
		while (stmt.step()) {
			const row = stmt.getAsObject();
			modelNames.push(row.name as string);
		}
		stmt.free();

		return json(modelNames);
	} catch (error) {
		console.error('[API /api/models] Errore:', error);
		return json({ message: 'Errore nel recuperare la lista dei modelli' }, { status: 500 });
	}
}