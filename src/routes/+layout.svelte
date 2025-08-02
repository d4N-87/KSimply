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
    <!-- 
      [EN] Background container with the animation and a gradient overlay for a fade-out effect.
      [IT] Contenitore di sfondo con l'animazione e un velo con gradiente per un effetto di sfumatura.
    -->
    <div class="fixed inset-0 z-0">
        <!-- [EN] The p5.js canvas animation component. -->
        <!-- [IT] Il componente dell'animazione canvas di p5.js. -->
        <NeuralNetwork />

        <!-- [EN] GRADIENT OVERLAY: This div sits on top of the canvas. -->
        <!-- [IT] VELO CON GRADIENTE: Questo div è posizionato sopra il canvas. -->
        <div class="absolute inset-0 z-10 [background-image:linear-gradient(to_bottom,transparent_70%,#030b17_100%)]">            
        </div>
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