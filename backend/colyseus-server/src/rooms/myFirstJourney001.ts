import { GameRoom } from './Room';
import { RoomState } from './schema/RoomState';

export class myFirstJourney001 extends GameRoom {
	onCreate() {
		this.setState(new RoomState('myFirstJourney001', 'My First Journey Area 1', 16, 20, '', 'myFirstJourney002', false, true));
		super.onCreate();
	}
}
