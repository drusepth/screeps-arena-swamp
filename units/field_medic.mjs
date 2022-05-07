import { findClosestByPath } from '/game/utils';
import { OK, ERR_NOT_IN_RANGE, ERR_INVALID_TARGET } from '/game/constants';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { filter_creeps_by_role, filter_creeps_by_roles } from '../helpers/filters.mjs';

export class UFieldMedic extends UGeneric {
    static act(medic) {
        var current_task = "no task";
        var current_target = medic;

        var my_army_units = Arena.get_friendly_creeps_with_roles(['archer', 'field-medic']);

        var my_wounded_army_units = my_army_units.filter(unit => unit.hits < unit.hitsMax);
        if (my_wounded_army_units.length > 0) {
            var closest_wounded_army_unit = findClosestByPath(medic, my_wounded_army_units);
            var heal_result = medic.heal(closest_wounded_army_unit);

            current_task = "Healing the wounded";
            current_target = closest_wounded_army_unit;

            if (heal_result == ERR_NOT_IN_RANGE) {
                medic.heal(medic);
                medic.moveTo(closest_wounded_army_unit);
            }
        } else {
            if (my_army_units.length > 0) {
                // Just pick a random archer (for now) and follow him; they all should converge anyway
                current_task = "Following an army unit";
                current_target = my_army_units[0];
                var first_archer = filter_creeps_by_role(my_army_units, 'archer');
                medic.heal(medic);
                medic.moveTo(first_archer[0]);
            } else {
                // Go home!
                var my_spawn = Arena.get_my_spawn();
                current_task = "Headed home";
                current_target = my_spawn;
                medic.heal(medic);
                medic.moveTo(my_spawn);
            }
        }

        UFieldMedic.display_action_message_with_target_line(medic,
            medic.memory.role + ': ' + current_task,
            current_target
        );
    }
}