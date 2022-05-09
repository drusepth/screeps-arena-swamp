import { findClosestByPath, getTicks } from '/game/utils';
import { ERR_NOT_IN_RANGE, HEAL } from '/game/constants';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { filter_creeps_by_body_part } from '../helpers/filters';
import { flight_distance } from '../helpers/distance';
import { WarManager } from '../managers/war_manager';
import { BHive } from '../buildings/hive';
import { ThreatManager } from '../managers/threat_manager';

export class UArcher extends UGeneric {
    static act(archer) {
        if (archer.memory.hits_last_tick === undefined)
            this.set_default_memory(archer);

        let enemy_creeps = Arena.get_enemy_creeps();

        // Health minimum before running away
        let fear_health_threshold = 0.5;

        // If we were hit last tick, take a turn and fall back to spawn/reinforcements
        let fall_back = archer.memory.fear_ticks > 0 || archer.hits < archer.memory.hits_last_tick;
        archer.memory.hits_last_tick = archer.hits;
        archer.memory.fear_ticks--;

        // If we've already healed back up, shed the fear immediately
        if (archer.hits > archer.hitsMax * fear_health_threshold)
            fall_back = false;

        // If we don't have a sufficient army to attack, don't
        if (getTicks() < WarManager.full_army_tick_timing())
            return UArcher.avoid_engagements(archer);

        if (fall_back && archer.hits < archer.hitsMax * fear_health_threshold) {
            let ticks_to_fully_heal = 2; // todo
            archer.memory.fear_ticks = ticks_to_fully_heal;

            let nearby_threats = ThreatManager.enemy_threats_in_range(archer, this.safety_zone());
            if (nearby_threats.length > 0)
                return UGeneric.flee_from_nearby_threats(archer, nearby_threats);
            else
                return UArcher.avoid_engagements(archer);
        }

        if (enemy_creeps.length == 0) {
            return UArcher.attack_enemy_hive(archer);
        }

        if (WarManager.predicted_victory() && archer.hits >= archer.hitsMax / 2) {
            UArcher.hunt_nearest_enemy_creep(archer, enemy_creeps);
        } else {
            UArcher.avoid_engagements(archer);
        }
    }

    static set_default_memory(archer) {
        archer.memory.hits_last_tick = archer.hits;
        archer.memory.fear_ticks     = 0;
    }

    static avoid_engagements(archer) {
        // TODO: we probably actually want to act more like a Vulture here
        // and take worker pickoffs wherever we can without engaging actual army units
        // -- need to figure out how to group archers up first if they're gonna spread tho  

        let spawn = Arena.get_my_spawn();
        let distance_to_spawn = flight_distance(archer.x, archer.y, spawn.x, spawn.y);

        // Quick check here: if we're at base and there are threats nearby, we just have to engage
        if (distance_to_spawn <= BHive.hive_radius()) {
            let threats_in_base = ThreatManager.enemy_threats_in_range(spawn, BHive.hive_radius() + 3);
            console.log('idling in base; threats in base: ' + threats_in_base.length);
            if (threats_in_base.length > 0)
                return UArcher.hunt_nearest_enemy_creep(archer, threats_in_base);
        }          

        if (archer.hits < archer.hitsMax)
            archer.heal(archer);

        // While we're standing around and healing, fire arrows wildly
        this.attack_all_enemy_creeps_in_range(archer);

        // If we're NEAR spawn, then just loosely circle around it
        if (distance_to_spawn < 10) {
            archer.moveTo(spawn, { range: 3, flee: true });

        // If we're further out from spawn, either move back towards it or collapse on a leader
        } else {
            let captain = Arena.get_friendly_creeps_with_role('archer')[0];
            if (archer.hits < archer.hitsMax || archer.x == captain.x && archer.y == captain.y)
                archer.moveTo(spawn, { range: 4 });
            else
                archer.moveTo(captain);
        }

        UArcher.display_action_message_with_target_line(
            archer,
            archer.memory.role + ': Avoiding engagements!',
            spawn
        );
    }

    static attack_all_enemy_creeps_in_range(archer) {
        let attack_result = archer.rangedMassAttack();
        if (attack_result == ERR_NOT_IN_RANGE)
            if (archer.hits < archer.hitsMax)
                archer.heal(archer);

        UArcher.display_action_message_with_target_line(
            archer,
            archer.memory.role + ': Holding our ground!',
            archer
        );
    }

    static hunt_near_highest_value_enemy_creep(archer, enemy_creeps) {
        // TODO
    }

    static hunt_nearest_enemy_creep(archer, enemy_creeps) {
        let enemy_spawn = Arena.get_enemy_spawn();

        // If there's a medic nearby, prioritize that!
        let enemy_medics_nearby = filter_creeps_by_body_part(enemy_creeps, HEAL).filter(
            medic => flight_distance(archer.x, archer.y, medic.x, medic.y) < 6
        );

        let closest_target;
        if (enemy_medics_nearby.length > 0) {
            closest_target = findClosestByPath(archer, enemy_medics_nearby);

        } else {
            // If there are no enemy medics nearby, then just prioritize the closest enemy/spawn
            closest_target = findClosestByPath(archer, enemy_creeps);
        }

        // If the enemy spawn is even closer than our closest target... hit it instead!
        let distance_to_closest_enemy = flight_distance(archer.x, archer.y, closest_target.x, closest_target.y);
        let distance_to_enemy_spawn   = flight_distance(archer.x, archer.y, enemy_spawn.x, enemy_spawn.y);
        if (distance_to_enemy_spawn <= distance_to_closest_enemy)
            closest_target = enemy_spawn;

        // Ranged attacks and healing are in separate action pipelines and can be stacked in a tick
        if (archer.hits < archer.hitsMax)
            archer.heal(archer);

        let attack_response = archer.rangedAttack(closest_target);
        if (attack_response == ERR_NOT_IN_RANGE) {
            archer.rangedMassAttack();
            archer.moveTo(closest_target);
        }

        UArcher.display_action_message_with_target_line(
            archer,
            archer.memory.role + ': Attacking enemy unit!',
            closest_target
        );        
    }

    static attack_enemy_hive(archer) {
        let enemySpawn = Arena.get_enemy_spawn();
        let attack_response = archer.rangedAttack(enemySpawn);

        if (archer.hits < archer.hitsMax)
            archer.heal(archer);

        if (attack_response == ERR_NOT_IN_RANGE) {
            archer.rangedMassAttack();
            archer.moveTo(enemySpawn);
        }

        UArcher.display_action_message_with_target_line(
            archer,
            archer.memory.role + ': Attacking enemy hive!',
            enemySpawn
        );
    }
}