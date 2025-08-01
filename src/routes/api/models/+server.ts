// src/routes/api/models/+server.ts

// [EN] Import SvelteKit's JSON helper and our database helper.
// [IT] Importa l'helper JSON di SvelteKit e il nostro helper per il database.
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/database';

// [EN] Reliably detect if the app is running in a Vercel production environment.
// [IT] Rileva in modo affidabile se l'app è in esecuzione in un ambiente di produzione Vercel.
const isProduction = process.env.VERCEL_ENV === 'production';

/**
 * [EN] Handles GET requests to fetch and return a sorted list of base model names.
 * [IT] Gestisce le richieste GET per recuperare e restituire una lista ordinata di nomi di modelli base.
 */
export async function GET() {
	try {
		const db = await getDb();
		const sql = 'SELECT name FROM base_models ORDER BY name ASC';

		// [EN] Use the correct method to fetch all rows based on the environment.
		// [IT] Usa il metodo corretto per recuperare tutte le righe in base all'ambiente.
		const result = isProduction ? (await db.execute(sql)).rows : await db.all(sql);
		
		// [EN] Extract just the name from each row object.
		// [IT] Estrae solo il nome da ogni oggetto riga.
		const modelNames = (result as { name: string }[]).map(row => row.name);
		return json(modelNames);
	} catch (error) {
		console.error('[API /api/models] Errore:', error);
		return json({ message: 'Errore nel recuperare la lista dei modelli' }, { status: 500 });
	}
}