import { Arena } from '../room/arena';
import { filter_creeps_by_role } from '../helpers/filters';
import { UNIT_TYPE_BODIES, UNIT_BUILD_ORDER } from '../units/data.mjs';
import { WarManager } from './war_manager.mjs';
import { UVulture } from '../units/vulture.mjs';

export class SpawnManager {
    static desired_next_unit_spawn_role() {
        let my_creeps = Arena.get_my_creeps();
        let role_counts = {};
        for (let role of Object.keys(UNIT_TYPE_BODIES)) {
            let creeps_of_this_role = filter_creeps_by_role(my_creeps, role);
            role_counts[role] = creeps_of_this_role.length;
        }

        // Always require at least 1 drone!
        if (role_counts['drone'] == 0) { return 'drone'; }

        for (let role of UNIT_BUILD_ORDER)
            if (role_counts[role] < SpawnManager.desired_number_of_role(role))
                return role;
    }

    static desired_number_of_role(role) {
        switch(role) {
            case 'drone':
                // Factor in: average distance to Containers, average move/work/carry of existing drones
                let drones_per_container = 0.3;
                return Arena.get_non_empty_containers().length * drones_per_container;

            case 'big-drone':
                return 0;

            case 'field-medic':
                let field_medics_per_archer = 3;
                let my_archers = Arena.get_friendly_creeps_with_role('archer');
                return my_archers.length / field_medics_per_archer;

            case 'archer':
                return 10;

            case 'vulture':
                // Always have 1 vulture, then scale additional vultures off how many unguarded workers the opponent spawns
                let max_vultures = 3;
                let desired_vultures = 1 + (WarManager.get_unguarded_enemy_workers(UVulture.safety_zone()).length * 0.34);
                return Math.min(desired_vultures, max_vultures);

            case 'builder':
                // After we've built at least 1 extension, don't bother replenishing dead builders
                return 1 - Arena.get_my_extensions().length;
        }
    }
}