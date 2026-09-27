import pool from '../config/database.js';
import { formatoFechaMySQL } from './clienteRepository.js';

class SeguimientoRepository {
    async crear(seguimiento){
        const [result] = await pool.query(
            "INSERT INTO seguimientos (id_contrato, fecha, peso, grasa_corporal, medidas, foto_url, comentarios) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [seguimiento.idContrato, formatoFechaMySQL(seguimiento.fecha), seguimiento.peso, seguimiento.grasaCorporal, seguimiento.medidas, seguimiento.fotoUrl, seguimiento.comentarios]
        );
        return result.insertId;
    }

    async buscarPorId(id){
        const [rows] = await pool.query("SELECT * FROM seguimientos WHERE id_seguimiento = ?", [id]);
        return rows[0] || null;
    }

    async listar(){
        const [rows] = await pool.query("SELECT * FROM seguimientos ORDER BY fecha DESC");
        return rows;
    }

    async actualizar(id, seguimiento){
        const [result] = await pool.query(
            "UPDATE seguimientos SET id_contrato = ?, fecha = ?, peso = ?, grasa_corporal = ?, medidas = ?, foto_url = ?, comentarios = ? WHERE id_seguimiento = ?",
            [seguimiento.idContrato, formatoFechaMySQL(seguimiento.fecha), seguimiento.peso, seguimiento.grasaCorporal, seguimiento.medidas, seguimiento.fotoUrl, seguimiento.comentarios, id]
        );
        return result.affectedRows > 0;
    }

    async eliminar(id){
        const [result] = await pool.query("DELETE FROM seguimientos WHERE id_seguimiento = ?", [id])
        return result.affectedRows > 0;
    }
}

export default SeguimientoRepository;