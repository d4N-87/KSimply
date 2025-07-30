import type { UserHardware } from './types';

// --- INTERFACES ---
// [EN] Raw data structures mapping directly to the database schema.
// [IT] Strutture dati grezze che mappano direttamente lo schema del database.
interface ModelRelease { id: number; model_id: number; quantization_id: number; file_size_gb: number; model_name: string; model_type: string; quantization_name: string; quality_score: number; priority: number; }
interface EncoderRelease { id: number; encoder_id: number; quantization_id: number; file_size_gb: number; encoder_name: string; quantization_name: string; quality_score: number; priority: number; compatible_with_model_id: number; }
interface VaeRelease { id: number; vae_id: number; quantization_id: number; file_size_gb: number; vae_name: string; quantization_name: string; quality_score: number; priority: number; compatible_with_model_id: number; }
export interface RawDataPayload { models: ModelRelease[]; encoders: EncoderRelease[]; vaes: VaeRelease[]; }
export type AnalysisLevel = 'Verde' | 'Giallo' | 'Rosso';

// [EN] Represents a translatable analysis note. `key` maps to a Paraglide message.
// [IT] Rappresenta una nota di analisi traducibile. `key` mappa a un messaggio Paraglide.
export interface AnalysisNote {
	key: 'note_optimal_all_in_vram' | 'note_optimal_vram_usage' | 'note_possible_offload' | 'note_possible_ram_usage' | 'note_warning_heavy_offload';
	params?: { [key: string]: string | number };
}

// [EN] The final, structured result of an analysis for a single model recipe.
// [IT] Il risultato finale e strutturato di un'analisi per una singola ricetta di modello.
export interface AnalysisResult { id: string; recipeName: string; modelType: string; level: AnalysisLevel; totalVramCost: number; totalRamCost: number; quality: number; notes: AnalysisNote[]; components: { model: { name: string; cost: number }; quantization: { name: string }; text_encoders: { name: string; cost: number; quantization: string }[]; vae: { name: string; cost: number; quantization: string }; }; }

// --- BUSINESS LOGIC CONSTANTS ---
const VRAM_BUFFER_PERCENTAGE = 1.03; // [EN] 3% safety buffer for VRAM calculations. [IT] 3% di buffer di sicurezza per i calcoli VRAM.
const RAM_BASE_OVERHEAD_GB = 2.0; // [EN] Base system RAM usage assumption. [IT] Assunzione di utilizzo base della RAM di sistema.
const ABSOLUTE_MAX_OFFLOAD_RAM_GB = 64; // [EN] Hard cap on how much system RAM can be used for offloading. [IT] Limite massimo di RAM di sistema utilizzabile per l'offload.
const HIGH_END_VRAM_THRESHOLD = 16; // [EN] VRAM amount to consider a GPU "high-end" for filtering models. [IT] Quantità di VRAM per considerare una GPU "high-end" per filtrare i modelli.
const MIN_MODEL_PRIORITY_FOR_HIGH_END = 10; // [EN] Minimum model priority to show on high-end GPUs. [IT] Priorità minima del modello da mostrare su GPU high-end.

type Champion = { result: AnalysisResult; score: number[]; };

/**
 * [EN] The main analysis function. It iterates through all possible model combinations
 * to find the best "Optimal" (Green) and "Possible" (Yellow) recommendation for each base model.
 * ---
 * [IT] La funzione di analisi principale. Itera attraverso tutte le possibili combinazioni di modelli
 * per trovare la migliore raccomandazione "Ottimale" (Verde) e "Possibile" (Gialla) per ogni modello base.
 */
