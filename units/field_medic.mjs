import { findClosestByPath } from '/game/utils';
import { OK, ERR_NOT_IN_RANGE, ERR_INVALID_TARGET } from '/game/constants';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';

export class UFieldMedic extends UGeneric {
    static act(medic) {
        var current_task = "no task";
        var current_target = medic;

        var my_archers = Arena.get_friendly_creeps_with_role('archer');
        // TODO also heal other medics

        var my_wounded_archers = my_archers.filter(archer => archer.hits < archer.hitsMax);
        if (my_wounded_archers.length > 0) {
            var closest_wounded_archer = findClosestByPath(medic, my_wounded_archers);
            var heal_result = medic.heal(closest_wounded_archer);

            current_task = "Healing the wounded";
            current_target = closest_wounded_archer;

            if (heal_result == ERR_NOT_IN_RANGE)
                medic.moveTo(closest_wounded_archer);
        } else {
            if (my_archers.length > 0) {
                // Just pick a random archer (for now) and follow him; they all should converge anyway
                current_task = "Following an archer";
                current_target = my_archers[0];
                medic.moveTo(my_archers[0]);
            } else {
                // Go home!
                var my_spawn = Arena.get_my_spawn();
                current_task = "Headed home";
                current_target = my_spawn;
                medic.moveTo(my_spawn);
            }
        }

        UFieldMedic.display_action_message_with_target_line(medic,
            medic.memory.role + ': ' + current_task,
            current_target
        );
    }
}