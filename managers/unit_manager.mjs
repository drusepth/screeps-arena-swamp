import { UDrone } from '../units/drone';
import { UArcher } from '../units/archer';
import { UFieldMedic } from '../units/field_medic';

export class UnitManager {
    static act(creep) {
        switch(creep.memory.role) {
            case 'drone':       return UDrone.act(creep);
            case 'archer':      return UArcher.act(creep);
            case 'field-medic': return UFieldMedic.act(creep);
            default:
                console.log('Error: no unit action defined for role=' + creep.memory.role);
        }
    }
}