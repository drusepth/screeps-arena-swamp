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

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';

export class UArcher extends UGeneric {
    static act(archer) {
        // TODO probably want to prioritize by threat also
        var enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);
        if (enemyCreeps.length > 0) {
            var closest_enemy = enemyCreeps[0];
            if (enemyCreeps.length > 1) {
                console.log(archer);
                var min_distance = archer.pos.getRangeTo(enemyCreeps[0]);
                for (var i = 1; i < enemyCreeps.length; i++) {
                    var distance_to_enemy = archer.pos.getRangeTo(enemyCreeps[i]);
                        if (distance_to_enemy < min_distance) {
                        closest_enemy = enemyCreeps[i];
                    }
                }
        }
        var attack_response = archer.rangedAttack(closest_enemy);
        if (attack_response == ERR_NOT_IN_RANGE)
            archer.moveTo(closest_enemy);
        return;
        }

        console.log('Attacking enemy spawn!');
        var enemySpawn = getObjectsByPrototype(StructureSpawn).filter(structure => !structure.my)[0];
        var attack_response = archer.rangedAttack(enemySpawn);
        if (attack_response == ERR_NOT_IN_RANGE)
            archer.moveTo(enemySpawn);
    }
}