import {
    MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH,
} from '/game/constants';

export var UNIT_TYPE_BODIES = {
    'drone':  [MOVE, MOVE, MOVE, CARRY, WORK, WORK],
    'archer': [MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK],
    'tank':   [MOVE, MOVE, MOVE, ATTACK, TOUGH, TOUGH]
};