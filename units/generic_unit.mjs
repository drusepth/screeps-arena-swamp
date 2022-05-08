import { Visual } from '/game/visual';
import { searchPath } from 'game/path-finder';

import { ThreatManager } from '../managers/threat_manager';

export class UGeneric {
    static display_action_message_with_target_line(creep, message, target) {
        if (!creep.actionMessageVisual) { creep.actionMessageVisual = new Visual(1, true); }
        creep.actionMessageVisual.clear().text(
            message,
            { x: creep.x, y: creep.y - 0.5 }, // above the creep
            {
                font: '0.5',
                opacity: 0.7,
                backgroundColor: '#808080',
                backgroundPadding: '0.03'
            }
        ).line(
            { x: creep.x, y: creep.y },
            { x: target.x, y: target.y },
            { color: '#0000ff', lineStyle: 'dotted', opacity: 0.75 }
        );
    }

    static flee_from_nearby_threats(creep, nearby_threats) {
        let active_threats = [];
        nearby_threats.forEach(threat => active_threats.push({
            "pos":   { x: threat.x, y: threat.y },
            "range": this.safety_zone() + ThreatManager.max_attack_range(threat)
        }));
        let escape_route = searchPath(creep, active_threats, { "flee": true });
        creep.moveTo(escape_route.path[0]);

        UGeneric.display_action_message_with_target_line(creep,
            creep.memory.role + ': Fleeing from threats!',
            nearby_threats[0]
        );
    }

    static safety_zone() {
        return 3;
    }
}