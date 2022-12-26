import { GameUtils } from './gameUtils';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA3 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley003',
			name: 'Angelic Alley - Area 3/10',
			width: 80,
			height: 16,
			previous: 'AngelicAlley002',
			next: 'AngelicAlley004',
			isWin: false,
			maxLevel: 10
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 15; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 0.5 });
		}

		super.onCreate();
	}
}
