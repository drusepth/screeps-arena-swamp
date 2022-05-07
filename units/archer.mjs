import { findClosestByPath } from '/game/utils';
import { ERR_NOT_IN_RANGE, HEAL } from '/game/constants';
import { getTicks } from 'game';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { filter_creeps_by_body_part } from '../helpers/filters.mjs';
import { flight_distance } from '../helpers/distance.mjs';

export class UArcher extends UGeneric {
    static act(archer) {
        var enemy_creeps = Arena.get_enemy_creeps();
        var my_archers   = Arena.get_friendly_creeps_with_role('archer');

        if (archer.memory.hitsLastTick === undefined) {
            archer.memory.hitsLastTick = archer.hits;
        } else {
            // If we were hit last tick, take a turn and fall back to spawn/reinforcements
            var fall_back = archer.memory.hits < archer.memory.hitsLastTick;
            archer.memory.hitsLastTick = archer.hits;

            if (fall_back)
                return archer.moveTo(Arena.get_my_spawn());
        }

        if (enemy_creeps.length == 0) {
            return UArcher.attack_enemy_hive(archer);
        }

        if ((my_archers.length >= 4 || getTicks() > 500) && archer.hits >= archer.hitsMax / 2) {
            return UArcher.hunt_nearest_enemy_creep(archer, enemy_creeps);
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
        // If there's a medic nearby, prioritize that!
        var enemy_medics_nearby = filter_creeps_by_body_part(enemy_creeps, HEAL).filter(
            medic => flight_distance(archer.x, archer.y, medic.x, medic.y) < 6
        );

        var closest_target;
        if (enemy_medics_nearby.length > 0) {
            console.log("Enemy medic is nearby!");
            closest_target = findClosestByPath(archer, enemy_medics_nearby);

        } else {
            // If there are no enemy medics nearby, then just prioritize the closest enemy
            closest_target = findClosestByPath(archer, enemy_creeps);
        }

        var attack_response = archer.rangedAttack(closest_target);
        if (attack_response == ERR_NOT_IN_RANGE)
            archer.moveTo(closest_target);

        UArcher.display_action_message_with_target_line(
            archer,
            archer.memory.role + ': Attacking enemy unit!',
            closest_target
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