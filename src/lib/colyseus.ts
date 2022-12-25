import { AppwriteService } from './appwrite';
import {get} from 'svelte/store';
import { accountStore } from './stores';

export class ColyseusService {
	private client: any;
	jwt: string = '';

	constructor(hostname: string) {
		this.client = new Colyseus.Client((hostname.includes('localhost') ? 'ws' : 'wss') + '://' + hostname);

		console.log(this.client);

		const jwt = localStorage.getItem('jwt');
		if (jwt) {
			const obj = JSON.parse(jwt);

            if(get(accountStore)?.$id ?? '' !== obj.userId) {
                return;
            }

			this.jwt = obj.jwt;
			const timePassed = Date.now() - obj.createdAt;
			const timeWait = 1000 * 60 * 14 - timePassed;

			if (timeWait > 0) {
				setTimeout(() => {
					this.jwt = '';
				}, timeWait);
			} else {
				this.jwt = '';
			}
		}
	}

	async getJwt() {
		if (!this.jwt) {
			this.jwt = await AppwriteService.getJwtKey();
			localStorage.setItem('jwt', JSON.stringify({ jwt: this.jwt, createdAt: Date.now(), userId: get(accountStore)?.$id ?? '' }));

			setTimeout(() => {
				this.jwt = '';
			}, 1000 * 60 * 14);
		}

		return this.jwt;
	}

	async joinLobby(desiredRoomId: string) {
		return await this.client.joinOrCreate('Lobby', {
			jwt: await this.getJwt(),
			sessionId: localStorage.getItem('sessionId') ?? '',
			desiredRoomId
		})
	}

	async joinRoom(name: string) {
		return await this.client.joinOrCreate(name, {
			sessionId: localStorage.getItem('sessionId') ?? ''
		});
	}
}
