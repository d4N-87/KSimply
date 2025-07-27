<script lang="ts">
	import LanguagePicker from './LanguagePicker.svelte';
</script>

<header class="w-full p-4 border-b border-border">
	<div class="max-w-5xl mx-auto flex justify-between items-center">
		<!-- MODIFICA: Aggiunta animazione e effetto glow al logo -->
		<a 
			href="https://github.com/d4n-87" 
			target="_blank" 
			rel="noopener noreferrer"
			class="transition-transform duration-300 hover:scale-105"
		>
			<img 
				src="/ksimply_logo.png" 
				alt="KSimply Logo" 
				class="w-20 h-20 rounded-full animate-subtle-float transition-all duration-300 hover:drop-shadow-[0_0_12px_theme(colors.secondary-accent)]" 
			/>
		</a>

		<!-- Azioni Header -->
		<div class="flex items-center gap-4">
			<LanguagePicker />
		</div>
	</div>
</header>