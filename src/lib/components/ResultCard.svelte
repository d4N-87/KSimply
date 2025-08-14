<script lang="ts">
	import * as m from '$paraglide/messages';
	import type { AnalysisResult, AnalysisLevel, AnalysisNote } from '$lib/core/analyzer';
	import HuggingFaceIcon from './HuggingFaceIcon.svelte';

	let { result }: { result: AnalysisResult } = $props();

	// [EN] Style definitions for different analysis levels (Optimal, Possible, etc.).
	// [IT] Definizioni di stile per i diversi livelli di analisi (Ottimale, Possibile, ecc.).
	const levelStyles = {
		Verde: { borderColor: 'border-green-500', textColor: 'text-green-300', badgeBg: 'bg-green-500/20' },
		Giallo: { borderColor: 'border-amber-500', textColor: 'text-amber-300', badgeBg: 'bg-amber-500/20' },
		Rosso: { borderColor: 'border-red-600', textColor: 'text-red-400', badgeBg: 'bg-red-500/20' }
	};
	const currentStyle = levelStyles[result.level];

	/**
	 * [EN] Returns the translated text for a given analysis level.
	 * [IT] Restituisce il testo tradotto per un dato livello di analisi.
	 */
	function getLevelText(level: AnalysisLevel) {
		switch (level) {
			case 'Verde': return m.card_level_optimal();
			case 'Giallo': return m.card_level_possible();
			case 'Rosso': return m.card_level_incompatible();
		}
	}

	/**
	 * [EN] Translates an analysis note object by dynamically calling the correct
	 * Paraglide message function with its parameters.
	 * [IT] Traduce un oggetto nota di analisi chiamando dinamicamente la funzione
	 * di messaggio Paraglide corretta con i suoi parametri.
	 */
	function translateNote(note: AnalysisNote): string {
		const messageFunction = m[note.key] as (params: any) => string;
		return messageFunction(note.params || {});
	}

	// [EN] Defines different "flavors" for quantization types to style them.
	// [IT] Definisce diversi "flavor" per i tipi di quantizzazione per stilizzarli.
	type Flavor = 'GGUF' | 'FP16' | 'FP8' | 'FP4' | 'Virtual' | 'Altro';
	const flavorStyles: Record<Flavor, string> = {
		GGUF: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
		FP16: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
		FP8: 'bg-teal-500/20 text-teal-300 border-teal-500/50',
		FP4: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
		Virtual: 'bg-gray-600/20 text-gray-400 border-gray-600/50',
		Altro: 'bg-gray-500/20 text-gray-300 border-gray-500/50'
	};

	/**
	 * [EN] Determines the quantization "flavor" from a string name for styling.
	 * [IT] Determina il "flavor" di quantizzazione da un nome stringa per la stilizzazione.
	 */
	function getQuantizationFlavor(quantName: string): Flavor {
		if (!quantName || quantName === 'N/A') return 'Altro';
		const lower = quantName.toLowerCase();
		if (lower.includes('included')) return 'Virtual';
		if (lower.startsWith('fp16')) return 'FP16';
		if (lower.startsWith('fp8')) return 'FP8';
		if (lower.startsWith('fp4')) return 'FP4';
		if (lower.startsWith('q') && lower.includes('_')) return 'GGUF';
		return 'Altro';
	}

	const modelFlavor = getQuantizationFlavor(result.components.quantization.name);
	const vaeFlavor = getQuantizationFlavor(result.components.vae.quantization);
</script>

<!-- 
  [EN] Displays a single analysis result card.
  It shows the model recipe, compatibility level, resource requirements, and analysis notes.
  ---
  [IT] Mostra una singola card con un risultato dell'analisi.
  Visualizza la ricetta del modello, il livello di compatibilità, i requisiti di risorse e le note di analisi.
