import { RegistryData } from "./Room";

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandom(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export const GameUtils = {
	addNormalEnemy: (state: any, map: RegistryData, config: any) => {
        config.speed = config.speed ?? 1;
        config.radius = config.radius ?? 16;

        const minX = 8.5 * 32;
        const maxX = (map.width -8.5) * 32;

        const minY = 0.5*32;
        const maxY = (map.height-0.5)*32;

        config.x = getRandom(minX, maxX);
        config.y = getRandom(minY, maxY);

        let moveVector = [getRandom(-1, 1), getRandom(-1,1)];

        const r = Math.random();
        if(r < 0.15) {
            moveVector[0] = 0;
            moveVector[1] = Math.random() < 0.5 ? 1 : -1;
        } else if(r < 0.3) {
            moveVector[0] = Math.random() < 0.5 ? 1 : -1;
            moveVector[1] = 0;
        }

        config.moveVector = moveVector;
        config.color = [100,100,100];

        state.createEnemy(config);
    }
};
