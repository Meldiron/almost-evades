import { GameRoom } from './Room';
import { RoomState } from './schema/RoomState';

export class myFirstJourney002 extends GameRoom {
	onCreate() {
		this.setState(new RoomState('My First Journey Area 2', 16, 24, 'myFirstJourney001', 'myFirstJourney003'));
		super.onCreate();
	}
}