-->
<div class="hud-panel bg-surface border border-border rounded-lg p-6 shadow-lg transition-all hover:shadow-primary-accent/20 hover:scale-[1.02] flex flex-col h-full">
	<!-- Header Section -->
	<div class="flex justify-between items-start">
		<div>
			<div class="flex items-center gap-2">
				<h3 class="text-xl font-bold text-primary-text">{result.recipeName}</h3>
				{#if result.repository}
					<a
						href={result.repository}
						target="_blank"
						rel="noopener noreferrer"
						class="text-secondary-text hover:text-primary-accent transition-colors"
						title={m.repository_link_title()}
					>
						<HuggingFaceIcon />
					</a>
				{/if}
			</div>
			<p class="text-sm text-secondary-text">{result.modelType}</p>
		</div>
		<span
			class="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap {currentStyle.badgeBg} {currentStyle.textColor}"
		>
			{getLevelText(result.level)}
		</span>
	</div>

	<!-- Component Tags Section -->
	<div class="mt-3 flex gap-2 flex-wrap">
		<a
			href={result.components.model.repository}
			target="_blank"
			rel="noopener noreferrer"
			class="text-xs border px-2 py-0.5 rounded-full {flavorStyles[
				modelFlavor
			]} flex items-center gap-1 hover:border-primary-accent"
			title={m.repository_link_title()}
		>
			<span>{m.card_label_model()} {result.components.quantization.name}</span>
			<HuggingFaceIcon width={12} height={12} />
		</a>
		{#each result.components.text_encoders as encoder (encoder.name)}
			{#if encoder.cost > 0}
				<a
					href={encoder.repository}
					target="_blank"
					rel="noopener noreferrer"
					class="text-xs border px-2 py-0.5 rounded-full {flavorStyles[
						getQuantizationFlavor(encoder.quantization)
					]} flex items-center gap-1 hover:border-primary-accent"
					title={m.repository_link_title()}
				>
					<span>{m.card_label_encoder()} {encoder.quantization}</span>
					<HuggingFaceIcon width={12} height={12} />
				</a>
			{/if}
		{/each}
		{#if result.components.vae.cost > 0 && result.components.vae.repository}
			<a
				href={result.components.vae.repository}
				target="_blank"
				rel="noopener noreferrer"
				class="text-xs border px-2 py-0.5 rounded-full {flavorStyles[
					vaeFlavor
				]} flex items-center gap-1 hover:border-primary-accent"
				title={m.repository_link_title()}
			>
				<span>{m.card_label_vae()} {result.components.vae.quantization}</span>
				<HuggingFaceIcon width={12} height={12} />
			</a>
		{/if}
	</div>

	<!-- Main Stats Section -->
	<div class="mt-4 space-y-3 text-primary-text">
		<div class="flex items-center justify-between">
			<span>{m.card_quality_model()}</span>
			<span class="font-mono bg-background/50 px-2 py-1 rounded">{result.quality} / 100</span>
		</div>
		<div class="flex items-center justify-between">
			<span>{m.card_vram_requirement()}</span>
			<span class="font-mono {currentStyle.textColor}">{result.totalVramCost.toFixed(2)} GB</span>
		</div>
		<div class="flex items-center justify-between">
			<span>{m.card_ram_requirement()}</span>
			<span class="font-mono {currentStyle.textColor}">{result.totalRamCost.toFixed(2)} GB</span>
		</div>
	</div>

	<!-- Composition Breakdown Section -->
	<div class="mt-4 pt-4 border-t border-border/50">
		<h4 class="text-sm font-semibold text-secondary-text mb-2">{m.card_composition_title()}</h4>
		<div class="space-y-2 text-sm">
			<div class="flex justify-between">
				<span class="text-secondary-text">{result.components.model.name}</span>
				<span class="font-mono bg-background/50 px-2 py-1 rounded">{result.components.model.cost.toFixed(2)} GB</span>
			</div>
			<div class="flex justify-between">
				<span class="text-secondary-text">{m.card_precision()} {result.components.quantization.name}</span>
			</div>
			{#each result.components.text_encoders as encoder (encoder.name)}
				<div class="flex justify-between">
					<span class="text-secondary-text">{m.card_label_encoder()} {encoder.name}</span>
					<span class="font-mono bg-background/50 px-2 py-1 rounded">{encoder.cost.toFixed(2)} GB</span>
				</div>
			{/each}
			{#if result.components.vae.cost > 0}
				<div class="flex justify-between">
					<span class="text-secondary-text">{m.card_label_vae()} {result.components.vae.name}</span>
					<span class="font-mono bg-background/50 px-2 py-1 rounded">{result.components.vae.cost.toFixed(2)} GB</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Analysis Notes Section -->
	<div class="mt-4 pt-4 border-t border-border/50 flex-grow flex flex-col">
		<h4 class="text-sm font-semibold text-secondary-text mb-2">{m.card_analysis_notes()}</h4>
		<ul class="list-disc list-inside space-y-1 text-sm {currentStyle.textColor}">
			{#each result.notes as note}
				<li>{translateNote(note)}</li>
			{/each}
		</ul>
	</div>
</div>