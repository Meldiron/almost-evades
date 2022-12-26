<script lang="ts">
	import Card from '$lib/components/card.svelte';
	import Layout from '$lib/components/layout.svelte';
	import { maps } from '$lib/data';

	import type { PageData } from './$types';

	export let data: PageData;

	const mapsWins = JSON.parse(data.profile.mapWins);
</script>

<Layout>
	<Card>
		<div>
			<h1 class="text-black font-bold text-2xl">{data.profile.nickname}</h1>
			<p class="text-sm text-slate-500">Registered on {data.profile.$createdAt}</p>
		</div>

		<hr />

		<h1 class="font-bold">
			<span class="text-3xl">{data.profile.vps}</span> Victory {data.profile.vps === 1
				? 'Point'
				: 'Points'}
		</h1>

		<div>
			{#each Object.entries(maps) as [mapId, mapName]}
				<p>
					{mapName}: <span class="text-xl font-bold">{mapsWins[mapId]}</span>
					<span class="text-xs text-slate-500">VPs</span>
				</p>
			{/each}
		</div>

		<hr />

		<p class="text-sm text-slate-500 italic text-center">
			Profile is public. You can share URL with anyone.
		</p>
	</Card>
</Layout>
