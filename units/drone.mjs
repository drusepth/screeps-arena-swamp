import { findClosestByPath } from '/game/utils';
import { RESOURCE_ENERGY, OK, ERR_NOT_IN_RANGE } from '/game/constants';
import { searchPath } from 'game/path-finder';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { ThreatManager } from '../managers/threat_manager';
import { TrafficManager } from '../managers/traffic_manager';

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
        let current_task = 'no task';
        let current_target = drone;

        let closest_container = findClosestByPath(drone, Arena.get_non_empty_containers());
        let harvest_result = drone.withdraw(closest_container, RESOURCE_ENERGY);
        switch (harvest_result) {
            case OK:
                current_task = 'Harvesting from container';
                current_target = closest_container;
                break;

            case ERR_NOT_IN_RANGE:
                current_task = 'Moving to closest container';
                current_target = closest_container;
                
                let cost_matrix = TrafficManager.threat_avoidant_cost_matrix();
                let route = searchPath(drone, closest_container, 
                    { swampCost: 2, costMatrix: cost_matrix }
                );
                drone.moveTo(route.path[0]);

                break;

            default:
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                console.log('Unknown error while ' + drone.id + ' harvesting: ' + harvest_result);
        }

        UDrone.display_action_message_with_target_line(
            drone,
            drone.memory.role + ': ' + current_task,
            current_target
        );
    }

    static return_energy(drone) {
        let my_spawn      = Arena.get_my_spawn();
        let my_extensions = Arena.get_my_extensions();
        let current_task = 'no task';

        let non_full_dropoffs = my_extensions.concat(my_spawn).filter((dropoff) => {
            let capacity = (dropoff.constructor.name == 'StructureSpawn') ? 1000 : 100;
            return dropoff.store[RESOURCE_ENERGY] < capacity; 
        });

        if (non_full_dropoffs.length > 0) {
            let nearest_dropoff = findClosestByPath(drone, non_full_dropoffs);
            if (drone.transfer(nearest_dropoff, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                current_task = 'Returning to ' + nearest_dropoff.constructor.name;
                
                let cost_matrix = TrafficManager.threat_avoidant_cost_matrix();
                let route = searchPath(drone, nearest_dropoff, 
                    { swampCost: 2, costMatrix: cost_matrix }
                );
                drone.moveTo(route.path[0]);
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