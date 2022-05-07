import { Arena } from '../room/arena';
import { filter_creeps_by_role } from '../helpers/filters';
import { UNIT_TYPE_BODIES, UNIT_BUILD_ORDER } from '../units/data.mjs';

export class SpawnManager {
    static desired_next_unit_spawn_role() {
        var my_creeps = Arena.get_my_creeps();
        var role_counts = {};
        for (var role of Object.keys(UNIT_TYPE_BODIES)) {
            var creeps_of_this_role = filter_creeps_by_role(my_creeps, role);
            role_counts[role] = creeps_of_this_role.length;
        }

        // Always require at least 1 drone!
        if (role_counts['drone'] == 0) { return 'drone'; }

        for (var role of UNIT_BUILD_ORDER)
            if (role_counts[role] < SpawnManager.desired_number_of_role(role))
                return role;
    }

    static desired_number_of_role(role) {
        switch(role) {
            case 'drone':
                // Factor in: average distance to Containers, average move/work/carry of existing drones
                var drones_per_container = 0.3;
                return Arena.get_non_empty_containers().length * drones_per_container;

            case 'field-medic':
                var field_medics_per_archer = 3;
                var my_archers = Arena.get_friendly_creeps_with_role('archer');
                return my_archers.length / field_medics_per_archer;

            case 'archer':
                return 10;

            case 'vulture':
                return 0;

            case 'builder':
                return 1;
        }
    }
}