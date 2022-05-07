import {
    getObjectsByPrototype, findClosestByPath
} from '/game/utils';
import { 
    Creep, Source, 
    Structure, StructureContainer, StructureSpawn
} from '/game/prototypes';
import { OK, ERR_NOT_IN_RANGE, ERR_INVALID_TARGET } from '/game/constants';
import { Visual } from '/game/visual';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { flight_distance } from '../helpers/distance';

export class UArcher extends UGeneric {
    static act(archer) {
        var enemy_creeps = Arena.get_enemy_creeps();
        var my_archers   = Arena.get_friendly_creeps_with_role('archer');

        if (my_archers.length > 4) {
            if (enemy_creeps.length > 0) {
                return UArcher.hunt_nearest_enemy_creep(archer, enemy_creeps);
            }

            if (enemy_creeps.length == 0) {
                return UArcher.attack_enemy_hive(archer);
            }
        } else {
            archer.moveTo(Arena.get_my_spawn());
            return UArcher.attack_all_enemy_creeps_in_range(archer);
        }
    }

    static attack_all_enemy_creeps_in_range(archer) {
        archer.rangedMassAttack();

        UArcher.display_action_message_with_target_line(
            archer,
            archer.memory.role + ': Holding our ground!',
            archer
        );
    }

    static hunt_nearest_enemy_creep(archer, enemy_creeps) {        
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
        var enemySpawn = Arena.get_enemy_spawn();
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