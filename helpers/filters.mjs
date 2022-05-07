export function filter_creeps_by_role(creeps, role) {
    return creeps.filter(creep => creep.memory.role == role);
}

export function filter_creeps_by_roles(creeps, roles) {
    return creeps.filter(creep => roles.includes(creep.memory.role));
}

export function filter_creeps_by_body_part(creeps, body_part, minimum = 1) {
    // return creep.body.includes(body_part);

    return creeps.filter((creep) => {
        let part_count = 0;
        for (var i = 0; i < creep.body.length; i++) {
            if (creep.body[i].type == body_part)
                part_count++;
        }
        return part_count >= minimum;
    });
}