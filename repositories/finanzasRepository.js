import pool from '../config/database.js';
import { formatoFechaMySQL } from './clienteRepository.js';

class FinanzasRepository{
    async crear(movimiento, conn = pool){
        const [result] = await conn.query(
            "INSERT INTO movimientos_financieros (id_cliente, id_contrato, tipo, categoria, monto, fecha) VALUES (?, ?, ?, ?, ?, ?)",
            [movimiento.idCliente, movimiento.idContrato, movimiento.tipo, movimiento.categoria, movimiento.monto, formatoFechaMySQL(movimiento.fecha)]
        );
        return result.insertId;
    }

    async listar() {
        const [rows] = await pool.query("SELECT * FROM movimientos_financieros ORDER BY fecha DESC");
        return rows;
    }

    async balancePorCliente(idCliente){
        const [rows] = await pool.query(
            `SELECT
                SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS total_ingresos,
                SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) AS total_egresos,
                SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) AS balance
            FROM movimientos_financieros WHERE id_cliente = ?`,
            [idCliente]
        );
        return rows[0];
    }

    async balancePorFecha(desde, hasta){
        const [rows] = await pool.query(
            `SELECT
                SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS total_ingresos,
                SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) AS total_egresos,
                SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) AS balance
            FROM movimientos_financieros WHERE fecha BETWEEN ? AND ?`,
            [formatoFechaMySQL(desde), formatoFechaMySQL(hasta)]
        );
        return rows[0];
    }
}

export default FinanzasRepository;