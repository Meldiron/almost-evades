import type { PageLoad } from './$types';
import { AppwriteService } from '$lib/appwrite';

export const load = (async ({ params }) => {
	const profileId = params.profileId ?? '';

	const profile = await AppwriteService.getProfile(profileId);

	return {
		profile
	};
}) satisfies PageLoad;
