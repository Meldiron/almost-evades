import { GameUtils } from './gameUtils';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA4 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley004',
			name: 'Angelic Alley - Area 4/10',
			width: 80,
			height: 16,
			previous: 'AngelicAlley003',
			next: 'AngelicAlley005',
			isWin: false
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		for (let i = 0; i < 20; i++) {
			GameUtils.addNormalEnemy(this.state, this.getRegistryData(), { speed: 0.5 });
		}

		super.onCreate();
	}
}