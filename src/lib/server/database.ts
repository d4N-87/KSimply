// src/lib/server/database.ts
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import fs from 'fs/promises';
import path from 'path';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

/**
 * Inizializza il motore SQL.js e carica il database in memoria.
 * Utilizza un pattern singleton per assicurarsi che il DB sia caricato una sola volta.
 */
export async function getDb(): Promise<Database> {
	if (db) {
		return db;
	}

	try {
		if (!SQL) {
			const wasmPath = path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
			const wasmBinary = await fs.readFile(wasmPath);
			SQL = await initSqlJs({ wasmBinary });
		}

		const dbFileBuffer = await fs.readFile('ksimply.db');
		db = new SQL.Database(dbFileBuffer);
		console.log('[DB Helper] Database caricato in memoria con successo.');
		return db;
	} catch (error) {
		console.error('[DB Helper] Errore critico durante il caricamento del database:', error);
		// In un'app reale, potremmo voler gestire questo errore in modo più robusto
		throw new Error('Impossibile caricare il database.');
	}
}