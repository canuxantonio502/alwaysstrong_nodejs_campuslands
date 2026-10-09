import fs from 'fs/promises';
import path from 'path';
import ClienteRepository from '../repositories/clienteRepository.js';
import ContratoRepository from '../repositories/contratoRepository.js';
import PlanEntrenamientoRepository from '../repositories/planRepository.js';
import SeguimientoRepository from '../repositories/seguimientoRepository.js';
import NutricionRepository from '../repositories/nutricionRepository.js';

const slugify = (texto) =>
    texto
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

class ExportService {
    constructor() {
        this.clienteRepository = new ClienteRepository();
        this.contratoRepository = new ContratoRepository();
        this.planRepository = new PlanEntrenamientoRepository();
        this.seguimientoRepository = new SeguimientoRepository();
        this.nutricionRepository = new NutricionRepository();
    }

    // Resolvemos si es Id o Nombre, y validamos existencia
    async _resolverCliente(idONombre) {
        const esNumero = /^\d+$/.test(String(idONombre).trim());

        if (esNumero) {
            const cliente = await this.clienteRepository.buscarPorId(Number(idONombre));
            if (!cliente) throw new Error(`No existe un cliente con ID ${idONombre}.`);
            return cliente;
        }

        const coincidencias = await this.clienteRepository.buscarPorNombre(idONombre);
        if (coincidencias.length === 0) {
            throw new Error(`No se encontró ningún cliente con nombre "${idONombre}".`);
        }
        return coincidencias[0];
    }

    async generarRespaldoProgreso(idONombre) {
        const cliente = await this._resolverCliente(idONombre);

        // listamos todos los contratos y filtramos por el cliente encontrado
        const todosLosContratos = await this.contratoRepository.listar();
        const contratosDelCliente = todosLosContratos.filter(c => c.id_cliente === cliente.id_cliente);

        // Por cada contrato, traemos el plan de entrenamiento asociado, los seguimientos físicos, y los planes nutricionales con sus alimentos.
        const todosLosSeguimientos = await this.seguimientoRepository.listar();

        const planesEntrenamiento = [];
        const avancesFisicos = [];
        const nutricion = [];

        for (const contrato of contratosDelCliente) {
            const plan = await this.planRepository.buscarPorId(contrato.id_plan);

            planesEntrenamiento.push({
                idContrato: contrato.id_contrato,
                estado: contrato.estado,
                fechaInicio: contrato.fecha_inicio,
                fechaFin: contrato.fecha_fin,
                precio: contrato.precio,
                condiciones: contrato.condiciones,
                plan: plan ? {
                    idPlan: plan.id_plan,
                    nombre: plan.nombre,
                    nivel: plan.nivel,
                    duracionSemanas: plan.duracion_semanas,
                    metasFisicas: plan.metas_fisicas
                } : null
            });

            // seguimientos de este contrato específico
            const seguimientosDeEsteContrato = todosLosSeguimientos
                .filter(s => s.id_contrato === contrato.id_contrato)
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

            seguimientosDeEsteContrato.forEach(s => avancesFisicos.push({
                idSeguimiento: s.id_seguimiento,
                idContrato: s.id_contrato,
                fecha: s.fecha,
                peso: s.peso,
                grasaCorporal: s.grasa_corporal,
                medidas: s.medidas,
                fotoUrl: s.foto_url,
                comentarios: s.comentarios
            }));

            // Planes nutricionales de este contrato, cada uno con sus alimentos
            const planesNutricionales = await this.nutricionRepository.listarPlanesPorContrato(contrato.id_contrato);
            for (const pn of planesNutricionales) {
                const alimentos = await this.nutricionRepository.listarAlimentosPorPlan(pn.id_plan_nutricional);
                nutricion.push({
                    idPlanNutricional: pn.id_plan_nutricional,
                    idContrato: pn.id_contrato,
                    fechaInicio: pn.fecha_inicio,
                    fechaFin: pn.fecha_fin,
                    alimentos: alimentos.map(a => ({
                        fecha: a.fecha,
                        nombreAlimento: a.nombre_alimento,
                        calorias: a.calorias
                    }))
                });
            }
        }

        const respaldo = {
            generadoEn: new Date().toISOString(),
            cliente: {
                idCliente: cliente.id_cliente,
                nombre: cliente.nombre,
                telefono: cliente.telefono,
                correo: cliente.correo,
                fechaIngreso: cliente.fecha_ingreso,
                estado: cliente.estado
            },
            planesEntrenamiento,
            avancesFisicos,
            nutricion
        };

        // Crear /exports si no existe, y escribir el archivo.
        const carpetaExports = path.resolve('exports');
        await fs.mkdir(carpetaExports, { recursive: true });

        const nombreArchivo = `cliente_${slugify(cliente.nombre)}_progreso.json`;
        const rutaCompleta = path.join(carpetaExports, nombreArchivo);

        await fs.writeFile(rutaCompleta, JSON.stringify(respaldo, null, 2), 'utf-8');

        return {
            ruta: rutaCompleta,
            totalContratos: planesEntrenamiento.length,
            totalAvances: avancesFisicos.length,
            totalPlanesNutricionales: nutricion.length
        };
    }
}

export default ExportService;