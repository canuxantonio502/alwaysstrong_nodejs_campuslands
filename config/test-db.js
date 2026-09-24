import pool from "./database.js";

const [rows] = await pool.query("SELECT 1 + 1 AS resultado");
console.log("Conexión OK:", rows);
process.exit();