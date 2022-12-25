import { Schema, type, MapSchema } from '@colyseus/schema';
import { Client } from 'colyseus';
import { AppwriteService } from '../../appwrite';
import { CollideUtils } from '../../collideUtils';
import { RoomRegistry } from '../../roomRegistry';
import { RegistryData } from '../Room';

export class Player extends Schema {
	@type('number')
	x;

	@type('number')
	y;

	@type('string')
	nickname;

	@type('string')
	directionX = 'none';

	@type('string')
	directionY = 'none';

	@type('boolean')
	isSlow = false;

	@type('number')
	radius = 16;

	@type('boolean')
	isEnemy = false;

	@type('boolean')
	isDead = false;

	@type('number')
	colorR = 0;

	@type('number')
	colorG = 0;

	@type('number')
	colorB = 0;

	lastSync = 0;
	isZombie = false;

	constructor(
		private room: RoomState,
		isEnemy: boolean,
		nickname: string,
		isSlow: boolean,
		directionX: string,
		directionY: string,
		x: number,
		y: number,
		isDead: boolean,
		color: number[],
		public client: Client | null = null
	) {
		super();

		this.x = x;
		this.y = y;
		this.nickname = nickname;
		this.isSlow = isSlow;
		this.directionX = directionX;
		this.directionY = directionY;
		this.isEnemy = isEnemy;
		this.isDead = isDead;

		this.colorR = color[0];
		this.colorG = color[1];
		this.colorB = color[2];
	}

	async update(deltaTime: number) {
		if (this.isDead || this.isZombie) {
			return;
		}

		const baseSpeed = deltaTime * 0.3;
		let speed = baseSpeed;

		if (this.x < 32 * 8 || this.x > (this.room.width - 8) * 32) {
			speed = baseSpeed * 2;
		}

		if (this.isSlow) {
			speed = baseSpeed / 3;
		}

		if (this.directionX === 'left') {
			this.x -= speed;
		} else if (this.directionX === 'right') {
			this.x += speed;
		}

		if (this.directionY === 'up') {
			this.y -= speed;
		} else if (this.directionY === 'down') {
			this.y += speed;
		}

		const collisionObject = {
			x: this.x,
			y: this.y,
			radius: this.radius
		};

		const collisionLeft = CollideUtils.circleWithBox(collisionObject, {
			x: this.isEnemy ? -1000 + 8 * 32 : -1000,
			y: 0,
			width: 1000,
			height: this.room.height * 32
		});
		if (collisionLeft.collide) {
			collisionObject.x = collisionLeft.x;
			collisionObject.y = collisionLeft.y;

			if (this.client && this.room.registry.previous) {
				this.isZombie = true;
				const roomData = RoomRegistry.get(this.room.registry.previous);
				this.client.auth.session.roomId = this.room.registry.previous;
				this.client.auth.session.x = (roomData.width - 4) * 32;
				this.client.auth.session.y = Math.floor(roomData.height / 2) * 32;
				await AppwriteService.updateSession(this.client.auth.session);
				this.client.send('goToRoom', { roomId: this.room.registry.previous });
				return;
			}

			if (this.isEnemy && this.directionX === 'left') {
				this.directionX = 'right';
			}
		}

		const collisionRight = CollideUtils.circleWithBox(collisionObject, {
			x: this.isEnemy ? this.room.width * 32 - 32 * 8 : this.room.width * 32,
			y: 0,
			width: 1000,
			height: this.room.height * 32
		});
		if (collisionRight.collide) {
			collisionObject.x = collisionRight.x;
			collisionObject.y = collisionRight.y;

			if (this.client && this.room.registry.next) {
				this.isZombie = true;
				const roomData = RoomRegistry.get(this.room.registry.next);
				this.client.auth.session.roomId = this.room.registry.next;
				this.client.auth.session.x = 4 * 32;
				this.client.auth.session.y = Math.floor(roomData.height / 2) * 32;
				await AppwriteService.updateSession(this.client.auth.session);
				this.client.send('goToRoom', { roomId: this.room.registry.next });
				return;
			}

			if (this.isEnemy && this.directionX === 'right') {
				this.directionX = 'left';
			}
		}

		const collisionUp = CollideUtils.circleWithBox(collisionObject, {
			x: 0,
			y: -1000,
			width: this.room.width * 32,
			height: 1000
		});
		if (collisionUp.collide) {
			collisionObject.x = collisionUp.x;
			collisionObject.y = collisionUp.y;

			if (this.isEnemy && this.directionY === 'up') {
				this.directionY = 'down';
			}
		}

		const collisionDown = CollideUtils.circleWithBox(collisionObject, {
			x: 0,
			y: this.room.height * 32,
			width: this.room.width * 32,
			height: 1000
		});
		if (collisionDown.collide) {
			collisionObject.x = collisionDown.x;
			collisionObject.y = collisionDown.y;

			if (this.isEnemy && this.directionY === 'down') {
				this.directionY = 'up';
			}
		}

		this.x = collisionObject.x;
		this.y = collisionObject.y;

		if (this.client) {
			this.client.auth.session.x = this.x;
			this.client.auth.session.y = this.y;

			if(Math.abs(this.lastSync - Date.now()) > 5000) {
				this.lastSync = Date.now();
				AppwriteService.updateSession(this.client.auth.session);
			}
		}
	}
}

export class RoomState extends Schema {
	@type({ map: Player })
	players = new MapSchema<Player>();

	@type('string')
	name: string;

	@type('number')
	height: number;

	@type('number')
	width: number;

	@type('boolean')
	isWin = false;

	constructor(public registry: RegistryData) {
		super();

		this.name = registry.name;
		this.width = registry.width;
		this.height = registry.height;
		this.isWin = registry.isWin;
	}

	createEnemy(
		isSlow: boolean,
		directionX: string,
		directionY: string,
		x: number,
		y: number,
		color: number[]
	) {
		const enemyId = crypto.randomUUID();

		this.players.set(
			enemyId,
			new Player(this, true, '', isSlow, directionX, directionY, x, y, false, color)
		);
	}

	createPlayer(client: Client) {
		const nickname = client.auth.session.nickname;
		const x = client.auth.session.x;
		const y = client.auth.session.y;
		const isDead = client.auth.session.isDead;

		this.players.set(
			client.sessionId,
			new Player(this, false, nickname, false, 'none', 'none', x, y, isDead, [255, 0, 0], client)
		);
	}

	removePlayer(client: Client) {
		this.players.delete(client.sessionId);
	}

	setSlow(client: Client, isSlow: boolean) {
		this.players.get(client.sessionId).isSlow = isSlow;
	}

	setDirection(client: Client, direction: string) {
		if (direction === 'up' || direction === 'down') {
			this.players.get(client.sessionId).directionY = direction;
		} else if (direction === 'left' || direction === 'right') {
			this.players.get(client.sessionId).directionX = direction;
		}
	}

	endDirection(client: Client, direction: string) {
		if (direction === 'up' || direction === 'down') {
			if (this.players.get(client.sessionId).directionY === direction) {
				this.players.get(client.sessionId).directionY = 'none';
			}
		} else if (direction === 'left' || direction === 'right') {
			if (this.players.get(client.sessionId).directionX === direction) {
				this.players.get(client.sessionId).directionX = 'none';
			}
		}
	}
}
