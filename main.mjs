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

import { UDrone } from './units/drone';
import { UArcher } from './units/archer';
import { BHive }  from './buildings/hive';
import { Arena } from './room/arena';

import { UNIT_TYPE_BODIES } from './units/data.mjs';

export function loop() {    
    var mySpawn = getObjectsByPrototype(StructureSpawn).filter(structure => structure.my)[0];

    var myCreeps  = getObjectsByPrototype(Creep).filter(creep => creep.my);
    var myDrones  = myCreeps.filter(creep => creep.memory.role == 'drone');
    var myArchers = myCreeps.filter(creep => creep.memory.role == 'archer');

    var enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);

    console.log("Drone count: " + myDrones.length + "/" + BHive.desired_number_of_drones());
    console.log("Archer count: " + myArchers.length);

    // Queue building logic
    BHive.act(mySpawn);

    // Queue creep logic
    for (var drone  of myDrones)  { UDrone.act(drone); }
    for (var archer of myArchers) { UArcher.act(archer); }
}



