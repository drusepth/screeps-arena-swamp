import { Visual } from '/game/visual';

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
}