// scripts/seed.ts (VERSIONE FINALE COMPLETA)
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import * as data from './seed-data.js';

async function seed() {
	console.log('🌱 Inizio del processo di seeding...');

	const db = await open({
		filename: './ksimply.db',
		driver: sqlite3.Database
	});
	console.log('🔗 Connessione al database stabilita.');

	// --- 1. PULIZIA ---
	console.log('🧹 Pulizia delle tabelle esistenti...');
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

	// --- 2. POPOLAMENTO ENTITÀ ---
	console.log('Popolamento delle tabelle delle entità...');
	// (GPU)
	for (const gpu of data.gpus) {
		await db.run('INSERT INTO gpus (name, vram_gb, family, fp8_support, fp4_support) VALUES (?, ?, ?, ?, ?)', gpu.name, gpu.vram_gb, gpu.family, gpu.fp8_support, gpu.fp4_support);
	}
	console.log(`   -> Inserite ${data.gpus.length} GPU.`);
	// (Quantizations)
	for (const q of data.quantizations) {
		await db.run('INSERT INTO quantizations (name, type, vram_multiplier, ram_multiplier, quality_score) VALUES (?, ?, ?, ?, ?)', q.name, q.type, q.vram_multiplier, q.ram_multiplier, q.quality_score);
	}
	console.log(`   -> Inserite ${data.quantizations.length} Quantizzazioni.`);
	// (Text Encoders)
	for (const te of data.text_encoders) {
		await db.run('INSERT INTO text_encoders (name, base_vram_cost_gb) VALUES (?, ?)', te.name, te.base_vram_cost_gb);
	}
	console.log(`   -> Inseriti ${data.text_encoders.length} Text Encoders.`);
	// (VAEs)
	for (const vae of data.vaes) {
		await db.run('INSERT INTO vaes (name, base_vram_cost_gb) VALUES (?, ?)', vae.name, vae.base_vram_cost_gb);
	}
	console.log(`   -> Inseriti ${data.vaes.length} VAEs.`);
    // (Base Models - Senza compatibilità per ora)
    for (const model of data.base_models) {
        await db.run('INSERT INTO base_models (name, type, base_vram_cost_gb) VALUES (?, ?, ?)', model.name, model.type, model.base_vram_cost_gb);
    }
    console.log(`   -> Inseriti ${data.base_models.length} Modelli Base.`);


	// --- 3. POPOLAMENTO TABELLE DI GIUNZIONE ---
	console.log('🔗 Creazione dei collegamenti nelle tabelle di giunzione...');

	// Recuperiamo tutti i dati con i loro ID appena creati
	const modelsFromDb = await db.all('SELECT id, name FROM base_models');
	const quantizationsFromDb = await db.all('SELECT id, name FROM quantizations');
	const encodersFromDb = await db.all('SELECT id, name FROM text_encoders');
	const vaesFromDb = await db.all('SELECT id, name FROM vaes');

	// Creiamo delle mappe NOME -> ID per una ricerca veloce
	const modelMap = new Map(modelsFromDb.map(i => [i.name, i.id]));
	const quantizationMap = new Map(quantizationsFromDb.map(i => [i.name, i.id]));
	const encoderMap = new Map(encodersFromDb.map(i => [i.name, i.id]));
	const vaeMap = new Map(vaesFromDb.map(i => [i.name, i.id]));

	// Iteriamo sui dati originali dei modelli per leggere le loro compatibilità
	for (const modelData of data.base_models) {
		const modelId = modelMap.get(modelData.name);
		if (!modelId) continue;

		// Collega Quantizzazioni
		for (const qName of modelData.compatible_quantizations) {
			const qId = quantizationMap.get(qName);
			if (qId) {
				await db.run('INSERT INTO model_quantization_compatibility (model_id, quantization_id) VALUES (?, ?)', modelId, qId);
			}
		}

		// Collega Text Encoders
		for (const teName of modelData.compatible_text_encoders) {
			const teId = encoderMap.get(teName);
			if (teId) {
				await db.run('INSERT INTO model_encoder_compatibility (model_id, encoder_id) VALUES (?, ?)', modelId, teId);
			}
		}

		// Collega VAEs
		for (const vaeName of modelData.compatible_vaes) {
			const vaeId = vaeMap.get(vaeName);
			if (vaeId) {
				await db.run('INSERT INTO model_vae_compatibility (model_id, vae_id) VALUES (?, ?)', modelId, vaeId);
			}
		}
	}
	console.log('✅ Collegamenti creati con successo.');


	// --- 4. CHIUSURA ---
	await db.close();
	console.log('🎉 Processo di seeding completato con successo!');
}

seed().catch((err) => {
	console.error('❌ Errore durante il processo di seeding:', err);
	process.exit(1);
});