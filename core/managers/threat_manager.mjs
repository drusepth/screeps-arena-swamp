import { ATTACK, RANGED_ATTACK, WORK, MOVE, TOUGH, CARRY, HEAL } from '/game/constants';
import { Arena } from '../room/arena';
import { flight_distance } from '../helpers/distance.mjs';

export class ThreatManager {
    static print_threat_report() {
        console.log([
            "Threat report:",
            `Friendly: ${ThreatManager.get_my_attackers().length} (${ThreatManager.get_my_threat_score()})`,
            `Enemy:    ${ThreatManager.get_enemy_attackers().length} (${ThreatManager.get_enemy_threat_score()})`,
        ].join("\n"));
    }

    static enemy_threats_in_range(origin, range) {
        let enemy_attackers = ThreatManager.get_enemy_attackers();
        let enemies_in_range = [];

        for (let enemy of enemy_attackers) {
            // IMPROVE: we should switch to a path distance
            if (flight_distance(enemy.x, enemy.y, origin.x, origin.y) <= range)
                enemies_in_range.push(enemy);
        }

        return enemies_in_range;
    }

    static get_enemy_attackers() {
        return Arena.get_enemy_creeps_with_body_parts(ThreatManager.attacker_body_parts());
    }

    static get_my_attackers() {
        return Arena.get_my_creeps_with_body_parts(ThreatManager.attacker_body_parts());
    }

    static get_my_threat_score() {
        return ThreatManager.calculate_threat_score(ThreatManager.get_my_attackers());        
    }

    static get_enemy_threat_score() {
        return ThreatManager.calculate_threat_score(ThreatManager.get_enemy_attackers());
    }

    static max_attack_range(creep) {
        let max_range = 0;
        for (let i = 0; i < creep.body.length; i++) {
            if (creep.body[i].type == ATTACK && creep.body[i].hits > 0)
                max_range = 1;

            if (creep.body[i].type == RANGED_ATTACK && creep.body[i].hits > 0)
                return 3;
        }

        return max_range;
    }

    static calculate_threat_score(creeps) {
        let score  = this.attacker_score_multiplier() * this.get_creeps_body_part_count(creeps, ATTACK)
            + this.ranged_attacker_score_multiplier() * this.get_creeps_body_part_count(creeps, RANGED_ATTACK)
            + this.heal_score_multiplier()            * this.get_creeps_body_part_count(creeps, HEAL)
            + this.move_score_multiplier()            * this.get_creeps_body_part_count(creeps, MOVE)
            + this.tough_score_multiplier()           * this.get_creeps_body_part_count(creeps, TOUGH);

        return score;
    }

    static get_creeps_body_part_count(creeps, body_part) {
        return this.get_creeps_body_parts_count(creeps, [body_part]);
    }

    static get_creeps_body_parts_count(creeps, body_parts) {
        let body_part_count = 0;

        for (let creep of creeps)
            for (let i = 0; i < creep.body.length; i++)
                if (body_parts.includes(creep.body[i].type) && creep.body[i].hits > 0)
                    body_part_count++;

        return body_part_count;
    }

    static attacker_body_parts() {
        return [ATTACK, RANGED_ATTACK];
    }

    static attacker_score_multiplier() {
        return 80;
    }

    static ranged_attacker_score_multiplier() {
        return 140;
    }

    static heal_score_multiplier() {
        return 250;
    }

    static move_score_multiplier() {
        return 30;
    }

    static tough_score_multiplier() {
        return 10;
    }
}