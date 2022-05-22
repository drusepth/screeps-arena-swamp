import { RESOURCE_ENERGY } from '/game/constants';
import { Visual } from '/game/visual';
import { Arena } from '../room/arena';

import { UNIT_TYPE_BODIES, spawn_cost } from '../units/data';
import { SpawnManager } from '../managers/spawn_manager';

export class BHive {
    static act(spawn) {
        let my_extensions        = Arena.get_my_extensions();
        let next_unit_spawn_role = SpawnManager.desired_next_unit_spawn_role();
        let next_unit_spawn_body = UNIT_TYPE_BODIES[next_unit_spawn_role];
        let next_unit_spawn_cost = spawn_cost(next_unit_spawn_body);

        let extension_energy = my_extensions.reduce(function (sum, extension) { return sum + extension.store[RESOURCE_ENERGY]; }, 0);
        let energy_available = spawn.store[RESOURCE_ENERGY] + extension_energy;
        if (energy_available >= next_unit_spawn_cost) {
            let new_unit = spawn.spawnCreep(next_unit_spawn_body).object;
            if (new_unit)
                new_unit.memory = { role: next_unit_spawn_role };
        }

        let spawn_status = "Next spawn: " + next_unit_spawn_role + ' @ ' + energy_available + "/" + next_unit_spawn_cost;
        this.draw_hive_radius(spawn, spawn_status, this.hive_radius());

        for (let extension of my_extensions)
            this.draw_hive_radius(extension, "Extension", this.extension_radius());
    }

    static draw_hive_radius(spawn, status_text, radius) {
        if (!spawn.radialAreaVisual) { spawn.radialAreaVisual = new Visual(0, true); }
        spawn.radialAreaVisual.clear().circle(
            { x: spawn.x, y: spawn.y },
            {
                radius: radius,
                fill: '#00ff00',
                opacity: 0.25
            }
        ).text(
            status_text,
            { x: spawn.x, y: spawn.y - 0.5 }, // above the base
            {
                font: '0.5',
                opacity: 0.7,
                backgroundColor: '#808080',
                backgroundPadding: '0.03'
            }
        );
    }

    static hive_radius() {
        return 10;
    }

    static extension_radius() {
        return 5;
    }
}