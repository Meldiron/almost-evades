<script lang="ts">
	import type { Profile } from '$lib/appwrite';
	import Card from '$lib/components/card.svelte';

	export let players: Profile[];
</script>

<Card>
	<div>
		<h1 class="text-black font-bold text-2xl">Hall of Fame</h1>
		<p class="text-slate-500">TOP 25 Players by Victory Points.</p>
	</div>

	<div>
		{#each players as player, i}
			<p>
				<span class="text-2xl font-bold">{i + 1}.</span>
				{player.nickname} <span class="text-slate-500">({player.vps} {player.vps === 1 ? 'VP' : 'VPs'})</span>
			</p>
		{/each}
	</div>
</Card>
