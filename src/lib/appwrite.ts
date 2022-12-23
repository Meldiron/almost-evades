import { browser } from '$app/environment';
import { Account, Client, Databases, Functions, ID, type Models } from 'appwrite';

export type Profile = Models.Document & {
	nickname: string;
};

const client = new Client();

client.setEndpoint('https://cloud.appwrite.io/v1').setProject('almostEvades');

const account = new Account(client);
const functions = new Functions(client);
const databases = new Databases(client);

const errorHandler = (cb: any) => {
	return async () => {
		try {
			return await cb();
		} catch (err: any) {
			console.error(err);
			Swal.fire('Error!', err.message ? err.message : err.toString());
		}
	};
};

if (browser) {
	window.addEventListener('unhandledrejection', function (event) {
		Swal.fire('Error!', event.reason.message, 'error');
	});
}

export const AppwriteService = {
	loginGuest: async () => {
		return await account.createAnonymousSession();
	},
	loginEmail: async (email: string) => {
		return await account.createMagicURLSession(
			ID.unique(),
			email,
			window.location.origin + '/auth'
		);
	},
	loginEmailFinish: async (userId: string, secret: string) => {
		return await account.updateMagicURLSession(userId, secret);
	},
	logout: async () => {
		return await account.deleteSession('current');
	},
	getAccount: async () => {
		return await account.get();
	},
	getJwtKey: async () => {
		return (await account.createJWT()).jwt;
	},
	getProfile: async (userId: string) => {
		return await databases.getDocument<Profile>('default', 'profiles', userId);
	},
	createProfile: async (nickname: string) => {
		const execution = await functions.createExecution(
			'createProfile',
			JSON.stringify({
				nickname
			}),
			false
		);

		if (execution.status === 'failed') {
			throw new Error('Something went wrong. Please try again.');
		}

		const response = JSON.parse(execution.response);

		if (!response.ok) {
			throw new Error(response.msg);
		}

		return response;
	}
};
