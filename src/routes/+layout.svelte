<script lang="ts">
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte'; // <-- Importa il nuovo Footer
	import NeuralNetwork from '$lib/components/NeuralNetwork.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<ParaglideJS {i18n}>
	<NeuralNetwork />

	<div class="relative z-10 flex flex-col min-h-screen">
		<Header />
		<div class="flex-grow">
			{@render children()}
		</div>
		<Footer /> <!-- <-- Usa il nuovo componente Footer -->
	</div>
</ParaglideJS>