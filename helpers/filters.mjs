export function filter_creeps_by_role(creeps, role) {
    return creeps.filter(creep => creep.memory.role == role);
}

export function filter_creeps_by_roles(creeps, roles) {
    return creeps.filter(creep => roles.includes(creep.memory.role));
}