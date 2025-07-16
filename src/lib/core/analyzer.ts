// src/lib/core/analyzer.ts (NUOVA VERSIONE)

import type { UserHardware } from './types';

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
	model_vram_cost: number;
	model_ram_cost: number;
	text_encoder_vram_cost: number;
	text_encoder_ram_cost: number;
	vae_vram_cost: number;
	vae_ram_cost: number;
}

// L'interfaccia del risultato finale rimane quasi identica
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
		// 2. Sommiamo i costi dei componenti per ottenere i totali
		const totalVramCost = recipe.model_vram_cost + recipe.text_encoder_vram_cost + recipe.vae_vram_cost;
		const totalRamCost = recipe.model_ram_cost + recipe.text_encoder_ram_cost + recipe.vae_ram_cost;

		// La logica di determinazione del livello è identica a prima
		let level: AnalysisLevel = 'Rosso';
		let notes: string[] = [];

		if (userVram >= totalVramCost && userRam >= totalRamCost) {
			level = 'Verde';
			notes.push(`Performance ottimali: tutti i componenti risiedono in VRAM.`);
			notes.push(`VRAM: ${totalVramCost.toFixed(2)}GB / ${userVram}GB`);
			notes.push(`RAM: ${totalRamCost.toFixed(2)}GB / ${userRam}GB`);
		} else if (userRam >= totalRamCost) {
			level = 'Giallo';
			notes.push(`Performance ridotte: richiede CPU Offloading.`);
			notes.push(`La VRAM non è sufficiente per l'uso nativo, ma la RAM sì.`);
			notes.push(`RAM richiesta per l'offload: ~${totalRamCost.toFixed(2)}GB.`);
		} else {
			level = 'Rosso';
			if (userVram < totalVramCost) { notes.push(`VRAM insufficiente. Richiesti ${totalVramCost.toFixed(2)}GB.`); }
			if (userRam < totalRamCost) { notes.push(`RAM insufficiente. Richiesti ${totalRamCost.toFixed(2)}GB.`); }
		}

		// 3. Costruiamo l'oggetto risultato finale
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
				model: { name: recipe.model_name, cost: recipe.model_vram_cost },
				quantization: { name: recipe.model_quantization },
				text_encoder: { name: `${recipe.text_encoder_name} (${recipe.text_encoder_quantization})`, cost: recipe.text_encoder_vram_cost },
				vae: { name: `${recipe.vae_name} (${recipe.vae_quantization})`, cost: recipe.vae_vram_cost }
			}
		});
	}

	// L'ordinamento rimane identico
	return results.sort((a, b) => {
		const levelOrder = { Verde: 0, Giallo: 1, Rosso: 2 };
		if (levelOrder[a.level] !== levelOrder[b.level]) {
			return levelOrder[a.level] - levelOrder[b.level];
		}
		return b.quality - a.quality;
	});
}