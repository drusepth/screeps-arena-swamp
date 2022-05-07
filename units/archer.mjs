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
import { flight_distance } from '../helpers/distance';

export class UArcher extends UGeneric {
    static act(archer) {
        var enemy_creeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);

        if (enemy_creeps.length > 0) {
            return UArcher.attack_nearest_enemy_creep(archer, enemy_creeps);
        }

        if (enemy_creeps.length == 0) {
            return UArcher.attack_enemy_hive(archer);
        }
    }

    static attack_nearest_enemy_creep(archer, enemy_creeps) {        
        // TODO probably want to prioritize by threat also
        var closest_enemy = findClosestByPath(archer, enemy_creeps);

        var attack_response = archer.rangedAttack(closest_enemy);
        if (attack_response == ERR_NOT_IN_RANGE)
            archer.moveTo(closest_enemy);

        UArcher.display_action_message_with_target_line(
            archer,
            archer.memory.role + ': Attacking enemy unit!',
            closest_enemy
        );
    }

    static attack_enemy_hive(archer) {
        var enemySpawn = getObjectsByPrototype(StructureSpawn).filter(structure => !structure.my)[0];
        var attack_response = archer.rangedAttack(enemySpawn);
        if (attack_response == ERR_NOT_IN_RANGE)
            archer.moveTo(enemySpawn);

        UArcher.display_action_message_with_target_line(
            archer,
            archer.memory.role + ': Attacking enemy hive!',
            enemySpawn
        );
    }
}