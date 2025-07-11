<script lang="ts">
	// Definiamo i valori standard per la RAM
	const ramOptions = [4, 8, 16, 32, 64, 128, 256];

	// Variabili di stato del form
	let selectedGpuName = '';
	let selectedRam: number = 16; // Valore di default
	let storageType: 'hdd' | 'ssd' | 'nvme' = 'ssd'; // Valore di default

	// Dati caricati dalla funzione `load`
	let { data } = $props();

	async function analyzeHardware() {
		// Mostra un feedback all'utente (opzionale ma consigliato)
		console.log('Analisi in corso...');

		// Controlliamo che una GPU sia stata selezionata
		if (!selectedGpuName) {
			alert('Per favore, seleziona una scheda video dalla lista.');
			return;
		}

		const hardwareData = {
			gpu: selectedGpuName,
			// La VRAM non viene più inviata, sarà determinata dal server
			ram: selectedRam,
			storage: storageType
		};

		try {
			// Invia i dati al nostro endpoint API usando il metodo POST
			const response = await fetch('/', {
				// Usiamo '/' perché l'API è sulla stessa rotta
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(hardwareData) // Convertiamo l'oggetto in una stringa JSON
			});

			// Controlla se la richiesta è andata a buon fine
			if (!response.ok) {
				throw new Error(`Errore HTTP: ${response.status}`);
			}

			// Estrai i dati JSON dalla risposta
			const result = await response.json();

			// Mostra i risultati nella console (per ora)
			console.log("Risultati ricevuti dall'API:", result);

			if (result.success && result.gpu) {
				// Ora la VRAM arriva direttamente dal server!
				alert(
					`GPU trovata nel database: ${result.gpu.name} con ${result.gpu.vram_gb}GB di VRAM!`
				);
			} else {
				alert(`La GPU "${hardwareData.gpu}" non è stata trovata nel nostro database.`);
			}
		} catch (error) {
			console.error('Errore durante la chiamata API:', error);
			alert("Si è verificato un errore durante l'analisi. Controlla la console per i dettagli.");
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
		<form class="space-y-6" on:submit|preventDefault={analyzeHardware}>
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
					{#each data.gpus as gpuOption}
						<option value={gpuOption.name}>{gpuOption.name}</option>
					{/each}
				</select>
				{#if data.gpus.length === 0}
					<p class="text-xs text-red-400 mt-1">Impossibile caricare la lista delle GPU.</p>
				{/if}
			</div>

			<!-- VRAM (RIMOSSO) -->
			<!-- Il div per l'input della VRAM è stato completamente rimosso -->

			<!-- RAM (NUOVO MENU A TENDINA) -->
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

			<!-- Storage -->
			<div>
				<label for="storage" class="block text-sm font-medium text-gray-300 mb-1"
					>Tipo di Storage Principale</label
				>
				<select
					id="storage"
					bind:value={storageType}
					class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
				>
					<option value="hdd">Hard Disk Meccanico (HDD)</option>
					<option value="ssd">SSD (SATA / M.2 SATA)</option>
					<option value="nvme">M.2 NVMe</option>
				</select>
				<p class="text-xs text-gray-400 mt-1">Influisce sui tempi di caricamento dei modelli.</p>
			</div>

			<!-- Bottone di invio -->
			<div class="pt-4">
				<button
					type="submit"
					class="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50"
				>
					Analizza e Mostrami i Risultati
				</button>
			</div>
		</form>
	</div>

	<footer class="mt-12 text-gray-500 text-sm">
		<p>KSimply v1.0 - Un progetto open source per la community.</p>
	</footer>
</main>