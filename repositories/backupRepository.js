import pool from '../config/database.js';
import dayjs from 'dayjs';

class BackupRepository {
    constructor(connectionPool = pool) {
        this.pool = connectionPool;
        // Orden topológico respetando restricciones de claves foráneas
        this.ordenTopologico = [
            'clientes',
            'planes_entrenamiento',
            'contratos',
            'seguimientos',
            'planes_nutricionales',
            'alimentos_dia',
            'movimientos_financieros'
        ];
    }

    /**
     * Obtiene el orden de dependencias de las entidades
     * @returns {string[]}
     */
    obtenerOrdenTopologico() {
        return [...this.ordenTopologico];
    }

    /**
     * Obtiene todos los registros de una colección/tabla formateando fechas
     * @param {string} coleccion
     * @returns {Promise<Array<Object>>}
     */
    async obtenerDatosColeccion(coleccion) {
        const [rows] = await this.pool.query(`SELECT * FROM \`${coleccion}\``);
        return rows.map(row => {
            const rowLimpia = { ...row };
            for (const key of Object.keys(rowLimpia)) {
                if (rowLimpia[key] instanceof Date) {
                    rowLimpia[key] = dayjs(rowLimpia[key]).format('YYYY-MM-DD');
                }
            }
            return rowLimpia;
        });
    }

    /**
     * Obtiene la estructura de columnas de una tabla para validación de compatibilidad
     * @param {string} coleccion
     * @returns {Promise<Array<Object>>}
     */
    async obtenerColumnasTabla(coleccion) {
        try {
            const [rows] = await this.pool.query(`DESCRIBE \`${coleccion}\``);
            return rows.map(col => ({
                campo: col.Field,
                tipo: col.Type,
                permiteNulo: col.Null === 'YES',
                llave: col.Key,
                defecto: col.Default,
                extra: col.Extra
            }));
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') {
                return null;
            }
            throw error;
        }
    }

    /**
     * Verifica si una tabla existe en la base de datos
     * @param {string} coleccion
     * @returns {Promise<boolean>}
     */
    async verificarExistenciaTabla(coleccion) {
        const [rows] = await this.pool.query('SHOW TABLES LIKE ?', [coleccion]);
        return rows.length > 0;
    }

    /**
     * Restaura colecciones de manera atómica dentro de una transacción MySQL
     * @param {Object} datosPorColeccion Objeto donde las claves son nombres de tabla y los valores arreglos de filas
     * @param {string[]} coleccionesAProcesar Lista de colecciones que se restaurarán
     * @returns {Promise<Object>} Resumen de registros restaurados por colección
     */
    async restaurarColecciones(datosPorColeccion, coleccionesAProcesar) {
        const conn = await this.pool.getConnection();
        const resumen = {};

        try {
            await conn.beginTransaction();
            // Deshabilitar temporalmente chequeo de claves foráneas para restaurar con seguridad
            await conn.query('SET FOREIGN_KEY_CHECKS = 0');

            // 1. Limpieza en orden inverso de dependencias
            const ordenBorrado = [...this.ordenTopologico]
                .reverse()
                .filter(col => coleccionesAProcesar.includes(col));

            for (const col of ordenBorrado) {
                await conn.query(`DELETE FROM \`${col}\``);
            }

            // 2. Inserción en orden de dependencias
            const ordenInsercion = this.ordenTopologico
                .filter(col => coleccionesAProcesar.includes(col));

            for (const col of ordenInsercion) {
                const filas = datosPorColeccion[col] || [];
                let contador = 0;

                for (const fila of filas) {
                    const columnas = Object.keys(fila);
                    if (columnas.length === 0) continue;

                    const valores = columnas.map(campo => {
                        let val = fila[campo];
                        if (val === undefined || val === null) return null;
                        if (val instanceof Date) {
                            return dayjs(val).format('YYYY-MM-DD');
                        }
                        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
                            return dayjs(val).format('YYYY-MM-DD');
                        }
                        return val;
                    });

                    const columnasEscapadas = columnas.map(c => `\`${c}\``).join(', ');
                    const placeholders = columnas.map(() => '?').join(', ');
                    const sql = `INSERT INTO \`${col}\` (${columnasEscapadas}) VALUES (${placeholders})`;

                    await conn.query(sql, valores);
                    contador++;
                }

                resumen[col] = contador;
            }

            // Reactivar chequeo de claves foráneas y confirmar transacción
            await conn.query('SET FOREIGN_KEY_CHECKS = 1');
            await conn.commit();
            return resumen;
        } catch (error) {
            try {
                await conn.query('SET FOREIGN_KEY_CHECKS = 1');
            } catch (_) {}
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
}

export default BackupRepository;
