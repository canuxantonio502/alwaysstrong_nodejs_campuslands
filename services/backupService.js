import fs from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';
import BackupRepository from '../repositories/backupRepository.js';

export const COLECCIONES_DISPONIBLES = [
    { id: 'clientes', nombre: 'Clientes', descripcion: 'Datos personales y estado de los clientes' },
    { id: 'planes_entrenamiento', nombre: 'Planes de entrenamiento', descripcion: 'Catálogo de planes, niveles y tarifas base' },
    { id: 'contratos', nombre: 'Contratos', descripcion: 'Contratos asociados a clientes y planes' },
    { id: 'seguimientos', nombre: 'Seguimientos físicos', descripcion: 'Historial de peso, medidas y evolución física' },
    { id: 'planes_nutricionales', nombre: 'Planes nutricionales', descripcion: 'Planes alimenticios asociados a contratos' },
    { id: 'alimentos_dia', nombre: 'Alimentos por día', descripcion: 'Detalle de comidas y calorías registradas' },
    { id: 'movimientos_financieros', nombre: 'Movimientos financieros', descripcion: 'Registro de ingresos y egresos del gimnasio' }
];

class BackupService {
    constructor(backupRepository = new BackupRepository()) {
        this.backupRepository = backupRepository;
        this.coleccionesValidas = COLECCIONES_DISPONIBLES.map(c => c.id);
    }

    /**
     * Retorna la lista de colecciones configuradas y disponibles para respaldar
     */
    listarColeccionesDisponibles() {
        return [...COLECCIONES_DISPONIBLES];
    }

    /**
     * Genera un archivo de respaldo en formato JSON en la carpeta /backups
     * @param {Object} opciones
     * @param {string[]} [opciones.colecciones] Colecciones a exportar. Si es null o vacío se exportan todas.
     * @param {string} [opciones.carpetaDestino='backups'] Carpeta donde se guardará el respaldo
     * @returns {Promise<Object>} Resumen del respaldo generado
     */
    async generarBackup({ colecciones = null, carpetaDestino = 'backups' } = {}) {
        // 1. Determinar y validar colecciones a incluir
        let coleccionesAExportar = [];
        if (!colecciones || colecciones.length === 0) {
            coleccionesAExportar = [...this.coleccionesValidas];
        } else {
            // Validar que cada colección seleccionada exista
            for (const col of colecciones) {
                if (!this.coleccionesValidas.includes(col)) {
                    throw new Error(`La colección "${col}" no es una colección válida del proyecto.`);
                }
            }
            coleccionesAExportar = [...colecciones];
        }

        // Ordenar según dependencias lógicas
        const orden = this.backupRepository.obtenerOrdenTopologico();
        coleccionesAExportar.sort((a, b) => orden.indexOf(a) - orden.indexOf(b));

        // 2. Garantizar que la carpeta de respaldos exista
        const rutaCarpeta = path.resolve(carpetaDestino);
        await fs.mkdir(rutaCarpeta, { recursive: true });

        // 3. Extraer datos de la base de datos para cada colección
        const datos = {};
        const resumen = {};
        let totalRegistros = 0;

        for (const col of coleccionesAExportar) {
            const filas = await this.backupRepository.obtenerDatosColeccion(col);
            datos[col] = filas;
            resumen[col] = filas.length;
            totalRegistros += filas.length;
        }

        // 4. Estructurar payload del respaldo
        const ahora = dayjs();
        const timestampISO = ahora.toISOString();
        const tipoRespaldo = coleccionesAExportar.length === this.coleccionesValidas.length ? 'completo' : 'parcial';

        const payload = {
            metadata: {
                app: 'alwaysstrong_nodejs_campuslands',
                version: '1.0.0',
                timestamp: timestampISO,
                fechaGeneracion: ahora.format('YYYY-MM-DD HH:mm:ss'),
                tipo: tipoRespaldo,
                totalColecciones: coleccionesAExportar.length,
                totalRegistros: totalRegistros,
                resumen: resumen
            },
            colecciones: coleccionesAExportar,
            datos: datos
        };

        // 5. Generar nombre de archivo con timestamp: ej. backup_2025_08_20T15-00-00.json
        let nombreArchivo = `backup_${ahora.format('YYYY_MM_DD[T]HH-mm-ss')}.json`;
        let rutaCompleta = path.join(rutaCarpeta, nombreArchivo);
        let contadorSufijo = 1;

        while (true) {
            try {
                await fs.access(rutaCompleta);
                nombreArchivo = `backup_${ahora.format('YYYY_MM_DD[T]HH-mm-ss')}_${contadorSufijo}.json`;
                rutaCompleta = path.join(rutaCarpeta, nombreArchivo);
                contadorSufijo++;
            } catch (_) {
                break;
            }
        }

        // 6. Escribir archivo al disco
        await fs.writeFile(rutaCompleta, JSON.stringify(payload, null, 2), 'utf-8');

        return {
            ruta: rutaCompleta,
            archivo: nombreArchivo,
            timestamp: timestampISO,
            tipo: tipoRespaldo,
            resumen: resumen,
            totalRegistros: totalRegistros,
            colecciones: coleccionesAExportar
        };
    }
}

export default BackupService;
