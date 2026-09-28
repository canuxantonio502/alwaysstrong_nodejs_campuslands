import ContratoFactory from '../factory/contratoFactory.js';
import ContratoRepository from '../repositories/contratoRepository.js';
import pool from '../config/database.js';

class ContratoService {
    constructor() {
        this.contratoRepository = new ContratoRepository();
    }

    async asociarClientePlan(cliente, plan) {
        const contrato = ContratoFactory.crearDesdeAsociacion(cliente, plan);
        return this.contratoRepository.crear(contrato);
    }

    async cancelar(idContrato){
        const conn = await pool.getConnection();
        try{
            await conn.beginTransaction();

            // verificamos la existencia del contrqto
            const [contratos] = await conn.query(
                "SELECT * FROM contratos WHERE id_contrato = ?",
                [idContrato]
            );
            if(!contratos.length){
                throw new Error(`No existe un contrato con ID ${idContrato}.`);
            }
            if(contratos[0].estado === 'cancelado'){
                throw new Error('Este contrato ya se encuentra concelado.');
            }

            await conn.query(
                "DELETE FROM seguimientos WHERE id_contrato = ?",
                [idContrato]
            );
            // throw new Error("Prueba rollback.");

            const [resultado] = await conn.query(
                "UPDATE contratos SET estado = 'cancelado' WHERE id_contrato = ?",
                [idContrato]
            );

            await conn.commit();
            return resultado.affectedRows > 0;
        }catch(error){
            await conn.rollback();
            throw error;
        }finally{
            conn.release();
        }
    }
}

export default ContratoService;