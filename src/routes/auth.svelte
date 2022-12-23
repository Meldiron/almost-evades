<script>
	import { AppwriteService } from '$lib/appwrite';
	import { accountStore, profileStore } from '$lib/stores';
	import Card from '$lib/components/card.svelte';

	async function playAsGuest() {
		const session = await AppwriteService.loginGuest();
		const userId = session.userId;
		await AppwriteService.createProfile('Guest#' + Date.now().toString());

		const account = await AppwriteService.getAccount();
		const profile = await AppwriteService.getProfile(userId);

		accountStore.set(account);
		profileStore.set(profile);
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

	<button on:click={playAsGuest} class="bg-cyan-600 text-white px-6 py-3 rounded-md"
		>Play as Guest</button
	>
</Card>
