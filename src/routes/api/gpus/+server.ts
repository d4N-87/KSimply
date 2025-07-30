// [EN] API endpoint to retrieve a list of all available GPUs.
// [IT] Endpoint API per recuperare la lista di tutte le GPU disponibili.
// Path: src/routes/api/gpus/+server.ts

import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database';

/**
 * [EN] Handles GET requests to fetch and return a sorted list of GPUs from the database.
 * It uses a singleton database connection helper to ensure efficiency.
 * ---
 * [IT] Gestisce le richieste GET per recuperare e restituire una lista ordinata di GPU dal database.
 * Utilizza un helper per la connessione al database (singleton) per garantire l'efficienza.
 */
export async function GET() {
	try {
		// [EN] Get a memoized database connection instance.
		// [IT] Ottiene un'istanza memoizzata della connessione al database.
		const db = await getDb();

		// [EN] Prepare and execute the SQL query to select all GPUs.
		// [IT] Prepara ed esegue la query SQL per selezionare tutte le GPU.
		const stmt = db.prepare('SELECT id, name FROM gpus ORDER BY name ASC');
		const gpus = [];
		while (stmt.step()) {
			gpus.push(stmt.getAsObject());
		}
		stmt.free();

		// [EN] The database connection is intentionally left open for subsequent requests.
		// [IT] La connessione al database viene lasciata intenzionalmente aperta per le richieste successive.
		return json(gpus);
	} catch (error) {
		console.error('[API /api/gpus] Errore:', error);
		return json({ message: 'Errore nel recuperare la lista delle GPU' }, { status: 500 });
	}
}