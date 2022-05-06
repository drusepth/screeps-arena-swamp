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

import { DroneLogic } from './units/drone';
import { BaseLogic }  from './buildings/base';

var UNIT_BODIES = {
    'drone':  [MOVE, MOVE, MOVE, CARRY, WORK, WORK],
    'archer': [MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK],
    'tank':   [MOVE, MOVE, MOVE, ATTACK, TOUGH, TOUGH]
};

export function loop() {    
    console.log(DroneLogic.test());
    console.log(DroneLogic.basetest());

    var mySpawn = getObjectsByPrototype(StructureSpawn).filter(structure => structure.my)[0];

    var myCreeps  = getObjectsByPrototype(Creep).filter(creep => creep.my);
    var myDrones  = myCreeps.filter(creep => creep.memory.role == 'drone');
    var myArchers = myCreeps.filter(creep => creep.memory.role == 'archer');

    var enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);

    console.log("Drone count: " + myDrones.length + "/" + desired_number_of_drones());
    console.log("Archer count: " + myArchers.length);

    // Queue role logic
    act_as_base(mySpawn);
    for (var drone  of myDrones)  { act_as_drone(drone); }
    for (var archer of myArchers) { act_as_archer(archer); }
}

function spawn_cost(body)
{
    if (body == undefined || body.length == 0) { return 0; }

    let sum = 0;
    for (var i = 0; i < body.length; i++)
        sum += BODYPART_COST[body[i]];

    return sum;
}

function desired_number_of_drones() {
    // Factors to consider: enemy threat count, enemy drone count, friendly threat count, total containers within N range?
    var drones_per_container = 0.3;

    return get_non_empty_containers().length * drones_per_container;
}

function desired_next_unit_spawn_role() {
    // TODO just build a map here of role => count keys/values
    var myCreeps  = getObjectsByPrototype(Creep).filter(creep => creep.my);
    var myDrones  = myCreeps.filter(creep => creep.memory.role == 'drone');
    var myArchers = myCreeps.filter(creep => creep.memory.role == 'archer');

    if (myDrones.length < desired_number_of_drones())
        return 'drone';
    else if (myArchers.length < 10)
        return 'archer';
}

function body_for_unit_role(role) {
    return UNIT_BODIES[role];
}

function next_unit_spawn_body() {
    return UNIT_BODIES[next_unit_role()];


    // Factor in: average distance to Containers, average move/work/carry of existing drones
    // var ranged_dude = mySpawn.spawnCreep([RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]);
    //return [MOVE, MOVE, MOVE, CARRY, WORK, WORK];
}

function secured_base_radius() {
    return 10;
}

function flight_distance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function act_as_base(spawn) {
    var next_unit_spawn_role = desired_next_unit_spawn_role();
    var next_unit_spawn_body = body_for_unit_role(next_unit_spawn_role);
    var next_unit_spawn_cost = spawn_cost(next_unit_spawn_body);
    var energy_available = spawn.store[RESOURCE_ENERGY];

    if (energy_available >= next_unit_spawn_cost) {
        var new_unit = spawn.spawnCreep(next_unit_spawn_body).object;
        if (new_unit)
            new_unit.memory = { role: next_unit_spawn_role };
    }

    if (!spawn.radialAreaVisual) { spawn.radialAreaVisual = new Visual(0, true); }
    spawn.radialAreaVisual.clear().circle(
        { x: spawn.x, y: spawn.y },
        {
            radius: secured_base_radius(),
            fill: '#00ff00',
            opacity: 0.25
        }
    ).text(
        "Next spawn: " + next_unit_spawn_role + ' @ ' + energy_available + "/" + next_unit_spawn_cost,
        { x: spawn.x, y: spawn.y - 0.5 }, // above the base
        {
            font: '0.5',
            opacity: 0.7,
            backgroundColor: '#808080',
            backgroundPadding: '0.03'
        }
    );
}

function get_non_empty_containers() {
    let containers = getObjectsByPrototype(StructureContainer).filter((structure) => {
        // Only look at non-owned containers that let us fill our full capacity from
        // return store.energy >= drone.store.getFreeCapacity(RESOURCE_ENERGY);

        // Only harvest from containers outside of our base
        //return flight_distance(structure.x, structure.y, mySpawn.x, mySpawn.y) > secured_base_radius();
        return structure.store[RESOURCE_ENERGY] > 0;
    });

    return containers;
}

function act_as_drone(drone) {
    var mySpawn = getObjectsByPrototype(StructureSpawn).filter(structure => structure.my)[0];
    var source = getObjectsByPrototype(Source)[0];
    
    // console.log("Drone free capacity = " + drone.store.getFreeCapacity(RESOURCE_ENERGY));
    // console.log("Drone total capacity = " + drone.store.getCapacity(RESOURCE_ENERGY));

    var closest_container = findClosestByPath(drone, get_non_empty_containers());
    
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

function act_as_archer(archer) {
    // TODO probably want to prioritize by threat also
    var enemyCreeps = getObjectsByPrototype(Creep).filter(creep => !creep.my);
    if (enemyCreeps.length > 0) {
        var closest_enemy = enemyCreeps[0];
        if (enemyCreeps.length > 1) {
            console.log(archer);
            var min_distance = archer.pos.getRangeTo(enemyCreeps[0]);
            for (var i = 1; i < enemyCreeps.length; i++) {
                var distance_to_enemy = archer.pos.getRangeTo(enemyCreeps[i]);
                    if (distance_to_enemy < min_distance) {
                    closest_enemy = enemyCreeps[i];
                }
            }
       }
       var attack_response = archer.rangedAttack(closest_enemy);
       if (attack_response == ERR_NOT_IN_RANGE)
           archer.moveTo(closest_enemy);
       return;
    }

    console.log('Attacking enemy spawn!');
    var enemySpawn = getObjectsByPrototype(StructureSpawn).filter(structure => !structure.my)[0];
    var attack_response = archer.rangedAttack(enemySpawn);
    if (attack_response == ERR_NOT_IN_RANGE)
        archer.moveTo(enemySpawn);
}