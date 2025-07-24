<script lang="ts">
	import { Github } from 'lucide-svelte';
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
				<span>GitHub</span>
			</a>
		</div>
		<p class="text-xs italic mb-4">
			Disclaimer: I risultati forniti sono a titolo puramente esemplificativo. Le performance reali
			possono variare in base a ottimizzazioni software, driver e configurazioni specifiche del
			sistema.
		</p>
		<p class="text-sm font-bold">KSimply v1.0</p>
	</div>
</footer>