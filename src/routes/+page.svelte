<script lang="ts">
	// [EN] Import i18n messages, Svelte transitions, components, types, and icons.
	// [IT] Importa messaggi i18n, transizioni Svelte, componenti, tipi e icone.
	import * as m from '$paraglide/messages';
	import { fly } from 'svelte/transition';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import type { AnalysisResult, AnalysisLevel } from '$lib/core/analyzer';
	import { Cpu, MemoryStick, Search } from 'lucide-svelte';

	// [EN] Page data loaded from the `load` function in `+page.ts` or `+page.server.ts`.
	// [IT] Dati della pagina caricati dalla funzione `load` in `+page.ts` o `+page.server.ts`.
	const { data } = $props<{
		data: {
			gpus: { id: number; name: string }[];
			allModelNames: string[];
		};
	}>();

	// [EN] The title is split into characters for a simple hover animation effect.
	// [IT] Il titolo viene diviso in caratteri per un semplice effetto di animazione al passaggio del mouse.
	const titleChars = m.app_title().split('');

	// --- STATE MANAGEMENT (Svelte 5 Runes) ---
	// [EN] All reactive state for the page is managed here using Svelte 5 runes.
	// [IT] Tutto lo stato reattivo della pagina è gestito qui tramite le runes di Svelte 5.

	// [EN] Derived state for a sorted list of model names. It re-calculates automatically if `data` changes.
	// [IT] Stato derivato per una lista ordinata di nomi di modelli. Si ricalcola automaticamente se `data` cambia.
	const sortedModelNames = $derived(data.allModelNames.slice().sort((a: string, b: string) => a.localeCompare(b)));
	
	// [EN] UI state variables for user selections and component visibility.
	// [IT] Variabili di stato della UI per le selezioni dell'utente e la visibilità dei componenti.
	const baseClass = 'px-4 py-1 text-sm rounded-full transition-all';
	let isModelListVisible = $state(false);
	let selectedGpuName = $state('');
	let selectedRam = $state<number>(16);
	const ramOptions = [4, 8, 16, 24, 32, 48, 64, 96, 128, 256];
	
	// [EN] State variables to manage the analysis process flow.
	// [IT] Variabili di stato per gestire il flusso del processo di analisi.
	let isLoading = $state(false);
	let analysisResults = $state<AnalysisResult[]>([]);
	let analysisPerformed = $state(false);
	let progressPercent = $state(0);

	// [EN] State for the active level filters (e.g., Optimal, Possible).
	// [IT] Stato per i filtri di livello attivi (es. Ottimale, Possibile).
	let activeLevelFilters = $state<Set<AnalysisLevel>>(new Set(['Verde', 'Giallo']));
	function toggleLevelFilter(level: AnalysisLevel) {
		const newSet = new Set(activeLevelFilters);
		if (newSet.has(level)) newSet.delete(level);
		else newSet.add(level);
		activeLevelFilters = newSet;
	}

	// [EN] Derived state for available model types, and state for active type filters.
	// [IT] Stato derivato per i tipi di modello disponibili e stato per i filtri di tipo attivi.
	let modelTypes = $derived([...new Set(analysisResults.map((r) => r.modelType))]);
	let activeTypeFilters = $state<Set<string>>(new Set());
	function toggleTypeFilter(type: string) {
		const newSet = new Set(activeTypeFilters);
		if (newSet.has(type)) newSet.delete(type);
		else newSet.add(type);
		activeTypeFilters = newSet;
	}

	// [EN] A derived state that automatically computes the filtered results whenever `analysisResults` or the filters change.
	// [IT] Uno stato derivato che calcola automaticamente i risultati filtrati ogni volta che `analysisResults` o i filtri cambiano.
	const filteredResults = $derived(
		analysisResults.filter((result) => {
			const levelMatch = activeLevelFilters.has(result.level);
			const typeMatch = activeTypeFilters.size === 0 || activeTypeFilters.has(result.modelType);
			return levelMatch && typeMatch;
		})
	);

	/**
	 * [EN] Handles the form submission to start the hardware analysis.
	 * It sends user hardware data to the root server endpoint and processes the results.
	 * ---
	 * [IT] Gestisce l'invio del form per avviare l'analisi dell'hardware.
	 * Invia i dati hardware dell'utente all'endpoint server di root e processa i risultati.
	 */
	async function analyzeHardware(event: SubmitEvent) {
		event.preventDefault();
		if (!selectedGpuName) {
			window.alert(m.gpu_select_placeholder());
			return;
		}
		isLoading = true;
		analysisPerformed = true;
		analysisResults = [];
		activeTypeFilters = new Set();
		progressPercent = 10;
		const hardwareData = { gpu: selectedGpuName, ram: selectedRam };
		try {
			const response = await fetch('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(hardwareData)
			});
			progressPercent = 80;
			if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
			const result = await response.json();
			if (result.success && result.analysis) {
				analysisResults = result.analysis;
			} else {
				throw new Error(result.message || 'Risposta API non valida');
			}
			progressPercent = 100;
			setTimeout(() => (isLoading = false), 500);
		} catch (error) {
			console.error('Errore catturato nel frontend:', error);
			isLoading = false;
		}
	}
