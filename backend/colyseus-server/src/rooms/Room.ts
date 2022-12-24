import { Room, Client } from 'colyseus';
import { AppwriteService } from '../appwrite';
import { CollideUtils } from '../collideUtils';
import { Player } from './schema/RoomState';
import { RoomState } from './schema/RoomState';

// TODO: Cleanup

export const sessions: any = {};
export const users: any = {};

export class GameRoom extends Room<RoomState> {
	async onAuth(client: Client, options: { jwt: string, sessionId: string }) {
		if(!options.sessionId) {
			const account = await AppwriteService.getAccount(options.jwt);

			if(users[account.$id]) {
				const session = sessions[users[account.$id]];
				if(session.currentLevel) {
					session.isSlow = false;
					session.directionX = "none";
					session.directionY = "none";
					client.send('goToRoom', { room: session.currentLevel });
				}

				return session;
			}

			const [user, profile] = await Promise.all([
				AppwriteService.getUser(account.$id),
				AppwriteService.getProfile(account.$id)
			]);

			const sessionId = crypto.randomUUID();

			sessions[sessionId] = { user, profile, sessionId };
			users[user.$id] = sessionId;

			if(!this.state.isFirst) {
				client.send('goToRoom', { room: this.state.id.slice(0, -3) + '001' });
			}

			return sessions[sessionId];
		} else {
			return sessions[options.sessionId];
		}
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
			this.state.setSlow(client, true);
		});

		this.onMessage('slowEnd', (client: Client) => {
			this.state.setSlow(client, false);
		});

		this.onMessage('restart', (client: Client) => {
			const sessionId = client.auth.sessionId;
			delete sessions[sessionId];
			delete users[client.auth.user.$id];
			this.state.removePlayer(client);
			client.leave();
		});
	}

	onJoin(client: Client) {
		this.state.createPlayer(client);
	}

	onLeave(client: Client) {
		this.state.removePlayer(client);
	}

	update(deltaTime: number) {
		// Movement tick
		this.state.players.forEach((player: Player) => {
			player.update(deltaTime);
		});

		// Player <-> Enemy collision
		this.state.players.forEach((player) => {
			if(player.isEnemy) {
				return;
			}

			this.state.players.forEach((enemy) => {
				if(!enemy.isEnemy) {
					return;
				}

				const collision = CollideUtils.circleWithCircle({
					x: player.x,
					y: player.y,
					radius: player.radius
				}, {
					x: enemy.x,
					y: enemy.y,
					radius: enemy.radius
				});

				if(collision.collide) {
					player.isDead = true;

					if (player.client) {
						const sessionId = player.client.auth.sessionId;
						sessions[sessionId].isDead = true;
					}
				}
			});
		})

		// Player <-> Player collision
		this.state.players.forEach((player) => {
			if(player.isEnemy) {
				return;
			}

			this.state.players.forEach((player2) => {
				if(player2.isEnemy) {
					return;
				}

				if(player == player2) {
					return;
				}

				if(player.isDead && player2.isDead) {
					return;
				}

				const collision = CollideUtils.circleWithCircle({
					x: player.x,
					y: player.y,
					radius: player.radius
				}, {
					x: player2.x,
					y: player2.y,
					radius: player2.radius
				});

				if(collision.collide) {
					player.isDead = false;
					if (player.client) {
						const sessionId = player.client.auth.sessionId;
						sessions[sessionId].isDead = false;
					}

					player2.isDead = false;
					if (player2.client) {
						const sessionId = player2.client.auth.sessionId;
						sessions[sessionId].isDead = false;
					}
				}
			});
		});
	}
}
