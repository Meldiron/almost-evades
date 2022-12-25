import { GameUtils } from './gameUtils';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA11 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley011',
			name: 'Angelic Alley - Win Area',
			width: 16,
			height: 16,
			previous: 'AngelicAlley010',
			next: '',
			isWin: true
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));

		super.onCreate();
	}
}
