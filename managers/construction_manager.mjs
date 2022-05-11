import { getObjectsByPrototype, createConstructionSite } from '/game/utils';
import { findClosestByPath } from '/game/utils';
import { RESOURCE_ENERGY, OK, ERR_NOT_IN_RANGE } from '/game/constants';
import { StructureRampart, StructureExtension, ConstructionSite } from '/game/prototypes';
import { get_walkable_neighbor_tiles_around } from '../helpers/neighbors.mjs';

import { Arena } from '../room/arena';
import { flight_distance } from '../helpers/distance';
import { BHive } from '../buildings/hive';

export class ConstructionManager {
    static get_my_ramparts() {
        return getObjectsByPrototype(StructureRampart).filter(structure => structure.my);
    }

    static get_my_construction_sites() {
        return getObjectsByPrototype(ConstructionSite).filter(
            (site) => site.my && site.progress < site.progressTotal
        );
    }

    static get_my_extensions() {
        return getObjectsByPrototype(StructureExtension).filter(structure => structure.my);
    }

    static get_my_empty_extensions() {
        return this.get_my_extensions().filter(extension => extension.store[RESOURCE_ENERGY] == 0);
    }

    static get_my_non_empty_extensions() {
        return this.get_my_extensions().filter(extension => extension.store[RESOURCE_ENERGY] > 0);
    }

    static create_next_construction_site() {
        let my_spawn         = Arena.get_my_spawn();
        let my_ramparts      = ConstructionManager.get_my_ramparts();
        let full_containers  = Arena.get_mostly_full_containers_away_from(my_spawn, BHive.hive_radius());
        let empty_extensions = ConstructionManager.get_my_empty_extensions();

        // 1. If we don't have a rampart yet, start construction of one at our spawn.
        if (my_ramparts.length == 0) {
            console.log("Queued rampart for construction");
            return ConstructionManager.create_rampart_construction_site(my_spawn);
        }

        // 2. If there are useful containers outside of our base, try to create an Extension near them
        //    If we already have more than 2 empty extensions, don't bother building more though.
        if (full_containers.length > 0 && empty_extensions.length <= 1) {
            let nearest_full_container = findClosestByPath(my_spawn, full_containers);
            let buildable_tiles        = get_walkable_neighbor_tiles_around(nearest_full_container.x, nearest_full_container.y, 1);
            let tile_to_build_on       = buildable_tiles[0];

            console.log("Queued extension for construction");
            return ConstructionManager.create_extension_construction_site(tile_to_build_on);
        }

        return null;
    }

    static create_rampart_construction_site(location) {
        return createConstructionSite({x: location.x, y: location.y}, StructureRampart).object;
    }

    static create_extension_construction_site(location) {
        return createConstructionSite({x: location.x, y: location.y}, StructureExtension).object;
    }
}