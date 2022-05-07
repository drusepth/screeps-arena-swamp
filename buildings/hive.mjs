import {
    getObjectsByPrototype, findClosestByPath
} from '/game/utils';
import { 
    Creep, Source, 
    Structure, StructureContainer, StructureSpawn
} from '/game/prototypes';
import {
    MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH, BODYPART_COST,
    RESOURCE_ENERGY,
    OK, ERR_NOT_IN_RANGE, ERR_INVALID_TARGET
} from '/game/constants';
import { Visual } from '/game/visual';

import { Arena } from '../room/arena';
import { UNIT_TYPE_BODIES, spawn_cost } from '../units/data';
import { filter_creeps_by_role } from '../helpers/filters';

export class BHive {
    static act(spawn) {
        var next_unit_spawn_role = BHive.desired_next_unit_spawn_role();
        var next_unit_spawn_body = BHive.body_for_unit_role(next_unit_spawn_role);
        var next_unit_spawn_cost = spawn_cost(next_unit_spawn_body);
        var energy_available = spawn.store[RESOURCE_ENERGY];

        if (energy_available >= next_unit_spawn_cost) {
            var new_unit = spawn.spawnCreep(next_unit_spawn_body).object;
            if (new_unit)
                new_unit.memory = { role: next_unit_spawn_role };
        }

        if (!spawn.radialAreaVisual) { spawn.radialAreaVisual = new Visual(0, true); }
        spawn.radialAreaVisual.clear().circle(
            { x: spawn.x, y: spawn.y },
            {
                radius: BHive.secured_base_radius(),
                fill: '#00ff00',
                opacity: 0.25
            }
        ).text(
            "Next spawn: " + next_unit_spawn_role + ' @ ' + energy_available + "/" + next_unit_spawn_cost,
            { x: spawn.x, y: spawn.y - 0.5 }, // above the base
            {
                font: '0.5',
                opacity: 0.7,
                backgroundColor: '#808080',
                backgroundPadding: '0.03'
            }
        );
    }
    
    static desired_next_unit_spawn_role() {
        // TODO just build a map here of role => count keys/values
        var my_creeps       = Arena.get_my_creeps();
        var my_drones       = filter_creeps_by_role(my_creeps, 'drone');
        var my_archers      = filter_creeps_by_role(my_creeps, 'archer');
        var my_field_medics = filter_creeps_by_role(my_creeps, 'field-medic');

        if (my_drones.length < BHive.desired_number_of_drones())
            return 'drone';
        else if (my_field_medics.length < (my_archers.length / 3))
            return 'field-medic';
        else if (my_archers.length < 10)
            return 'archer';
    }

    static body_for_unit_role(role) {
        return UNIT_TYPE_BODIES[role];
    }

    static next_unit_spawn_body() {
        return UNIT_TYPE_BODIES[BHive.next_unit_role()];


        // Factor in: average distance to Containers, average move/work/carry of existing drones
        // var ranged_dude = mySpawn.spawnCreep([RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]);
        //return [MOVE, MOVE, MOVE, CARRY, WORK, WORK];
    }

    static secured_base_radius() {
        return 10;
    }

    static desired_number_of_drones() {
        // Factors to consider: enemy threat count, enemy drone count, friendly threat count, total containers within N range?
        var drones_per_container = 0.3;

        return Arena.get_non_empty_containers().length * drones_per_container;
    }
}