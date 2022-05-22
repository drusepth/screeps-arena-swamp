import { findClosestByPath } from '/game/utils';
import { RESOURCE_ENERGY, OK, ERR_NOT_IN_RANGE } from '/game/constants';
import { searchPath } from 'game/path-finder';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { ThreatManager } from '../managers/threat_manager';
import { TrafficManager } from '../managers/traffic_manager';
import { flight_distance } from '../helpers/distance.mjs';

export class UDrone extends UGeneric {
    static act(drone) {
        // Before anything else, we want to run away from enemy threats that might hurt us!
        let nearby_enemy_threats = ThreatManager.enemy_threats_in_range(drone, this.safety_zone());
        if (nearby_enemy_threats.length > 0)
            return UGeneric.flee_from_nearby_threats(drone, nearby_enemy_threats);

        if (drone.store.getFreeCapacity(RESOURCE_ENERGY)) {
            UDrone.acquire_energy(drone);
        } else {
            // If we're next to a spawn, always return to it instead of dropping anything
            let my_spawn = Arena.get_my_spawn();
            let distance_to_spawn = flight_distance(drone.x, drone.y, my_spawn.x, my_spawn.y);
            if (distance_to_spawn < 5) {
                return UDrone.return_energy(drone);
            }

            // If we're next to a harvestable but not spawn, then go ahead and drop what we have and keep harvesting
            let closest_harvestable = findClosestByPath(drone, Arena.get_non_empty_containers());
            if (flight_distance(drone.x, drone.y, closest_harvestable.x, closest_harvestable.y) < 3) {
                // If we're near a container, just keep mining and dropping to exhaust it
                drone.drop(RESOURCE_ENERGY);
            } else {
                // If there isn't anything immediately nearby to keep harvesting, return the energy we have
                UDrone.return_energy(drone);
            }
        }
    }

    static acquire_energy(drone) {
        let current_task = 'no task';
        let current_target = drone;

        // Find nearest harvestable to use
        let closest_harvestable = findClosestByPath(drone, Arena.get_non_empty_containers());
        let distance_to_closest_container = flight_distance(drone.x, drone.y, closest_harvestable.x, closest_harvestable.y);

        // We always want to prioritize harvesting from containers first, but if the closest container
        // is more than 3 tiles away, we can consider harvesting from Resource piles instead
        if (distance_to_closest_container > 3) {
            let nearby_resources = Arena.get_resource_piles(RESOURCE_ENERGY);
            if (nearby_resources.length > 0) {
                let closest_resource = findClosestByPath(drone, nearby_resources);
                let distance_to_closest_resource = flight_distance(drone.x, drone.y, closest_resource.x, closest_resource.y);
                
                // Retarget to resource pile instead if it's closer
                if (distance_to_closest_resource < distance_to_closest_container) {
                    closest_harvestable = closest_resource;
                }
            }
        }

        let harvest_result;
        switch (closest_harvestable.constructor.name) {
            case 'StructureContainer':
                harvest_result = drone.withdraw(closest_harvestable, RESOURCE_ENERGY);
                break;

            case 'Resource':
                harvest_result = drone.pickup(closest_harvestable);
                break;

            default:
                console.log("Trying to harvest unhandled type: " + closest_harvestable.constructor.name);
                break;
        }

        switch (harvest_result) {
            case OK:
                current_task = 'Harvesting from ' + closest_harvestable.constructor.name;
                current_target = closest_harvestable;
                break;

            case ERR_NOT_IN_RANGE:
                current_task = 'Moving to closest ' + closest_harvestable.constructor.name;
                current_target = closest_harvestable;
                
                let cost_matrix = TrafficManager.threat_avoidant_cost_matrix();
                let route = searchPath(drone, closest_harvestable, 
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