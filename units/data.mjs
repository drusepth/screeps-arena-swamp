import {
    MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH,
} from '/game/constants';

export var UNIT_TYPE_BODIES = {
    // Macro:
    'drone':   [MOVE, MOVE, CARRY],
    'builder': [MOVE, MOVE, WORK],

    // Combat:
    'archer':  [MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK],
    'tank':    [MOVE, MOVE, MOVE, ATTACK, TOUGH, TOUGH],
    'medic':   [MOVE, MOVE, HEAL]
};