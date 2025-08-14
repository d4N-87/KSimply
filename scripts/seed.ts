// [EN] This script seeds the LOCAL SQLite database from CSV files.
// [IT] Questo script popola il database SQLite LOCALE a partire da file CSV.
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

// [EN] Setup to get the correct directory path in an ES module environment.
// [IT] Setup per ottenere il percorso corretto della directory in un ambiente ES module.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFolderPath = path.join(__dirname, 'data');

/**
 * [EN] A generic utility to parse a CSV file into an array of objects.
 * [IT] Una utility generica per parsare un file CSV in un array di oggetti.
 */
async function parseCsv<T>(fileName: string): Promise<T[]> {
	const filePath = path.join(dataFolderPath, fileName);
	console.log(`   -> Lettura: ${path.basename(filePath)}`);
	const csvFile = await fs.readFile(filePath, 'utf-8');
	return new Promise((resolve) => {
		Papa.parse<T>(csvFile, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			comments: '#',
			complete: (results) => {
				const cleanedData = results.data.filter((item) => item != null);
				resolve(cleanedData);
			}
		});
	});
}

/**
 * [EN] Main function to orchestrate the entire database seeding process.
 * [IT] Funzione principale che orchestra l'intero processo di seeding del database.
 */
async function seed() {
	console.log('🌱 Inizio del processo di seeding...');
	const db = await open({ filename: './ksimply.db', driver: sqlite3.Database });
	console.log('🔗 Connessione al database stabilita.');

	// [EN] Step 1: Clean up existing tables to ensure a fresh start.
	// [IT] Passo 1: Pulisce le tabelle esistenti per garantire una partenza pulita.
	console.log('🧹 Pulizia delle tabelle...');
	await db.exec('PRAGMA foreign_keys = OFF;');
	const tables = ['model_encoder_compatibility', 'model_vae_compatibility', 'model_releases', 'text_encoder_releases', 'vae_releases', 'gpus', 'base_models', 'text_encoders', 'vaes', 'quantizations'];
	for (const table of tables) {
		await db.exec(`DROP TABLE IF EXISTS ${table};`);
	}

	// [EN] Try to reset autoincrement counters. This may fail if the table
	// doesn't exist, so we wrap it in a try-catch to prevent a crash.
	// ---
	// [IT] Prova a resettare i contatori di autoincremento. Potrebbe fallire se la tabella
	// non esiste, quindi lo inseriamo in un blocco try-catch per prevenire un crash.
	try {
		await db.exec('DELETE FROM sqlite_sequence;');
	} catch (error) {
		console.log("   -> Tabella sqlite_sequence non trovata, reset saltato (normale).");
	}

	console.log('✅ Tabelle eliminate.');

	// [EN] Step 1.1: Recreate the database schema from scratch.
	// [IT] Passo 1.1: Ricrea lo schema del database da zero.
	console.log('🏗️ Creazione della nuova struttura delle tabelle...');
	await db.exec(`
		CREATE TABLE "base_models" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL UNIQUE, "type" TEXT NOT NULL);
		CREATE TABLE "gpus" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL UNIQUE, "vram_gb" INTEGER NOT NULL, "family" TEXT, "fp8_support" TEXT, "fp4_support" TEXT);
		CREATE TABLE "text_encoders" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL UNIQUE);
		CREATE TABLE "vaes" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL UNIQUE);
		CREATE TABLE "quantizations" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT NOT NULL UNIQUE, "quality_score" INTEGER NOT NULL, "priority" INTEGER NOT NULL DEFAULT 0);
		CREATE TABLE "model_encoder_compatibility" ("model_id" INTEGER NOT NULL, "encoder_id" INTEGER NOT NULL, PRIMARY KEY (model_id, encoder_id), FOREIGN KEY(model_id) REFERENCES base_models(id) ON DELETE CASCADE, FOREIGN KEY(encoder_id) REFERENCES text_encoders(id) ON DELETE CASCADE);
		CREATE TABLE "model_releases" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "model_id" INTEGER NOT NULL, "quantization_id" INTEGER NOT NULL, "file_size_gb" REAL NOT NULL, "repository" TEXT, FOREIGN KEY(model_id) REFERENCES base_models(id) ON DELETE CASCADE, FOREIGN KEY(quantization_id) REFERENCES quantizations(id) ON DELETE CASCADE);
		CREATE TABLE "model_vae_compatibility" ("model_id" INTEGER NOT NULL, "vae_id" INTEGER NOT NULL, PRIMARY KEY (model_id, vae_id), FOREIGN KEY(model_id) REFERENCES base_models(id) ON DELETE CASCADE, FOREIGN KEY(vae_id) REFERENCES vaes(id) ON DELETE CASCADE);
		CREATE TABLE "text_encoder_releases" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "encoder_id" INTEGER NOT NULL, "quantization_id" INTEGER NOT NULL, "file_size_gb" REAL NOT NULL, "repository" TEXT, FOREIGN KEY(encoder_id) REFERENCES text_encoders(id) ON DELETE CASCADE, FOREIGN KEY(quantization_id) REFERENCES quantizations(id) ON DELETE CASCADE);
		CREATE TABLE "vae_releases" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "vae_id" INTEGER NOT NULL, "quantization_id" INTEGER NOT NULL, "file_size_gb" REAL NOT NULL, "repository" TEXT, FOREIGN KEY(vae_id) REFERENCES vaes(id) ON DELETE CASCADE, FOREIGN KEY(quantization_id) REFERENCES quantizations(id) ON DELETE CASCADE);
	`);
	await db.exec('PRAGMA foreign_keys = ON;');
	console.log('✅ Nuova struttura creata.');

	// [EN] Step 2: Load all data from CSV files into memory.
	// [IT] Passo 2: Carica tutti i dati dai file CSV in memoria.
	console.log('🚚 Caricamento dati dai file CSV...');
	const gpus = await parseCsv<any>('gpus.csv');
	const base_models = await parseCsv<any>('base_models.csv');
	const text_encoders = await parseCsv<any>('text_encoders.csv');
	const vaes = await parseCsv<any>('vaes.csv');
	const quantizations = await parseCsv<any>('quantizations.csv');
	const model_releases = await parseCsv<any>('model_releases.csv');
	const text_encoder_releases = await parseCsv<any>('text_encoder_releases.csv');
	const vae_releases = await parseCsv<any>('vae_releases.csv');
	const model_compatibilities = await parseCsv<any>('model_compatibilities.csv');

	// [EN] Step 3: Populate core tables and create name-to-ID maps for later use.
	// [IT] Passo 3: Popola le tabelle principali e crea mappe nome-ID per uso futuro.
	console.log('📝 Inserimento anagrafiche e creazione mappe ID...');
	const nameToIdMaps: { [key: string]: Map<string, number> } = {};
	const anagrafiche = [
		{ name: 'gpus', data: gpus, cols: '(name, vram_gb, family, fp8_support, fp4_support)', vals: [':name', ':vram_gb', ':family', ':fp8_support', ':fp4_support'] },
		{ name: 'base_models', data: base_models, cols: '(name, type)', vals: [':name', ':type'] },
		{ name: 'text_encoders', data: text_encoders, cols: '(name)', vals: [':name'] },
		{ name: 'vaes', data: vaes, cols: '(name)', vals: [':name'] },
		{ name: 'quantizations', data: quantizations, cols: '(name, quality_score, priority)', vals: [':name', ':quality_score', ':priority'] }
	];
	for (const anag of anagrafiche) {
		const stmt = await db.prepare(`INSERT INTO ${anag.name} ${anag.cols} VALUES (${anag.vals.map((v) => v.replace(':', '@')).join(',')})`);
		for (const item of anag.data) {
			if (item) {
				const params: { [key: string]: any } = {};
				anag.vals.forEach((v) => {
					const key = v.replace(':', '');
					params[`@${key}`] = item[key] ?? null;
				});
				await stmt.run(params);
			}
		}
		await stmt.finalize();

		const itemsFromDb = await db.all(`SELECT id, name FROM ${anag.name}`);
		nameToIdMaps[anag.name] = new Map(itemsFromDb.map((i) => [i.name, i.id]));
		console.log(`   -> Inseriti ${itemsFromDb.length} record in ${anag.name}.`);
	}

	// [EN] Step 4: Populate "release" tables, using the maps to link foreign keys.
	// [IT] Passo 4: Popola le tabelle "release", usando le mappe per collegare le chiavi esterne.
	console.log('📦 Inserimento delle versioni specifiche (releases)...');
	for (const release of model_releases) { if (release && release.model_name) { await db.run('INSERT INTO model_releases (model_id, quantization_id, file_size_gb, repository) VALUES (?, ?, ?, ?)', nameToIdMaps['base_models'].get(release.model_name), nameToIdMaps['quantizations'].get(release.quantization_name), release.file_size_gb, release.repository); } }
	console.log(`   -> Inserite ${model_releases.length} versioni di modelli.`);
	for (const release of text_encoder_releases) { if (release && release.encoder_name) { await db.run('INSERT INTO text_encoder_releases (encoder_id, quantization_id, file_size_gb, repository) VALUES (?, ?, ?, ?)', nameToIdMaps['text_encoders'].get(release.encoder_name), nameToIdMaps['quantizations'].get(release.quantization_name), release.file_size_gb, release.repository); } }
	console.log(`   -> Inserite ${text_encoder_releases.length} versioni di text encoder.`);
	for (const release of vae_releases) { if (release && release.vae_name) { await db.run('INSERT INTO vae_releases (vae_id, quantization_id, file_size_gb, repository) VALUES (?, ?, ?, ?)', nameToIdMaps['vaes'].get(release.vae_name), nameToIdMaps['quantizations'].get(release.quantization_name), release.file_size_gb, release.repository); } }
	console.log(`   -> Inserite ${vae_releases.length} versioni di VAE.`);

	// [EN] Step 5: Populate join tables to create compatibility relationships.
	// [IT] Passo 5: Popola le tabelle di giunzione per creare le relazioni di compatibilità.
	console.log('🔗 Creazione dei collegamenti di compatibilità...');
	for (const comp of model_compatibilities) {
		if (comp && comp.model_name) {
			process.stdout.write(`- Analisi compatibilità per il modello: "${comp.model_name}"... `);
			const modelId = nameToIdMaps['base_models'].get(comp.model_name);

			if (!modelId) {
				process.stdout.write(`ERRORE: Modello base non trovato!\n`);
				continue;
			}

			const encoders = comp.compatible_text_encoders.split('|');
			for (const teName of encoders) {
				const trimmedTeName = teName.trim();
				const teId = nameToIdMaps['text_encoders'].get(trimmedTeName);
				if (teId) {
					await db.run('INSERT OR IGNORE INTO model_encoder_compatibility (model_id, encoder_id) VALUES (?, ?)', modelId, teId);
				} else {
					process.stdout.write(`ERRORE: Text Encoder "${trimmedTeName}" non trovato! `);
				}
			}

			const vaes = comp.compatible_vaes.split('|');
			for (const vaeName of vaes) {
				const trimmedVaeName = vaeName.trim();
				const vaeId = nameToIdMaps['vaes'].get(trimmedVaeName);
				if (vaeId) {
					await db.run('INSERT OR IGNORE INTO model_vae_compatibility (model_id, vae_id) VALUES (?, ?)', modelId, vaeId);
				} else {
					process.stdout.write(`ERRORE: VAE "${trimmedVaeName}" non trovato! `);
				}
			}
			process.stdout.write('OK\n');
		}
	}
	console.log('✅ Collegamenti creati con successo.');

	// [EN] Step 6: Close the database connection.
	// [IT] Passo 6: Chiude la connessione al database.
	await db.close();
	console.log('🎉 Processo di seeding completato con successo!');
}

// [EN] Execute the seed function and handle potential errors.
// [IT] Esegue la funzione di seed e gestisce i potenziali errori.
seed().catch((err) => {
	console.error('❌ Errore durante il processo di seeding:', err);
	process.exit(1);
});