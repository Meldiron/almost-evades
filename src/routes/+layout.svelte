<script lang="ts">
	import '../app.css';

	import { AppwriteService } from '$lib/appwrite';
	import { accountStore, profileStore } from '$lib/stores';
	import type { Models } from 'appwrite';
	import { onMount } from 'svelte';
	import Layout from '$lib/components/layout.svelte';

	let finished = false;

	onMount(async () => {
		let account: Models.Account<any> | null = null;

		try {
			account = await AppwriteService.getAccount();
			accountStore.set(account);
		} catch (err) {
			console.warn(err);
			accountStore.set(null);
		}

		if (account) {
			try {
				const profile = await AppwriteService.getProfile(account.$id);
				profileStore.set(profile);
			} catch (err) {
				console.warn(err);
				profileStore.set(null);
			}
		}

		finished = true;
	});

	async function logout() {
		await AppwriteService.logout();
		profileStore.set(null);
		accountStore.set(null);
		localStorage.removeItem('sessionId');
	}
</script>

<Layout>
	<div class="flex justify-between items-center mb-12 mt-6">
		<a href="/" class="text-cyan-500 font-bold text-4xl text-center">Almost Evades</a>
		<div class="flex items-center jutify-center space-x-3">
			{#if $profileStore !== null}
				<a
					href={`/profile/${$profileStore.$id}`}
					class="hover:bg-slate-300 bg-slate-200 text-slate-700 px-6 py-3 rounded-md">My Profile</a
				>
			{/if}

			{#if $accountStore !== null}
				<button
					on:click={logout}
					class="hover:bg-slate-300 bg-slate-200 text-slate-700 px-6 py-3 rounded-md">Logout</button
				>
			{/if}
		</div>
	</div>
</Layout>

{#if !finished}
	<Layout>
		<p class="text-center">Loading ...</p>
	</Layout>
{:else}
	<slot />
{/if}

<Layout>
	<p class="text-slate-500 text-center mt-12 mb-12">
		Made with <a href="https://appwrite.io/" rel="noreferrer" class="text-black underline"
			>Appwrite</a
		>. Contact:
		<a href="https://appwrite.io/" rel="noreferrer" class="text-black underline"
			>contact@almostapps.eu</a
		>
	</p>
</Layout>
