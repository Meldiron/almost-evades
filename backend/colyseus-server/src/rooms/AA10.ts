import { GameUtils } from './gameUtils';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA10 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley010',
			name: 'Angelic Alley - Area 10/10',
			width: 80,
			height: 16,
			previous: 'AngelicAlley009',
			next: 'AngelicAlley011',
			isWin: false,
			maxLevel: 10
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 5; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 1.3, radius: 8 });
		}

		for (let i = 0; i < 10; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 0.3, radius: 64 });
		}

		for (let i = 0; i < 5; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 1, radius: 16 });
		}

		super.onCreate();
	}
}
