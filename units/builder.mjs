import { getObjectsByPrototype, createConstructionSite } from '/game/utils';
import { findClosestByPath } from '/game/utils';
import { RESOURCE_ENERGY, OK, ERR_NOT_IN_RANGE } from '/game/constants';
import { StructureRampart, StructureExtension, ConstructionSite } from '/game/prototypes';
import { searchPath } from 'game/path-finder';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { UDrone } from './drone';
import { BHive } from '../buildings/hive';
import { flight_distance } from '../helpers/distance';
import { ConstructionManager } from '../managers/construction_manager';
import { ThreatManager } from '../managers/threat_manager';

export class UBuilder extends UGeneric {
    static act(builder) {
        // Before anything else, we want to run away from enemy threats that might hurt us!
        let nearby_enemy_threats = ThreatManager.enemy_threats_in_range(builder, this.safety_zone());
        if (nearby_enemy_threats.length > 0)
            return UGeneric.flee_from_nearby_threats(builder, nearby_enemy_threats);

        let my_spawn        = Arena.get_my_spawn();
        let full_containers = Arena.get_mostly_full_containers_away_from(my_spawn, BHive.hive_radius());
        let my_useful_sites = ConstructionManager.get_my_construction_sites().filter((site) => {
            // We can't build on sites we're standing upon, so do a quick position check first
            switch (site.structure.constructor.name) {
                case 'StructureRampart':
                    // Ramparts are always useful
                    return true;

                case 'StructureExtension':
                    // Non-started extensions are only useful if there is a full-ish container still nearby,
                    // and our site would provide a drop-off point that is closer to it than spawn
                    if (site.progress >= 100) return true;

                    let closest_usable_container = findClosestByPath(site, full_containers);
                    let maximum_container_distance = flight_distance(my_spawn.x, my_spawn.y, closest_usable_container.x, closest_usable_container.y);
                    let distance_to_container = flight_distance(site.x, site.y, closest_usable_container.x, closest_usable_container.y);
                    return distance_to_container <= maximum_container_distance;

                default:
                    console.log("!!!!!! Unknown structure in construction site: " + site.structure.constructor.name);
                    return false;
            }
        });

        // Priority: continue existing construction sites (if still useful)
        if (my_useful_sites.length > 0) {
            let nearest_construction_site = findClosestByPath(builder, my_useful_sites);
            UBuilder.continue_construction(builder, nearest_construction_site);

            UBuilder.display_action_message_with_target_line(builder,
                builder.memory.role + ': Working on construction site',
                nearest_construction_site
            );

        } else {
            // If there are no existing construction sites, we should find something new to build.
            let new_site = ConstructionManager.create_next_construction_site();
            if (new_site) {
                builder.moveTo(new_site);

                UBuilder.display_action_message_with_target_line(builder,
                    builder.memory.role + ': Headed to new construction site',
                    builder
                );
            } else {
                // If we've made everything we dreamed of, just be a better drone
                UDrone.act(builder);
            }
        }
    }

    static continue_construction(builder, construction_site) {
        // Poor man's state machine
        if (builder.memory.gathering === undefined)
            builder.memory.gathering = true;
        if (builder.store.getUsedCapacity(RESOURCE_ENERGY) == 0)
            builder.memory.gathering = true;
        if (builder.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
            builder.memory.gathering = false

        // If we need to gather energy, just act like a drone :)
        if (builder.memory.gathering) {
            UDrone.acquire_energy(builder);

        } else {
            let build_result = builder.build(construction_site);
            if (build_result == ERR_NOT_IN_RANGE)
                builder.moveTo(construction_site);
            else
                console.log('site build result = ' + build_result);
        }

    }
}