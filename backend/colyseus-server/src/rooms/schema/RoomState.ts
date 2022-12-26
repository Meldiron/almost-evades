import { Schema, type, MapSchema } from '@colyseus/schema';
import { Client } from 'colyseus';
import { AppwriteService } from '../../appwrite';
import { CollideUtils } from '../../collideUtils';
import { RoomRegistry } from '../../roomRegistry';
import { RegistryData } from '../Room';

export class Vector {
    constructor(public x: number, public y: number) {}

    public magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public divide(scalar: number) {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    public normalize() {
        return this.divide(this.magnitude());
    }
}

export class Player extends Schema {
	@type('string')
	sessionId;

	@type('number')
	x;

	@type('number')
	y;

	@type('string')
	nickname;

	@type('number')
	moveVectorX = 0;

	@type('number')
	moveVectorY = 0;

	@type('boolean')
	isSlow = false;

	@type('number')
	baseSpeed = 1;

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
		sessionId: string,
		isEnemy: boolean,
		nickname: string,
		isSlow: boolean,
		moveVector: number[],
		x: number,
		y: number,
		isDead: boolean,
		color: number[],
		baseSpeed: number = 1,
		radius: number = 16,
		public client: Client | null = null
	) {
		super();

		this.sessionId = sessionId;
		this.x = x;
		this.y = y;
		this.nickname = nickname;
		this.isSlow = isSlow;
		this.isEnemy = isEnemy;
		this.isDead = isDead;
		this.baseSpeed = baseSpeed;
		this.radius = radius;

		this.colorR = color[0];
		this.colorG = color[1];
		this.colorB = color[2];

		this.setMoveVector(moveVector);
	}

	setMoveVector(moveVector: number[]) {
		if(moveVector[0] === 0 && moveVector[1] === 0) {
			this.moveVectorX = 0;
			this.moveVectorY = 0;
			return;
		}

		const vector = new Vector(moveVector[0], moveVector[1]).normalize();
		this.moveVectorX = vector.x;
		this.moveVectorY = vector.y;
	}

	async update(deltaTime: number) {
		if (this.isDead || this.isZombie) {
			return;
		}

		const baseSpeed = (deltaTime * 0.3) * this.baseSpeed;
		let speed = baseSpeed;

		/*
		if (this.x < 32 * 8 || this.x > (this.room.width - 8) * 32) {
			speed = baseSpeed * 2;
		}
		*/

		if (this.isSlow) {
			speed = baseSpeed / 3;
		}

		this.x += speed * this.moveVectorX;
		this.y += speed * this.moveVectorY;

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

			if (this.isEnemy) {
				this.setMoveVector([-1 * this.moveVectorX, this.moveVectorY]);
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

			if (this.isEnemy) {
				this.setMoveVector([-1 * this.moveVectorX, this.moveVectorY]);
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

			if (this.isEnemy) {
				this.setMoveVector([this.moveVectorX, -1 * this.moveVectorY]);
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

			if (this.isEnemy) {
				this.setMoveVector([this.moveVectorX, -1 * this.moveVectorY]);
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

	@type('number')
	maxLevel: number;

	constructor(public registry: RegistryData) {
		super();

		this.name = registry.name;
		this.width = registry.width;
		this.height = registry.height;
		this.isWin = registry.isWin;
		this.maxLevel = registry.maxLevel;
	}

	createEnemy(
		config: {
			speed: number,
			radius: number,
			baseSpeed: number,
			moveVector: number[],
			x: number,
			y: number,
			color: number[]
		}
	) {
		const enemyId = crypto.randomUUID();

		this.players.set(
			enemyId,
			new Player(this, enemyId, true, '', false, config.moveVector, config.x, config.y, false, config.color, config.speed, config.radius)
		);
	}

	createPlayer(client: Client) {
		const sessionId = client.auth.session.$id;
		const nickname = client.auth.session.nickname;
		const x = client.auth.session.x;
		const y = client.auth.session.y;
		const isDead = client.auth.session.isDead;

		this.players.set(
			client.sessionId,
			new Player(this, sessionId, false, nickname, false, [0,0], x, y, isDead, [255, 0, 0], 1, 16, client)
		);
	}

	removePlayer(client: Client) {
		this.players.delete(client.sessionId);
	}

	setMoveVector(client: Client, vector: number[]) {
		this.players.get(client.sessionId).setMoveVector(vector);
	}
}
