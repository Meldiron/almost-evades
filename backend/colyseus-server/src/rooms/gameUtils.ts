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

        const directionsX = ['left', 'right'];
        const directionsY = ['up', 'down'];

        let directionX = directionsX[Math.floor(Math.random() * directionsX.length)];
        let directionY = directionsY[Math.floor(Math.random() * directionsY.length)];

        const r = Math.random();
        if(r < 0.15) {
            directionX = 'none';
        } else if(r < 0.3) {
            directionY = 'none';
        }

        config.directionX = directionX;
        config.directionY = directionY;
        config.color = [100,100,100];

        state.createEnemy(config);
    }
};
