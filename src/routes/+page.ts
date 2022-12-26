import type { PageLoad } from './$types';
import { AppwriteService } from '$lib/appwrite';

export const load = (async () => {
	const response = await AppwriteService.getHallOfFame();

	return {
		hallOfFamePlayers: response.documents
	};
}) satisfies PageLoad;
