import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class myFirstJourney002 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'myFirstJourney002',
			name: 'My First Journey Area 2',
			width: 24,
			height: 16,
			previous: 'myFirstJourney001',
			next: '',
			isWin: false
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 10; i++) {
			const x = 10 + Math.round(Math.random() * 2);
			const y = Math.round(Math.random() * 15);
			this.state.createEnemy(false, 'none', 'none', x * 32, y * 32, [100, 100, 100]);
		}

		super.onCreate();
	}
}
