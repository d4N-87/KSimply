// src/lib/core/types.ts

// --- INPUT UTENTE ---
export interface UserHardware {
	gpu: string;
	gpuFamily?: 'rtx-40' | 'rtx-30' | 'rtx-20' | 'amd-rx-7000' | 'generic';
	vram: number;
	ram: number;
	storage: 'hdd' | 'ssd' | 'nvme';
}

// --- MATTONCINI DEL DATABASE ---

export interface GpuRequirements {
	supportedFamilies: UserHardware['gpuFamily'][];
	isSoftwareFallback: boolean;
	note?: string;
}

/**
 * Rappresenta una possibile precisione/quantizzazione.
 */
export interface Quantization {
	// CORREZIONE: Ho aggiunto tutti gli ID che stiamo usando.
	id:
		| 'fp16'
		| 'fp8'
		| 'int8'
		| 'fp4'
		| 'gguf-q2_k'
		| 'gguf-q3_k_m'
		| 'gguf-q4_0'
		| 'gguf-q4_k_m'
		| 'gguf-q5_0'
		| 'gguf-q5_k_m'
		| 'gguf-q6_k'
		| 'gguf-q8_0';
	name: string;
	vramMultiplier: number;
	ramMultiplier: number;
	notes: string[];
	// CORREZIONE: Ho aggiunto la proprietà opzionale 'gpuRequirements'.
	gpuRequirements?: GpuRequirements;
}

/**
 * Rappresenta un Text Encoder.
 */
export interface TextEncoder {
	id: 'clip-l' | 'clip-g' | 't5-xxl';
	name: string;
	baseVramCost: number;
	baseRamCost: number;
	notes: string[];
}

/**
 * Rappresenta un Modello Base (U-Net).
 */
export interface BaseModel {
	id: 'sd-1.5' | 'sdxl' | 'flux1';
	name: 'Stable Diffusion 1.5' | 'Stable Diffusion XL' | 'FLUX.1';
	type: 'Image Generation' | 'Video Generation' | 'Music Generation' | 'LLM';
	baseVramCost: number;
	compatibleTextEncoders: TextEncoder['id'][];
	compatibleQuantizations: Quantization['id'][];
	// Aggiungiamo la possibilità di avere requisiti GPU anche a livello di modello base.
	gpuRequirements?: GpuRequirements;
}

// --- OUTPUT DEL SISTEMA ---

export interface GeneratedRecipe {
	id: string;
	name: string;
	type: BaseModel['type'];
	baseModel: BaseModel;
	quantization: Quantization;
	textEncoders: TextEncoder[];
	totalVramCost: number;
	totalRamCost: number;
	setupNotes: string[];
}

export type CompatibilityLevel = 'Optimal' | 'Good' | 'Poor' | 'Not Recommended';

export interface AnalysisResult {
	recipe: GeneratedRecipe;
	compatibility: CompatibilityLevel;
	performanceNotes: string[];
}