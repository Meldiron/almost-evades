import { Schema, type, MapSchema } from '@colyseus/schema';

export class Player extends Schema {
	@type('number')
	x = 64 + 16;

	@type('number')
	y = 128 + 16;

	@type('string')
	directionX = 'none';

	@type('string')
	directionY = 'none';

	@type('boolean')
	isSlow = false;

	update(deltaTime: number) {
		let speed = deltaTime * 0.3;

		if(this.isSlow) {
			speed /= 3;
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
	}
}

export class RoomState extends Schema {
	@type({ map: Player })
	players = new MapSchema<Player>();

	createPlayer(sessionId: string) {
		this.players.set(sessionId, new Player());
	}

	removePlayer(sessionId: string) {
		this.players.delete(sessionId);
	}

	setSlow(sessionId: string, isSlow: boolean) {
		this.players.get(sessionId).isSlow = isSlow;
	}

	setDirection(sessionId: string, direction: string) {
		if (direction === 'up' || direction === 'down') {
			this.players.get(sessionId).directionY = direction;
		} else if (direction === 'left' || direction === 'right') {
			this.players.get(sessionId).directionX = direction;
		}
	}

	endDirection(sessionId: string, direction: string) {
		if (direction === 'up' || direction === 'down') {
			if (this.players.get(sessionId).directionY === direction) {
				this.players.get(sessionId).directionY = 'none';
			}
		} else if (direction === 'left' || direction === 'right') {
			if (this.players.get(sessionId).directionX === direction) {
				this.players.get(sessionId).directionX = 'none';
			}
		}
	}
}
