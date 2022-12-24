import { GameRoom } from './Room';
import { RoomState } from './schema/RoomState';

export class myFirstJourney003 extends GameRoom {
	onCreate() {
		this.setState(new RoomState('myFirstJourney003', 'My First Journey Area 3', 16, 28, 'myFirstJourney002', 'myFirstJourney004'));

		this.state.createEnemy(false, "none", "none", 14 * 32, 1 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 2 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 3 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 4 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 5 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 6 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 10 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 11 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 12 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 13 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 14 * 32, [100,100,100]);
		this.state.createEnemy(false, "none", "none", 14 * 32, 15 * 32, [100,100,100]);

		this.state.createEnemy(false,  Math.random() < 0.5 ? 'left' : 'right', Math.random() < 0.5 ? 'up' : 'down', 14 * 32, 8 * 32, [100,100,100]);


		super.onCreate();
	}
}
