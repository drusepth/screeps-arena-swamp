import {
    getObjectsByPrototype, findClosestByPath
} from '/game/utils';
import { 
    Creep, Source, 
    Structure, StructureContainer, StructureSpawn
} from '/game/prototypes';
import {
    MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH, BODYPART_COST,
    RESOURCE_ENERGY,
    OK, ERR_NOT_IN_RANGE, ERR_INVALID_TARGET
} from '/game/constants';
import { Visual } from '/game/visual';

export class Arena {
    static get_my_spawn() {
        return getObjectsByPrototype(StructureSpawn).filter(structure => structure.my)[0];
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
        return getObjectsByPrototype(Creep).filter(creep => creep.my && creep.memory.role == role);
    }
}