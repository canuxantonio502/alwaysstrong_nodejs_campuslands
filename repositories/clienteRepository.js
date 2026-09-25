import pool from '../config/database.js';

class ClienteRepository{
    async crear(cliente){
        const [result] = await pool.query(
            "INSERT INTO clientes (nombre, telefono, correo, fecha_ingreso, estado) VALUES (?, ?, ?, ?, 'activo')",
            [cliente.nombre, cliente.telefono, cliente.correo, cliente.fecha_ingreso]);
        return result.insertId;
    }

    async listar(){
        const [rows] = await pool.query("SELECT * FROM clientes ORDER BY fecha_ingreso");
        return rows;
    }
}

export default ClienteRepository;