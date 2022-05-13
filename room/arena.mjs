import { getObjectsByPrototype } from '/game/utils';
import { Creep, StructureContainer, StructureSpawn, StructureExtension, Resource } from '/game/prototypes';
import { RESOURCE_ENERGY } from '/game/constants';
import { filter_creeps_by_role, filter_creeps_by_roles, filter_creeps_by_body_part, filter_creeps_by_body_parts } from '../helpers/filters';
import { flight_distance } from '../helpers/distance';

export class Arena {
    static get_my_spawn() {
        return getObjectsByPrototype(StructureSpawn).filter(structure => structure.my)[0];
    }

    static get_my_extensions() {
        return getObjectsByPrototype(StructureExtension).filter(structure => structure.my);
    }

    static get_enemy_spawn() {
        return getObjectsByPrototype(StructureSpawn).filter(structure => !structure.my)[0];
    }

    static get_my_creeps() {
        return getObjectsByPrototype(Creep).filter(creep => creep.my && creep.exists);
    }

    static get_non_empty_containers() {
        let containers = getObjectsByPrototype(StructureContainer).filter((structure) => {
            return structure.store[RESOURCE_ENERGY] > 0;
        });
    
        return containers;
    }

    static get_resource_piles(resource_type) {
        // Since we're always dealing with energy here we can skip the filter call, but if we
        // switch to a game mode with multiple resources we probably want to pass the resource in
        // as a parameter to filter on.
        return getObjectsByPrototype(Resource);
    }

    static get_mostly_full_containers_away_from(origin, distance) {
        let containers = getObjectsByPrototype(StructureContainer).filter((container) => {
            return container.store[RESOURCE_ENERGY] >= container.store.getCapacity() * 0.75
                && flight_distance(origin.x, origin.y, container.x, container.y) > 10;
        });
        return containers;
    }

    static get_enemy_creeps() {
        return getObjectsByPrototype(Creep).filter(creep => !creep.my && creep.exists);
    }

    static get_friendly_creeps_with_role(role) {
        return filter_creeps_by_role(this.get_my_creeps(), role);
    }

    static get_friendly_creeps_with_roles(roles) {
        return filter_creeps_by_roles(this.get_my_creeps(), roles);
    }

    static get_enemy_creeps_with_body_part(body_part) {
        return filter_creeps_by_body_part(this.get_enemy_creeps(), body_part);
    }

    static get_enemy_creeps_with_body_parts(body_parts) {
        return filter_creeps_by_body_parts(this.get_enemy_creeps(), body_parts);
    }

    static get_my_creeps_with_body_part(body_part) {
        return filter_creeps_by_body_part(this.get_my_creeps(), body_part);
    }

    static get_my_creeps_with_body_parts(body_parts) {
        return filter_creeps_by_body_parts(this.get_my_creeps(), body_parts);
    }
}
