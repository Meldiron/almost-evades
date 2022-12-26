import { Schema, type, MapSchema } from '@colyseus/schema';
import { Client } from 'colyseus';

export class LobbyPlayer extends Schema {
	@type('string')
	sessionId: string;

	@type('string')
	nickname: string;

	@type('number')
	level: number;

	@type('boolean')
	isDead: boolean;

	constructor(
		sessionId: string,
		nickname: string,
		level: number,
		isDead: boolean
	) {
		super();

		this.sessionId = sessionId;
		this.nickname = nickname;
		this.level = level;
		this.isDead = isDead;
	}
}

export class LobbyState extends Schema {
	@type({ map: LobbyPlayer })
	players = new MapSchema<LobbyPlayer>();

	constructor() {
		super();
	}

	createPlayer(client: Client) {
		const sessionId = client.auth.session.$id;
		const nickname = client.auth.session.nickname;
		const roomId = client.auth.session.roomId;
		const isDead = client.auth.session.isDead;

		const roomLevel = +(roomId.slice(-3));

		this.players.set(
			client.sessionId,
			new LobbyPlayer(sessionId, nickname, roomLevel, isDead)
		);
	}

	removePlayer(client: Client) {
		this.players.delete(client.sessionId);
	}

	changeRoom(client: Client, roomId: string) {
		const roomLevel = +(roomId.slice(-3));
		this.players.get(client.sessionId).level = roomLevel;
	}

	setIsDead(client: Client, isDead: boolean) {
		this.players.get(client.sessionId).isDead = isDead;
	}
}
