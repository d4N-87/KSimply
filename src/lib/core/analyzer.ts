// src/lib/core/analyzer.ts

import type { UserHardware } from './types';

export interface RawRecipe {
	model_name: string;
	model_type: string;
	base_vram_cost_gb: number;
	ram_multiplier: number;
	quantization_name: string;
	vram_multiplier: number;
	quality_score: number;
	text_encoder_name: string;
	text_encoder_vram_cost: number;
	vae_name: string;
	vae_vram_cost: number;
}

export type AnalysisLevel = 'Verde' | 'Giallo' | 'Rosso';

export interface AnalysisResult {
	id: string; // ID unico per la chiave nel #each di Svelte
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
		const modelVramCost = recipe.base_vram_cost_gb * recipe.vram_multiplier;
		const totalVramCost = modelVramCost + recipe.text_encoder_vram_cost + recipe.vae_vram_cost;

		const modelRamCost = recipe.base_vram_cost_gb * recipe.ram_multiplier;
		const totalRamCost = modelRamCost + recipe.text_encoder_vram_cost + recipe.vae_vram_cost;

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
			if (userVram < totalVramCost) {
				notes.push(`VRAM insufficiente. Richiesti ${totalVramCost.toFixed(2)}GB.`);
			}
			if (userRam < totalRamCost) {
				notes.push(`RAM insufficiente. Richiesti ${totalRamCost.toFixed(2)}GB.`);
			}
		}

		// Creazione di un ID unico concatenando i nomi dei componenti
		const uniqueId = `${recipe.model_name}-${recipe.quantization_name}-${recipe.text_encoder_name}-${recipe.vae_name}`;
		const recipeName = `${recipe.model_name} (${recipe.quantization_name})`;

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
				quantization: { name: recipe.quantization_name },
				text_encoder: { name: recipe.text_encoder_name, cost: recipe.text_encoder_vram_cost },
				vae: { name: recipe.vae_name, cost: recipe.vae_vram_cost }
			}
		});
	}

	return results.sort((a, b) => {
		const levelOrder = { Verde: 0, Giallo: 1, Rosso: 2 };
		if (levelOrder[a.level] !== levelOrder[b.level]) {
			return levelOrder[a.level] - levelOrder[b.level];
		}
		return b.quality - a.quality;
	});
}