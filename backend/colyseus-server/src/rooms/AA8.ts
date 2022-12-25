import { GameUtils } from './gameUtils';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA8 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley008',
			name: 'Angelic Alley - Area 8/10',
			width: 80,
			height: 16,
			previous: 'AngelicAlley007',
			next: 'AngelicAlley009',
			isWin: false
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 5; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 1.5, radius: 8 });
		}

		for (let i = 0; i < 5; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 0.3, radius: 64 });
		}

		super.onCreate();
	}
}
