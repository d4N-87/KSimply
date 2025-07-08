<script lang="ts">
	// Riceviamo la funzione 'close' dal componente genitore.
	let { close }: { close: () => void } = $props();
</script>

<!-- Sfondo e gestore di chiusura -->
<div
	class="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50"
	onclick={(event) => {
		if (event.currentTarget === event.target) {
			close();
		}
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			close();
		}
	}}
	role="button"
	tabindex="0"
>
	<!-- Contenitore del modale -->
	<div
		class="bg-gray-800 text-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-lg mx-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<header class="flex justify-between items-center mb-6">
			<h2 id="modal-title" class="text-2xl font-bold text-sky-400">
				Inserisci le Specifiche del Tuo PC
			</h2>
			<button
				onclick={close}
				class="text-gray-400 hover:text-white transition-colors"
				aria-label="Chiudi modale"
			>
				<!-- Icona "X" -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</header>

		<p class="text-gray-300 mb-8">
			Abbiamo bisogno di alcuni dettagli per darti consigli accurati. Più sei preciso, migliori
			saranno i risultati.
		</p>

		<!-- Form per l'input dei dati -->
		<form class="space-y-6">
			<!-- GPU -->
			<div>
				<label for="gpu" class="block text-sm font-medium text-gray-300 mb-1"
					>Scheda Video (GPU)</label
				>
				<input
					type="text"
					id="gpu"
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
						min="1"
						class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
						required
					/>
					<span class="bg-gray-600 px-4 py-2 rounded-md text-sm">GB</span>
				</div>
			</div>

			<!-- Bottone di invio -->
			<div class="pt-4">
				<button
					type="submit"
					class="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50"
				>
					Mostrami il mio Potenziale AI
				</button>
			</div>
		</form>
	</div>
</div>