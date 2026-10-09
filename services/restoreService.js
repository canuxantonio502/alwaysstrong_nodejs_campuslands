import fs from 'fs/promises';
import path from 'path';
import BackupRepository from '../repositories/backupRepository.js';
import { COLECCIONES_DISPONIBLES } from './backupService.js';

class RestoreService {
    constructor(backupRepository = new BackupRepository()) {
        this.backupRepository = backupRepository;
        this.coleccionesValidas = COLECCIONES_DISPONIBLES.map(c => c.id);
    }

    /**
     * Lista todos los archivos de respaldo disponibles en la carpeta /backups
     * @param {string} [carpetaDestino='backups']
     * @returns {Promise<Array<Object>>}
     */
    async listarArchivosBackup(carpetaDestino = 'backups') {
        const rutaCarpeta = path.resolve(carpetaDestino);
        await fs.mkdir(rutaCarpeta, { recursive: true });

        const archivos = await fs.readdir(rutaCarpeta);
        const archivosJson = archivos.filter(a => a.toLowerCase().endsWith('.json'));

        const listaConDetalles = [];
        for (const nombre of archivosJson) {
            const rutaCompleta = path.join(rutaCarpeta, nombre);
            const stats = await fs.stat(rutaCompleta);
            listaConDetalles.push({
                nombre,
                ruta: rutaCompleta,
                tamanoBytes: stats.size,
                tamanoKb: (stats.size / 1024).toFixed(2),
                fechaModificacion: stats.mtime
            });
        }

        // Ordenar del más reciente al más antiguo
        return listaConDetalles.sort((a, b) => b.fechaModificacion - a.fechaModificacion);
    }

    /**
     * Valida exhaustivamente la compatibilidad de un archivo de respaldo con el sistema actual y la BD
     * @param {string} rutaArchivo Ruta absoluta o relativa al archivo JSON
     * @returns {Promise<Object>} Resultado de la validación
     */
    async validarCompatibilidad(rutaArchivo) {
        const errores = [];
        const advertencias = [];
        let parsed = null;

        // 1. Validar existencia y lectura del archivo
        try {
            const contenido = await fs.readFile(rutaArchivo, 'utf-8');
            parsed = JSON.parse(contenido);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return {
                    esCompatible: false,
                    errores: [`El archivo especificado no existe: ${rutaArchivo}`],
                    advertencias: [],
                    resumen: null,
                    datosBackup: null
                };
            }
            return {
                esCompatible: false,
                errores: [`El archivo no contiene un formato JSON válido: ${error.message}`],
                advertencias: [],
                resumen: null,
                datosBackup: null
            };
        }

