<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import NeuralNetwork from '$lib/components/NeuralNetwork.svelte';
    import '../app.css';

    let { children } = $props();
</script>

<div class="relative min-h-screen">
    <div class="absolute inset-0 z-0">
        <NeuralNetwork />
    </div>
    <div class="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main class="flex-grow">
            {@render children()}
        </main>
        <Footer />
    </div>
</div>