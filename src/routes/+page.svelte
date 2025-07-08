<script lang="ts">
    import HardwareInputModal from '$lib/components/HardwareInputModal.svelte';
    let showModal = false;
</script>

<main class="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
    <div class="text-center max-w-2xl mx-auto">
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-blue-500 text-transparent bg-clip-text">
            KSimply
        </h1>
        <p class="mt-4 text-lg md:text-xl text-gray-300">
            Sblocca il potenziale del tuo PC. Analizziamo il tuo hardware e ti mostriamo quali modelli di Intelligenza Artificiale puoi eseguire, con guide e consigli su misura per te.
        </p>

        <div class="mt-10">
            <button
                on:click={() => { showModal = true; }}
                class="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-400 focus:ring-opacity-50"
            >
            Analizza il mio Sistema
            </button>
        </div>

        <footer class="mt-20 text-gray-500 text-sm">
            <p>KSimply v1.0 - Un progetto open source per la community.</p>
        </footer>
    </div>

</main>

{#if showModal}
	<HardwareInputModal
		close={() => {
			showModal = false;
		}}
	/>
{/if}