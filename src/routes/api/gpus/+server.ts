// src/routes/api/gpus/+server.ts

// [EN] Import SvelteKit's JSON helper and our database helper.
// [IT] Importa l'helper JSON di SvelteKit e il nostro helper per il database.
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database';

// [EN] Reliably detect if the app is running in a Vercel production environment.
// [IT] Rileva in modo affidabile se l'app è in esecuzione in un ambiente di produzione Vercel.
const isProduction = process.env.VERCEL_ENV === 'production';

/**
 * [EN] Handles GET requests to fetch and return a sorted list of GPUs.
 * [IT] Gestisce le richieste GET per recuperare e restituire una lista ordinata di GPU.
 */
export async function GET() {
	try {
		const db = await getDb();
		const sql = 'SELECT id, name FROM gpus ORDER BY name ASC';

		// [EN] Use the correct method to fetch all rows based on the environment.
		// The Turso client returns results in a `rows` property, while the local client returns an array directly.
		// ---
		// [IT] Usa il metodo corretto per recuperare tutte le righe in base all'ambiente.
		// Il client Turso restituisce i risultati in una proprietà `rows`, mentre il client locale restituisce direttamente un array.
		const gpus = isProduction ? (await db.execute(sql)).rows : await db.all(sql);

		return json(gpus);
	} catch (error) {
		console.error('[API /api/gpus] Errore:', error);
		return json({ message: 'Errore nel recuperare la lista delle GPU' }, { status: 500 });
	}
}