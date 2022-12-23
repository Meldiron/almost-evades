import { Schema, type, MapSchema } from '@colyseus/schema';
import { Client } from 'colyseus';
import { CollideUtils } from '../../collideUtils';

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

	constructor(private room: RoomState, private client: Client, x: number, y: number) {
		super();

		this.x = x;
		this.y = y;
		this.nickname = this.client.auth.profile.nickname;

		this.isSlow = this.client.auth.initState.isSlow;
		this.directionX = this.client.auth.initState.directionX;
		this.directionY = this.client.auth.initState.directionY;
	}

	update(deltaTime: number) {
		const baseSpeed = deltaTime * 0.3;
		let speed = baseSpeed;

		if (this.x < 32 * 8 || this.x > (this.room.width-8) * 32) {
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
		}

		const collisionLeft = CollideUtils.circleWithBox(collisionObject, { x: -1000, y: 0, width: 1000, height: this.room.height * 32 });
		if(collisionLeft.collide) {
			collisionObject.x = collisionLeft.x;
			collisionObject.y = collisionLeft.y;

			if(this.room.previousLevel) {
				this.client.send('goToRoom', { hasFinished: true, room: this.room.previousLevel, isSlow: this.isSlow, directionX: this.directionX, directionY: this.directionY});
			}
		}

		const collisionRight = CollideUtils.circleWithBox(collisionObject, { x: this.room.width * 32, y: 0, width: 1000, height: this.room.height * 32 });
		if(collisionRight.collide) {
			collisionObject.x = collisionRight.x;
			collisionObject.y = collisionRight.y;
			
			if(this.room.nextLevel) {
				this.client.send('goToRoom', { hasFinished: false, room: this.room.nextLevel, isSlow: this.isSlow, directionX: this.directionX, directionY: this.directionY});
			}
		}

		const collisionUp = CollideUtils.circleWithBox(collisionObject, { x: 0, y: -1000, width: this.room.width * 32, height: 1000 });
		if(collisionUp.collide) {
			collisionObject.x = collisionUp.x;
			collisionObject.y = collisionUp.y;
		}

		const collisionDown = CollideUtils.circleWithBox(collisionObject, { x: 0, y: this.room.height * 32, width: this.room.width * 32, height: 1000 });
		if(collisionDown.collide) {
			collisionObject.x = collisionDown.x;
			collisionObject.y = collisionDown.y;
		}

		this.x = collisionObject.x;
		this.y = collisionObject.y;
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

	constructor(name: string, height: number, width: number, public previousLevel: string, public nextLevel: string, isWin: boolean = false) {
		super();

		this.name = name;
		this.height = height;
		this.width = width;
		this.isWin = isWin;

		if(width % 4 !== 0) {
			throw new Error('Width must be multiply of 4.');
		} else if(height % 4 !== 0) {
			throw new Error('Height must be multiply of 4.');
		}
	}

	createPlayer(client: Client) {
		const x = client.auth.initState.hasFinished ? 32 * (this.width - 4) : 32 * 4;
		const y = 32 * Math.floor(this.height / 2);
		this.players.set(
			client.sessionId,
			new Player(this, client, x, y)
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
