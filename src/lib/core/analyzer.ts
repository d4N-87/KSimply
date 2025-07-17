// src/lib/core/analyzer.ts (ARCHITETTURA FINALE)

import type { UserHardware } from './types';

// --- REGOLE DI BUSINESS PER IL CALCOLO DEI COSTI ---
const VRAM_BUFFER_PERCENTAGE = 1.10; // 10% di buffer per l'inferenza
const RAM_BASE_OVERHEAD_GB = 2.0;    // 2GB di overhead per il software di base

// 1. La nuova interfaccia per i dati grezzi dalla query
export interface RawRecipe {
	model_release_id: number;
	text_encoder_release_id: number;
	vae_release_id: number;
	model_name: string;
	model_type: string;
	model_quantization: string;
	text_encoder_name: string;
	text_encoder_quantization: string;
	vae_name: string;
	vae_quantization: string;
	quality_score: number;
	model_file_size: number;
	text_encoder_file_size: number;
	vae_file_size: number;
}

// L'interfaccia del risultato finale rimane la stessa
export type AnalysisLevel = 'Verde' | 'Giallo' | 'Rosso';
export interface AnalysisResult {
	id: string;
	recipeName: string;
	modelType: string;
	level: AnalysisLevel;
	totalVramCost: number;
	totalRamCost: number;
	quality: number;
	notes: string[];
	components: {
		model: { name: string; cost: number };
		quantization: { name: string };
		text_encoder: { name: string; cost: number };
		vae: { name: string; cost: number };
	};
}

export function analyzeHardware(
	userHardware: UserHardware,
	gpuInfo: { vram_gb: number },
	rawRecipes: RawRecipe[]
): AnalysisResult[] {
	const results: AnalysisResult[] = [];
	const userVram = gpuInfo.vram_gb;
	const userRam = userHardware.ram;

	for (const recipe of rawRecipes) {
		// 2. Calcolo dinamico dei costi
		const modelVramCost = recipe.model_file_size * VRAM_BUFFER_PERCENTAGE;
		const encoderVramCost = recipe.text_encoder_file_size; // Senza buffer
		const vaeVramCost = recipe.vae_file_size; // Senza buffer

		const totalVramCost = modelVramCost + encoderVramCost + vaeVramCost;

		// Il costo RAM è la somma dei file + un overhead fisso per il software
		const totalRamCost = recipe.model_file_size + recipe.text_encoder_file_size + recipe.vae_file_size + RAM_BASE_OVERHEAD_GB;

		// 3. Logica di determinazione del livello (invariata)
		let level: AnalysisLevel = 'Rosso';
		let notes: string[] = [];

		if (userVram >= totalVramCost && userRam >= totalRamCost) {
			level = 'Verde';
			notes.push(`Performance ottimali: tutti i componenti risiedono in VRAM.`);
			notes.push(`VRAM Stimata: ${totalVramCost.toFixed(2)}GB / ${userVram}GB (include buffer).`);
			notes.push(`RAM Stimata: ${totalRamCost.toFixed(2)}GB / ${userRam}GB (include overhead software).`);
		} else if (userRam >= totalRamCost) {
			level = 'Giallo';
			notes.push(`Performance ridotte: richiede CPU Offloading.`);
			notes.push(`La VRAM non è sufficiente, ma la RAM sì.`);
			notes.push(`RAM Stimata per l'offload: ~${totalRamCost.toFixed(2)}GB.`);
		} else {
			level = 'Rosso';
			if (userVram < totalVramCost) { notes.push(`VRAM insufficiente. Richiesti ~${totalVramCost.toFixed(2)}GB.`); }
			if (userRam < totalRamCost) { notes.push(`RAM insufficiente. Richiesti ~${totalRamCost.toFixed(2)}GB.`); }
		}

		// 4. Costruzione dell'oggetto risultato (aggiornato per usare i nuovi costi)
		const uniqueId = `${recipe.model_release_id}-${recipe.text_encoder_release_id}-${recipe.vae_release_id}`;
		const recipeName = `${recipe.model_name} (${recipe.model_quantization})`;

		results.push({
			id: uniqueId,
			recipeName: recipeName,
			modelType: recipe.model_type,
			level: level,
			totalVramCost: parseFloat(totalVramCost.toFixed(2)),
			totalRamCost: parseFloat(totalRamCost.toFixed(2)),
			quality: recipe.quality_score,
			notes: notes,
			components: {
				model: { name: recipe.model_name, cost: parseFloat(modelVramCost.toFixed(2)) },
				quantization: { name: recipe.model_quantization },
				text_encoder: { name: `${recipe.text_encoder_name} (${recipe.text_encoder_quantization})`, cost: encoderVramCost },
				vae: { name: `${recipe.vae_name} (${recipe.vae_quantization})`, cost: vaeVramCost }
			}
		});
	}

	// Ordinamento (invariato)
	return results.sort((a, b) => {
		const levelOrder = { Verde: 0, Giallo: 1, Rosso: 2 };
		if (levelOrder[a.level] !== levelOrder[b.level]) {
			return levelOrder[a.level] - levelOrder[b.level];
		}
		return b.quality - a.quality;
	});
}