<script lang="ts">
	import { goto } from '$app/navigation';
	import { accountStore, profileStore } from '$lib/stores';
	import Layout from '$lib/components/layout.svelte';
	import { onMount } from 'svelte';
	import { ColyseusService } from '$lib/colyseus';

	import { page } from '$app/stores';

	import kaboom from 'kaboom';
	import { browser } from '$app/environment';

	let colyseus: any = null;
	let room: any = null;
	let ctx: any = null;
	const players: any = {};
	let levelName = '';
	let sessionId = '';

	onMount(async () => {
		if (!browser) {
			return;
		}

		if (!$accountStore || !$profileStore) {
			goto('/');
			return;
		}

		const { map, server } = $page.params;

		ctx = kaboom({
			root: document.getElementById('game') as HTMLElement,
			width: window.innerWidth,
			height: window.innerHeight,
			background: [28, 28, 28]
		});

		layers(['bg', 'game', 'ui'], 'game');

		await loadSprite('tiles', '/tiles.png');

		colyseus = new ColyseusService(server);

		goToRoom({ room: map });
	});

	let switchingRooms = false;
	async function goToRoom(data: {
		room: string;
	}) {
		if(switchingRooms) {
			return;
		}

		switchingRooms = true;

		if (room) {
			console.log("Leavign room");
			await room.leave();
		}

		console.log("Joining room ", data.room);
		room = await colyseus.playLevel(data.room, {sessionId});

		didInit = false;

		destroyAll('destroyable');

		initState();

		room.state.onChange = () => {
			initCanvas(room.state);
		};

		switchingRooms = false;
	}

	let didInit = false;
	let didInitOnce = false;
	async function initCanvas(state: any) {
		levelName = state.name;

		if (!didInitOnce) {
			didInitOnce = true;
			onUpdate(() => {
				every('movable', (ctx) => {
					const pos = vec2(lerp(ctx.pos.x, ctx.serverX, 0.3), lerp(ctx.pos.y, ctx.serverY, 0.3));
					ctx.moveTo(pos);

					ctx.nicknameCtx.moveTo(vec2(pos.x, pos.y - 28));

					if (ctx.self) {
						camPos(pos);
					}
				});
			});
		}

		if (didInit) {
			return;
		}

		didInit = true;

		const tileSize = 32;

		const height = 32 * state.height;
		const width = 32 * state.width;

		add([
			'destroyable',
			sprite('tiles', {
				tiled: true,
				width: width,
				height: height
			}),
			pos(0, 0),
			layer('bg')
		]);

		const safeZoneSize = 8;

		add([
			'destroyable',
			pos(0, 0),
			rect(safeZoneSize * tileSize, height),
			color(0, 0, 0),
			opacity(0.3),
			layer('bg')
		]);

		add([
			'destroyable',
			pos(width - tileSize * safeZoneSize, 0),
			rect(safeZoneSize * tileSize, height),
			color(0, 0, 0),
			opacity(0.3),
			layer('bg')
		]);

		if (state.isWin) {
			add([
				'destroyable',
				pos(0, 0),
				rect(width, height),
				color(255, 215, 0),
				opacity(0.5),
				layer('bg')
			]);
		}
	}

	async function initState() {
		room.onMessage('goToRoom', (data: any) => {
			goToRoom(data);
		});

		room.onMessage('sessionId', (data: any) => {
			sessionId = data.sessionId;
		});

		room.state.players.onAdd = (player: any, sessionId: any) => {
			const nicknameCtx = add([
				'destroyable',
				text(player.nickname, {
					size: 14
				}),
				color(0, 0, 0),
				pos(player.x, player.y - 24),
				origin('center')
			]);

			const playerCtx = add([
				'destroyable',
				'movable',
				pos(player.x, player.y),
				circle(16),
				origin('center'),
				color(255, 0, 0),
				{ self: sessionId === room.sessionId },
				{ nicknameCtx },
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
	}
</script>

<div id="game" class="fixed inset-0" />
<div class="fixed inset-0 z-[100]">
	{#if levelName}
		<div class="flex justify-center">
			<h1
				class="title font-bold text-2xl p-3 border-2 border-[rgb(28,28,28)] border-t-none rounded-b-md bg-white"
			>
				{levelName}
			</h1>
		</div>
	{/if}
</div>

<Layout>
	{#if !room}
		<p class="text-center">Connecting to server ...</p>
	{/if}
</Layout>
