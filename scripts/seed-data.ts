// scripts/seed-data.ts

export interface SeedGpu {
	name: string;
	vram_gb: number;
	family: string;
	fp8_support: 'native' | 'software' | 'none';
	fp4_support: 'native' | 'software' | 'none';
}

export interface SeedQuantization {
	name: string;
	type: 'fp' | 'int' | 'gguf';
	vram_multiplier: number;
	ram_multiplier: number;
	quality_score: number;
}

export interface SeedTextEncoder {
	name: string;
	base_vram_cost_gb: number;
}

export interface SeedVae {
	name: string;
	base_vram_cost_gb: number;
}

export interface SeedBaseModel {
	name: string;
	type: 'Image Generation' | 'Video Generation' | 'Audio Generation';
	base_vram_cost_gb: number;
	compatible_quantizations: string[];
	compatible_text_encoders: string[];
	compatible_vaes: string[];
}

// --- I NOSTRI DATI "STARTER PACK" ---

export const gpus: SeedGpu[] = [
	{ name: 'GeForce RTX 4090', vram_gb: 24, family: 'rtx-40', fp8_support: 'native', fp4_support: 'native' },
	{ name: 'GeForce RTX 3060', vram_gb: 12, family: 'rtx-30', fp8_support: 'none', fp4_support: 'none' }
];

export const quantizations: SeedQuantization[] = [
	{ name: 'FP16', type: 'fp', vram_multiplier: 1.0, ram_multiplier: 1.0, quality_score: 100 },
	{ name: 'GGUF Q4_K_M', type: 'gguf', vram_multiplier: 0.6, ram_multiplier: 0.8, quality_score: 85 }
];

export const text_encoders: SeedTextEncoder[] = [
	{ name: 'CLIP (SD 1.5)', base_vram_cost_gb: 0.5 }
];

export const vaes: SeedVae[] = [
    { name: 'VAE (SD 1.5)', base_vram_cost_gb: 0.32 }
];

export const base_models: SeedBaseModel[] = [
	{
		name: 'Stable Diffusion 1.5',
		type: 'Image Generation',
		base_vram_cost_gb: 4.0,
		compatible_quantizations: ['FP16', 'GGUF Q4_K_M'],
		compatible_text_encoders: ['CLIP (SD 1.5)'],
		compatible_vaes: ['VAE (SD 1.5)']
	}
];