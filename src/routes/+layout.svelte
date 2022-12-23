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
</script>

{#if !finished}
	<Layout>
		<p class="text-center">Loading ...</p>
	</Layout>
{:else}
	<slot />
{/if}

<Layout>
	<p class="text-slate-500 text-center">
		Made with <a href="https://appwrite.io/" rel="noreferrer" class="text-black underline"
			>Appwrite</a
		>. Contact:
		<a href="https://appwrite.io/" rel="noreferrer" class="text-black underline"
			>contact@almostapps.eu</a
		>
	</p>
</Layout>
