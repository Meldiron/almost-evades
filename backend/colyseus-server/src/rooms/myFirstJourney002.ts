import { GameRoom } from './Room';
import { RoomState } from './schema/RoomState';

export class myFirstJourney002 extends GameRoom {
	onCreate() {
		this.setState(new RoomState('myFirstJourney002', 'My First Journey Area 2', 16, 24, 'myFirstJourney001', 'myFirstJourney003'));
		
		this.state.createEnemy(false, "none", Math.random() < 0.5 ? 'up' : 'down', 12 * 32, 8 * 32, [100,100,100]);

		super.onCreate();
	}
}
