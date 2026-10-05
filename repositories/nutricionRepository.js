import pool from '../config/database.js';
import { formatoFechaMySQL } from './clienteRepository.js';

class NutricionRepository {

    async crearPlan(plan) {
        const [result] = await pool.query(
            "INSERT INTO planes_nutricionales (id_contrato, fecha_inicio, fecha_fin) VALUES (?, ?, ?)",
            [plan.idContrato, formatoFechaMySQL(plan.fechaInicio), formatoFechaMySQL(plan.fechaFin)]
        );
        return result.insertId;
    }

    async buscarPlanPorId(id) {
        const [rows] = await pool.query("SELECT * FROM planes_nutricionales WHERE id_plan_nutricional = ?", [id]);
        return rows[0] || null;
    }

    async crearAlimento(alimento) {
        const [result] = await pool.query(
            "INSERT INTO alimentos_dia (id_plan_nutricional, fecha, nombre_alimento, calorias) VALUES (?, ?, ?, ?)",
            [alimento.idPlanNutricional, formatoFechaMySQL(alimento.fecha), alimento.nombreAlimento, alimento.calorias]
        );
        return result.insertId;
    }

    async listarAlimentosPorPlan(idPlanNutricional) {
        const [rows] = await pool.query(
            "SELECT * FROM alimentos_dia WHERE id_plan_nutricional = ? ORDER BY fecha",
            [idPlanNutricional]
        );
        return rows;
    }

    // Reporte semanal
    async reporteSemanal(idPlanNutricional, desde, hasta) {
        const [rows] = await pool.query(
            `SELECT fecha, SUM(calorias) AS total_calorias
             FROM alimentos_dia
             WHERE id_plan_nutricional = ? AND fecha BETWEEN ? AND ?
             GROUP BY fecha ORDER BY fecha`,
            [idPlanNutricional, formatoFechaMySQL(desde), formatoFechaMySQL(hasta)]
        );
        return rows;
    }

    // Listamos los planes nutricionales de un contrato espec{ifico}

    async listarPlanesPorContrato(idContrato) {
        const [rows] = await pool.query(
            "SELECT * FROM planes_nutricionales WHERE id_contrato = ?",
            [idContrato]
        );
        return rows;
    }
}

export default NutricionRepository;