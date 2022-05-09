export function filter_creeps_by_role(creeps, role) {
    return creeps.filter(creep => creep.memory.role == role);
}

export function filter_creeps_by_roles(creeps, roles) {
    return creeps.filter(creep => roles.includes(creep.memory.role));
}

export function filter_creeps_by_body_part(creeps, body_part, minimum = 1) {
    return filter_creeps_by_body_parts(creeps, [body_part], minimum);
}

export function filter_creeps_by_body_parts(creeps, body_parts, minimum = 1) {
    return creeps.filter((creep) => {
        let part_count = 0;
        for (let i = 0; i < creep.body.length; i++) {
            if (body_parts.includes(creep.body[i].type))
                part_count++;
        }
        return part_count >= minimum;
    });
}

export function has_body_part(creep, body_part) {
    return creep.body.some(part => part.type === body_part && part.hits > 0);
}

export function exclude_creeps_with_body_part(creeps, body_part) {
    return creeps.filter(creep => !has_body_part(creep, body_part));
}