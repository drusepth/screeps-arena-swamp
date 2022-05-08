import { findClosestByPath, getTicks } from '/game/utils';
import { ERR_NOT_IN_RANGE, HEAL } from '/game/constants';

import { UGeneric } from './generic_unit';
import { Arena } from '../room/arena';
import { filter_creeps_by_body_part } from '../helpers/filters';
import { flight_distance } from '../helpers/distance';
import { WarManager } from '../managers/war_manager';

export class UArcher extends UGeneric {
    static act(archer) {
        let enemy_creeps = Arena.get_enemy_creeps();

        if (archer.memory.hits_last_tick === undefined)
            this.set_default_memory(archer);

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

        let spawn = Arena.get_my_spawn();
        let distance_to_spawn = flight_distance(archer.x, archer.y, spawn.x, spawn.y);            

        if (archer.hits < archer.hitsMax)
            archer.heal(archer);

        // While we're standing around and healing, fire arrows wildly
        this.attack_all_enemy_creeps_in_range(archer);

        // If we're NEAR spawn, then just loosely circle around it
        if (distance_to_spawn < 10) {
            archer.moveTo(spawn, { range: 5, flee: true });

        // If we're further out from spawn, either move back towards it or collapse on a leader
        } else {
            let captain = Arena.get_friendly_creeps_with_role('archer')[0];
            if (archer.hits < archer.hitsMax || archer.x == captain.x && archer.y == captain.y)
                archer.moveTo(spawn, { range: 10 });
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

    static hunt_nearest_enemy_creep(archer, enemy_creeps) {
        let enemy_spawn = Arena.get_enemy_spawn();

        // If there's a medic nearby, prioritize that!
        let enemy_medics_nearby = filter_creeps_by_body_part(enemy_creeps, HEAL).filter(
            medic => flight_distance(archer.x, archer.y, medic.x, medic.y) < 6
        );

        let closest_target;
        if (enemy_medics_nearby.length > 0) {
            console.log("Enemy medic is nearby!");
            closest_target = findClosestByPath(archer, enemy_medics_nearby);

        } else {
            // If there are no enemy medics nearby, then just prioritize the closest enemy/spawn
            closest_target = findClosestByPath(archer, enemy_creeps.concat(enemy_spawn));
        }

        let attack_response = archer.rangedAttack(closest_target);

        // Ranged attacks and healing are in separate action pipelines and can be stacked in a tick
        if (archer.hits < archer.hitsMax)
            archer.heal(archer);

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