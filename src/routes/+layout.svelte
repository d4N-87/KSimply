<script lang="ts">
	import type { LayoutData } from './$types';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import NeuralNetwork from '$lib/components/NeuralNetwork.svelte';
	import '../app.css';

	let { data, children } = $props<{ data: LayoutData }>();
</script>

<ParaglideJS {i18n} languageTag={data.paraglide?.lang}>
	<!--
		LA SOLUZIONE FINALE: Usiamo un blocco {#key}.
		La chiave è la lingua corrente (`data.paraglide?.lang`).
		Ogni volta che la lingua cambia (es. da 'it' a 'en'), SvelteKit
		distruggerà e ricreerà da zero tutto il contenuto del blocco.
		Questo forza il re-rendering di Header e Footer, risolvendo
		il problema della traduzione mancante.
	-->
	{#key data.paraglide?.lang}
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
	{/key}
</ParaglideJS>