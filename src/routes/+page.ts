// src/routes/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		// Eseguiamo entrambe le chiamate in parallelo per efficienza
		const gpuResponsePromise = fetch('/api/gpus');
		const modelResponsePromise = fetch('/api/models');

		const [gpuResponse, modelResponse] = await Promise.all([
			gpuResponsePromise,
			modelResponsePromise
		]);

		if (!gpuResponse.ok) {
			throw new Error('Errore nel caricare la lista delle GPU');
		}
		if (!modelResponse.ok) {
			throw new Error('Errore nel caricare la lista dei modelli');
		}

		const gpus = await gpuResponse.json();
		const allModelNames = await modelResponse.json();

		// Restituiamo entrambi i set di dati
		return {
			gpus: gpus,
			allModelNames: allModelNames
		};
	} catch (error) {
		console.error('Errore in +page.ts load:', error);
		// Restituiamo array vuoti in caso di errore per non far crashare la pagina
		return {
			gpus: [],
			allModelNames: []
		};
	}
};