import { findClosestByPath } from '/game/utils';
import { ERR_NOT_IN_RANGE, HEAL, CARRY } from '/game/constants';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { filter_creeps_by_body_part } from '../helpers/filters.mjs';

export class UVulture extends UGeneric {
    static act(vulture) {
        if (vulture.hits >= vulture.hitsMax / 5) {
            var enemy_creeps = Arena.get_enemy_creeps();
            var enemy_workers = filter_creeps_by_body_part(enemy_creeps, CARRY);
            var nearest_enemy_worker = findClosestByPath(vulture, enemy_workers);
            var attack_response = vulture.attack(nearest_enemy_worker);
            if (attack_response == ERR_NOT_IN_RANGE)
                vulture.moveTo(nearest_enemy_worker);

            UVulture.display_action_message_with_target_line(
                vulture,
                vulture.memory.role + ': Attacking enemy worker!',
                nearest_enemy_worker
            );
        } else {
            var friendly_medics = Arena.get_friendly_creeps_with_role('field-medic');
            var nearest_medic = findClosestByPath(vulture, friendly_medics);
            vulture.moveTo(nearest_medic);

            UVulture.display_action_message_with_target_line(
                vulture,
                vulture.memory.role + ': Running to a medic!',
                nearest_medic
            );
        }
    }
}