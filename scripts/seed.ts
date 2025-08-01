// src/lib/server/database.ts

import { createClient, type Client } from '@libsql/client';
import { open, type Database } from 'sqlite';
import sqlite3 from 'sqlite3';

// [EN] Direct import of Vite's environment mode to check if we are in development.
// [IT] Import diretto della modalità ambiente di Vite per verificare se siamo in sviluppo.
const dev = process.env.NODE_ENV === 'development';

// [EN] Direct import of environment variables using Node.js `process.env`.
// [IT] Import diretto delle variabili d'ambiente usando `process.env` di Node.js.
const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

let db: any;

/**
 * [EN] Database connection helper (singleton).
 * It intelligently connects to the Turso cloud database in production
 * or to a local SQLite file during development.
 * ---
 * [IT] Helper per la connessione al database (singleton).
 * Si connette in modo intelligente al database cloud Turso in produzione
 * o a un file SQLite locale durante lo sviluppo.
 */
export async function getDb() {
	if (db) {
		return db;
	}

	if (dev) {
		// --- DEVELOPMENT ---
		console.log('[DB Helper] Connecting to local SQLite database (ksimply.db)');
		db = await open({
			filename: './ksimply.db',
			driver: sqlite3.Database
		});
	} else {
		// --- PRODUCTION ---
		console.log('[DB Helper] Connecting to Turso cloud database...');
		// [EN] We add a check to ensure env variables are loaded in production.
		// [IT] Aggiungiamo un controllo per assicurare che le variabili d'ambiente siano caricate in produzione.
		if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
			throw new Error('Database environment variables are not set in production.');
		}
		db = createClient({
			url: TURSO_DATABASE_URL,
			authToken: TURSO_AUTH_TOKEN
		});
	}

	return db;
}