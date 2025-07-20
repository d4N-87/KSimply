<script lang="ts">
	import type { AnalysisResult } from '$lib/core/analyzer';

	let { result }: { result: AnalysisResult } = $props();

	const levelStyles = {
		Verde: { borderColor: 'border-green-500', textColor: 'text-green-300', badgeText: 'Ottimale', badgeBg: 'bg-green-500/20' },
		Giallo: { borderColor: 'border-amber-500', textColor: 'text-amber-300', badgeText: 'Possibile (Offload)', badgeBg: 'bg-amber-500/20' },
		Rosso: { borderColor: 'border-red-600', textColor: 'text-red-400', badgeText: 'Incompatibile', badgeBg: 'bg-red-500/20' }
	};
	const currentStyle = levelStyles[result.level];

	type Flavor = 'GGUF' | 'FP16' | 'FP8' | 'FP4' | 'Virtual' | 'Altro';

	const flavorStyles: Record<Flavor, string> = {
		GGUF: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
		FP16: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
		FP8: 'bg-teal-500/20 text-teal-300 border-teal-500/50',
		FP4: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
		Virtual: 'bg-gray-600/20 text-gray-400 border-gray-600/50',
		Altro: 'bg-gray-500/20 text-gray-300 border-gray-500/50'
	};

	// --- FUNZIONE CORRETTA ---
	function getQuantizationFlavor(quantName: string): Flavor {
		if (!quantName || quantName === 'N/A') return 'Altro';
		const lower = quantName.toLowerCase();
		if (lower.includes('included')) return 'Virtual';
		if (lower.startsWith('fp16')) return 'FP16';
		if (lower.startsWith('fp8')) return 'FP8';
		if (lower.startsWith('fp4')) return 'FP4';
		// Riconosce i pattern GGUF come Q8_0, Q5_K_M, etc.
		if (lower.startsWith('q') && lower.includes('_')) return 'GGUF';
		return 'Altro';
	}

	const modelFlavor = getQuantizationFlavor(result.components.quantization.name);
	const vaeFlavor = getQuantizationFlavor(result.components.vae.quantization);
</script>

<div
	class="bg-gray-800 rounded-lg border-2 {currentStyle.borderColor} p-6 shadow-lg transition-all hover:shadow-cyan-500/20 hover:scale-[1.02] flex flex-col h-full"
>
	<!-- Header della Card -->
	<div class="flex justify-between items-start">
		<div>
			<h3 class="text-xl font-bold text-white">{result.recipeName}</h3>
			<p class="text-sm text-gray-400">{result.modelType}</p>
		</div>
		<span
			class="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap {currentStyle.badgeBg} {currentStyle.textColor}"
		>
			{currentStyle.badgeText}
		</span>
	</div>

	<!-- Sezione Etichette Tecnologia -->
	<div class="mt-3 flex gap-2 flex-wrap">
		<span class="text-xs border px-2 py-0.5 rounded-full {flavorStyles[modelFlavor]}">
			Modello: {result.components.quantization.name}
		</span>
		{#each result.components.text_encoders as encoder (encoder.name)}
			{#if encoder.cost > 0}
				<span
					class="text-xs border px-2 py-0.5 rounded-full {flavorStyles[
						getQuantizationFlavor(encoder.quantization)
					]}"
				>
					Encoder: {encoder.quantization}
				</span>
			{/if}
		{/each}
		{#if result.components.vae.cost > 0}
			<span class="text-xs border px-2 py-0.5 rounded-full {flavorStyles[vaeFlavor]}">
				VAE: {result.components.vae.quantization}
			</span>
		{/if}
	</div>

	<!-- Riepilogo Costi e Qualità -->
	<div class="mt-4 space-y-3 text-gray-300">
		<div class="flex items-center justify-between">
			<span>Qualità (Modello):</span>
			<span class="font-mono bg-gray-700 px-2 py-1 rounded">{result.quality} / 100</span>
		</div>
		<div class="flex items-center justify-between">
			<span>VRAM Richiesta:</span>
			<span class="font-mono {currentStyle.textColor}">{result.totalVramCost.toFixed(2)} GB</span>
		</div>
		<div class="flex items-center justify-between">
			<span>RAM Richiesta:</span>
			<span class="font-mono {currentStyle.textColor}">{result.totalRamCost.toFixed(2)} GB</span>
		</div>
	</div>

	<!-- Composizione Ricetta -->
	<div class="mt-4 pt-4 border-t border-gray-700">
		<h4 class="text-sm font-semibold text-gray-400 mb-2">Composizione:</h4>
		<div class="space-y-2 text-sm">
			<div class="flex justify-between">
				<span class="text-gray-300">{result.components.model.name}</span>
				<span class="font-mono bg-gray-700 px-2 py-1 rounded"
					>{result.components.model.cost.toFixed(2)} GB</span
				>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-300">Precisione: {result.components.quantization.name}</span>
			</div>
			{#each result.components.text_encoders as encoder (encoder.name)}
				<div class="flex justify-between">
					<span class="text-gray-300">Encoder: {encoder.name}</span>
					<span class="font-mono bg-gray-700 px-2 py-1 rounded">{encoder.cost.toFixed(2)} GB</span>
				</div>
			{/each}
			{#if result.components.vae.cost > 0}
				<div class="flex justify-between">
					<span class="text-gray-300">VAE: {result.components.vae.name}</span>
					<span class="font-mono bg-gray-700 px-2 py-1 rounded"
						>{result.components.vae.cost.toFixed(2)} GB</span
					>
				</div>
			{/if}
		</div>
	</div>

	<!-- Sezione Note -->
	<div class="mt-4 pt-4 border-t border-gray-700 flex-grow flex flex-col">
		<h4 class="text-sm font-semibold text-gray-400 mb-2">Note di Analisi:</h4>
		<ul class="list-disc list-inside space-y-1 text-sm {currentStyle.textColor}">
			{#each result.notes as note}
				<li>{note}</li>
			{/each}
		</ul>
	</div>
</div>