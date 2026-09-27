import pool from '../config/database.js';

class PlanEntrenamientoRepository {
    async crear(plan) {
        const [result] = await pool.query(
            "INSERT INTO planes_entrenamiento (nombre, duracion_semanas, metas_fisicas, nivel, precio_base) VALUES (?, ?, ?, ?, ?)",
            [plan.nombre, plan.duracionSemanas, plan.metasFisicas, plan.nivel, plan.precioBase]
        );
        return result.insertId;
    }

    async buscarPorId(id) {
        const [rows] = await pool.query("SELECT * FROM  planes_entrenamiento WHERE id_plan = ?", [id])
        return rows[0] || null;
    }
    async listar() {
        const [rows] = await pool.query("SELECT * FROM planes_entrenamiento")
        return rows;
    }
    async actualizar(id, plan) {
        const [result] = await pool.query(
            "UPDATE planes_entrenamiento SET nombre = ?, duracion_semanas = ?, metas_fisicas = ?, nivel = ?, precio_base = ? WHERE id_plan = ?",
            [plan.nombre, plan.duracionSemanas, plan.metasFisicas, plan.nivel, plan.precioBase, id]
        );
        return result.affectedRows > 0;
    }
    async eliminar(id) {
        const [result] = await pool.query("DELETE FROM planes_entrenamiento WHERE id_plan = ?", [id])
        return result.affectedRows > 0;
    }
}

export default PlanEntrenamientoRepository;