import { dev } from '$app/environment';

export const maps = {
	AngelicAlley: 'Angelic Alley (Easy)'
};

export const servers = dev
	? {
			'localhost:3000': 'Development'
	  }
	: {
			'eu1.evades.almostapps.eu': 'EU #1'
	  };
