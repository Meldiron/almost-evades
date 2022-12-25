import { GameUtils } from './gameUtils';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA5 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley005',
			name: 'Angelic Alley - Area 5/10',
			width: 80,
			height: 16,
			previous: 'AngelicAlley004',
			next: 'AngelicAlley006',
			isWin: false
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 10; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 1, radius: 16 });
		}

		super.onCreate();
	}
}
