<script>
	import { goto } from '$app/navigation';
	import { profileStore } from '$lib/stores';
	import Card from '$lib/components/card.svelte';
	import { dev } from '$app/environment';

	const maps = {
		AngelicAlley001: 'Angelic Alley (Easy)'
	};

	const servers = dev ? {
        'localhost:3000': 'Development'
    } : {
		'eu1.evades.almostapps.eu': 'EU #1'
	};

	let map = Object.keys(maps)[0];
	let server = Object.keys(servers)[0];

	async function play() {
		goto(`/play/${server}/${map}`);
	}
</script>

<Card>
	<h1 class="text-black font-bold text-2xl">Ready to Play?</h1>
	<p class="text-slate-500">
		Welcome {$profileStore?.nickname ?? 'Guest'} 👋
	</p>

	<form on:submit|preventDefault={play} class="flex flex-col space-y-2">
		<p class="text-black">Server:</p>
		<select bind:value={server} class="rounded-md bg-slate-100 p-3 w-full">
			{#each Object.entries(servers) as [id, name]}
				<option value={id}>{name}</option>
			{/each}
		</select>

		<p class="text-black">Map:</p>
		<select bind:value={map} class="rounded-md bg-slate-100 p-3 w-full">
			{#each Object.entries(maps) as [id, name]}
				<option value={id}>{name}</option>
			{/each}
		</select>

		<button type="submit" class="bg-cyan-600 text-white px-6 py-3 rounded-md">Play</button>
		<p class="text-sm text-slate-500 italic text-center">
			We highly recommend playing with friends.
		</p>
	</form>
</Card>
