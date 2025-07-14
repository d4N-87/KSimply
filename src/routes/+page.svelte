<script lang="ts">
	// --- IMPORTAZIONI ---
	import { fly } from 'svelte/transition';
	import ResultCard from '$lib/components/ResultCard.svelte';
	import type { AnalysisResult } from '$lib/core/analyzer';

	// --- PROPS RICEVUTE DALLA FUNZIONE `load` ---
	const { data } = $props<{ data: { gpus: { id: number; name: string }[] } }>();

	// --- STATO INTERNO REATTIVO (SVELTE 5 RUNES) ---
	const ramOptions = [4, 8, 16, 32, 64, 128, 256];

	// Stato del form
	let selectedGpuName = $state('');
	let selectedRam = $state<number>(16);

	// Stato della UI per i risultati
	let isLoading = $state(false);
	let analysisResults = $state<AnalysisResult[]>([]);
	let analysisPerformed = $state(false);

	/**
	 * Gestisce l'invio del form, chiama l'API e aggiorna lo stato della UI.
	 */
	async function analyzeHardware(event: SubmitEvent) {
		event.preventDefault();

		if (!selectedGpuName) {
			window.alert('Per favore, seleziona una scheda video dalla lista.');
			return;
		}

		isLoading = true;
		analysisPerformed = true;
		analysisResults = [];

		const hardwareData = {
			gpu: selectedGpuName,
			ram: selectedRam
		};

		try {
			const response = await fetch('/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(hardwareData)
			});

			if (!response.ok) {
				throw new Error(`Errore HTTP: ${response.status}`);
			}

			const result = await response.json();

			if (result.success && result.analysis) {
				analysisResults = result.analysis;
			} else {
				throw new Error(result.message || 'Risposta API non valida');
			}
		} catch (error) {
			console.error('Errore catturato nel frontend:', error);
			window.alert(
				"Si è verificato un errore durante l'analisi. Controlla la console del browser per i dettagli."
			);
		} finally {
			isLoading = false;
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
			<!-- GPU -->
			<div>
				<label for="gpu" class="block text-sm font-medium text-gray-300 mb-1">
					Scheda Video (GPU)
				</label>
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
				{#if data.gpus.length === 0}
					<p class="text-xs text-red-400 mt-1">Impossibile caricare la lista delle GPU.</p>
				{/if}
			</div>

			<!-- RAM -->
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

			<!-- Bottone di invio -->
			<div class="pt-4">
				<button
					type="submit"
					class="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50 disabled:bg-gray-500 disabled:cursor-not-allowed"
					disabled={isLoading}
				>
					{#if isLoading}
						Analisi in corso...
					{:else}
						Analizza e Mostrami i Risultati
					{/if}
				</button>
			</div>
		</form>
	</div>

	<p class="text-center text-xs text-gray-500 mt-4 max-w-lg mx-auto">
		<span class="font-bold text-amber-400">Nota:</span> Per un'esperienza ottimale, è fortemente
		consigliato l'uso di un'unità SSD NVMe M.2 per ridurre i tempi di caricamento dei modelli.
	</p>

	<!-- Sezione per la visualizzazione dei risultati -->
	<div class="w-full max-w-4xl mx-auto mt-12">
		{#if isLoading}
			<div class="text-center">
				<p class="text-lg text-sky-400 animate-pulse">Sto analizzando il tuo potenziale...</p>
			</div>
		{:else if analysisResults.length > 0}
			<h2 class="text-3xl font-bold text-center mb-8">Ecco le tue Ricette AI</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- MODIFICA CHIAVE: Usiamo `result.id` come chiave unica -->
				{#each analysisResults as result (result.id)}
					<div in:fly={{ y: 20, duration: 500 }}>
						<ResultCard {result} />
					</div>
				{/each}
			</div>
		{:else if analysisPerformed}
			<div class="text-center bg-gray-800 p-8 rounded-lg">
				<h3 class="text-2xl font-bold text-amber-400">Nessun Risultato Trovato</h3>
				<p class="mt-2 text-gray-300">
					Non abbiamo trovato ricette pienamente compatibili o i dati nel nostro database sono ancora
					limitati. Prova con una configurazione diversa o torna a trovarci presto!
				</p>
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<footer class="mt-12 text-gray-500 text-sm">
		<p>KSimply v1.0 - Un progetto open source per la community.</p>
	</footer>
</main>