import {
    MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH, BODYPART_COST
} from '/game/constants';

export let UNIT_BUILD_ORDER = [
    'builder', 'drone', 'vulture', 'field-medic', 'archer'
];

export let UNIT_TYPE_BODIES = {
    // Macro:
    'drone':     [MOVE, MOVE, CARRY, CARRY],
    'big-drone': [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
    'builder':   [CARRY, CARRY, CARRY, CARRY, WORK, MOVE, MOVE, MOVE, MOVE],

    // Combat:
    'archer':      [MOVE, MOVE, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, HEAL],
    // 'tank':        [TOUGH, MOVE, MOVE, MOVE, ATTACK],
    'vulture':     [MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK],
    'field-medic': [MOVE, MOVE, MOVE, MOVE, HEAL, HEAL]
};

export function spawn_cost(body) {
    if (body == undefined || body.length == 0) { return 0; }

    let sum = 0;
    for (let i = 0; i < body.length; i++)
        sum += BODYPART_COST[body[i]];

    return sum;
}
