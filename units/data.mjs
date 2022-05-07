import {
    MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH, BODYPART_COST
} from '/game/constants';

export var UNIT_TYPE_BODIES = {
    // Macro:
    'drone':   [MOVE, MOVE, CARRY],
    'builder': [MOVE, MOVE, WORK],

    // Combat:
    'archer':      [MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK],
    'tank':        [MOVE, MOVE, MOVE, ATTACK, TOUGH, TOUGH],
    'field-medic': [MOVE, MOVE, HEAL, HEAL]
};

export function spawn_cost(body) {
    if (body == undefined || body.length == 0) { return 0; }

    let sum = 0;
    for (var i = 0; i < body.length; i++)
        sum += BODYPART_COST[body[i]];

    return sum;
}
