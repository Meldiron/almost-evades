import { GameUtils } from './gameUtils';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA1 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley001',
			name: 'Angelic Alley - Area 1/10',
			width: 80,
			height: 16,
			previous: '',
			next: 'AngelicAlley002',
			isWin: false
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 5; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 0.5 });
		}

		super.onCreate();
	}
}
