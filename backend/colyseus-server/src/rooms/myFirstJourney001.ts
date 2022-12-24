import { GameRoom } from './Room';
import { RoomState } from './schema/RoomState';

export class myFirstJourney001 extends GameRoom {
	onCreate() {
		this.setState(
			new RoomState(
				'myFirstJourney001',
				'My First Journey Area 1',
				16,
				20,
				'',
				'myFirstJourney002',
				false,
				true
			)
		);

		for (let i = 0; i < 5; i++) {
			const x = 8 + Math.round(Math.random() * 2);
			const y = Math.round(Math.random() * 15);
			this.state.createEnemy(false, 'none', 'none', x * 32, y * 32, [100, 100, 100]);
		}

		super.onCreate();
	}
}
