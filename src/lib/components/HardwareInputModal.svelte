<script lang="ts">
	// Riceviamo la funzione 'close' dal componente genitore.
	// Questa è la sintassi di Svelte 5 per le proprietà.
	let { close }: { close: () => void } = $props();
</script>

<!-- 
  Questo è lo sfondo scuro semi-trasparente.
  - Gestisce la chiusura al click SOLO se il click avviene direttamente su di esso.
  - Gestisce la chiusura con il tasto 'Escape'.
  - È reso accessibile con 'role' e 'tabindex'.
-->
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
	<!-- 
    Questo è il contenitore del modale.
    - Non ha più un suo evento onclick, per evitare problemi con il linter.
    - Ha il ruolo 'dialog' e un tabindex='-1' per una corretta accessibilità.
  -->
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
				<!-- Icona "X" in formato SVG -->
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

		<!-- Per ora, lasciamo il form come un segnaposto. Lo implementeremo nel prossimo step. -->
		<div class="text-center p-8 bg-gray-700 rounded-md">
			<p>Qui andrà il form per l'input dei dati.</p>
		</div>
	</div>
</div>