import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import SeguimientoRepository from '../repositories/seguimientoRepository.js';
import ContratoRepository from '../repositories/contratoRepository.js';
import Seguimiento from '../models/seguimiento.js';

const pausar = async () => {
    console.log('\n');
    await inquirer.prompt([{ type: 'input', name: 'enter', message: `Presiona ${chalk.green('ENTER')} para continuar...` }]);
};

const mostrarMenuSeguimiento = async () => {
    let salir = false;

    while (!salir) {
        console.clear();
        console.log(chalk.blue.bold('============================================'));
        console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
        console.log(chalk.blue.bold('=------------------------------------------='));
        console.log(chalk.blue.bold(`=          GESTIÓN DE SEGUIMIENTOS         =`));
        console.log(chalk.blue.bold('============================================'));
        const { opcion } = await inquirer.prompt([
            {
                type: 'select',
                name: 'opcion',
                message: '¿Qué desea hacer?',
                loop: false,
                choices: [
                    { name: `1. ${chalk.cyan('Registrar')} avance semanal`, value: 'crear' },
                    { name: `2. ${chalk.cyan('Ver')} progreso cronológico de un contrato`, value: 'listar' },
                    { name: `3. ${chalk.red('Eliminar')} un registro`, value: 'eliminar' },
                    new inquirer.Separator(),
                    { name: chalk.red('0. Regresar'), value: 'regresar' }
                ]
            }
        ]);

        switch (opcion) {
            case 'crear': {
                console.clear();
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold(`=            REGISTRO DE AVANCE            =`));
                console.log(chalk.blue.bold('============================================'));
                const { idContrato } = await inquirer.prompt([{ type: 'number', name: 'idContrato', message: 'ID del contrato: ' }]);

                // vALIDAMOS LA EXISTENCIA DEL CONTRATO ANTES DE LA INSERCIÓN
                try {
                    const contratoRepository = new ContratoRepository();
                    const contrato = await contratoRepository.buscarPorId(idContrato);
                    if (!contrato) throw new Error(`No existe un contrato con ID ${idContrato}.`);
                    if (contrato.estado !== 'activo') throw new Error(`El contrato ${idContrato} no está activo (estado: ${contrato.estado}).`);

                    const datos = await inquirer.prompt([
                        { type: 'input', name: 'fecha', message: 'Fecha (AAAA-MM-DD): ' },
                        { type: 'number', name: 'peso', message: 'Peso (kg): ' },
                        { type: 'number', name: 'grasaCorporal', message: 'Grasa corporal (%): ' },
                        { type: 'input', name: 'medidas', message: 'Medidas adicionales: ' },
                        { type: 'input', name: 'fotoUrl', message: 'Enlace a foto (opcional): ' },
                        { type: 'input', name: 'comentarios', message: 'Comentarios: ' }
                    ]);

                    const seguimiento = new Seguimiento({ ...datos, idContrato });
                    const seguimientoRepository = new SeguimientoRepository();
                    const id = await seguimientoRepository.crear(seguimiento);
                    console.log(chalk.green(`Avance registrado con ID: ${id}`));
                } catch (error) {
                    console.log(chalk.red(error.message));
                }
                await pausar();
                break;
            }

            case 'listar': {
                console.clear();
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold(`=            PROCESO CRONOLÓGICO           =`));
                console.log(chalk.blue.bold('============================================'));
                const { idContrato } = await inquirer.prompt([{ type: 'number', name: 'idContrato', message: 'ID del contrato: ' }]);
                const seguimientoRepository = new SeguimientoRepository();
                const todos = await seguimientoRepository.listar();
                
                const delContrato = todos
                    .filter(s => s.id_contrato === idContrato)
                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // cronológico ascendente

                const table = new Table({ head: [chalk.cyan.bold('Fecha'), chalk.cyan.bold('Peso'), chalk.cyan.bold('Grasa %'), chalk.cyan.bold('Comentarios')] });
                delContrato.forEach(s => table.push([s.fecha?.toISOString().slice(0, 10), s.peso, s.grasa_corporal, s.comentarios]));
                console.log(table.toString());
                await pausar();
                break;
            }

            case 'eliminar': {
                console.clear();
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold(`=             ELIMINAR REGISTRO            =`));
                console.log(chalk.blue.bold('============================================'));
                const { idSeguimiento } = await inquirer.prompt([{ type: 'number', name: 'idSeguimiento', message: 'ID del registro a eliminar: ' }]);
                try {
                    const seguimientoRepository = new SeguimientoRepository();
                    await seguimientoRepository.eliminar(idSeguimiento);
                    console.log(chalk.green('Registro eliminado.'));
                } catch (error) {
                    console.log(chalk.red(error.message));
                }
                await pausar();
                break;
            }

            case 'regresar':
                salir = true;
                console.log(chalk.green('\nRegresando al menu principal...'));
        }
    }
};

export default mostrarMenuSeguimiento;