import { Room, Client } from 'colyseus';
import { AppwriteService } from '../appwrite';
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
	}

	onJoin(client: Client) {
		this.state.createPlayer(client);
	}

	onLeave(client: Client) {
		this.state.removePlayer(client);
	}

	update(deltaTime: number) {
		this.state.players.forEach((player: Player) => {
			player.update(deltaTime);
		});
	}
}
