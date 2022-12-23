import { Room, Client } from 'colyseus';
import { AppwriteService } from '../appwrite';
import { Player } from './schema/RoomState';
import { RoomState } from './schema/RoomState';

const jwtCache: any = {};
export const userData: any = {};

export class GameRoom extends Room<RoomState> {
	private async getAuthData(jwt: string) {
		if (!jwtCache[jwt]) {
			const account = await AppwriteService.getAccount(jwt);

			const [user, profile] = await Promise.all([
				AppwriteService.getUser(account.$id),
				AppwriteService.getProfile(account.$id)
			]);

			const response = { user, profile };

			if(!userData[user.$id]) {
				userData[user.$id] = {};
			}

			jwtCache[jwt] = response;

			setTimeout(() => {
				const userId = jwtCache[jwt].user.$id;
				const activeJwtKey = Object.values(jwtCache).find((v: any) => v.user.$id === userId);

				if(!activeJwtKey) {
					delete userData[userId];
				}

				delete jwtCache[jwt];
			}, 1000 * 60 * 16);
		}

		return jwtCache[jwt];
	}

	async onAuth(client: Client, options: { jwt: string }) {
		const { user, profile } = await this.getAuthData(options.jwt);

		const response = {
			jwt: options.jwt,
			user,
			profile
		};

		return response;
	}

	onCreate() {
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
