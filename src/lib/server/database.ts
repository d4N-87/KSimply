// src/lib/server/database.ts

// [EN] Import the Turso client for production and Node.js environment variables.
// [IT] Importa il client Turso per la produzione e le variabili d'ambiente di Node.js.
import { createClient } from '@libsql/client';
const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, VERCEL_ENV } = process.env;

// [EN] Reliably detect if the app is running in a Vercel production environment.
// [IT] Rileva in modo affidabile se l'app è in esecuzione in un ambiente di produzione Vercel.
const isProduction = VERCEL_ENV === 'production';

// [EN] A singleton instance to hold the database connection client.
// [IT] Un'istanza singleton per mantenere il client di connessione al database.
let db: any;

/**
 * [EN] Database connection helper (singleton).
 * It connects to Turso in production or dynamically loads the local SQLite
 * driver for development. This prevents the local driver from being bundled in production.
 * ---
 * [IT] Helper per la connessione al database (singleton).
 * Si connette a Turso in produzione o carica dinamicamente il driver SQLite
 * locale per lo sviluppo. Questo impedisce che il driver locale venga incluso nel bundle di produzione.
 */
export async function getDb() {
	if (db) return db;

	if (isProduction) {
		// --- PRODUCTION ENVIRONMENT (Vercel) ---
		console.log('[DB Helper] Production environment detected. Connecting to Turso...');
		if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
			throw new Error('Database environment variables are not set in production.');
		}
		db = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });
	} else {
		// --- DEVELOPMENT ENVIRONMENT (Local) ---
		console.log('[DB Helper] Development environment detected. Connecting to local SQLite file...');
		// [EN] Dynamically import local DB packages to avoid bundling them in production.
		// [IT] Importa dinamicamente i pacchetti DB locali per evitare di includerli nel bundle di produzione.
		const { open } = await import('sqlite');
		const sqlite3 = await import('sqlite3');
		db = await open({
			filename: './ksimply.db',
			driver: sqlite3.default.Database
		});
	}
	return db;
}