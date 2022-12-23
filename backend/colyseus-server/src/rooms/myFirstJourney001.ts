import { Room, Client } from 'colyseus';
import { AppwriteService } from '../appwrite';
import { Player } from './schema/RoomState';
import { RoomState } from './schema/RoomState';

export class myFirstJourney001 extends Room<RoomState> {
	async onAuth(client: Client, options: { jwt: string }) {
		const account = await AppwriteService.getAccount(options.jwt);

		const [user, profile] = await Promise.all([
			AppwriteService.getUser(account.$id),
			AppwriteService.getProfile(account.$id)
		]);

		return { user, profile };
	}

	onCreate(_options: any) {
		this.setSimulationInterval((deltaTime) => this.update(deltaTime));

		this.setState(new RoomState());

		this.onMessage('move', (client: Client, data: { direction: string }) => {
			this.state.setDirection(client.sessionId, data.direction);
		});

		this.onMessage('moveEnd', (client: Client, data: { direction: string }) => {
			this.state.endDirection(client.sessionId, data.direction);
		});

		this.onMessage('slow', (client: Client) => {
			this.state.setSlow(client.sessionId, true);
		});

		this.onMessage('slowEnd', (client: Client) => {
			this.state.setSlow(client.sessionId, false);
		});
	}

	onJoin(client: Client) {
		this.state.createPlayer(client.sessionId);
	}

	onLeave(client: Client) {
		this.state.removePlayer(client.sessionId);
	}

	update(deltaTime: number) {
		this.state.players.forEach((player: Player) => {
			player.update(deltaTime);
		});
	}
}
