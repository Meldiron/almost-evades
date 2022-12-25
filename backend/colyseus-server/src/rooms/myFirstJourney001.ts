import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class myFirstJourney001 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'myFirstJourney001',
			name: 'My First Journey Area 1',
			width: 20,
			height: 16,
			previous: '',
			next: 'myFirstJourney002',
			isWin: false
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 5; i++) {
			const x = 8 + Math.round(Math.random() * 2);
			const y = Math.round(Math.random() * 15);
			this.state.createEnemy(false, 'none', 'none', x * 32, y * 32, [100, 100, 100]);
		}

		super.onCreate();
	}
}
