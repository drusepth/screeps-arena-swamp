import { findClosestByPath } from '/game/utils';
import { ERR_NOT_IN_RANGE, HEAL, CARRY, ATTACK, RANGED_ATTACK } from '/game/constants';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { EconomyManager } from '../managers/economy_manager';
import { BHive } from '../buildings/hive';
import { ThreatManager } from '../managers/threat_manager';
import { WarManager } from '../managers/war_manager.mjs';

export class UVulture extends UGeneric {
    static act(vulture) {
        // Vultures look for enemy workers that don't have any threats around them, then
        // hunt them down for the kill.

        // Before anything else, we want to run away from enemy threats that might hurt us!
        let nearby_enemy_threats = ThreatManager.enemy_threats_in_range(vulture, this.safety_zone());
        if (nearby_enemy_threats.length > 0)
            return UGeneric.flee_from_nearby_threats(vulture, nearby_enemy_threats);

        let enemy_workers = EconomyManager.get_enemy_workers();
        console.log("total enemy workers: " + enemy_workers.length);

        if (enemy_workers.length == 0) {
            // if there are no workers left to hunt, act like a standard melee war unit (TBD)
            console.log("No more workers to hunt - joining the standard army");
            return;
        }

        let unguarded_enemy_workers = WarManager.get_unguarded_enemy_workers(this.safety_zone());
        if (unguarded_enemy_workers.length > 0) {
            let closest_unguarded_enemy_worker = findClosestByPath(vulture, unguarded_enemy_workers);

            UVulture.display_action_message_with_target_line(
                vulture,
                vulture.memory.role + ': Hunting unguarded worker!',
                closest_unguarded_enemy_worker
            );

            UVulture.hunt(vulture, closest_unguarded_enemy_worker);

        } else {
            // No unguarded enemy workers to snipe; maybe act like an army splitter / taunter or something instead?

            // For now: just get closer to enemy workers without engaging
            let closest_guarded_enemy_worker = findClosestByPath(vulture, enemy_workers);
            vulture.moveTo(closest_guarded_enemy_worker, { range: 25 });

            UVulture.display_action_message_with_target_line(
                vulture,
                vulture.memory.role + ': Waiting for an unguarded worker',
                closest_guarded_enemy_worker
            );
        }
    }

    static hunt(vulture, victim) {
        let attack_response = vulture.attack(victim);
        if (attack_response == ERR_NOT_IN_RANGE)
            vulture.moveTo(victim, { swampCost: 2 });

        UVulture.display_action_message_with_target_line(
            vulture,
            vulture.memory.role + ': Attacking enemy worker!',
            victim
        );
    }

    static safety_zone() {
        return 8;
    }
}