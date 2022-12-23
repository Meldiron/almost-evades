<script>
	import { AppwriteService } from '$lib/appwrite';
	import { accountStore, profileStore } from '$lib/stores';
	import Auth from './auth.svelte';
	import Layout from '$lib/components/layout.svelte';
	import Onboard from './onboard.svelte';
	import Play from './play.svelte';

	async function logout() {
		await AppwriteService.logout();
		profileStore.set(null);
		accountStore.set(null);
	}
</script>

<Layout>
	<h1 class="text-cyan-500 font-bold text-4xl text-center mb-12">Almost Evades</h1>

	{#if $accountStore === null}
		<Auth />
	{:else}
		{#if $profileStore === null}
			<Onboard />
		{:else}
			<Play />
		{/if}

		<div class="flex justify-center mt-12">
			<button on:click={logout} class="bg-slate-200 text-slate-700 px-6 py-3 rounded-md"
				>Logout</button
			>
		</div>
	{/if}
</Layout>
