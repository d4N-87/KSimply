<script lang="ts">
    let gpu = '';
    let vram = 8;
    let ram = 16;
    let storageType: 'hdd' | 'ssd' | 'nvme' = 'ssd'; // Valore di default: SSD SATA

    function analyzeHardware() {
        const hardwareData = {
            gpu: gpu,
            vram: vram,
            ram: ram,
            storage: storageType
        };

        console.log("Dati Hardware da Analizzare:", hardwareData);
        
        // Prossimamente, qui passeremo i dati al nostro "cervello" analizzatore.
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

	<!-- Sezione Form (precedentemente nel modale) -->
	<div class="bg-gray-800 rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-lg">
		<form class="space-y-6" on:submit|preventDefault={analyzeHardware}>
			<!-- GPU -->
			<div>
				<label for="gpu" class="block text-sm font-medium text-gray-300 mb-1"
					>Scheda Video (GPU)</label
				>
				<input
					type="text"
					id="gpu"
                    bind:value={gpu}
					class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
					placeholder="Es. NVIDIA GeForce RTX 4070"
					required
				/>
			</div>

			<!-- VRAM -->
			<div>
				<label for="vram" class="block text-sm font-medium text-gray-300 mb-1"
					>Memoria GPU (VRAM)</label
				>
				<div class="flex items-center space-x-2">
					<input
						type="number"
						id="vram"
                        bind:value={vram}
						min="1"
						class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
						required
					/>
					<span class="bg-gray-600 px-4 py-2 rounded-md text-sm">GB</span>
				</div>
				<p class="text-xs text-gray-400 mt-1">
					Il dato più importante. Su Windows: Task Manager > Prestazioni > GPU.
				</p>
			</div>

			<!-- RAM -->
			<div>
				<label for="ram" class="block text-sm font-medium text-gray-300 mb-1"
					>Memoria di Sistema (RAM)</label
				>
				<div class="flex items-center space-x-2">
					<input
						type="number"
						id="ram"
                        bind:value={ram}
						min="1"
						class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
						required
					/>
					<span class="bg-gray-600 px-4 py-2 rounded-md text-sm">GB</span>
				</div>
			</div>

            <!-- Storage -->
    <div>
        <label for="storage" class="block text-sm font-medium text-gray-300 mb-1">Tipo di Storage Principale</label>
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