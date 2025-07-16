// scripts/seed.ts (VERSIONE CSV con percorso robusto)
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url'; // <-- Importiamo un helper di Node.js

// --- NUOVA LOGICA PER I PERCORSI ---
// Otteniamo il percorso della directory in cui si trova questo script (seed.ts)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Costruiamo il percorso alla nostra cartella dei dati CSV partendo da lì
const dataFolderPath = path.join(__dirname, 'data');


// Funzione helper per leggere e parsare un file CSV
async function parseCsv<T>(fileName: string): Promise<T[]> {
    // Usiamo il percorso assoluto alla cartella dei dati
	const filePath = path.join(dataFolderPath, fileName);
	console.log(`   -> Lettura del file CSV: ${filePath}`);
	const csvFile = await fs.readFile(filePath, 'utf-8');
	return new Promise((resolve) => {
		Papa.parse<T>(csvFile, {
			header: true,
			dynamicTyping: true,
			complete: (results) => {
				resolve(results.data);
			}
		});
	});
}

async function seed() {
	console.log('🌱 Inizio del processo di seeding...');

	const db = await open({
		filename: './ksimply.db',
		driver: sqlite3.Database
	});
	console.log('🔗 Connessione al database stabilita.');

	// --- 1. PULIZIA ---
	console.log('🧹 Pulizia delle tabelle esistenti...');
	// ... (la logica di pulizia rimane identica)
	await db.exec('PRAGMA foreign_keys = OFF;');
	await db.exec('DELETE FROM model_encoder_compatibility;');
	await db.exec('DELETE FROM model_quantization_compatibility;');
	await db.exec('DELETE FROM model_vae_compatibility;');
	await db.exec('DELETE FROM quantization_gpu_requirements;');
	await db.exec('DELETE FROM gpus;');
	await db.exec('DELETE FROM base_models;');
	await db.exec('DELETE FROM quantizations;');
	await db.exec('DELETE FROM text_encoders;');
	await db.exec('DELETE FROM vaes;');
	await db.exec("DELETE FROM sqlite_sequence WHERE name IN ('gpus', 'base_models', 'quantizations', 'text_encoders', 'vaes');");
	await db.exec('PRAGMA foreign_keys = ON;');
	console.log('✅ Tabelle pulite.');

	// --- 2. LETTURA DAI CSV E POPOLAMENTO ENTITÀ ---
	console.log('🚚 Caricamento dati dai file CSV...');

	type GpuCsv = { name: string; vram_gb: number; family: string; fp8_support: string; fp4_support: string; };
	
	// Ora passiamo solo il nome del file alla nostra funzione helper
	const gpus = await parseCsv<GpuCsv>('gpus.csv');

	for (const gpu of gpus) {
        if (!gpu.name) continue;
		await db.run(
			'INSERT INTO gpus (name, vram_gb, family, fp8_support, fp4_support) VALUES (?, ?, ?, ?, ?)',
			gpu.name, gpu.vram_gb, gpu.family, gpu.fp8_support, gpu.fp4_support
		);
	}
	console.log(`   -> Inserite ${gpus.filter(g => g.name).length} GPU.`);

	console.log('⏳ Logica per le tabelle di giunzione da implementare...');

	// --- 3. CHIUSURA ---
	await db.close();
	console.log('🎉 Processo di seeding completato con successo!');
}

seed().catch((err) => {
	console.error('❌ Errore durante il processo di seeding:', err);
	process.exit(1);
});