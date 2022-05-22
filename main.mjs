import { getObjectsByPrototype, getTicks } from '/game/utils';
import { Creep } from '/game/prototypes';

import { UDrone } from './core/units/drone';
import { UArcher } from './core/units/archer';
import { UFieldMedic } from './core/units/field_medic';
import { BHive }  from './core/buildings/hive';
import { Arena } from './core/room/arena';

import { SpawnManager } from './core/managers/spawn_manager';
import { UnitManager } from './core/managers/unit_manager';

import { filter_creeps_by_role } from './core/helpers/filters';
import { UNIT_TYPE_BODIES } from './core/units/data';
import { UGeneric } from './core/units/generic_unit';
import { ThreatManager } from './core/managers/threat_manager';
import { TrafficManager } from './core/managers/traffic_manager';

export function loop() {
    if (getTicks() == 1) {
        // Build whatever one-time tables/maps based on room we need
    }

    let my_creeps  = getObjectsByPrototype(Creep).filter(creep => creep.my);

    // Print reports
    ThreatManager.print_threat_report();

    // Queue building logic
    BHive.act(Arena.get_my_spawn());

    // Queue creep logic
    for (let role of Object.keys(UNIT_TYPE_BODIES)) {
        let creeps_of_this_role = filter_creeps_by_role(my_creeps, role);
        console.log(`${role} count: ${creeps_of_this_role.length} / ${SpawnManager.desired_number_of_role(role)}`);

        for (let creep of creeps_of_this_role)
            UnitManager.act(creep);
    }
}
