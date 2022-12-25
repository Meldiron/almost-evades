import { ID, Account, Client, Users, Databases, Models, Query } from 'node-appwrite';

const apiKey = process.env.APPWRITE_API_KEY;

export type Profile = Models.Document & {
	nickname: string;
	vps: number;
	skinId: string;
	mapWins: string;
};

export type Session = Models.Document & {
	userId: string;
	nickname: string;
	roomId: string;
	isActive: boolean;
	x: number;
	y: number;
	isDead: boolean;
};

const client = new Client()
	.setEndpoint('https://cloud.appwrite.io/v1')
	.setProject('almostEvades')
	.setKey(apiKey);

const users = new Users(client);
const databases = new Databases(client);

export const AppwriteService = {
	getAccount: async (jwtKey: string) => {
		const client = new Client()
			.setEndpoint('https://cloud.appwrite.io/v1')
			.setProject('almostEvades')
			.setJWT(jwtKey);

		const account = new Account(client);

		return account.get();
	},
	getProfile: async (userId: string) => {
		return await databases.getDocument<Profile>('default', 'profiles', userId);
	},
	getUser: async (userId: string) => {
		return await users.get(userId);
	},
	createSession: async (userId: string, nickname: string, roomId: string, x: number, y: number, isDead: boolean) => {
		return await databases.createDocument<Session>('default', 'sessions', ID.unique(), {
			userId,
			roomId,
			isActive: false,
			x,
			y,
			isDead,
			nickname
		});
	},
	getSession: async (sessionId: string) => {
		return await databases.getDocument<Session>('default', 'sessions', sessionId);
	},
	getActiveSession: async (userId: string) => {
		const response = await databases.listDocuments<Session>('default', 'sessions', [
			Query.limit(1),
			Query.equal('userId', userId),
			Query.equal('isActive', true)
		]);

		return response.documents[0] ?? null;
	},
	updateSession: async (session: Session) => {
		delete session['$collectionId'];
		delete session['$databaseId'];
		delete session['$updatedAt'];
		delete session['$createdAt'];
		delete session['$permissions'];
		return await databases.updateDocument<Session>('default', 'sessions', session.$id, session);
	},
	addVp: async (userId: string, amount: number) => {
		const profile = await AppwriteService.getProfile(userId);
		await databases.updateDocument<Profile>('default', 'profiles', userId, {
			vps: profile.vps + amount
		});
	},
	addMapWin: async (userId: string, mapId: string) => {
		const profile = await AppwriteService.getProfile(userId);
		const wins = JSON.parse(profile.mapWins);

		if(!wins[mapId]) {
			wins[mapId] = 0;
		}

		wins[mapId]++;

		await databases.updateDocument<Profile>('default', 'profiles', userId, {
			mapWins: JSON.stringify(wins)
		});
	}
};
