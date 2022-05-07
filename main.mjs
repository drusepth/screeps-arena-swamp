import { getObjectsByPrototype } from '/game/utils';
import { Creep } from '/game/prototypes';

import { UDrone } from './units/drone';
import { UArcher } from './units/archer';
import { UFieldMedic } from './units/field_medic';
import { BHive }  from './buildings/hive';
import { Arena } from './room/arena';

import { SpawnManager } from './managers/spawn_manager.mjs';
import { filter_creeps_by_role } from './helpers/filters.mjs';

export function loop() {
    var my_creeps  = getObjectsByPrototype(Creep).filter(creep => creep.my);
    var my_drones  = filter_creeps_by_role(my_creeps, 'drone');
    var my_archers = filter_creeps_by_role(my_creeps, 'archer');
    var my_medics  = filter_creeps_by_role(my_creeps, 'field-medic');

    console.log(`Drone count: ${my_drones.length} / ${SpawnManager.desired_number_of_role('drone')}`);
    console.log(`Archer count: ${my_archers.length} / ${SpawnManager.desired_number_of_role('archer')}`);
    console.log(`Medic count: ${my_medics.length} / ${SpawnManager.desired_number_of_role('field-medic')}`);

    // Queue building logic
    BHive.act(Arena.get_my_spawn());

    // Queue creep logic
    for (var drone  of my_drones)  { UDrone.act(drone); }
    for (var archer of my_archers) { UArcher.act(archer); }
    for (var medic of my_medics)   { UFieldMedic.act(medic); }
}



