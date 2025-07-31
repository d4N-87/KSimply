<script lang="ts">
	// [EN] Import the main layout components.
	// [IT] Importa i componenti principali del layout.
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import NeuralNetwork from '$lib/components/NeuralNetwork.svelte';
    import '../app.css';

	// [EN] Get the 'children' prop, which contains the content of the current page.
	// [IT] Ottiene la prop 'children', che contiene il contenuto della pagina corrente.
    let { children } = $props();
</script>

<!-- 
  [EN] The root layout structure for every page.
  It includes a background animation and stacks the Header, main content, and Footer.
  ---
  [IT] La struttura di layout di base per ogni pagina.
  Include un'animazione di sfondo e impila l'Header, il contenuto principale e il Footer.
-->
<div class="relative min-h-screen">
    <!-- [EN] Background canvas for the neural network animation. -->
	<!-- [IT] Canvas di sfondo per l'animazione della rete neurale. -->
    <div class="absolute inset-0 z-0">
        <NeuralNetwork />
    </div>
    <!-- [EN] Main content container, stacked above the background. -->
	<!-- [IT] Contenitore del contenuto principale, posizionato sopra lo sfondo. -->
    <div class="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main class="flex-grow">
			<!-- [EN] Renders the specific content of the current route. -->
			<!-- [IT] Renderizza il contenuto specifico della rotta corrente. -->
            {@render children()}
        </main>
        <Footer />
    </div>
</div>