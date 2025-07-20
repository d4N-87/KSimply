<script lang="ts">
	import { fly } from 'svelte/transition';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import type { AnalysisResult, AnalysisLevel } from '$lib/core/analyzer';

	const { data } = $props<{
		data: {
			gpus: { id: number; name: string }[];
			allModelNames: string[];
		};
	}>();

	const baseClass = 'px-4 py-1 text-sm rounded-full transition-all';
	let isModelListVisible = $state(false);
	let selectedGpuName = $state('');
	let selectedRam = $state<number>(16);
	const ramOptions = [4, 8, 16, 32, 64, 128, 256];
	let isLoading = $state(false);
	let analysisResults = $state<AnalysisResult[]>([]);
	let analysisPerformed = $state(false);
	let progressPercent = $state(0);
	let progressText = $state('');

	let activeLevelFilters = $state<Set<AnalysisLevel>>(new Set(['Verde', 'Giallo']));
	function toggleLevelFilter(level: AnalysisLevel) {
		const newSet = new Set(activeLevelFilters);
		if (newSet.has(level)) newSet.delete(level);
		else newSet.add(level);
		activeLevelFilters = newSet;
	}

	let modelTypes = $derived([...new Set(analysisResults.map((r) => r.modelType))]);
	let activeTypeFilters = $state<Set<string>>(new Set());
	function toggleTypeFilter(type: string) {
		const newSet = new Set(activeTypeFilters);
		if (newSet.has(type)) newSet.delete(type);
		else newSet.add(type);
		activeTypeFilters = newSet;
	}

	const filteredResults = $derived(
		analysisResults.filter((result) => {
			const levelMatch = activeLevelFilters.has(result.level);
			const typeMatch = activeTypeFilters.size === 0 || activeTypeFilters.has(result.modelType);
			return levelMatch && typeMatch;
		})
	);

	// --- FUNZIONE DI ANALISI REVISIONATA ---
	// La logica di progressione è stata resa più robusta e legata agli eventi reali
	// invece di usare setTimeout() simulati, risolvendo il bug della barra invisibile.
	async function analyzeHardware(event: SubmitEvent) {
		event.preventDefault();
		if (!selectedGpuName) {
			window.alert('Per favore, seleziona una scheda video dalla lista.');
			return;
		}

		// 1. Inizio analisi: imposta lo stato iniziale
		isLoading = true;
		analysisPerformed = true;
		analysisResults = [];
		activeTypeFilters = new Set();
		progressPercent = 10;
		progressText = 'Avvio analisi...';

		const hardwareData = { gpu: selectedGpuName, ram: selectedRam };

		try {
			// 2. Esegui la chiamata di rete
			progressText = 'Recupero e analisi delle combinazioni...';
			const response = await fetch('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(hardwareData)
			});

			// 3. Dati ricevuti: aggiorna il progresso prima di elaborare
			progressPercent = 80;
			progressText = 'Finalizzazione risultati...';

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
			}
			const result = await response.json();

			if (result.success && result.analysis) {
				analysisResults = result.analysis;
			} else {
				throw new Error(result.message || 'Risposta API non valida');
			}

			// 4. Completato: imposta il progresso al 100% e attendi un istante per UX
			progressPercent = 100;
			setTimeout(() => {
				isLoading = false;
			}, 500); // Breve ritardo per mostrare il 100%
		} catch (error) {
			console.error('Errore catturato nel frontend:', error);
			window.alert(`Si è verificato un errore durante l'analisi: ${error instanceof Error ? error.message : String(error)}`);
			isLoading = false;
			progressPercent = 0; // Resetta in caso di errore
		}
	}
</script>

