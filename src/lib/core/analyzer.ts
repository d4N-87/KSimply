// src/lib/core/analyzer.ts

import type { UserHardware } from './types';

// Questo tipo rappresenta una singola "ricetta" grezza estratta dal DB
export interface RawRecipe {
	model_name: string;
	model_type: string;
	base_vram_cost_gb: number;
	quantization_name: string;
	vram_multiplier: number;
	ram_multiplier: number;
	quality_score: number;
	text_encoder_name: string;
	text_encoder_vram_cost: number;
	vae_name: string;
	vae_vram_cost: number;
}

// Questo tipo rappresenta il risultato finale e arricchito dell'analisi per una ricetta
export interface AnalysisResult {
	recipeName: string;
	modelType: string;
	totalVramCost: number;
	quality: number;
	notes: string[];
	isCompatible: boolean;
	// Dettagli sulla composizione della ricetta
	components: {
		model: { name: string; cost: number };
		quantization: { name: string };
		text_encoder: { name: string; cost: number };
		vae: { name: string; cost: number };
	};
}

/**
 * Analizza l'hardware dell'utente contro un catalogo di ricette AI.
 * @param userHardware - Le specifiche hardware fornite dall'utente.
 * @param gpuInfo - Le informazioni dettagliate sulla GPU recuperate dal DB.
 * @param rawRecipes - Il catalogo di tutte le possibili combinazioni di modelli dal DB.
 * @returns Un array di risultati di analisi, ordinati per compatibilità e qualità.
 */
export function analyzeHardware(
	userHardware: UserHardware,
	gpuInfo: { vram_gb: number /* altre info... */ },
	rawRecipes: RawRecipe[]
): AnalysisResult[] {
	const results: AnalysisResult[] = [];
	const userVram = gpuInfo.vram_gb;

	for (const recipe of rawRecipes) {
		// Calcoliamo il costo in VRAM per ogni componente
		const modelVramCost = recipe.base_vram_cost_gb * recipe.vram_multiplier;
		const totalVramCost =
			modelVramCost + recipe.text_encoder_vram_cost + recipe.vae_vram_cost;

		const isCompatible = userVram >= totalVramCost;

		results.push({
			recipeName: `${recipe.model_name} (${recipe.quantization_name})`,
			modelType: recipe.model_type,
			totalVramCost: parseFloat(totalVramCost.toFixed(2)),
			quality: recipe.quality_score,
			notes: [
				`Richiede circa ${parseFloat(totalVramCost.toFixed(2))} GB di VRAM.`,
				`La tua GPU ha ${userVram} GB.`
			],
			isCompatible: isCompatible,
			// Popoliamo i dettagli dei componenti
			components: {
				model: { name: recipe.model_name, cost: parseFloat(modelVramCost.toFixed(2)) },
				quantization: { name: recipe.quantization_name },
				text_encoder: { name: recipe.text_encoder_name, cost: recipe.text_encoder_vram_cost },
				vae: { name: recipe.vae_name, cost: recipe.vae_vram_cost }
			}
		});
	}

	// Ordiniamo i risultati: prima i compatibili, poi per qualità decrescente
	return results.sort((a, b) => {
		if (a.isCompatible !== b.isCompatible) {
			return a.isCompatible ? -1 : 1;
		}
		return b.quality - a.quality;
	});
}