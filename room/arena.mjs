import { getObjectsByPrototype } from '/game/utils';
import { Creep, StructureContainer, StructureSpawn } from '/game/prototypes';
import { RESOURCE_ENERGY } from '/game/constants';
import { filter_creeps_by_role, filter_creeps_by_roles } from '../helpers/filters.mjs';

export class Arena {
    static get_my_spawn() {
        return getObjectsByPrototype(StructureSpawn).filter(structure => structure.my)[0];
    }

    static get_enemy_spawn() {
        return getObjectsByPrototype(StructureSpawn).filter(structure => !structure.my)[0];
    }

    static get_my_creeps() {
        return getObjectsByPrototype(Creep).filter(creep => creep.my);
    }

    static get_non_empty_containers() {
        let containers = getObjectsByPrototype(StructureContainer).filter((structure) => {
            // Only look at non-owned containers that let us fill our full capacity from
            // return store.energy >= drone.store.getFreeCapacity(RESOURCE_ENERGY);
    
            // Only harvest from containers outside of our base
            //return flight_distance(structure.x, structure.y, mySpawn.x, mySpawn.y) > secured_base_radius();
            return structure.store[RESOURCE_ENERGY] > 0;
        });
    
        return containers;
    }

    static get_enemy_creeps() {
        return getObjectsByPrototype(Creep).filter(creep => !creep.my);
    }

    static get_friendly_creeps_with_role(role) {
        return filter_creeps_by_role(this.get_my_creeps(), role);
    }

    static get_friendly_creeps_with_roles(roles) {
        return filter_creeps_by_roles(this.get_my_creeps(), roles);
    }
}
