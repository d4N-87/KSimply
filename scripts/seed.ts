// scripts/seed.ts (ARCHITETTURA FINALE)
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFolderPath = path.join(__dirname, 'data');

async function parseCsv<T>(fileName: string): Promise<T[]> {
	const filePath = path.join(dataFolderPath, fileName);
	console.log(`   -> Lettura: ${path.basename(filePath)}`);
	const csvFile = await fs.readFile(filePath, 'utf-8');
	return new Promise((resolve) => {
		Papa.parse<T>(csvFile, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			complete: (results) => resolve(results.data)
		});
	});
}

async function seed() {
	console.log('🌱 Inizio del processo di seeding...');
	const db = await open({ filename: './ksimply.db', driver: sqlite3.Database });
	console.log('🔗 Connessione al database stabilita.');

	// --- 1. PULIZIA ---
	console.log('🧹 Pulizia delle tabelle...');
	await db.exec('PRAGMA foreign_keys = OFF;');
	const tables = ['model_encoder_compatibility', 'model_vae_compatibility', 'model_releases', 'text_encoder_releases', 'vae_releases', 'gpus', 'base_models', 'text_encoders', 'vaes', 'quantizations'];
	for (const table of tables) { await db.exec(`DELETE FROM ${table};`); }
	await db.exec("DELETE FROM sqlite_sequence;");
	await db.exec('PRAGMA foreign_keys = ON;');
	console.log('✅ Tabelle pulite.');

	// --- 2. LETTURA DATI DAI CSV ---
	console.log('🚚 Caricamento dati dai file CSV...');
	const gpus = await parseCsv<{ name: string; vram_gb: number; family: string; fp8_support: string; fp4_support: string; }>('gpus.csv');
	const base_models = await parseCsv<{ name: string; type: string; }>('base_models.csv');
	const text_encoders = await parseCsv<{ name: string; }>('text_encoders.csv');
	const vaes = await parseCsv<{ name: string; }>('vaes.csv');
	const quantizations = await parseCsv<{ name: string; quality_score: number; }>('quantizations.csv');
	const model_releases = await parseCsv<{ model_name: string; quantization_name: string; vram_cost_gb: number; ram_cost_gb: number; }>('model_releases.csv');
	const text_encoder_releases = await parseCsv<{ encoder_name: string; quantization_name: string; vram_cost_gb: number; ram_cost_gb: number; }>('text_encoder_releases.csv');
	const vae_releases = await parseCsv<{ vae_name: string; quantization_name: string; vram_cost_gb: number; ram_cost_gb: number; }>('vae_releases.csv');
	const model_compatibilities = await parseCsv<{ model_name: string; compatible_text_encoders: string; compatible_vaes: string; }>('model_compatibilities.csv');

	// --- 3. POPOLAMENTO ANAGRAFICHE E CREAZIONE MAPPE ---
	console.log('📝 Inserimento anagrafiche e creazione mappe ID...');
	const nameToIdMaps: { [key: string]: Map<string, number> } = {};

	const anagrafiche = [
		{ name: 'gpus', data: gpus, cols: '(name, vram_gb, family, fp8_support, fp4_support)', vals: [':name', ':vram_gb', ':family', ':fp8_support', ':fp4_support'] },
		{ name: 'base_models', data: base_models, cols: '(name, type)', vals: [':name', ':type'] },
		{ name: 'text_encoders', data: text_encoders, cols: '(name)', vals: [':name'] },
		{ name: 'vaes', data: vaes, cols: '(name)', vals: [':name'] },
		{ name: 'quantizations', data: quantizations, cols: '(name, quality_score)', vals: [':name', ':quality_score'] }
	];

	for (const anag of anagrafiche) {
		for (const item of anag.data) { await db.run(`INSERT INTO ${anag.name} ${anag.cols} VALUES (${anag.vals.map(() => '?').join(',')})`, ...Object.values(item)); }
		const itemsFromDb = await db.all(`SELECT id, name FROM ${anag.name}`);
		nameToIdMaps[anag.name] = new Map(itemsFromDb.map(i => [i.name, i.id]));
		console.log(`   -> Inseriti ${anag.data.length} record in ${anag.name}.`);
	}

	// --- 4. POPOLAMENTO TABELLE "RELEASES" ---
	console.log('📦 Inserimento delle versioni specifiche (releases)...');
	for (const release of model_releases) { await db.run('INSERT INTO model_releases (model_id, quantization_id, vram_cost_gb, ram_cost_gb) VALUES (?, ?, ?, ?)', nameToIdMaps['base_models'].get(release.model_name), nameToIdMaps['quantizations'].get(release.quantization_name), release.vram_cost_gb, release.ram_cost_gb); }
	console.log(`   -> Inserite ${model_releases.length} versioni di modelli.`);
	for (const release of text_encoder_releases) { await db.run('INSERT INTO text_encoder_releases (encoder_id, quantization_id, vram_cost_gb, ram_cost_gb) VALUES (?, ?, ?, ?)', nameToIdMaps['text_encoders'].get(release.encoder_name), nameToIdMaps['quantizations'].get(release.quantization_name), release.vram_cost_gb, release.ram_cost_gb); }
	console.log(`   -> Inserite ${text_encoder_releases.length} versioni di text encoder.`);
	for (const release of vae_releases) { await db.run('INSERT INTO vae_releases (vae_id, quantization_id, vram_cost_gb, ram_cost_gb) VALUES (?, ?, ?, ?)', nameToIdMaps['vaes'].get(release.vae_name), nameToIdMaps['quantizations'].get(release.quantization_name), release.vram_cost_gb, release.ram_cost_gb); }
	console.log(`   -> Inserite ${vae_releases.length} versioni di VAE.`);

	// --- 5. POPOLAMENTO TABELLE DI GIUNZIONE ---
	console.log('🔗 Creazione dei collegamenti di compatibilità...');
	for (const comp of model_compatibilities) {
		const modelId = nameToIdMaps['base_models'].get(comp.model_name);
		if (!modelId) continue;
		// Collega Text Encoders
		for (const teName of comp.compatible_text_encoders.split('|')) { const teId = nameToIdMaps['text_encoders'].get(teName.trim()); if (teId) { await db.run('INSERT INTO model_encoder_compatibility (model_id, encoder_id) VALUES (?, ?)', modelId, teId); } }
		// Collega VAEs
		for (const vaeName of comp.compatible_vaes.split('|')) { const vaeId = nameToIdMaps['vaes'].get(vaeName.trim()); if (vaeId) { await db.run('INSERT INTO model_vae_compatibility (model_id, vae_id) VALUES (?, ?)', modelId, vaeId); } }
	}
	console.log('✅ Collegamenti creati con successo.');

	// --- 6. CHIUSURA ---
	await db.close();
	console.log('🎉 Processo di seeding completato con successo!');
}

seed().catch((err) => {
	console.error('❌ Errore durante il processo di seeding:', err);
	process.exit(1);
});