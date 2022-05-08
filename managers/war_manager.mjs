import { getTicks } from '/game/utils';
import { ThreatManager } from './threat_manager';

export class WarManager {
    static full_army_tick_timing() {
        // TODO
        let current_tick = 0;
        let time_to_finish_full_army = 285;

        return current_tick + time_to_finish_full_army;
    }

    static predicted_victory() {
        let my_threat_score    = ThreatManager.get_my_threat_score();
        let enemy_threat_score = ThreatManager.get_enemy_threat_score();

        // After 300 ticks, we care less about the enemy threat score since we're maxed out
        //if (getTicks() > 300)
        //    enemy_threat_score /= 2;

        // Super rudimentary for now, should chunk this up into per-battle predictions later
        return my_threat_score > enemy_threat_score;
    }
}