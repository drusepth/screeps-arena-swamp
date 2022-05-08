import { getObjectsByPrototype, getTicks } from '/game/utils';
import { Creep } from '/game/prototypes';

import { UDrone } from './units/drone';
import { UArcher } from './units/archer';
import { UFieldMedic } from './units/field_medic';
import { BHive }  from './buildings/hive';
import { Arena } from './room/arena';

import { SpawnManager } from './managers/spawn_manager';
import { UnitManager } from './managers/unit_manager';

import { filter_creeps_by_role } from './helpers/filters';
import { UNIT_TYPE_BODIES } from './units/data';
import { UGeneric } from './units/generic_unit';
import { ThreatManager } from './managers/threat_manager';

export function loop() {
    if (getTicks() == 1) {
        // Build whatever one-time tables/maps based on room we need
    }

    var my_creeps  = getObjectsByPrototype(Creep).filter(creep => creep.my);

    // Print reports
    ThreatManager.print_threat_report();
    
    // Queue building logic
    BHive.act(Arena.get_my_spawn());

    // Queue creep logic
    for (var role of Object.keys(UNIT_TYPE_BODIES)) {
        var creeps_of_this_role = filter_creeps_by_role(my_creeps, role);
        console.log(`${role} count: ${creeps_of_this_role.length} / ${SpawnManager.desired_number_of_role(role)}`);

        for (var creep of creeps_of_this_role)
            UnitManager.act(creep);
    }
}