<main class="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 md:p-8">
	<!-- Sezione Titolo -->
	<div class="text-center max-w-2xl mx-auto mb-12">
		<h1
			class="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text"
		>
			KSimply
		</h1>
		<p class="mt-4 text-lg md:text-xl text-gray-300">
			Inserisci le specifiche del tuo PC per scoprire il tuo potenziale nel mondo dell'IA generativa.
		</p>
	</div>

	<!-- Sezione Form -->
	<div class="bg-gray-800 rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-lg">
		<form class="space-y-6" onsubmit={analyzeHardware}>
			<div>
				<label for="gpu" class="block text-sm font-medium text-gray-300 mb-1"
					>Scheda Video (GPU)</label
				>
				<select
					id="gpu"
					bind:value={selectedGpuName}
					class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
					required
				>
					<option disabled selected value="">Scegli una GPU dalla lista...</option>
					{#each data.gpus as gpuOption (gpuOption.id)}
						<option value={gpuOption.name}>{gpuOption.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="ram" class="block text-sm font-medium text-gray-300 mb-1"
					>Memoria di Sistema (RAM)</label
				>
				<select
					id="ram"
					bind:value={selectedRam}
					class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
				>
					{#each ramOptions as ramValue}
						<option value={ramValue}>{ramValue} GB</option>
					{/each}
				</select>
			</div>
			<div class="pt-4">
				<button
					type="submit"
					class="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50 disabled:bg-gray-500 disabled:cursor-not-allowed"
					disabled={isLoading}
				>
					{#if isLoading}
						<span>{progressText}</span>
					{:else}
						<span>Analizza e Mostrami i Risultati</span>
					{/if}
				</button>
			</div>
		</form>
	</div>

	<!-- Lista Modelli -->
	<div class="text-center mt-4">
		<button
			onclick={() => (isModelListVisible = !isModelListVisible)}
			class="text-sm text-sky-400 hover:text-sky-300 underline"
		>
			{isModelListVisible ? 'Nascondi' : 'Mostra'} la lista di tutti i modelli nel nostro database
		</button>
	</div>
	{#if isModelListVisible}
		<div transition:fly={{ y: -20 }} class="w-full max-w-2xl bg-gray-800 p-6 rounded-lg mt-4">
			<h3 class="font-bold text-lg mb-2 text-white">Modelli nel Database di KSimply</h3>
			<ul class="list-disc list-inside text-gray-300 columns-2 md:columns-3 gap-4">
				{#each data.allModelNames as modelName (modelName)}
					<li>{modelName}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Sezione Risultati -->
	<div class="w-full max-w-4xl mx-auto mt-12">
		{#if isLoading}
			<div class="w-full max-w-lg mx-auto text-center">
				<div class="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
					<div
						class="h-4 rounded-full transition-all duration-500 ease-in-out animate-stripes"
						style="
							width: {progressPercent}%;
							background-size: 1rem 1rem;
							background-image: 
								linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent),
								linear-gradient(to right, #0ea5e9, #06b6d4);
						"
					></div>
				</div>
			</div>
		{:else if analysisResults.length > 0}
			<div class="mb-8 p-4 bg-gray-800/50 rounded-lg space-y-4">
				<div class="flex items-center gap-4 flex-wrap">
					<span class="font-semibold text-gray-300 min-w-max">Mostra:</span>
					<div class="flex gap-2 flex-wrap">
						<button
							onclick={() => toggleLevelFilter('Verde')}
							class="{baseClass} {activeLevelFilters.has('Verde')
								? 'bg-green-500 text-white font-bold ring-2 ring-green-300'
								: 'bg-gray-700 hover:bg-gray-600'}"
						>
							Ottimale
						</button>
						<button
							onclick={() => toggleLevelFilter('Giallo')}
							class="{baseClass} {activeLevelFilters.has('Giallo')
								? 'bg-amber-500 text-white font-bold ring-2 ring-amber-300'
								: 'bg-gray-700 hover:bg-gray-600'}"
						>
							Possibile
						</button>
					</div>
				</div>
				<div class="flex items-center gap-4 flex-wrap">
					<span class="font-semibold text-gray-300 min-w-max">Tipologia:</span>
					<div class="flex gap-2 flex-wrap">
						{#each modelTypes as type (type)}
							<button
								onclick={() => toggleTypeFilter(type)}
								class="{baseClass} {activeTypeFilters.has(type)
									? 'bg-sky-500 text-white font-bold ring-2 ring-sky-300'
									: 'bg-gray-700 hover:bg-gray-600'}"
							>
								{type}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<h2 class="text-3xl font-bold text-center mb-8">
				Ecco le tue Ricette AI ({filteredResults.length} trovate)
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each filteredResults as result (result.id)}
					<div in:fly={{ y: 20, duration: 500 }}><ResultCard {result} /></div>
				{/each}
			</div>

			<p class="text-center text-sm text-gray-400 mt-8 italic">
				Se un modello non appare nei risultati, significa che il tuo hardware non è in grado di
				eseguirlo.
			</p>
		{:else if analysisPerformed}
			<div class="text-center bg-gray-800 p-8 rounded-lg">
				<h3 class="text-2xl font-bold text-amber-400">Nessun Risultato Trovato</h3>
				<p class="mt-2 text-gray-300">
					Non abbiamo trovato ricette pienamente compatibili con il tuo hardware.
				</p>
			</div>
		{/if}
	</div>

	<footer class="mt-12 text-gray-500 text-sm">
		<p>KSimply v1.0 - Un progetto open source per la community.</p>
	</footer>
</main>

<style>
	@keyframes stripes {
		from {
			background-position: 1rem 0;
		}
		to {
			background-position: 0 0;
		}
	}
	.animate-stripes {
		animation: stripes 1s linear infinite;
	}
</style>