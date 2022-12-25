export class RoomRegistry {
    static rooms: any = {};

    static get(roomId: string) {
        return RoomRegistry.rooms[roomId];
    }

    static register(roomId: string, data: any) {
        RoomRegistry.rooms[roomId] = data;
    }
}