import ContratoFactory from '../factory/contratoFactory.js';
import ContratoRepository from '../repositories/contratoRepository.js';

class ContratoService {
    constructor() {
        this.contratoRepository = new ContratoRepository();
    }

    async asociarClientePlan(cliente, plan) {
        const contrato = ContratoFactory.crearDesdeAsociacion(cliente, plan);
        return this.contratoRepository.crear(contrato);
    }
}

export default ContratoService;