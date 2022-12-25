import { GameUtils } from './gameUtils';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA6 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley006',
			name: 'Angelic Alley - Area 6/10',
			width: 80,
			height: 16,
			previous: 'AngelicAlley005',
			next: 'AngelicAlley007',
			isWin: false
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 10; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 1.1 });
		}

		for (let i = 0; i < 5; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 1.1, radius: 16 });
		}

		super.onCreate();
	}
}
