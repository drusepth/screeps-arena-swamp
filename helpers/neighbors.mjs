import { getTerrainAt } from '/game/utils';
import { TERRAIN_WALL, TERRAIN_SWAMP } from '/game/constants';

export function get_walkable_neighbor_tiles_around(originX, originY) {
    let walkable_neighbor_tiles = [];
    let radius = 1;

    for (let y = originY - radius; y <= originY + radius; y++) {
        for (let x = originX - radius; x <= originX + radius; x++) {
            let tile = getTerrainAt({x: x, y: y})
            
            let tile_weight = 
                tile === TERRAIN_WALL  ? 255 : // wall  => unwalkable
                tile === TERRAIN_SWAMP ?   5 : // swamp => weight:  5
                                           1 ; // plain => weight:  1

            if (tile_weight != 255)
                walkable_neighbor_tiles.push({ x: x, y: y});
        }
    }

    return walkable_neighbor_tiles;
}
