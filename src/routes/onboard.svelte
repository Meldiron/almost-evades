<script>
	import { AppwriteService } from '$lib/appwrite';
	import { accountStore, profileStore } from '$lib/stores';
	import Card from '$lib/components/card.svelte';

	let nickname = '';
	let isLoading = false;
	async function signIn() {
		isLoading = true;
		await AppwriteService.createProfile(nickname);

		const userId = $accountStore?.$id ?? '';

		const account = await AppwriteService.getAccount();
		const profile = await AppwriteService.getProfile(userId);

		accountStore.set(account);
		profileStore.set(profile);
		isLoading = false;
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
		<button
			disabled={isLoading}
			type="submit"
			class="disabled:opacity-50 bg-cyan-600 text-white px-6 py-3 rounded-md flex justify-center space-x-2 items-center">
			{#if isLoading}
			<svg
				class="animate-spin h-5 w-5 text-white"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
		{:else}
			<p>Create Profile</p>
		{/if}</button
		>
		<p class="text-sm text-slate-500 italic text-center">Nickname is public. Anyone can see it.</p>
	</form>
</Card>
