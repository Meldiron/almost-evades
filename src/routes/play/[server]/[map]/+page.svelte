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
	let players: any = {};
	let roomName = '';
	let roomWidth = 9999;
	let roomMaxLevel = 99;

	let leaderboard: any = {};
	let leaderboardTick = true;
	function getPercentage(leaderboardSessionId: any) {
		for (const sessionId in players) {
			const player = players[sessionId];

			if (player.state.sessionId === leaderboardSessionId) {
				const x = player.state.x;
				const perc = Math.round((x / (roomWidth * 32)) * 100);
				return `, ${perc}%`;
			}
		}

		return '';
	}

	let messages: any = [];
	async function addMessage(data: any) {
		messages.push(data);
		messages = messages;

		await tick();

		setTimeout(() => {
			const chatDiv = document.getElementById('chat') as HTMLElement;
			chatDiv.scrollTop = chatDiv.scrollHeight;
		}, 1);
	}

	onMount(async () => {
		if (!browser) {
			return;
		}

		if (!$accountStore || !$profileStore) {
			goto('/');
			return;
		}

		function lTick() {
			leaderboardTick = !leaderboardTick;

			setTimeout(() => {
				lTick();
			}, 100);
		}

		lTick();

		ctx = kaboom({
			root: document.getElementById('game') as HTMLElement,
			width: window.innerWidth,
			height: window.innerHeight,
			background: [28, 28, 28]
		});

		layers(['bg', 'enemies', 'players', 'ui'], 'game');

		await loadSprite('tiles', '/tiles.png');

		await goToLobby();
	});

	async function goToLobby() {
		const { map, server } = $page.params;

		colyseus = new ColyseusService(server);

		lobbyRoom = await colyseus.joinLobby(map);

		lobbyRoom.state.players.onAdd = (player: any, sessionId: any) => {
			leaderboard[sessionId] = {
				state: player
			};

			player.onChange = function (_changes: any) {
				leaderboard[sessionId].state = player;
			};
		};

		lobbyRoom.state.players.onRemove = (player: any, sessionId: any) => {
			delete leaderboard[sessionId];
		};

		lobbyRoom.onLeave((code: any) => {
			if (code !== 1000) {
				Swal.fire('Error!', 'You got disconnect. Please reload the website.', 'error');
			}
		});

		lobbyRoom.onMessage('chatMessage', async (data: any) => {
			addMessage(data);
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
			players = {};
		}

		gameRoom = await colyseus.joinRoom(data.roomId);

		lobbyRoom.send('changeRoom', { roomId: data.roomId });

		didInit = false;

		destroyAll('destroyable');

		initState();

		gameRoom.onMessage('chatMessage', async (data: any) => {
			addMessage(data);
		});

		gameRoom.onMessage('restartResponse', async () => {
			await lobbyRoom.leave();
			leaderboard = {};
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
		roomName = state.name;
		roomMaxLevel = state.maxLevel;
		roomWidth = state.width;

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
				layer(player.isEnemy ? 'enemies' : 'players'),
				z(1000 - player.radius),
				outline(2),
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
						font: 'apl386',
						letterSpacing: -2
					}),
					layer('players'),
					z(1000 - player.radius + 1),
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
			players = {};
			leaderboard = {};
			localStorage.removeItem('sessionId');
			goto('/');
		} else if (chatMsg === '/revive') {
			sendAction('cheatRevive');
		} else if (chatMsg.startsWith('/level')) {
			sendAction('cheatLevel', { roomId: chatMsg.split(' ')[1] });
		} else if (chatMsg.startsWith('/levelEnd')) {
			sendAction('cheatLevelEnd', { roomId: chatMsg.split(' ')[1] });
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
	{#if roomName}
		<div class="flex justify-center">
			<h1
				class="title font-bold text-2xl p-3 border-2 border-[rgb(28,28,28)] border-t-none rounded-b-md bg-white"
			>
				{roomName}
			</h1>
		</div>
	{/if}
</div>

<div class="fixed left-4 top-4 w-[300px] z-[110]">
	<div class="shadow-md rounded-md">
		<div
			id="chat"
			class="h-[200px] overflow-auto text-white bg-black bg-opacity-50 p-3 rounded-t-md"
		>
			{#each messages as message}
				<p>
					<span class="text-gray-200 text-xs uppercase">{message.nickname}: </span>{message.msg}
				</p>
			{/each}
		</div>
		<form on:submit|preventDefault={onSubmitMessage}>
			<input
				on:keydown={onInput}
				on:keyup={onInput}
				bind:value={chatMsg}
				type="text"
				class="w-full bg-white bg-opacity-50 rounded-b-md p-2 text-black placeholder-gray-700"
				placeholder="Press enter to chat"
			/>
			<button type="button" class="hidden" />
		</form>
	</div>
</div>

<div class="fixed right-4 top-4 w-[300px] z-[110]">
	<div class="shadow-md rounded-md">
		<div class="h-[200px] overflow-auto text-white bg-black bg-opacity-50 p-3 rounded-md">
			<h3 class="text-sm uppercase text-center text-gray-200">PLAYERS</h3>
			{#each Object.entries(leaderboard) as [sessionId, player]}
				<p>
					{#if player.state.level <= roomMaxLevel}
						{#key leaderboardTick}
							<span class="text-gray-200 text-xs uppercase"
								>[{player.state.level}/{roomMaxLevel}{getPercentage(player.state.sessionId)}]</span
							>
						{/key}
					{:else}
						<span class="text-gray-200 text-xs uppercase">[WIN]</span>
					{/if}
					{player.state.nickname}
				</p>
			{/each}
		</div>
	</div>
</div>

<Layout>
	{#if !gameRoom}
		<p class="text-center">Connecting to server ...</p>
	{/if}
</Layout>