        // 2. Validar estructura general del documento de respaldo
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            errores.push('El contenido del archivo no es un objeto JSON válido para respaldo.');
            return { esCompatible: false, errores, advertencias, resumen: null, datosBackup: null };
        }

        if (!Array.isArray(parsed.colecciones) || parsed.colecciones.length === 0) {
            errores.push("El respaldo no contiene la propiedad 'colecciones' o la lista está vacía.");
        }

        if (!parsed.datos || typeof parsed.datos !== 'object' || Array.isArray(parsed.datos)) {
            errores.push("El respaldo no contiene un bloque de 'datos' válido.");
        }

        if (errores.length > 0) {
            return { esCompatible: false, errores, advertencias, resumen: null, datosBackup: null };
        }

        // 3. Validar compatibilidad de aplicación y metadatos
        if (parsed.metadata) {
            if (parsed.metadata.app && parsed.metadata.app !== 'alwaysstrong_nodejs_campuslands') {
                advertencias.push(`El respaldo proviene de una aplicación diferente ('${parsed.metadata.app}'). Proceda con cautela.`);
            }
        } else {
            advertencias.push('El archivo no incluye sección de metadatos.');
        }

        // 4. Validar que las colecciones pertenezcan al ecosistema del proyecto
        for (const col of parsed.colecciones) {
            if (!this.coleccionesValidas.includes(col)) {
                errores.push(`La colección '${col}' no es compatible ni reconocida por este proyecto.`);
            }
        }

        // 5. Validar existencia en la base de datos y coincidencia de columnas (esquema)
        const resumenDetallado = {};
        for (const col of parsed.colecciones) {
            if (!this.coleccionesValidas.includes(col)) continue;

            const columnasBD = await this.backupRepository.obtenerColumnasTabla(col);
            if (!columnasBD) {
                errores.push(`La tabla '${col}' no existe en la base de datos MySQL.`);
                continue;
            }

            const nombresColumnasBD = new Set(columnasBD.map(c => c.campo));
            const filas = parsed.datos[col];

            if (!Array.isArray(filas)) {
                errores.push(`Los datos para la colección '${col}' deben ser un arreglo de registros.`);
                continue;
            }

            resumenDetallado[col] = filas.length;

            // Verificar si hay registros y si sus campos coinciden con las columnas existentes
            if (filas.length > 0) {
                const columnasDesconocidas = new Set();
                for (const fila of filas) {
                    if (typeof fila !== 'object' || fila === null) {
                        errores.push(`La colección '${col}' contiene elementos que no son objetos válidos.`);
                        break;
                    }
                    for (const campo of Object.keys(fila)) {
                        if (!nombresColumnasBD.has(campo)) {
                            columnasDesconocidas.add(campo);
                        }
                    }
                }

                if (columnasDesconocidas.size > 0) {
                    errores.push(
                        `La colección '${col}' contiene campos inexistentes en la base de datos: ${[...columnasDesconocidas].join(', ')}.`
                    );
                }
            }
        }

        const totalRegistros = Object.values(resumenDetallado).reduce((acc, n) => acc + n, 0);

        const resumen = {
            archivo: path.basename(rutaArchivo),
            ruta: rutaArchivo,
            version: parsed.metadata?.version || '1.0.0',
            app: parsed.metadata?.app || 'Desconocida',
            timestamp: parsed.metadata?.timestamp || null,
            fechaGeneracion: parsed.metadata?.fechaGeneracion || null,
            tipo: parsed.metadata?.tipo || (parsed.colecciones.length === this.coleccionesValidas.length ? 'completo' : 'parcial'),
            colecciones: parsed.colecciones,
            resumenColecciones: resumenDetallado,
            totalRegistros: totalRegistros
        };

        return {
            esCompatible: errores.length === 0,
            errores,
            advertencias,
            resumen,
            datosBackup: parsed
        };
    }

    /**
     * Ejecuta la restauración de las colecciones seleccionadas en la base de datos
     * @param {Object} datosBackup Contenido del respaldo previamente validado
     * @param {string[]} [coleccionesAProcesar=null] Colecciones específicas a restaurar (null para todas las del archivo)
     * @returns {Promise<Object>} Resumen de la restauración
     */
    async ejecutarRestauracion(datosBackup, coleccionesAProcesar = null) {
        if (!datosBackup || !datosBackup.datos || !Array.isArray(datosBackup.colecciones)) {
            throw new Error('Estructura de respaldo inválida para ejecutar la restauración.');
        }

        let colecciones = coleccionesAProcesar;
        if (!colecciones || colecciones.length === 0) {
            colecciones = datosBackup.colecciones;
        }

        // Validar que todas las colecciones a restaurar existan en el archivo
        for (const col of colecciones) {
            if (!datosBackup.colecciones.includes(col)) {
                throw new Error(`La colección '${col}' no está presente en el archivo de respaldo.`);
            }
        }

        const resultado = await this.backupRepository.restaurarColecciones(
            datosBackup.datos,
            colecciones
        );

        const totalRegistros = Object.values(resultado).reduce((acc, curr) => acc + curr, 0);

        return {
            exito: true,
            coleccionesRestauradas: resultado,
            totalRegistros: totalRegistros
        };
    }
}

export default RestoreService;
