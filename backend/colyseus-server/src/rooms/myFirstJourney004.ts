import { GameRoom } from './Room';
import { RoomState } from './schema/RoomState';

export class myFirstJourney004 extends GameRoom {
	onCreate() {
		this.setState(new RoomState('My First Journey Area 4', 16, 16, 'myFirstJourney003', '', true));
		super.onCreate();
	}
}
