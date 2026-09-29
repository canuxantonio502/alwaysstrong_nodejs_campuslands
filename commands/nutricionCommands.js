import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import NutricionRepository from '../repositories/nutricionRepository.js';
import NutricionService from '../services/nutricionService.js';
import PlanNutricional from '../models/planNutricional.js';

const pausar = async () => {
    console.log('\n');
    await inquirer.prompt([{ type: 'input', name: 'enter', message: `Presiona ${chalk.green('ENTER')} para continuar...` }]);
};

const mostrarMenuNutricion = async () => {
    let salir = false;

    while (!salir) {
        console.clear();
        console.log(chalk.blue.bold('============================================'));
        console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
        console.log(chalk.blue.bold('=------------------------------------------='));
        console.log(chalk.blue.bold(`=           GESTIÓN DE NUTRICIÓN           =`));
        console.log(chalk.blue.bold('============================================'));
        const { opcion } = await inquirer.prompt([
            {
                type: 'select',
                name: 'opcion',
                message: '¿Qué desea hacer?',
                loop: false,
                choices: [
                    { name: `1. ${chalk.cyan('Crear')} plan nutricional`, value: 'crearPlan' },
                    { name: `2. ${chalk.cyan('Registrar')} alimento del día`, value: 'crearAlimento' },
                    { name: `3. ${chalk.cyan('Reporte')} nutricional semanal`, value: 'reporte' },
                    new inquirer.Separator(),
                    { name: chalk.red('0. Regresar'), value: 'regresar' }
                ]
            }
        ]);

        switch (opcion) {
            case 'crearPlan': {
                console.clear();
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold(`=          CREAR PLAN NUTRICIONAL          =`));
                console.log(chalk.blue.bold('============================================'));
                const datos = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idContrato',
                        message: 'ID del contrato: '
                    },
                    {
                        type: 'input',
                        name: 'fechaInicio',
                        message: 'Fecha inicio (AAAA-MM-DD): '
                    },
                    {
                        type: 'input',
                        name: 'fechaFin',
                        message: 'Fecha fin (AAAA-MM-DD): '
                    }
                ]);
                try {
                    const plan = new PlanNutricional(datos);
                    const nutricionRepository = new NutricionRepository();
                    const id = await nutricionRepository.crearPlan(plan);
                    console.log(chalk.green(`Plan nutricional creado con ID: ${id}`));
                } catch (error) {
                    console.log(chalk.red(error.message));
                }
                await pausar();
                break;
            }

            case 'crearAlimento': {
                console.clear();
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold(`=            REGISTRAR ALIMENTO            =`));
                console.log(chalk.blue.bold('============================================'));
                const datos = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idPlanNutricional',
                        message: 'ID del plan nutricional: '
                    },
                    {
                        type: 'input',
                        name: 'fecha',
                        message: 'Fecha (AAAA-MM-DD): '
                    },
                    {
                        type: 'input',
                        name: 'nombreAlimento',
                        message: 'Nombre del alimento: '
                    },
                    {
                        type: 'number',
                        name: 'calorias',
                        message: 'Calorías estimadas: '
                    }
                ]);
                try {
                    const nutricionService = new NutricionService();
                    const id = await nutricionService.registrarAlimento(datos);
                    console.log(chalk.green(`Alimento registrado con ID: ${id}`));
                } catch (error) {
                    console.log(chalk.red(error.message));
                }
                await pausar();
                break;
            }

            case 'reporte': {
        console.clear();
        console.log(chalk.blue.bold('============================================'));
        console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
        console.log(chalk.blue.bold('=------------------------------------------='));
        console.log(chalk.blue.bold(`=        REPORTE NUTRICIONAL SEMANAL       =`));
        console.log(chalk.blue.bold('============================================'));
                const datos = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idPlanNutricional',
                        message: 'ID del plan nutricional: '
                    },
                    {
                        type: 'input',
                        name: 'desde',
                        message: 'Desde (AAAA-MM-DD): '
                    },
                    {
                        type: 'input',
                        name: 'hasta',
                        message: 'Hasta (AAAA-MM-DD): '
                    }
                ]);
                const nutricionRepository = new NutricionRepository();
                const filas = await nutricionRepository.reporteSemanal(datos.idPlanNutricional, datos.desde, datos.hasta);

                if (!filas.length) {
                    console.log(chalk.yellow('No hay registros de alimentos para ese rango.'));
                } else {
                    const table = new Table({ head: [chalk.cyan.bold('Fecha'), chalk.cyan.bold('Calorías del día')] });
                    filas.forEach(f => table.push([f.fecha?.toISOString().slice(0, 10), f.total_calorias]));
                    console.log(table.toString());
                    const promedio = filas.reduce((sum, f) => sum + Number(f.total_calorias), 0) / filas.length;
                    console.log(chalk.blue(`Promedio diario: ${promedio.toFixed(2)} kcal`));
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

export default mostrarMenuNutricion;