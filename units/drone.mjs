import { findClosestByPath } from '/game/utils';
import { RESOURCE_ENERGY, OK, ERR_NOT_IN_RANGE } from '/game/constants';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';

export class UDrone extends UGeneric {
    static act(drone) {
        if (drone.store.getFreeCapacity(RESOURCE_ENERGY)) {
            UDrone.acquire_energy(drone);
        } else {
            UDrone.return_energy(drone);
        }
    }

    static acquire_energy(drone) {
        var current_task = 'no task';
        var current_target = drone;

        var closest_container = findClosestByPath(drone, Arena.get_non_empty_containers());
        var harvest_result = drone.withdraw(closest_container, RESOURCE_ENERGY);
        switch (harvest_result) {
            case OK:
                current_task = 'Harvesting from container';
                current_target = closest_container;
                break;

            case ERR_NOT_IN_RANGE:
                current_task = 'Moving to closest container';
                current_target = closest_container;
                drone.moveTo(closest_container);
                break;

            default:
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.log('Unknown error while harvesting: ' + harvest_result);
        }

        UDrone.display_action_message_with_target_line(
            drone,
            drone.memory.role + ': ' + current_task,
            current_target
        );
    }

    static return_energy(drone) {
        var my_spawn = Arena.get_my_spawn();
        var current_task = 'no task';
        var current_target = my_spawn;
        
        if (drone.transfer(my_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            current_task = 'Returning to spawn';
            drone.moveTo(my_spawn);
        } else {
            current_task = 'Unloading energy to spawn';
        }

        UDrone.display_action_message_with_target_line(
            drone,
            drone.memory.role + ': ' + current_task,
            current_target
        );
    }
}