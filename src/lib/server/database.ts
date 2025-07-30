import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import fs from 'fs/promises';
import path from 'path';

let SQL: SqlJsStatic | null = null;
// [EN] We store the Promise that resolves to the database instance, not the instance itself.
// This prevents race conditions during initialization.
// ---
// [IT] Memorizziamo la Promise che risolve l'istanza del database, non l'istanza stessa.
// Questo previene race conditions durante l'inizializzazione.
let dbPromise: Promise<Database> | null = null;

/**
 * [EN] Initializes the SQL.js instance and loads the database file into memory.
 * This function is designed to be called only once.
 * ---
 * [IT] Inizializza l'istanza di SQL.js e carica il file del database in memoria.
 * Questa funzione è progettata per essere chiamata una sola volta.
 * @returns A Promise that resolves to the database instance.
 */
async function initializeDatabase(): Promise<Database> {
	try {
		if (!SQL) {
			// [EN] Locate and load the .wasm file required by SQL.js.
			// [IT] Individua e carica il file .wasm richiesto da SQL.js.
			const wasmPath = path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
			const wasmBinaryFile = await fs.readFile(wasmPath);
			const wasmBinary = wasmBinaryFile.buffer; 
			
			SQL = await initSqlJs({ wasmBinary: wasmBinary as ArrayBuffer });
		}

		// [EN] Load the physical database file from disk.
		// [IT] Carica il file fisico del database dal disco.
		const dbFileBuffer = await fs.readFile('ksimply.db');
		const db = new SQL.Database(dbFileBuffer);
		console.log('[DB Helper] Database caricato in memoria con successo.');
		return db;
	} catch (error) {
		console.error('[DB Helper] Errore critico durante il caricamento del database:', error);
		// [EN] Reset the promise on failure to allow for a retry on the next call.
		// [IT] Resetta la promise in caso di fallimento per permettere un nuovo tentativo alla prossima chiamata.
		dbPromise = null; 
		throw new Error('Impossibile caricare il database.');
	}
}

/**
 * [EN] Gets a connection to the database.
 * It handles initialization atomically to prevent race conditions.
 * This is an asynchronous singleton pattern.
 * ---
 * [IT] Ottiene una connessione al database.
 * Gestisce l'inizializzazione in modo atomico per prevenire race conditions.
 * Questo è un pattern singleton asincrono.
 * @returns A Promise that resolves to the database instance.
 */
export function getDb(): Promise<Database> {
	if (!dbPromise) {
		// [EN] If no initialization is in progress, start one.
		// [IT] Se nessuna inizializzazione è in corso, ne avviamo una.
		dbPromise = initializeDatabase();
	}
	// [EN] Always return the promise. Subsequent calls while the first is loading
	// will receive the same promise and wait for it to resolve.
	// ---
	// [IT] Restituiamo sempre la promise. Le chiamate successive mentre la prima
	// sta ancora caricando riceveranno la stessa promise e attenderanno che si risolva.
	return dbPromise;
}