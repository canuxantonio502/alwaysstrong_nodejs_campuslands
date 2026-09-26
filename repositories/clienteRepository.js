import pool from '../config/database.js';

// con esta función nos aseguramos que todas las fechas pasen a la base de datos en el formato estandar YYYY-MM-DD;
export const formatoFechaMySQL = (fecha) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

class ClienteRepository{
    async crear(cliente){
        const [result] = await pool.query(
            "INSERT INTO clientes (nombre, telefono, correo, fecha_ingreso, estado) VALUES (?, ?, ?, ?, 'activo')",
            [cliente.nombre, cliente.telefono, cliente.correo, formatoFechaMySQL(cliente.fecha_ingreso)]
        );
        return result.insertId;
    }

    async buscarPorId(id){
        const [rows] = await pool.query("SELECT * FROM clientes WHERE id_cliente = ?", [id]);
        return rows[0] || null;
    }

    async listar(){
        const [rows] = await pool.query("SELECT * FROM clientes ORDER BY fecha_ingreso");
        return rows;
    }
}

export default ClienteRepository;