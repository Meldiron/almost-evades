import { Schema, type, MapSchema } from '@colyseus/schema';
import { Client } from 'colyseus';
import { CollideUtils } from '../../collideUtils';
import { sessions } from '../Room';

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

	update(deltaTime: number) {
		if (this.isDead) {
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

			if (this.client && this.room.previousLevel) {
				const sessionId = this.client.auth.sessionId;
				sessions[sessionId].lastLevel = this.room.id;
				sessions[sessionId].isSlow = this.isSlow;
				sessions[sessionId].directionX = this.directionX;
				sessions[sessionId].directionY = this.directionY;
				sessions[sessionId].x = undefined;
				sessions[sessionId].y = undefined;
				this.client.send('goToRoom', { room: this.room.previousLevel });
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

			if (this.client && this.room.nextLevel) {
				const sessionId = this.client.auth.sessionId;
				sessions[sessionId].lastLevel = this.room.id;
				sessions[sessionId].isSlow = this.isSlow;
				sessions[sessionId].directionX = this.directionX;
				sessions[sessionId].directionY = this.directionY;
				sessions[sessionId].x = undefined;
				sessions[sessionId].y = undefined;
				this.client.send('goToRoom', { room: this.room.nextLevel });
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
			const sessionId = this.client.auth.sessionId;
			sessions[sessionId].x = this.x;
			sessions[sessionId].y = this.y;
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

	constructor(
		public id: string,
		name: string,
		height: number,
		width: number,
		public previousLevel: string,
		public nextLevel: string,
		isWin: boolean = false,
		public isFirst: boolean = false
	) {
		super();

		this.name = name;
		this.height = height;
		this.width = width;
		this.isWin = isWin;

		if (width % 4 !== 0) {
			throw new Error('Width must be multiply of 4.');
		} else if (height % 4 !== 0) {
			throw new Error('Height must be multiply of 4.');
		}
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
		let x = 32 * 4;
		let y = 32 * Math.floor(this.height / 2);

		const sessionId = client.auth.sessionId;
		if (sessions[sessionId].lastLevel === this.nextLevel) {
			x = 32 * (this.width - 4);
		}

		sessions[sessionId].currentLevel = this.id;

		if (sessions[sessionId].x) {
			x = sessions[sessionId].x;
		}

		if (sessions[sessionId].y) {
			y = sessions[sessionId].y;
		}

		const nickname = client.auth.profile.nickname;
		const isSlow = sessions[sessionId].isSlow;
		const directionX = sessions[sessionId].directionX;
		const directionY = sessions[sessionId].directionY;
		const isDead = sessions[sessionId].isDead;

		this.players.set(
			client.sessionId,
			new Player(this, false, nickname, isSlow, directionX, directionY, x, y, isDead, [255, 0, 0], client)
		);

		client.send('sessionId', { sessionId });
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
