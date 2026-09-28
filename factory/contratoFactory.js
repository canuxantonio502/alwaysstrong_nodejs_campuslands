import dayjs from 'dayjs';
import Contrato from '../models/contrato.js';

class ContratoFactory {
    static crearDesdeAsociacion(cliente, plan) {
        const inicio = dayjs().startOf('day');
        return new Contrato({
            idCliente: cliente.id_cliente,
            idPlan: plan.id_plan,
            condiciones: `${plan.nombre} - Nivel ${plan.nivel}`,
            precio: Number(plan.precio_base),
            fechaInicio: inicio.toDate(),
            fechaFin: inicio.add(Number(plan.duracion_semanas), 'week').toDate(),
            estado: 'activo',
        });
    }
}

export default ContratoFactory;