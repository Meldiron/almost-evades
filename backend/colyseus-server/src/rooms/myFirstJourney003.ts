import { GameRoom } from './Room';
import { RoomState } from './schema/RoomState';

export class myFirstJourney003 extends GameRoom {
	onCreate() {
		this.setState(new RoomState('myFirstJourney003', 'My First Journey Area 3', 16, 28, 'myFirstJourney002', 'myFirstJourney004'));
		super.onCreate();
	}
}
