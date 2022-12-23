import type { Models } from 'appwrite';
import { writable } from 'svelte/store';
import type { Profile } from './appwrite';

export const accountStore = writable<Models.Account<any> | null>(null);
export const profileStore = writable<Profile | null>(null);