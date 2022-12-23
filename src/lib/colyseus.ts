import * as Colyseus from 'colyseus.js'; // not necessary if included via <script> tag.
import { AppwriteService } from './appwrite';
import {get} from 'svelte/store';
import { accountStore } from './stores';

export class ColyseusService {
	private client: Colyseus.Client;
	jwt: string = '';

	constructor(hostname: string) {
		this.client = new Colyseus.Client('wss://' + hostname);

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

	async playLevel(name: string) {
		return await this.client.joinOrCreate(name, {
			jwt: await this.getJwt()
		});
	}
}
