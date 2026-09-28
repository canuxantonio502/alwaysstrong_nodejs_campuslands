import pool from '../config/database.js';
import { formatoFechaMySQL } from './clienteRepository.js';

class ContratoRepository {
    async crear(contrato) {
        const [result] = await pool.query(
            "INSERT INTO contratos (id_cliente, id_plan, condiciones, precio, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [contrato.idCliente, contrato.idPlan, contrato.condiciones, contrato.precio, formatoFechaMySQL(contrato.fechaInicio), formatoFechaMySQL(contrato.fechaFin), contrato.estado]
        );
        return result.insertId;
    }

    async asignar(){
    try {
            await asignarPlanACliente();
        } catch (error) {
            console.log(chalk.red(error.message));
        }
    }

    async buscarPorId(id){
        const [rows] = await pool.query("SELECT * FROM contratos WHERE id_contrato = ?", [id])
        return rows[0] || null;
    }

    async listar(){
        const [rows] = await pool.query("SELECT * FROM contratos ORDER BY fecha_inicio DESC");
        return rows;
    }

    async actualizar(id, contrato) {
        const estadosPermitidos = ['activo', 'renovado', 'cancelado', 'finalizado'];
                    if (this.estado && !estadosPermitidos.includes(this.estado)){
                        throw new Error(`Estado inválido. Opciones: ${estadosPermitidos.join(', ')}.`);
                    }
        const [result] = await pool.query(
            "UPDATE contratos SET fecha_fin = ?, estado = ? WHERE id_contrato = ?",
            [formatoFechaMySQL(contrato.fechaFin), contrato.estado, id]
        );
        return result.affectedRows > 0;
    }

    async eliminar(id){
        const [result] = await pool.query("UPDATE contratos SET estado = 'cancelado' WHERE id_contrato = ?", [id]);
        return result.affectedRows > 0;
    }
 }

 export default ContratoRepository;