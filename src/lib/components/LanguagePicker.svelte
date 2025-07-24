<script lang="ts">
	import { availableLanguageTags, setLanguageTag } from '$paraglide/runtime';
</script>

<div class="relative">
	<select
		class="bg-surface border border-border rounded-md px-3 py-2 appearance-none cursor-pointer hover:bg-border transition-colors text-center"
		onchange={(e) => setLanguageTag(e.currentTarget.value as any)}
	>
		{#each availableLanguageTags as lang}
			<option value={lang}>{lang.toUpperCase()}</option>
		{/each}
	</select>
</div>