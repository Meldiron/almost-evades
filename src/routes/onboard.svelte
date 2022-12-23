<script>
	import { AppwriteService } from '$lib/appwrite';
	import { accountStore, profileStore } from '$lib/stores';
	import Card from '$lib/components/card.svelte';

	let nickname = '';
	async function signIn() {
		await AppwriteService.createProfile(nickname);

        const userId = $accountStore?.$id ?? '';

		const account = await AppwriteService.getAccount();
		const profile = await AppwriteService.getProfile(userId);

		accountStore.set(account);
		profileStore.set(profile);
	}
</script>

<Card>
	<h1 class="text-black font-bold text-2xl">Almost There!</h1>

	<form on:submit|preventDefault={signIn} class="flex flex-col space-y-2">
		<p class="text-black">Nickname:</p>
		<input
			required={true}
			type="text"
			bind:value={nickname}
			placeholder="Your nickname"
			class="rounded-md bg-slate-100 p-3 w-full"
		/>
		<button type="submit" class="bg-cyan-600 text-white px-6 py-3 rounded-md">Create Profile</button>
		<p class="text-sm text-slate-500 italic text-center">
			Nickname is public. Anyone can see it.
		</p>
	</form>
</Card>
