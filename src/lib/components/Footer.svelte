<script lang="ts">
	import * as m from '$paraglide/messages';
	import { Github } from 'lucide-svelte';
	// 1. Importiamo la nostra nuova costante di versione.
	import { APP_VERSION } from '$lib/config';
</script>

<footer class="w-full text-center p-8 mt-16 border-t border-border/50 text-secondary-text">
	<div class="max-w-2xl mx-auto">
		<div class="flex justify-center items-center gap-4 mb-4">
			<a
				href="https://github.com/d4N-87"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-2 hover:text-primary-accent transition-colors"
			>
				<Github class="w-5 h-5" />
				<span>{m.footer_github()}</span>
			</a>
		</div>
		<p class="text-xs italic mb-4">
			{m.footer_disclaimer()}
		</p>
		<!-- 2. Usiamo la costante direttamente nel template. -->
		<p class="text-sm font-bold">KSimply {APP_VERSION}</p>
	</div>
</footer>