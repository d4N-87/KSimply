<script lang="ts">
	import type { AnalysisResult } from '$lib/core/analyzer';

	// Il componente accetta un singolo risultato dell'analisi come prop
	let { result }: { result: AnalysisResult } = $props();

	// Mappa ogni livello a uno stile specifico per un facile accesso
	const levelStyles = {
		Verde: {
			borderColor: 'border-green-500',
			textColor: 'text-green-300',
			badgeText: 'Ottimale',
			badgeBg: 'bg-green-500/20'
		},
		Giallo: {
			borderColor: 'border-amber-500',
			textColor: 'text-amber-300',
			badgeText: 'Possibile (Offload)',
			badgeBg: 'bg-amber-500/20'
		},
		Rosso: {
			borderColor: 'border-red-600',
			textColor: 'text-red-400',
			badgeText: 'Incompatibile',
			badgeBg: 'bg-red-500/20'
		}
	};

	const currentStyle = levelStyles[result.level];
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

	<!-- Riepilogo Costi e Qualità -->
	<div class="mt-4 space-y-3 text-gray-300">
		<div class="flex items-center justify-between">
			<span>Qualità Stimata:</span>
			<span class="font-mono bg-gray-700 px-2 py-1 rounded">{result.quality} / 100</span>
		</div>
		<div class="flex items-center justify-between">
			<span>VRAM Richiesta (Nativa):</span>
			<span class="font-mono {currentStyle.textColor}">{result.totalVramCost} GB</span>
		</div>
		<div class="flex items-center justify-between">
			<span>RAM Richiesta:</span>
			<span class="font-mono {currentStyle.textColor}">{result.totalRamCost} GB</span>
		</div>
	</div>

	<!-- Composizione Ricetta -->
	<div class="mt-4 pt-4 border-t border-gray-700">
		<h4 class="text-sm font-semibold text-gray-400 mb-2">Composizione:</h4>
		<div class="space-y-2 text-sm">
			<div class="flex justify-between">
				<span class="text-gray-300">{result.components.model.name}</span>
				<span class="font-mono bg-gray-700 px-2 py-1 rounded"
					>{result.components.model.cost} GB</span
				>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-300">Precisione: {result.components.quantization.name}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-300">Encoder: {result.components.text_encoder.name}</span>
				<span class="font-mono bg-gray-700 px-2 py-1 rounded"
					>{result.components.text_encoder.cost} GB</span
				>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-300">VAE: {result.components.vae.name}</span>
				<span class="font-mono bg-gray-700 px-2 py-1 rounded"
					>{result.components.vae.cost} GB</span
				>
			</div>
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