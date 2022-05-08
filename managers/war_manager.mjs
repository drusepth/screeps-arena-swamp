import { ATTACK, RANGED_ATTACK, WORK, CARRY, HEAL } from '/game/constants';
import { Arena } from '../room/arena';
import { ThreatManager } from './threat_manager.mjs';

export class WarManager {
    static predicted_victory() {
        // Super rudimentary for now, should chunk this up into per-battle predictions later
        return ThreatManager.get_my_threat_score() > ThreatManager.get_enemy_threat_score();
    }
}