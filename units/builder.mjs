import { getObjectsByPrototype, createConstructionSite } from '/game/utils';
import { findClosestByPath } from '/game/utils';
import { RESOURCE_ENERGY, OK, ERR_NOT_IN_RANGE } from '/game/constants';
import { StructureRampart, ConstructionSite } from '/game/prototypes';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { UDrone } from './drone.mjs';

export class UBuilder extends UGeneric {
    static act(builder) {
        var my_spawn = Arena.get_my_spawn();
        var my_ramparts = getObjectsByPrototype(StructureRampart).filter(structure => structure.my);

        if (builder.store.getFreeCapacity(RESOURCE_ENERGY)) {
            // If we need to harvest energy (before building), act like a drone
            return UDrone.act(builder);
        }

        // Once we have the energy to build, start building!
        if (my_ramparts.length == 0) {
            var construction_sites =  getObjectsByPrototype(ConstructionSite).filter(i => i.my);
            var rampart_site;
            if (construction_sites.length == 0) {
                rampart_site = createConstructionSite({x: my_spawn.x, y: my_spawn.y}, StructureRampart);
            } else {
                rampart_site = construction_sites[0]; // todo filter by rampart
            }

            var build_result = builder.build(rampart_site);
            if (build_result == ERR_NOT_IN_RANGE) {
                builder.moveTo(my_spawn);
            }
            console.log('build result = ' + build_result);
        }

        // let myConstructionSites = getObjectsByPrototype(ConstructionSite).filter(i => i.my);
        // let target = creep.findClosestByRange(myConstructionSites);
        // if (target) {
        //     if (creep.build(target) == ERR_NOT_IN_RANGE) {
        //         creep.move(target);
        //     }
        // }

        // build rampart on spawner

        // build structure extensions around containers
    }
}