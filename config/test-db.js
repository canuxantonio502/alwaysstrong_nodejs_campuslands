import pool from "./database.js";

const [result] = await pool.query("select * from clientes;");
console.log("Conexión OK:", result);
process.exit();