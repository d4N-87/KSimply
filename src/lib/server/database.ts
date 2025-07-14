// src/lib/server/database.ts
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import fs from 'fs/promises';
import path from 'path';

let SQL: SqlJsStatic | null = null;
// --- MODIFICA CHIAVE ---
// Non memorizziamo più l'oggetto `db` direttamente, ma la Promise che lo risolve.
let dbPromise: Promise<Database> | null = null;

async function initializeDatabase(): Promise<Database> {
	try {
		if (!SQL) {
			const wasmPath = path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
			// 1. Leggi il file come Buffer
			const wasmBinaryFile = await fs.readFile(wasmPath);
			// 2. Estrai l'ArrayBuffer sottostante. QUESTA E' LA RIGA CHIAVE.
			const wasmBinary = wasmBinaryFile.buffer; 
			
			// 3. Passa l'ArrayBuffer a initSqlJs
			SQL = await initSqlJs({ wasmBinary: wasmBinary as ArrayBuffer });
		}

		const dbFileBuffer = await fs.readFile('ksimply.db');
		const db = new SQL.Database(dbFileBuffer);
		console.log('[DB Helper] Database caricato in memoria con successo.');
		return db;
	} catch (error) {
		console.error('[DB Helper] Errore critico durante il caricamento del database:', error);
		dbPromise = null;
		throw new Error('Impossibile caricare il database.');
	}
}

/**
 * Ottiene una connessione al database.
 * Gestisce l'inizializzazione in modo atomico per prevenire race conditions.
 */
export function getDb(): Promise<Database> {
	if (!dbPromise) {
		// Se nessuna inizializzazione è in corso, ne avviamo una.
		dbPromise = initializeDatabase();
	}
	// Restituiamo sempre la promise. Se altre richieste arrivano mentre
	// la prima sta ancora caricando, riceveranno la stessa promise e
	// attenderanno che si risolva, senza avviare un nuovo caricamento.
	return dbPromise;
}