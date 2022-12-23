import { Account, Client, Users, Databases, Models } from 'node-appwrite';

import * as dotenv from "dotenv";
const vars = dotenv.config();

const apiKey = process.env.APPWRITE_API_KEY;

export type Profile = Models.Document & {
	nickname: string;
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
	}
};
