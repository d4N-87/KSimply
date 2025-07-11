// src/routes/api/gpus/+server.ts

import { json } from '@sveltejs/kit';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import fs from 'fs/promises';
import path from 'path';

let SQL: SqlJsStatic | null = null;

export async function GET() {
    try {
        if (!SQL) {
            const wasmPath = path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
            const wasmBinaryFile = await fs.readFile(wasmPath);
            const wasmBinary = wasmBinaryFile.buffer;
            SQL = await initSqlJs({ wasmBinary });
        }

        const dbFileBuffer = await fs.readFile('ksimply.db');
        const db = new SQL.Database(dbFileBuffer);

        // Selezioniamo solo id e nome, e ordiniamo per nome per un menù a tendina più usabile
        const stmt = db.prepare('SELECT id, name FROM gpus ORDER BY name ASC');
        
        const gpus = [];
        while (stmt.step()) {
            gpus.push(stmt.getAsObject());
        }
        stmt.free();
        db.close();

        return json(gpus);

    } catch (error) {
        console.error('[API /api/gpus] Errore:', error);
        return json({ message: 'Errore nel recuperare la lista delle GPU' }, { status: 500 });
    }
}