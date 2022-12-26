<script lang="ts">
	import { accountStore, profileStore } from '$lib/stores';
	import Auth from './auth.svelte';
	import Layout from '$lib/components/layout.svelte';
	import Onboard from './onboard.svelte';
	import Play from './play.svelte';
	import HallOfFame from './hall-of-fame.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Layout>
	{#if $accountStore === null}
		<Auth />
	{:else if $profileStore === null}
		<Onboard />
	{:else}
		<div class="flex flex-col space-y-6">
			<Play />
			<HallOfFame players={data.hallOfFamePlayers} />
		</div>
	{/if}
</Layout>
