import { GameUtils } from './gameUtils';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA7 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley007',
			name: 'Angelic Alley - Area 7/10',
			width: 80,
			height: 16,
			previous: 'AngelicAlley006',
			next: 'AngelicAlley008',
			isWin: false
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 15; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 1 });
		}

		super.onCreate();
	}
}
