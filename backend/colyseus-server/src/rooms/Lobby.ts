import { Client, Room } from 'colyseus';
import { AppwriteService } from '../appwrite';
import { RoomRegistry } from '../roomRegistry';
import { LobbyState } from './schema/LobbyState';

export class Lobby extends Room<LobbyState> {
	async onAuth(client: Client, options: { jwt: string, sessionId?: string, desiredRoomId: string }) {
		if(options.sessionId) {
			const session = await AppwriteService.getSession(options.sessionId);

			const [user, profile] = await Promise.all([
				AppwriteService.getUser(session.userId),
				AppwriteService.getProfile(session.userId)
			]);

			return { session, user, profile };
		} else {
			const account = await AppwriteService.getAccount(options.jwt);

			const [user, profile] = await Promise.all([
				AppwriteService.getUser(account.$id),
				AppwriteService.getProfile(account.$id)
			]);

			const roomId = options.desiredRoomId  + '001';
	
			const roomData = RoomRegistry.get(roomId);

			const x = 32 * 4;
			const y = Math.floor(roomData.height / 2) * 32;

			const existingActiveSession = await AppwriteService.getActiveSession(user.$id);

			if(existingActiveSession) {
				return false;
			}

			const session = await AppwriteService.createSession(user.$id, profile.nickname, roomId, x, y, false);

			const response = { session, user, profile };

			return response;
		}

	}

	onCreate() {
		this.maxClients = 100;

		this.setState(new LobbyState());

		// Leaderboard
		this.onMessage('changeRoom', (client: Client, data: { roomId: string }) => {
			this.state.changeRoom(client, data.roomId);
		});

		// Chat
		this.onMessage('sendMessage', (client: Client, data: { msg: string }) => {
			if(!data.msg) {
				return;
			}

			const nickname = client.auth.profile.nickname;
			const msg = data.msg;

			this.broadcast("chatMessage", { nickname, msg });
		});

		// Join room
		this.onMessage('getAuthData', (client: Client) => {
			client.send('getAuthDataResponse', { roomId: client.auth.session.roomId, sessionId: client.auth.session.$id });
		});

		// Join room
		this.onMessage('fetchSession', async (client: Client) => {
			client.auth.session = await AppwriteService.getSession(client.auth.session.$id);
			this.state.setIsDead(client, client.auth.session.isDead);
		});
	}

	onJoin(client: Client) {
		this.state.createPlayer(client);
		client.send('chatMessage', { nickname: 'SYSTEM', msg: 'Type /r to restart or /l to leave.' });
	}

	onLeave(client: Client) {
		this.state.removePlayer(client);
	}
}
