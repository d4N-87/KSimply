<script lang="ts">
	// CORREZIONE: Usiamo i nomi corretti esportati dalla libreria @inlang/paraglide-js
	import { getLocale, locales, setLocale } from '$paraglide/runtime';
	// CORREZIONE: Il tipo corrispondente si chiama 'Locale'
	import type { Locale } from '$paraglide/runtime';
</script>

<div class="relative">
	<select
		class="bg-surface border border-border rounded-md px-3 py-2 appearance-none cursor-pointer hover:bg-border transition-colors text-center w-20"
		value={getLocale()}
		onchange={(e) => {
			const lang = e.currentTarget.value as Locale;
			setLocale(lang);
		}}
	>
		{#each locales as lang}
			<option value={lang}>{lang.toUpperCase()}</option>
		{/each}
	</select>
</div>