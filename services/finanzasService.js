import pool from '../config/database.js';
import FinanzasRepository from '../repositories/finanzasRepository.js';
import MovimientoFinanciero from '../models/movimientoFinanciero.js';

class FinanzasService{
    constructor(){
        this.finanzasRepository = new FinanzasRepository();
    }

    async registrarMovimiento(datosMovimiento){
        const conn = await pool.getConnection();
        try{
            await conn.beginTransaction();

            // Primero necesitamos verificar la existencia del contrato referenciado
            if(datosMovimiento.idContrato){
                const [contratos] = await conn.query(
                    "SELECT id_contrato FROM contratos WHERE id_contrato = ?",
                    [datosMovimiento.idContrato]
                );
                if(!contratos.length){
                    throw new Error(`No existe un contrato con ID ${datosMovimiento.idContrato}.`);
                }
            }

            const movimiento = new MovimientoFinanciero(datosMovimiento);

            const id = await this.finanzasRepository.crear(movimiento, conn);

            await conn.commit();
            return id;
        }catch(error){
            await conn.rollback();
            throw error;
        }finally{
            conn.release();
        }
    }
}


export default FinanzasService;