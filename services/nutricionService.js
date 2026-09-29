import NutricionRepository from '../repositories/nutricionRepository.js';
import AlimentoDia from '../models/alimentoDia.js';

class NutricionService {
    constructor() {
        this.nutricionRepository = new NutricionRepository();
    }

    async registrarAlimento(datos) {
        const plan = await this.nutricionRepository.buscarPlanPorId(datos.idPlanNutricional);
        if (!plan) throw new Error(`No existe un plan nutricional con ID ${datos.idPlanNutricional}.`);

        const fecha = new Date(datos.fecha);
        if (fecha < plan.fecha_inicio || fecha > plan.fecha_fin) {
            throw new Error(`La fecha debe estar entre ${plan.fecha_inicio} y ${plan.fecha_fin} (vigencia del plan).`);
        }

        const alimento = new AlimentoDia(datos); // valida tipo/rango de calorías
        return this.nutricionRepository.crearAlimento(alimento);
    }
}

export default NutricionService;