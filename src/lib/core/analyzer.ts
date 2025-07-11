// src/lib/core/analyzer.ts
import type { UserHardware } from './types';

// Questo tipo rappresenta una singola "ricetta" estratta dal DB
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

// Questo tipo rappresenta il risultato finale dell'analisi per una ricetta
export interface AnalysisResult {
	recipeName: string;
	modelType: string;
	totalVramCost: number;
	quality: number;
	notes: string[];
	isCompatible: boolean;
}

export function analyzeHardware(
	userHardware: UserHardware,
	gpuInfo: { vram_gb: number; /* altre info... */ },
	rawRecipes: RawRecipe[]
): AnalysisResult[] {
	const results: AnalysisResult[] = [];
	const userVram = gpuInfo.vram_gb;

	for (const recipe of rawRecipes) {
		// Calcoliamo il costo totale in VRAM per questa ricetta
		const modelVramCost = recipe.base_vram_cost_gb * recipe.vram_multiplier;
		const totalVramCost =
			modelVramCost + recipe.text_encoder_vram_cost + recipe.vae_vram_cost;

		const isCompatible = userVram >= totalVramCost;

		results.push({
			recipeName: `${recipe.model_name} (${recipe.quantization_name})`,
			modelType: recipe.model_type,
			totalVramCost: parseFloat(totalVramCost.toFixed(2)), // Arrotondiamo per pulizia
			quality: recipe.quality_score,
			notes: [
				`Richiede circa ${parseFloat(totalVramCost.toFixed(2))} GB di VRAM.`,
				`La tua GPU ha ${userVram} GB.`
			],
			isCompatible: isCompatible
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