<script lang="ts">
	import LanguagePicker from './LanguagePicker.svelte';
</script>

<!-- 
  [EN] The main application header.
  It contains the logo, which links to the project's GitHub repository,
  and the language selector component.
  ---
  [IT] L'header principale dell'applicazione.
  Contiene il logo, che linka al repository GitHub del progetto,
  e il componente per la selezione della lingua.
-->
<header class="w-full p-4 border-b border-border">
	<div class="max-w-5xl mx-auto flex justify-between items-center">
		<a
			href="https://github.com/d4N-87/KSimply"
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

		<div class="flex items-center gap-4">
			<LanguagePicker />
		</div>
	</div>
</header>