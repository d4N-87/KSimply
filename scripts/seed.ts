// scripts/seed.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// LA MODIFICA CHIAVE È QUI:
// Usiamo un percorso relativo esplicito e l'estensione.
// Questo è il modo più robusto in un ambiente "type": "module".
import * as data from './seed-data.js';

async function seed() {
	console.log('🌱 Inizio del processo di seeding...');

	const db = await open({
		filename: './ksimply.db',
		driver: sqlite3.Database
	});
	console.log('🔗 Connessione al database stabilita.');

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

	console.log('Popolamento delle tabelle delle entità...');

	// Usiamo `data.gpus`, `data.quantizations`, ecc.
	for (const gpu of data.gpus) {
		await db.run(
			'INSERT INTO gpus (name, vram_gb, family, fp8_support, fp4_support) VALUES (?, ?, ?, ?, ?)',
			gpu.name, gpu.vram_gb, gpu.family, gpu.fp8_support, gpu.fp4_support
		);
	}
	console.log(`   -> Inserite ${data.gpus.length} GPU.`);

	for (const q of data.quantizations) {
		await db.run(
			'INSERT INTO quantizations (name, type, vram_multiplier, ram_multiplier, quality_score) VALUES (?, ?, ?, ?, ?)',
			q.name, q.type, q.vram_multiplier, q.ram_multiplier, q.quality_score
		);
	}
	console.log(`   -> Inserite ${data.quantizations.length} Quantizzazioni.`);

	for (const te of data.text_encoders) {
		await db.run('INSERT INTO text_encoders (name, base_vram_cost_gb) VALUES (?, ?)', te.name, te.base_vram_cost_gb);
	}
	console.log(`   -> Inseriti ${data.text_encoders.length} Text Encoders.`);

	for (const vae of data.vaes) {
		await db.run('INSERT INTO vaes (name, base_vram_cost_gb) VALUES (?, ?)', vae.name, vae.base_vram_cost_gb);
	}
	console.log(`   -> Inseriti ${data.vaes.length} VAEs.`);
    
    console.log('⏳ Logica per le tabelle di giunzione da implementare...');

	await db.close();
	console.log('🎉 Processo di seeding completato con successo!');
}

seed().catch((err) => {
	console.error('❌ Errore durante il processo di seeding:', err);
	process.exit(1);
});