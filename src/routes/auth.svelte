<script>
	import { AppwriteService } from '$lib/appwrite';
	import { accountStore, profileStore } from '$lib/stores';
	import Card from '$lib/components/card.svelte';

	let isLoading = false;
	async function playAsGuest() {
		isLoading = true;
		const session = await AppwriteService.loginGuest();
		const userId = session.userId;
		await AppwriteService.createProfile('Guest#' + Date.now().toString());

		const account = await AppwriteService.getAccount();
		const profile = await AppwriteService.getProfile(userId);

		accountStore.set(account);
		profileStore.set(profile);
		isLoading = false;
	}

	let email = '';
	async function signIn() {
		await AppwriteService.loginEmail(email);
		Swal.fire(
			'Sign In',
			'Check your inbox. We sent you e-mail to login to your account.',
			'success'
		);
	}
</script>

<Card>
	<h1 class="text-black font-bold text-2xl">Sign in to Play</h1>

	<form on:submit|preventDefault={signIn} class="flex flex-col space-y-2">
		<p class="text-black">E-mail:</p>
		<input
			required={true}
			type="e-mail"
			bind:value={email}
			placeholder="Your e-mail"
			class="rounded-md bg-slate-100 p-3 w-full"
		/>
		<button type="submit" class="bg-cyan-600 text-white px-6 py-3 rounded-md">Sign In</button>
		<p class="text-sm text-slate-500 italic text-center">
			If you don't have account yet, we will create one for you.
		</p>
	</form>

	<div class="py-6">
		<div class="relative">
			<hr />
			<div class="absolute flex justify-center w-full left-0 -top-3">
				<p class="bg-white px-4 text-slate-500">or play as anonymous</p>
			</div>
		</div>
	</div>

	<button
		disabled={isLoading}
		on:click={playAsGuest}
		class="disabled:opacity-50 bg-cyan-600 text-white px-6 py-3 rounded-md flex justify-center space-x-2 items-center"
	>
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
			<p>Play as Guest</p>
		{/if}
	</button>
</Card>
