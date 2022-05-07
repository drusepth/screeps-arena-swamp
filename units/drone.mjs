import {
    getObjectsByPrototype, findClosestByPath
} from '/game/utils';
import { 
    Creep, Source, 
    Structure, StructureContainer, StructureSpawn
} from '/game/prototypes';
import {
    MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH, BODYPART_COST,
    RESOURCE_ENERGY,
    OK, ERR_NOT_IN_RANGE, ERR_INVALID_TARGET
} from '/game/constants';
import { Visual } from '/game/visual';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';

export class UDrone extends UGeneric {
    static act(drone) {
        var mySpawn = getObjectsByPrototype(StructureSpawn).filter(structure => structure.my)[0];
        var source = getObjectsByPrototype(Source)[0];
        
        // console.log("Drone free capacity = " + drone.store.getFreeCapacity(RESOURCE_ENERGY));
        // console.log("Drone total capacity = " + drone.store.getCapacity(RESOURCE_ENERGY));
    
        var closest_container = findClosestByPath(drone, Arena.get_non_empty_containers());
        
        var current_task = 'no task';
        var current_target = drone;
        if (drone.store.getFreeCapacity(RESOURCE_ENERGY)) {
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
        } else {
            if (drone.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                current_task = 'Returning to spawn';
                drone.moveTo(mySpawn);
            } else {
                current_task = 'Unloading energy to spawn';
            }
        }
        
        if (!drone.taskDescriptionVisual) { drone.taskDescriptionVisual = new Visual(1, true); }
        drone.taskDescriptionVisual.clear().text(
            drone.memory.role + ': ' + current_task,
            { x: drone.x, y: drone.y - 0.5 }, // above the creep
            {
                font: '0.5',
                opacity: 0.7,
                backgroundColor: '#808080',
                backgroundPadding: '0.03'
            }
        ).line(
            { x: drone.x, y: drone.y },
            { x: current_target.x, y: current_target.y },
            { color: '#0000ff', lineStyle: 'dotted', opacity: 0.75 }
        );
    }
}