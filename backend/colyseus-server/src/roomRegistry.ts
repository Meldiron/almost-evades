import { Server } from 'colyseus';
import { RegistryData } from './rooms/Room';

export class RoomRegistry {
	static rooms: { [key: string]: RegistryData } = {};

	static get(roomId: string) {
		return RoomRegistry.rooms[roomId];
	}

	static register(gameServer: Server, roomClass: any) {
        const roomData = new roomClass().getRegistryData();
		RoomRegistry.rooms[roomData.id] = roomData;
        gameServer.define(roomData.id, roomClass);
	}
}
