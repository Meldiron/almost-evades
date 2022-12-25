<script lang="ts">
	import { goto } from '$app/navigation';
	import { accountStore, profileStore } from '$lib/stores';
	import Layout from '$lib/components/layout.svelte';
	import { onMount, tick } from 'svelte';
	import { ColyseusService } from '$lib/colyseus';

	import { page } from '$app/stores';

	import kaboom from 'kaboom';
	import { browser } from '$app/environment';

	let colyseus: any = null;
	let lobbyRoom: any = null;
	let gameRoom: any = null;

	let ctx: any = null;
	const players: any = {};
	let levelName = '';

	let messages: any = [];

	onMount(async () => {
		if (!browser) {
			return;
		}

		if (!$accountStore || !$profileStore) {
			goto('/');
			return;
		}

		ctx = kaboom({
			root: document.getElementById('game') as HTMLElement,
			width: window.innerWidth,
			height: window.innerHeight,
			background: [28, 28, 28]
		});

		layers(['bg', 'game', 'ui'], 'game');

		await loadSprite('tiles', '/tiles.png');

		await goToLobby();
	});

	async function goToLobby() {
		const { map, server } = $page.params;

		colyseus = new ColyseusService(server);

		lobbyRoom = await colyseus.joinLobby(map);

		lobbyRoom.onLeave((code: any) => {
			if (code !== 1000) {
				Swal.fire('Error!', 'You got disconnect. Please reload the website.', 'error');
			}
		});

		lobbyRoom.onMessage('chatMessage', async (data: any) => {
			messages.push(data);
			messages = messages;

			await tick();

			setTimeout(() => {
				const chatDiv = document.getElementById('chat') as HTMLElement;
				chatDiv.scrollTop = chatDiv.scrollHeight;
			}, 1);
		});

		lobbyRoom.onMessage(
			'getAuthDataResponse',
			async (data: { roomId: string; sessionId: string }) => {
				localStorage.setItem('sessionId', data.sessionId);
				goToRoom({ roomId: data.roomId });
			}
		);

		lobbyRoom.send('getAuthData');
	}

	let switchingRooms = false;
	let actionsWileSwitching: any[] = [];
	async function goToRoom(data: { roomId: string }) {
		if (switchingRooms) {
			return;
		}

		actionsWileSwitching = [];
		switchingRooms = true;

		if (gameRoom) {
			await gameRoom.leave();
		}

		gameRoom = await colyseus.joinRoom(data.roomId);

		didInit = false;

		destroyAll('destroyable');

		initState();

		gameRoom.onMessage('restartResponse', async () => {
			await lobbyRoom.leave();
			localStorage.removeItem('sessionId');
			goToLobby();
		});

		gameRoom.state.onChange = () => {
			initCanvas(gameRoom.state);
		};

		switchingRooms = false;

		actionsWileSwitching.forEach((a) => {
			gameRoom.send(a.name, a.data);
		});

		actionsWileSwitching = [];
	}

	let didInit = false;
	let didInitOnce = false;
	async function initCanvas(state: any) {
		levelName = state.name;

		if (!didInitOnce) {
			didInitOnce = true;

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

				if (event.keyCode === 80) {
					sendAction('restart');
					return;
				}

				const direction = keyDirections[event.keyCode.toString()];

				if (direction === 'slow') {
					sendAction('slow');
				} else {
					sendAction('move', { direction });
				}
			});

			window.addEventListener('keyup', (event: any) => {
				if (event.repeat) {
					return;
				}

				const direction = keyDirections[event.keyCode.toString()];

				if (direction === 'slow') {
					sendAction('slowEnd');
				} else {
					sendAction('moveEnd', { direction });
				}
			});

			onUpdate(() => {
				every('movable', (ctx) => {
					const pos = vec2(lerp(ctx.pos.x, ctx.serverX, 0.3), lerp(ctx.pos.y, ctx.serverY, 0.3));
					ctx.moveTo(pos);

					if (ctx.nicknameCtx) {
						ctx.nicknameCtx.moveTo(vec2(pos.x, pos.y - 28));
					}

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
		gameRoom.onError((code: any, message: any) => {
			Swal.fire('Error!', message, 'error');
		});

		gameRoom.onLeave((code: any) => {
			if (code !== 1000) {
				Swal.fire('Error!', 'You got disconnect. Please reload the website.', 'error');
			}
		});

		gameRoom.onMessage('goToRoom', (data: any) => {
			goToRoom(data);
		});

		gameRoom.state.players.onAdd = (player: any, sessionId: any) => {
			const playerComponents = [
				'destroyable',
				'movable',
				pos(player.x, player.y),
				circle(player.radius),
				origin('center'),
				opacity(player.isDead ? 0.5 : 1),
				color(player.colorR, player.colorG, player.colorB),
				{ self: sessionId === gameRoom.sessionId },
				{
					serverX: player.x,
					serverY: player.y
				}
			];

			if (player.nickname) {
				const nicknameCtx = add([
					'destroyable',
					text(player.nickname, {
						size: 16,
						font: "apl386",
						letterSpacing: -2
					}),
					color(0, 0, 0),
					pos(player.x, player.y - 16),
					origin('center')
				]);
				playerComponents.push({ nicknameCtx });
			}

			const playerCtx = add(playerComponents);

			players[sessionId] = {
				ctx: playerCtx,
				state: player
			};

			player.onChange = function (_changes: any) {
				players[sessionId].state = player;
				playerCtx.serverX = player.x;
				playerCtx.serverY = player.y;
				playerCtx.opacity = player.isDead ? 0.5 : 1;
			};
		};

		gameRoom.state.players.onRemove = (player: any, sessionId: any) => {
			if (players[sessionId].ctx.nicknameCtx) {
				players[sessionId].ctx.nicknameCtx.destroy();
			}
			players[sessionId].ctx.destroy();
			delete players[sessionId];
		};
	}

	function sendAction(name: string, data: any = undefined) {
		if (switchingRooms) {
			actionsWileSwitching.push({ name, data });
		} else {
			gameRoom.send(name, data);
		}
	}

	let chatMsg = '';
	async function onSubmitMessage() {
		if (chatMsg === '/r') {
			sendAction('restart');
		} else if (chatMsg === '/l') {
			await gameRoom.leave();
			await lobbyRoom.leave();
			localStorage.removeItem('sessionId');
			goto('/');
		} else if (chatMsg === '/revive') {
			sendAction('revive');
		} else {
			lobbyRoom.send('sendMessage', { msg: chatMsg });
		}

		chatMsg = '';
	}

	function onInput(e: any) {
		e.stopPropagation();
	}
</script>

<div id="game" class="fixed inset-0 font-normal" />
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

<div class="fixed left-4 top-4 w-[300px] z-[110]">
	<div class="shadow-md rounded-md">
		<div id="chat" class="h-[200px] overflow-auto text-white bg-black p-3 rounded-t-md">
			{#each messages as message}
				<p><span class="text-slate-500">{message.nickname}: </span>{message.msg}</p>
			{/each}
		</div>
		<form on:submit|preventDefault={onSubmitMessage}>
			<input
				on:keydown={onInput}
				on:keyup={onInput}
				bind:value={chatMsg}
				type="text"
				class="w-full bg-white rounded-b-md p-2"
				placeholder="Press enter to chat"
			/>
			<button type="button" class="hidden" />
		</form>
	</div>
</div>

<Layout>
	{#if !gameRoom}
		<p class="text-center">Connecting to server ...</p>
	{/if}
</Layout>
