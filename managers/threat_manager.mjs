import { ATTACK, RANGED_ATTACK, WORK, CARRY, HEAL } from '/game/constants';
import { Arena } from '../room/arena';

export class ThreatManager {
    static print_threat_report() {
        console.log([
            "Threat report:",
            `Friendly: ${ThreatManager.get_my_attackers().length} (${ThreatManager.get_my_threat_score()})`,
            `Enemy:    ${ThreatManager.get_enemy_attackers().length} (${ThreatManager.get_enemy_threat_score()})`,
        ].join("\n"));
    }

    static get_enemy_attackers() {
        return Arena.get_enemy_creeps_with_body_parts(ThreatManager.attacker_body_parts());
    }

    static get_my_attackers() {
        return Arena.get_my_creeps_with_body_parts(ThreatManager.attacker_body_parts());
    }

    static get_my_threat_score() {
        var my_attackers = this.get_my_attackers();
        var score  = this.attacker_score_multiplier() * this.get_creeps_body_part_count(my_attackers, ATTACK)
            + this.ranged_attacker_score_multiplier() * this.get_creeps_body_part_count(my_attackers, RANGED_ATTACK);

        return score;
    }

    static get_enemy_threat_score() {
        var enemy_attackers = this.get_enemy_attackers();
        var score  = this.attacker_score_multiplier() * this.get_creeps_body_part_count(enemy_attackers, ATTACK)
            + this.ranged_attacker_score_multiplier() * this.get_creeps_body_part_count(enemy_attackers, RANGED_ATTACK);

        return score;
    }

    static get_creeps_body_part_count(creeps, body_part) {
        return this.get_creeps_body_parts_count(creeps, [body_part]);
    }

    static get_creeps_body_parts_count(creeps, body_parts) {
        var body_part_count = 0;

        for (var creep of creeps)
            for (var i = 0; i < creep.body.length; i++)
                if (body_parts.includes(creep.body[i].type))
                    body_part_count++;

        return body_part_count;
    }

    static attacker_body_parts() {
        return [ATTACK, RANGED_ATTACK];
    }

    static attacker_score_multiplier() {
        return 1.0;
    }

    static ranged_attacker_score_multiplier() {
        return 1.0;
    }
}