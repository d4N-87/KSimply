<script lang="ts">
	// [EN] Import runtime functions and types from Paraglide for i18n.
	// [IT] Importa funzioni e tipi di runtime da Paraglide per l'i18n.
	import { getLocale, locales, setLocale } from '$paraglide/runtime';
	import type { Locale } from '$paraglide/runtime';
</script>

<!-- 
  [EN] A language picker component.
  It displays a dropdown with available languages and allows the user to switch the current locale.
  ---
  [IT] Un componente per la selezione della lingua.
  Mostra un menu a tendina con le lingue disponibili e permette all'utente di cambiare la lingua corrente.
-->
<div class="relative">
	<select
		class="bg-surface border border-border rounded-md px-3 py-2 appearance-none cursor-pointer hover:bg-border transition-colors text-center w-20"
		value={getLocale()}
		onchange={(e) => {
			// [EN] Assert the type of the selected value to 'Locale' and call setLocale.
			// [IT] Esegue un'asserzione di tipo sul valore selezionato a 'Locale' e chiama setLocale.
			const lang = e.currentTarget.value as Locale;
			setLocale(lang);
		}}
	>
		<!-- [EN] Iterate over the available locales to create the dropdown options. -->
		<!-- [IT] Itera sulle lingue disponibili per creare le opzioni del menu a tendina. -->
		{#each locales as lang}
			<option value={lang}>{lang.toUpperCase()}</option>
		{/each}
	</select>
</div>