import { getTicks } from '/game/utils';
import { ThreatManager } from './threat_manager';
import { EconomyManager } from './economy_manager.mjs';

export class WarManager {
    static predicted_victory() {
        let my_threat_score    = ThreatManager.get_my_threat_score();
        let enemy_threat_score = ThreatManager.get_enemy_threat_score();

        // After 300 ticks, we care less about the enemy threat score since we're maxed out
        //if (getTicks() > 300)
        //    enemy_threat_score /= 2;

        // Super rudimentary for now, should chunk this up into per-battle predictions later
        return my_threat_score > enemy_threat_score;
    }

    static get_unguarded_enemy_workers(guard_range) {
        return EconomyManager.get_enemy_workers().filter(worker => {
            let attackers_near_worker = ThreatManager.enemy_threats_in_range(worker, guard_range);
            return attackers_near_worker.length == 0;
        });
    }
}