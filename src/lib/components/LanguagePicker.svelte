<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { languageTag, availableLanguageTags, sourceLanguageTag } from '$paraglide/runtime';

	function changeLanguage(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newLang = target.value;

		const currentPath = $page.url.pathname;
		const currentLang = languageTag();

		// Rimuove il prefisso della lingua corrente, se esiste
		const basePath = currentLang === sourceLanguageTag
			? currentPath
			: currentPath.replace(`/${currentLang}`, '');

		// Costruisce il nuovo percorso
		const newPath = newLang === sourceLanguageTag
			? (basePath === '' ? '/' : basePath)
			: `/${newLang}${basePath}`;
		
		goto(newPath, { invalidateAll: true });
	}
</script>

<div class="relative">
	<select
		class="bg-surface border border-border rounded-md px-3 py-2 appearance-none cursor-pointer hover:bg-border transition-colors text-center w-20"
		value={languageTag()}
		onchange={changeLanguage}
	>
		{#each availableLanguageTags as lang}
			<option value={lang}>{lang.toUpperCase()}</option>
		{/each}
	</select>
</div>