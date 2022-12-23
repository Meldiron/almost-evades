import { Room, Client } from 'colyseus';
import { AppwriteService } from '../appwrite';
import { Player } from './schema/RoomState';
import { RoomState } from './schema/RoomState';

const jwtCache: any = {};

export class GameRoom extends Room<RoomState> {
	async onAuth(
		client: Client,
		options: { hasFinished: boolean, jwt: string; isSlow: boolean; directionX: string; directionY: string }
	) {
		const initState = {
			isSlow: options.isSlow,
			directionX: options.directionX,
			directionY: options.directionY,
			hasFinished: options.hasFinished
		};

		if (jwtCache[options.jwt]) {
			jwtCache[options.jwt] = {
				...jwtCache[options.jwt],
				initState
			};
			return jwtCache[options.jwt];
		}

		const account = await AppwriteService.getAccount(options.jwt);

		const [user, profile] = await Promise.all([
			AppwriteService.getUser(account.$id),
			AppwriteService.getProfile(account.$id)
		]);

		const response = {
			user,
			profile,
			initState
		};

		jwtCache[options.jwt] = response;

		setTimeout(() => {
			delete jwtCache[options.jwt];
		}, 1000 * 60 * 16);

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
