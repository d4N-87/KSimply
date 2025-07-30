// [EN] API endpoint to retrieve a list of all available base model names.
// [IT] Endpoint API per recuperare la lista di tutti i nomi dei modelli base disponibili.
// Path: src/routes/api/models/+server.ts

import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database';

/**
 * [EN] Handles GET requests to fetch and return a sorted list of base model names from the database.
 * This is used, for example, to populate the "Show all models" section.
 * ---
 * [IT] Gestisce le richieste GET per recuperare e restituire una lista ordinata di nomi di modelli base dal database.
 * Viene usata, ad esempio, per popolare la sezione "Mostra tutti i modelli".
 */
export async function GET() {
	try {
		const db = await getDb();

		// [EN] Prepare and execute the SQL query to select all model names.
		// [IT] Prepara ed esegue la query SQL per selezionare tutti i nomi dei modelli.
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