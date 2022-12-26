import { Room, Client } from 'colyseus';
import { AppwriteService } from '../appwrite';
import { CollideUtils } from '../collideUtils';
import { RoomRegistry } from '../roomRegistry';
import { Player } from './schema/RoomState';
import { RoomState } from './schema/RoomState';

export type RegistryData = {
	id: string;
	name: string;
	width: number;
	height: number;
	previous: string;
	next: string;
	isWin: boolean;
	maxLevel: number;
};

export abstract class GameRoom extends Room<RoomState> {
	abstract getRegistryData(): RegistryData;

	async onAuth(client: Client, options: { sessionId: string }) {
		const session = await AppwriteService.getSession(options.sessionId);
		const roomRegistry = this.getRegistryData();

		if (roomRegistry.id !== session.roomId) {
			return false;
		}

		if (session.isActive) {
			return false;
		}

		session.isActive = true;

		await AppwriteService.updateSession(session);

		return { session };
	}

	onCreate() {
		this.maxClients = 100;

		this.setSimulationInterval((deltaTime) => this.update(deltaTime));

		this.onMessage('move', (client: Client, data: { direction: string }) => {
			this.state.setDirection(client, data.direction);
		});

		this.onMessage('moveEnd', (client: Client, data: { direction: string }) => {
			this.state.endDirection(client, data.direction);
		});

		this.onMessage('slow', (client: Client) => {
			this.state.players.get(client.sessionId).isSlow = true;
		});

		this.onMessage('slowEnd', (client: Client) => {
			this.state.players.get(client.sessionId).isSlow = false;
		});

		this.onMessage('restart', async (client: Client) => {
			client.auth.session.isActive = false;
			await AppwriteService.updateSession(client.auth.session);
			client.send('restartResponse');
		});

		if (process.env.ALLOW_CHEATS === 'yes') {
			this.onMessage('cheatRevive', async (client: Client) => {
				const player = this.state.players.get(client.sessionId);
				player.isDead = false;
				player.client.auth.session.isDead = false;
				await AppwriteService.updateSession(player.client.auth.session);
			});

			this.onMessage('cheatLevel', async (client: Client, data: { roomId: string }) => {
				const player = this.state.players.get(client.sessionId);

				player.isZombie = true;
				const roomData = RoomRegistry.get(data.roomId);
				client.auth.session.roomId = data.roomId;
				client.auth.session.x = 4 * 32;
				client.auth.session.y = Math.floor(roomData.height / 2) * 32;
				await AppwriteService.updateSession(client.auth.session);
				client.send('goToRoom', { roomId: data.roomId });
			});

			this.onMessage('cheatLevelEnd', async (client: Client, data: { roomId: string }) => {
				const player = this.state.players.get(client.sessionId);

				player.isZombie = true;
				const roomData = RoomRegistry.get(data.roomId);
				client.auth.session.roomId = data.roomId;
				client.auth.session.x = (roomData.width - 4) * 32;
				client.auth.session.y = Math.floor(roomData.height / 2) * 32;
				await AppwriteService.updateSession(client.auth.session);
				client.send('goToRoom', { roomId: data.roomId });
			});
		}
	}

	onJoin(client: Client) {
		this.state.createPlayer(client);
	}

	async onLeave(client: Client) {
		this.state.removePlayer(client);

		client.auth.session.isActive = false;
		await AppwriteService.updateSession(client.auth.session);
	}

	update(deltaTime: number) {
		// Movement tick
		this.state.players.forEach((player: Player) => {
			player.update(deltaTime);
		});

		// Player <-> Enemy collision
		this.state.players.forEach((player) => {
			if (player.isEnemy) {
				return;
			}

			if (player.x < 32 * 8 || player.x > (this.getRegistryData().width - 8) * 32) {
				return;
			}

			this.state.players.forEach(async (enemy) => {
				if (!enemy.isEnemy) {
					return;
				}

				const collision = CollideUtils.circleWithCircle(
					{
						x: player.x,
						y: player.y,
						radius: player.radius
					},
					{
						x: enemy.x,
						y: enemy.y,
						radius: enemy.radius
					}
				);

				if (collision.collide) {
					player.isDead = true;

					if (player.client) {
						player.client.auth.session.isDead = true;
						await AppwriteService.updateSession(player.client.auth.session);
					}
				}
			});
		});

		// Player <-> Player collision
		this.state.players.forEach((player) => {
			if (player.isEnemy) {
				return;
			}

			this.state.players.forEach(async (player2) => {
				if (player2.isEnemy) {
					return;
				}

				if (player == player2) {
					return;
				}

				if (player.isDead && player2.isDead) {
					return;
				}

				const collision = CollideUtils.circleWithCircle(
					{
						x: player.x,
						y: player.y,
						radius: player.radius
					},
					{
						x: player2.x,
						y: player2.y,
						radius: player2.radius
					}
				);

				if (collision.collide) {
					player.isDead = false;
					if (player.client) {
						player.client.auth.session.isDead = false;
						await AppwriteService.updateSession(player.client.auth.session);
					}

					player2.isDead = false;
					if (player2.client) {
						player.client.auth.session.isDead = false;
						await AppwriteService.updateSession(player.client.auth.session);
					}
				}
			});
		});
	}
}