</script>

<!-- 
  [EN] The main page component, responsible for user input and displaying analysis results.
  [IT] Il componente della pagina principale, responsabile dell'input utente e della visualizzazione dei risultati dell'analisi.
-->
<main class="w-full flex flex-col items-center p-4 md:p-8 overflow-x-hidden">
	<!-- [EN] Hero section with title and subtitle. -->
	<!-- [IT] Sezione "Hero" con titolo e sottotitolo. -->
	<div class="text-center max-w-3xl mx-auto mb-16">
		<h1 class="text-6xl md:text-8xl tracking-wider leading-tight font-display uppercase">
			{#each titleChars as char, i (char + i)}
				<span class="transition-colors duration-200 hover:text-secondary-accent">
					{char}
				</span>
			{/each}
		</h1>
		<p class="mt-4 text-lg md:text-xl text-secondary-text max-w-2xl mx-auto">
			{m.app_subtitle()}
		</p>
	</div>

	<!-- [EN] The main form for hardware selection. -->
	<!-- [IT] Il form principale per la selezione dell'hardware. -->
	<div class="hud-panel bg-surface border border-border rounded-lg p-6 md:p-8 w-full max-w-lg backdrop-blur-sm">
		<form class="space-y-6" onsubmit={analyzeHardware}>
			<div>
				<label for="gpu" class="flex items-center text-sm font-medium text-secondary-accent mb-2">
					<Cpu class="w-4 h-4 mr-2" />
					{m.gpu_label()}
				</label>
				<select id="gpu" bind:value={selectedGpuName} class="w-full bg-transparent border-2 border-border rounded-md px-3 py-2 text-primary-text focus:ring-2 focus:ring-primary-accent focus:border-primary-accent transition appearance-none" required>
					<option class="bg-background" disabled selected value="">{m.gpu_select_placeholder()}</option>
					{#each data.gpus as gpuOption (gpuOption.id)}
						<option class="bg-background" value={gpuOption.name}>{gpuOption.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="ram" class="flex items-center text-sm font-medium text-secondary-accent mb-2">
					<MemoryStick class="w-4 h-4 mr-2" />
					{m.ram_label()}
				</label>
				<select id="ram" bind:value={selectedRam} class="w-full bg-transparent border-2 border-border rounded-md px-3 py-2 text-primary-text focus:ring-2 focus:ring-primary-accent focus:border-primary-accent transition appearance-none">
					{#each ramOptions as ramValue}
						<option class="bg-background" value={ramValue}>{ramValue} GB</option>
					{/each}
				</select>
			</div>
			<div class="pt-4">
				<button type="submit" class="w-full flex items-center justify-center gap-2 bg-primary-accent hover:bg-secondary-accent text-background font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-secondary-accent/50 disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={isLoading}>
					{#if isLoading}
						<span>{m.analyze_button_loading()}</span>
					{:else}
						<Search class="w-6 h-6" />
						<span>{m.analyze_button()}</span>
					{/if}
				</button>
			</div>
		</form>
	</div>

	<!-- [EN] A toggle button to show/hide the full list of models in the database. -->
	<!-- [IT] Un pulsante per mostrare/nascondere la lista completa dei modelli nel database. -->
	<div class="text-center mt-6">
		<button onclick={() => (isModelListVisible = !isModelListVisible)} class="text-sm text-primary-accent border border-primary-accent/50 rounded-full px-4 py-2 hover:bg-primary-accent/10 transition-colors">
			{isModelListVisible ? m.hide_models_button() : m.show_models_button()}
		</button>
	</div>
	{#if isModelListVisible}
		<div transition:fly={{ y: -20 }} class="w-full max-w-2xl bg-surface border border-border p-6 rounded-lg mt-4">
			<h3 class="font-bold text-lg mb-4 text-primary-text">{m.db_models_title()}</h3>
			<div class="max-h-60 overflow-y-auto pr-4 columns-1 md:columns-3 gap-x-6">
				{#each sortedModelNames as modelName (modelName)}
					<p class="text-sm text-secondary-text mb-1 break-inside-avoid hover:text-secondary-accent transition-colors cursor-default">
						{modelName}
					</p>
				{/each}
			</div>
		</div>
	{/if}

	<!-- [EN] This section conditionally renders the loading state, the results, or a "no results" message. -->
	<!-- [IT] Questa sezione renderizza condizionalmente lo stato di caricamento, i risultati o un messaggio di "nessun risultato". -->
	<div class="w-full max-w-5xl mx-auto mt-16">
		{#if isLoading}
			<div class="w-full max-w-lg mx-auto text-center">
				<div class="w-full bg-surface rounded-full h-4 overflow-hidden border border-border">
					<div class="h-4 rounded-full transition-all duration-500 ease-in-out animation-stripes bg-secondary-accent" style="width: {progressPercent}%;"></div>
				</div>
			</div>
		{:else if analysisResults.length > 0}
			<!-- [EN] Filters and grid for displaying analysis results. -->
			<!-- [IT] Filtri e griglia per la visualizzazione dei risultati dell'analisi. -->
			<div class="hud-panel mb-8 p-4 bg-surface/50 border border-border rounded-lg space-y-4">
				<div class="flex items-center gap-4 flex-wrap">
					<span class="font-semibold text-secondary-text min-w-max">{m.filter_show()}</span>
					<div class="flex gap-2 flex-wrap">
						<button onclick={() => toggleLevelFilter('Verde')} class="{baseClass} {activeLevelFilters.has('Verde') ? 'bg-green-500 text-white font-bold ring-2 ring-green-300' : 'bg-surface hover:bg-border'}">
							{m.filter_optimal()}
						</button>
						<button onclick={() => toggleLevelFilter('Giallo')} class="{baseClass} {activeLevelFilters.has('Giallo') ? 'bg-amber-500 text-white font-bold ring-2 ring-amber-300' : 'bg-surface hover:bg-border'}">
							{m.filter_possible()}
						</button>
					</div>
				</div>
				{#if modelTypes.length > 1}
					<div class="flex items-center gap-4 flex-wrap">
						<span class="font-semibold text-secondary-text min-w-max">{m.filter_type()}</span>
						<div class="flex gap-2 flex-wrap">
							{#each modelTypes as type (type)}
								<button onclick={() => toggleTypeFilter(type)} class="{baseClass} {activeTypeFilters.has(type) ? 'bg-primary-accent text-background font-bold ring-2 ring-primary-accent/50' : 'bg-surface hover:bg-border'}">
									{type}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- [EN] Dynamically displays the result count title using i18n messages. -->
			<!-- [IT] Mostra dinamicamente il titolo del conteggio dei risultati usando i messaggi i18n. -->
			<h2 class="text-3xl font-bold text-center mb-8">
				{#if filteredResults.length === 0}
					{m.results_title_none()}
				{:else if filteredResults.length === 1}
					{m.results_title_one()}
				{:else}
					{m.results_title_many({ count: filteredResults.length })}
				{/if}
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each filteredResults as result (result.id)}
					<div in:fly={{ y: 20, duration: 500 }}><ResultCard {result} /></div>
				{/each}
			</div>
		{:else if analysisPerformed}
			<!-- [EN] Message displayed when analysis is done but yields no compatible models. -->
			<!-- [IT] Messaggio visualizzato quando l'analisi è completata ma non produce modelli compatibili. -->
			<div class="text-center bg-surface border border-border p-8 rounded-2xl">
				<h3 class="text-2xl font-bold text-secondary-accent">{m.no_results_title()}</h3>
				<p class="mt-2 text-secondary-text">{m.no_results_subtitle()}</p>
			</div>
		{/if}
	</div>
</main>