import { getObjectsByPrototype } from '/game/utils';
import { Creep, StructureContainer, Structure} from '/game/prototypes';
import { Visual } from '/game/visual';

import { Arena } from '../room/arena';
import { filter_creeps_by_role } from '../helpers/filters';
import { UNIT_TYPE_BODIES, UNIT_BUILD_ORDER } from '../units/data';
import { WarManager } from './war_manager';
import { CostMatrix } from 'game/path-finder';
import { ThreatManager } from './threat_manager';
import { get_walkable_neighbor_tiles_around } from '../helpers/neighbors';

export let threat_avoidant_cost_matrix_visualizer;

export class TrafficManager {
    // A cost matrix that weights tiles near enemy attackers much higher so we stay away from them
    static threat_avoidant_cost_matrix() {
        let cost_matrix = new CostMatrix();
        let avoidant_tile_weight   = 150;
        let impassable_tile_weight = 255;

        let draw_visual = true;
        if (draw_visual) {
            threat_avoidant_cost_matrix_visualizer = new Visual(1, false);
            threat_avoidant_cost_matrix_visualizer.clear();
        }

        // Add all creeps as impassable tiles
        for (let creep of getObjectsByPrototype(Creep))
            cost_matrix.set(creep.x, creep.x, impassable_tile_weight);

        // Add all structures as impassable tiles
        for (let structure of getObjectsByPrototype(Structure))
            cost_matrix.set(structure.x, structure.x, impassable_tile_weight);

        // Add variable ranges around all enemy attackers
        let enemy_attackers = ThreatManager.get_enemy_attackers();
        for (let attacker of enemy_attackers) {
            let attack_range = ThreatManager.max_attack_range(attacker);
            let move_range = 1;
            let expected_aggro_range = 4;
            let safety_range = move_range + attack_range + expected_aggro_range;

            let tiles_near_attacker = get_walkable_neighbor_tiles_around(attacker.x, attacker.y, safety_range);

            for (let tile of tiles_near_attacker) {
                cost_matrix.set(tile.x, tile.y, avoidant_tile_weight);
            }

            if (draw_visual) {
                threat_avoidant_cost_matrix_visualizer.rect(
                    { x: attacker.x - (safety_range / 2), y: attacker.y - (safety_range / 2) },
                    safety_range,
                    safety_range,
                    { fill: '#ff0000', opacity: 0.1 }
                );
            }
        }

        return cost_matrix;
    }
}