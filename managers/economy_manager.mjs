import { getTicks } from '/game/utils';
import { Arena } from '../room/arena';
import { ERR_NOT_IN_RANGE, HEAL, CARRY, ATTACK, RANGED_ATTACK } from '/game/constants';
import { has_body_part } from '../helpers/filters';

export class EconomyManager {
    static get_enemy_workers() {
        return Arena.get_enemy_creeps().filter((creep) => {
            return !has_body_part(creep, ATTACK) && !has_body_part(creep, RANGED_ATTACK)
        });
    }
}
