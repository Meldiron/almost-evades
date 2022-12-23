<script lang="ts">
	import { goto } from '$app/navigation';
	import { accountStore, profileStore } from '$lib/stores';
	import Layout from '$lib/components/layout.svelte';
	import { onMount } from 'svelte';
	import { ColyseusService } from '$lib/colyseus';

	import { page } from '$app/stores';

	import kaboom from 'kaboom';

	let room: any = null;
	const players: any = {};

	onMount(async () => {
		if (!$accountStore || !$profileStore) {
			goto('/');
			return;
		}

		const { map, server } = $page.params;

		const ctx = kaboom({
			root: document.getElementById('game') as HTMLElement,
			width: window.innerWidth,
			height: window.innerHeight,
			background: [0, 0, 0]
		});

		onUpdate(() => {
			every('movable', (ctx) => {
                const pos = vec2(
                    lerp(ctx.pos.x, ctx.serverX, 0.3),
                    lerp(ctx.pos.y, ctx.serverY, 0.3)
                );
				ctx.moveTo(pos);

                if(ctx.self) {
                    camPos(pos);
                }
			});
		});

		const tileSize = 32;

		await loadSprite('tiles', '/tiles.png');

		const h = 15 * tileSize;

		add([
			sprite('tiles', {
				tiled: true,
				width: 300 * tileSize,
				height: h
			})
		]);

		const colyseus = new ColyseusService(server);
		room = await colyseus.playLevel(map);

		room.state.players.onAdd = (player: any, sessionId: any) => {
			const playerCtx = add([
                "movable",
				pos(player.x, player.y),
				circle(16),
				color(255, 0, 0),
                { self: sessionId === room.sessionId },
				{
					serverX: player.x,
					serverY: player.y
				}
			]);

			players[sessionId] = {
				ctx: playerCtx,
				state: player
			};

			player.onChange = function (_changes: any) {
				players[sessionId].state = player;
				playerCtx.serverX = player.x;
				playerCtx.serverY = player.y;
			};
		};

		room.state.players.onRemove = (player: any, sessionId: any) => {
			players[sessionId].ctx.destroy();
			delete players[sessionId];
		};

		const keyDirections: any = {
			'68': 'right',
			'39': 'right',
			'65': 'left',
			'37': 'left',
			'87': 'up',
			'38': 'up',
			'83': 'down',
			'40': 'down',
			'16': 'slow'
		};

		window.addEventListener('keydown', (event: any) => {
			if (event.repeat) {
				return;
			}

			const direction = keyDirections[event.keyCode.toString()];

			if (direction === 'slow') {
				room.send('slow');
			} else {
				room.send('move', { direction });
			}
		});

		window.addEventListener('keyup', (event: any) => {
			if (event.repeat) {
				return;
			}

			const direction = keyDirections[event.keyCode.toString()];

			if (direction === 'slow') {
				room.send('slowEnd');
			} else {
				room.send('moveEnd', { direction });
			}
		});
	});
</script>

<div id="game" class="fixed inset-0" />

<Layout>
	{#if !room}
		<p class="text-center">Connecting to server ...</p>
	{/if}
</Layout>
