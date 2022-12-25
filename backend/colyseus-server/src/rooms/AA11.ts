import { Client } from 'colyseus';
import { AppwriteService } from '../appwrite';
import { GameRoom, RegistryData } from './Room';
import { RoomState } from './schema/RoomState';

export class AA11 extends GameRoom {
	getRegistryData(): RegistryData {
		return {
			id: 'AngelicAlley011',
			name: 'Angelic Alley - Win Area',
			width: 16,
			height: 16,
			previous: '',
			next: '',
			isWin: true
		}
	}

	onCreate() {
		this.setState(new RoomState(this.getRegistryData()));
		super.onCreate();
	}

	onJoin(client: Client): void {
		(async () => {
			if(!client.auth.session.didWin) {
				client.auth.session.didWin = true;
				await AppwriteService.updateSession(client.auth.session);
	
				await AppwriteService.addVp(client.auth.session.userId, 1);
				await AppwriteService.addMapWin(client.auth.session.userId, 'AngelicAlley');
				client.send('chatMessage', { nickname: 'SYSTEM', msg: 'You won! We added +1 VP to your profile. You can leave now with /l' });
			} else {
				client.send('chatMessage', { nickname: 'SYSTEM', msg: 'You won! You can leave now with /l' });
			}
		})();
		super.onJoin(client);
	}
}
