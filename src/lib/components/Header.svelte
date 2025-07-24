<script lang="ts">
	import LanguagePicker from './LanguagePicker.svelte';
</script>

<header class="w-full p-4 border-b border-border">
	<div class="max-w-5xl mx-auto flex justify-between items-center">
		<!-- Logo Placeholder -->
		<a
			href="/"
			class="flex items-center justify-center w-10 h-10 bg-surface border-2 border-primary-accent rounded-md text-2xl font-bold text-primary-accent hover:bg-primary-accent hover:text-background transition-colors"
			aria-label="KSimply Home"
		>
			K
		</a>

		<!-- Azioni Header -->
		<div class="flex items-center gap-4">
			<LanguagePicker />
		</div>
	</div>
</header>