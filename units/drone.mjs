import { findClosestByPath } from '/game/utils';
import { RESOURCE_ENERGY, OK, ERR_NOT_IN_RANGE } from '/game/constants';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { ThreatManager } from '../managers/threat_manager';

export class UDrone extends UGeneric {
    static act(drone) {
        // Before anything else, we want to run away from enemy threats that might hurt us!
        let nearby_enemy_threats = ThreatManager.enemy_threats_in_range(drone, this.safety_zone());
        if (nearby_enemy_threats.length > 0)
            return UGeneric.flee_from_nearby_threats(drone, nearby_enemy_threats);

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
        var my_spawn      = Arena.get_my_spawn();
        var my_extensions = Arena.get_my_extensions();
        var current_task = 'no task';

        var non_full_dropoffs = my_extensions.concat(my_spawn).filter((dropoff) => {
            var capacity = (dropoff.constructor.name == 'StructureSpawn') ? 1000 : 100;
            return dropoff.store[RESOURCE_ENERGY] < capacity; 
        });

        if (non_full_dropoffs.length > 0) {
            var nearest_dropoff = findClosestByPath(drone, non_full_dropoffs);
            if (drone.transfer(nearest_dropoff, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                current_task = 'Returning to ' + nearest_dropoff.constructor.name;
                drone.moveTo(nearest_dropoff);
            } else {
                current_task = 'Unloading energy to ' + nearest_dropoff.constructor.name;
            }
    
            UDrone.display_action_message_with_target_line(
                drone,
                drone.memory.role + ': ' + current_task,
                nearest_dropoff
            );
        } else {
            // Everything is full! Maybe make drones run around as distractions or something?
            console.log('All storage is full!');
        }
    }
}