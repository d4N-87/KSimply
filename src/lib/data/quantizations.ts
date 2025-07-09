// src/lib/data/quantizations.ts

import type { Quantization } from '$lib/core/types';

export const quantizations: Quantization[] = [
	{
		id: 'fp16',
		name: 'FP16 (Half Precision)',
		vramMultiplier: 1.0,
		ramMultiplier: 1.0,
		notes: [
			'Standard per l\'addestramento e l\'inferenza di alta qualità.',
			'Offre un ottimo equilibrio tra precisione e consumo di VRAM.',
			'Supportato universalmente su tutte le GPU moderne.'
		]
		// Nessun gpuRequirements specifico, è lo standard.
	},
	{
		id: 'fp8',
		name: 'FP8 (8-bit Float)',
		vramMultiplier: 0.55, // Indicativamente, il costo è circa la metà di FP16
		ramMultiplier: 0.55,
		notes: [
			'Notevole risparmio di VRAM con una perdita di qualità minima o nulla.',
			'Inferenza molto più veloce rispetto a FP16.',
			'Il supporto hardware nativo accelera drasticamente le prestazioni.'
		],
		gpuRequirements: {
			supportedFamilies: ['rtx-40', 'rtx-30'], // Supporto nativo su serie 30 e 40
			isSoftwareFallback: true, // Può essere emulato via software su altre schede, ma è più lento
			note: 'Supporto hardware nativo su architetture Ampere (RTX 30) e Ada Lovelace (RTX 40). Può funzionare via software su altre schede con un calo di performance.'
		}
	},
	{
		id: 'int8',
		name: 'INT8 (8-bit Integer)',
		vramMultiplier: 0.5,
		ramMultiplier: 0.5,
		notes: [
			'Quantizzazione a interi. Molto veloce e leggera.',
			'Può portare a una leggera perdita di fedeltà dell\'immagine (color banding).',
			'Comunemente usata per accelerare gli LLM con TensorRT-LLM.'
		],
		gpuRequirements: {
			supportedFamilies: ['rtx-40', 'rtx-30', 'rtx-20'], // Le GPU con Tensor Cores beneficiano enormemente
			isSoftwareFallback: false, // Generalmente non si usa in fallback software per la grafica
			note: 'Ottimizzato per GPU con Tensor Cores (serie RTX 20 e successive).'
		}
	},
	{
		id: 'fp4',
		name: 'FP4 (4-bit Float)',
		vramMultiplier: 0.3, // Molto aggressivo sulla VRAM
		ramMultiplier: 0.3,
		notes: [
			'Quantizzazione estrema per eseguire modelli molto grandi su hardware consumer.',
			'La perdita di qualità può essere visibile.',
			'Supporto ancora in fase di sviluppo in molti framework.'
		],
		gpuRequirements: {
			supportedFamilies: ['rtx-40'], // Attualmente, il supporto hardware è una feature distintiva della serie 40
			isSoftwareFallback: true,
			note: 'Supporto hardware nativo solo su architettura Ada Lovelace (RTX 40). Altre schede devono usare implementazioni software specializzate.'
		}
	},

	// --- GGUF Quantizations (per CPU-first e LLM) ---
	// Nota: I moltiplicatori di RAM sono approssimazioni basate su un modello di riferimento.
	// Il costo VRAM è gestito da una logica separata (offload di layer).
	{
		id: 'gguf-q2_k',
		name: 'GGUF Q2_K (2-bit, Estremo Risparmio)',
		vramMultiplier: 0,
		ramMultiplier: 0.35,
		notes: [
			'La quantizzazione più aggressiva. Massimo risparmio di spazio e RAM.',
			'La perdita di qualità è significativa. Usare solo se strettamente necessario.'
		]
	},
	{
		id: 'gguf-q3_k_m',
		name: 'GGUF Q3_K_M (3-bit, Medio-Basso)',
		vramMultiplier: 0,
		ramMultiplier: 0.45,
		notes: ['Un compromesso per eseguire modelli molto grandi su sistemi con poca RAM.']
	},
	{
		id: 'gguf-q4_0',
		name: 'GGUF Q4_0 (4-bit, Veloce)',
		vramMultiplier: 0,
		ramMultiplier: 0.5,
		notes: ['Quantizzazione a 4-bit originale. Veloce ma meno precisa delle varianti "K_M".']
	},
	{
		id: 'gguf-q4_k_m',
		name: 'GGUF Q4_K_M (4-bit, Bilanciato)',
		vramMultiplier: 0,
		ramMultiplier: 0.52,
		notes: [
			'Spesso considerato il miglior compromesso tra dimensione e qualità per l\'uso generale.',
			'Ideale per eseguire modelli 7B o 13B sulla maggior parte dei sistemi consumer.'
		]
	},
	{
		id: 'gguf-q5_0',
		name: 'GGUF Q5_0 (5-bit, Qualità Alta)',
		vramMultiplier: 0,
		ramMultiplier: 0.58,
		notes: ['Qualità notevolmente buona, quasi senza artefatti percepibili.']
	},
	{
		id: 'gguf-q5_k_m',
		name: 'GGUF Q5_K_M (5-bit, Qualità Alta+)',
		vramMultiplier: 0,
		ramMultiplier: 0.6,
		notes: ['Qualità molto vicina a FP16. Consigliato se si ha abbastanza RAM.']
	},
	{
		id: 'gguf-q6_k',
		name: 'GGUF Q6_K (6-bit, Qualità Molto Alta)',
		vramMultiplier: 0,
		ramMultiplier: 0.7,
		notes: ['Per chi cerca una qualità quasi perfetta con un risparmio ancora sensibile rispetto a 8-bit.']
	},
	{
		id: 'gguf-q8_0',
		name: 'GGUF Q8_0 (8-bit, Qualità Massima)',
		vramMultiplier: 0,
		ramMultiplier: 0.85,
		notes: [
			'Quantizzazione a 8-bit puri. Qualità quasi indistinguibile dall\'originale.',
			'Utile per modelli più piccoli o per sistemi con una quantità enorme di RAM.'
		]
	}
];
];