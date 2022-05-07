import { Arena } from '../room/arena';
import { filter_creeps_by_role } from '../helpers/filters';

export class SpawnManager {
    static desired_next_unit_spawn_role() {
        // TODO just build a map here of role => count keys/values
        var my_creeps       = Arena.get_my_creeps();
        var my_drones       = filter_creeps_by_role(my_creeps, 'drone');
        var my_archers      = filter_creeps_by_role(my_creeps, 'archer');
        var my_field_medics = filter_creeps_by_role(my_creeps, 'field-medic');

        // Factor in: average distance to Containers, average move/work/carry of existing drones

        if (my_drones.length < SpawnManager.desired_number_of_role('drone'))
            return 'drone';
        else if (my_field_medics.length < SpawnManager.desired_number_of_role('field-medic'))
            return 'field-medic';
        else if (my_archers.length < SpawnManager.desired_number_of_role('archer'))
            return 'archer';
    }

    static desired_number_of_role(role) {
        switch(role) {
            case 'drone':
                var drones_per_container = 0.3;
                return Arena.get_non_empty_containers().length * drones_per_container;

            case 'field-medic':
                var field_medics_per_archer = 3;
                var my_archers = Arena.get_friendly_creeps_with_role('archer');
                return my_archers.length / field_medics_per_archer;

            case 'archer':
                return 10;
        }
    }
}