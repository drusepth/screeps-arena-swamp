export function filter_creeps_by_role(creeps, role) {
    return creeps.filter(creep => creep.memory.role == role);
}
