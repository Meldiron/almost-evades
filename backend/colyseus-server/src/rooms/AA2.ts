import { GameUtils } from './gameUtils';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA2 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley002',
			name: 'Angelic Alley - Area 2/10',
			width: 80,
			height: 16,
			previous: 'AngelicAlley001',
			next: 'AngelicAlley003',
			isWin: false,
			maxLevel: 10
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 10; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 0.5 });
		}

		super.onCreate();
	}
}
