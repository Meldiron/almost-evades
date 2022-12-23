<script lang="ts">
	import { goto } from '$app/navigation';
	import { AppwriteService } from '$lib/appwrite';
	import { accountStore, profileStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import Layout from '$lib/components/layout.svelte';

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);

		const userId = urlParams.get('userId');
		const secret = urlParams.get('secret');

        if(!userId || !secret) {
            Swal.fire('Sign In', 'This link is no longer valid.', 'error');
            return;
        }

		await AppwriteService.loginEmailFinish(userId, secret);

		const account = await AppwriteService.getAccount();
		accountStore.set(account);

        try {
            const profile = await AppwriteService.getProfile(userId);
            profileStore.set(profile);
        } catch(err) {}

		goto('/');
	});
</script>

<Layout>
	<p class="text-center">Signing In ...</p>
</Layout>