export function analyzeHardware(
	userHardware: UserHardware,
	gpuInfo: { vram_gb: number },
	rawData: RawDataPayload
): AnalysisResult[] {
	const userVram = gpuInfo.vram_gb;
	const userRam = userHardware.ram;

	const maxOffloadRam = Math.min(userRam * 0.75, ABSOLUTE_MAX_OFFLOAD_RAM_GB);

	// [EN] Pre-process raw data into more efficient Maps for quick lookups.
	// [IT] Pre-elabora i dati grezzi in Map più efficienti per ricerche rapide.
	const baseModels = [...new Map(rawData.models.map((m) => [m.model_id, m])).values()].map((m) => ({ id: m.model_id, name: m.model_name, type: m.model_type as 'Image Generation' | 'Video Generation' | 'LLM' }));
	const modelReleasesById = new Map<number, ModelRelease[]>();
	for (const model of rawData.models) { if (!modelReleasesById.has(model.model_id)) modelReleasesById.set(model.model_id, []); modelReleasesById.get(model.model_id)!.push(model); }
	const requiredEncoderIdsByModelId = new Map<number, number[]>();
	const encoderReleasesById = new Map<number, EncoderRelease[]>();
	for (const enc of rawData.encoders) { if (!requiredEncoderIdsByModelId.has(enc.compatible_with_model_id)) requiredEncoderIdsByModelId.set(enc.compatible_with_model_id, []); const reqList = requiredEncoderIdsByModelId.get(enc.compatible_with_model_id)!; if (!reqList.includes(enc.encoder_id)) reqList.push(enc.encoder_id); if (!encoderReleasesById.has(enc.encoder_id)) encoderReleasesById.set(enc.encoder_id, []); encoderReleasesById.get(enc.encoder_id)!.push(enc); }
	const vaeReleasesByModelId = new Map<number, VaeRelease[]>();
	for (const vae of rawData.vaes) { if (!vaeReleasesByModelId.has(vae.compatible_with_model_id)) vaeReleasesByModelId.set(vae.compatible_with_model_id, []); vaeReleasesByModelId.get(vae.compatible_with_model_id)!.push(vae); }

	const finalRecommendations: AnalysisResult[] = [];
	for (const baseModel of baseModels) {
		// [EN] "Champion" pattern: find the best result for each level (Green, Yellow).
		// [IT] Pattern "Champion": trova il miglior risultato per ogni livello (Verde, Giallo).
		let bestGreen: Champion | null = null;
		let bestYellow: Champion | null = null;

		const modelReleases = modelReleasesById.get(baseModel.id) ?? [];
		const requiredEncoderIds = requiredEncoderIdsByModelId.get(baseModel.id) ?? [];
		const compatibleVaeReleases = vaeReleasesByModelId.get(baseModel.id) ?? [null];
		const encoderQuantizationPermutations = getQuantizationPermutations(requiredEncoderIds, encoderReleasesById);

		for (const modelRelease of modelReleases) {
			// [EN] Optimization: skip low-priority models on high-end GPUs.
			// [IT] Ottimizzazione: salta i modelli a bassa priorità su GPU high-end.
			if (userVram > HIGH_END_VRAM_THRESHOLD && modelRelease.priority < MIN_MODEL_PRIORITY_FOR_HIGH_END) {
				continue;
			}

			for (const encoderSet of encoderQuantizationPermutations) {
				if (encoderSet.length !== requiredEncoderIds.length) continue;

				for (const vaeRelease of compatibleVaeReleases) {
					const totalEncoderCost = encoderSet.reduce((sum, enc) => sum + enc.file_size_gb, 0);
					const vaeCost = vaeRelease?.file_size_gb ?? 0;
					const modelCost = modelRelease.file_size_gb;
					const totalVramCost = (modelCost + totalEncoderCost + vaeCost) * VRAM_BUFFER_PERCENTAGE;

					let level: AnalysisLevel = 'Rosso';
					let ramCostForLevel: number = RAM_BASE_OVERHEAD_GB;

					// [EN] Determine compatibility level: Green (fits in VRAM), Yellow (fits with offload), or Red.
					// [IT] Determina il livello di compatibilità: Verde (entra in VRAM), Giallo (entra con offload), o Rosso.
					if (totalVramCost <= userVram) {
						level = 'Verde';
					} else {
						const vramToOffload = totalVramCost - userVram;
						const requiredRamForOffload = vramToOffload + RAM_BASE_OVERHEAD_GB;
						if (userRam >= requiredRamForOffload && vramToOffload <= maxOffloadRam) {
							level = 'Giallo';
							ramCostForLevel = requiredRamForOffload;
						}
					}

					if (level === 'Rosso') continue;

					// [EN] Hierarchical score for comparing results: priority first, then quality, then cost.
					// [IT] Punteggio gerarchico per confrontare i risultati: prima la priorità, poi la qualità, poi il costo.
					const avgEncoderPriority = encoderSet.length > 0 ? encoderSet.reduce((sum, e) => sum + e.priority, 0) / encoderSet.length : 20;
					const avgEncoderQualityScore = encoderSet.length > 0 ? encoderSet.reduce((sum, e) => sum + e.quality_score, 0) / encoderSet.length : 100;
					const hierarchicalScore = [ modelRelease.priority, modelRelease.quality_score, avgEncoderPriority, avgEncoderQualityScore, -totalVramCost ];

					const currentResult: AnalysisResult = {
						id: `${modelRelease.id}-${encoderSet.map((e) => e.id).join('_')}-${vaeRelease?.id ?? 'none'}`,
						recipeName: `${baseModel.name} (${modelRelease.quantization_name})`,
						modelType: baseModel.type,
						level, totalVramCost,
						totalRamCost: ramCostForLevel,
						quality: modelRelease.quality_score,
						notes: [],
						components: {
							model: { name: baseModel.name, cost: modelCost },
							quantization: { name: modelRelease.quantization_name },
							text_encoders: encoderSet.map((e) => ({ name: `${e.encoder_name} (${e.quantization_name})`, cost: e.file_size_gb, quantization: e.quantization_name })),
							vae: { name: vaeRelease ? `${vaeRelease.vae_name} (${vaeRelease.quantization_name})` : 'N/A', cost: vaeCost, quantization: vaeRelease?.quantization_name ?? 'N/A' }
						}
					};

					// [EN] Compare with the current champion and replace if better.
					// [IT] Confronta con il campione attuale e sostituiscilo se è migliore.
					const championToCompare: Champion | null = level === 'Verde' ? bestGreen : bestYellow;
					let isBetter = false;
					if (!championToCompare) {
						isBetter = true;
					} else {
						for (let i = 0; i < hierarchicalScore.length; i++) {
							if (hierarchicalScore[i] > championToCompare.score[i]) { isBetter = true; break; }
							if (hierarchicalScore[i] < championToCompare.score[i]) { break; }
						}
					}

					if (isBetter) {
						const newChampion: Champion = { result: currentResult, score: hierarchicalScore };
						if (level === 'Verde') bestGreen = newChampion;
						else bestYellow = newChampion;
					}
				}
			}
		}

		if (bestGreen) finalRecommendations.push(bestGreen.result);
		if (bestYellow && bestYellow.result.id !== bestGreen?.result.id) {
			finalRecommendations.push(bestYellow.result);
		}
	}

	const HEAVY_OFFLOAD_THRESHOLD_GB = 16;

	// [EN] Post-process results to add context-specific notes.
	// [IT] Post-elabora i risultati per aggiungere note specifiche al contesto.
	finalRecommendations.forEach((r) => {
		if (r.level === 'Verde') {
			r.notes.push({ key: 'note_optimal_all_in_vram' });
			r.notes.push({ key: 'note_optimal_vram_usage', params: { used: r.totalVramCost.toFixed(2), total: userVram } });
		} else {
			const vramToOffload = r.totalVramCost > userVram ? r.totalVramCost - userVram : 0;
			r.notes.push({ key: 'note_possible_offload' });
			r.notes.push({ key: 'note_possible_ram_usage', params: { used: r.totalRamCost.toFixed(2), offloaded: vramToOffload.toFixed(2) } });

			if (vramToOffload > HEAVY_OFFLOAD_THRESHOLD_GB) {
				r.notes.push({ key: 'note_warning_heavy_offload' });
			}
		}
	});

	// [EN] Sort final results for display: by type, then level, then quality.
	// [IT] Ordina i risultati finali per la visualizzazione: per tipo, poi livello, poi qualità.
	const modelTypeOrder: Record<string, number> = { 'Image Generation': 1, 'Video Generation': 2, 'LLM': 3 };
	return finalRecommendations.sort((a, b) => {
		const typeA = modelTypeOrder[a.modelType] ?? 99;
		const typeB = modelTypeOrder[b.modelType] ?? 99;
		if (typeA !== typeB) return typeA - typeB;
		const levelOrder: Record<AnalysisLevel, number> = { Verde: 1, Giallo: 2, Rosso: 3 };
		if (levelOrder[a.level] !== levelOrder[b.level]) return levelOrder[a.level] - levelOrder[b.level];
		return b.quality - a.quality;
	});
}

/**
 * [EN] A recursive helper function to generate all possible combinations
 * of quantizations for a given set of required encoders.
 * ---
 * [IT] Una funzione di supporto ricorsiva per generare tutte le possibili
 * combinazioni di quantizzazioni per un dato set di encoder richiesti.
 */
function getQuantizationPermutations(
	requiredEncoderIds: number[],
	releasesById: Map<number, EncoderRelease[]>
): EncoderRelease[][] {
	if (requiredEncoderIds.length === 0) return [[]];
	const firstEncoderId = requiredEncoderIds[0];
	const remainingEncoderIds = requiredEncoderIds.slice(1);
	const releasesForFirst = releasesById.get(firstEncoderId) ?? [];
	const permutationsForRest = getQuantizationPermutations(remainingEncoderIds, releasesById);
	if (releasesForFirst.length === 0) return [];
	const newPermutations: EncoderRelease[][] = [];
	for (const release of releasesForFirst) {
		for (const p of permutationsForRest) {
			newPermutations.push([release, ...p]);
		}
	}
	return newPermutations;
}