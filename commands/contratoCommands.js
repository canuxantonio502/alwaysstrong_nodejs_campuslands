import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3'
import PlanEntrenamientoRepository from '../repositories/planRepository.js';
import Plan from '../models/planEntrenamiento.js'

const pausar = async () => {
    console.log('\n');
    await inquirer.prompt([
        {
            type: 'input',
            name: 'enter',
            message: `Presiona ${chalk.green('ENTER')} para continuar...`
        }
    ]);
}

const mostrarMenuPlanes = async () => {
    let salir = false;

    while(!salir){
        console.clear();
        console.log(chalk.blue.bold('============================================'));
        console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
        console.log(chalk.blue.bold('=------------------------------------------='));
        console.log(chalk.blue.bold('=            GESTIÓN DE CONTRATOS          ='));
        console.log(chalk.blue.bold('============================================'));

        const { opcion } = await inquirer.prompt([
            {
                type: 'select',
                name: 'opcion',
                message: '¿Qué desea hacer?',
                choices: [
                    {name: `1. ${chalk.cyan('Buscar')} contrato por ID`, value: 'buscar'},
                    {name: `2. ${chalk.cyan('Listar')} todos los planes`, value: 'listar'},
                    {name: `3. ${chalk.cyan('Actualizar')} plan`, value: 'actualizar'},
                    {name: `4. ${chalk.cyan('Eliminar')} plan`, value: 'eliminar'},
                    new inquirer.Separator(),
                    {name: chalk.red('0. Regresar'), value: 'regresar'}
                ]
            }
        ]);

        switch(opcion){

            case 'buscar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=              BÚSQUEDA DE PLAN            ='));
                console.log(chalk.blue.bold('============================================'));
                const { idPlan } = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idPlan',
                        message: 'Ingrese el ID del plan: '
                    }
                ]);
                try {
                    const planRepository = new PlanEntrenamientoRepository();
                    const planHallado = await planRepository.buscarPorId(idPlan);
                    console.log(chalk.blue('============== Plan encontrado ============='));
                    console.log(JSON.stringify(planHallado, null, 2));
                }catch(error){
                    console.log(chalk.red(error.message));
                };
                await pausar();
                break;

            case 'listar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=             LISTADO DE PLANES            ='));
                console.log(chalk.blue.bold('============================================'));
                
                const planRepository = new PlanEntrenamientoRepository();
                const listaPlanes = await planRepository.listar();

                // console.log(listaPlanes);

                // 1. Inicializar la tabla definiendo los encabezados con color
                const table = new Table({
                    head: [
                        chalk.cyan.bold('ID'),
                        chalk.cyan.bold('Nombre Plan'),
                        chalk.cyan.bold('Duración (semanas)'),
                        chalk.cyan.bold('Nivel'),
                        chalk.cyan.bold('Precio Base')
                    ],
                    chars: {
                        'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
                        'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
                        'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
                        'right': '║', 'right-mid': '╢', 'middle': '│'
                    } // Este bloque opcional le da un estilo de bordes dobles muy profesional
                });

                // 2. Recorrer el listado e insertar las filas
                listaPlanes.forEach(plan => {
                    table.push([
                        plan.id_plan,
                        plan.nombre,
                        plan.duracion_semanas,
                        plan.nivel,
                        plan.precio_base
                    ]);
                });

                // 3. Imprimir el resultado final
                console.log(table.toString());

                await pausar();
                break;
            case 'actualizar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=            ACTUALIZACIÓN PLAN            ='));
                console.log(chalk.blue.bold('============================================'));
                const { idPlanUP } = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idPlanUP',
                        message: 'Ingrese el ID del plan a actualizar: '
                    }
                ]);
                const actualizarPlan = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'nombre',
                        message: 'Ingrese el nombre del plan: '
                    },
                    {
                        type: 'number',
                        name: 'duracionSemanas',
                        message: 'Ingrese la duración del plan en semanas: '
                    },
                    {
                        type: 'input',
                        name: 'metasFisicas',
                        message: 'Ingrese las metas físicas del plan: '
                    },
                    {
                        type: 'input',
                        name: 'nivel',
                        message: 'Ingrese el nivel del plan: '
                    },
                    {
                        type: 'number',
                        name: 'precioBase',
                        message: 'Ingrese el precio base del plan: '
                    }
                ]);
                try {
                    const plan = new Plan(actualizarPlan)
                    const planRepository = new PlanEntrenamientoRepository();
                    await planRepository.actualizar(idPlanUP, plan);
                    const planActual = await planRepository.buscarPorId(idPlanUP);
                    console.log(chalk.blue('============ Cliente actualizado ==========='));
                    console.log(JSON.stringify(planActual, null, 2));
                } catch (error) {
                    console.log(chalk.red(error.message));
                }
                await pausar();
                break;
            case 'eliminar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=            ELIMINACIÓN DE PLAN           ='));
                console.log(chalk.blue.bold('============================================'));
                const { idPlanDE } = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idPlanDE',
                        message: 'Ingrese el ID del plan: '
                    }
                ]);
                try {
                    const planRepository = new PlanEntrenamientoRepository();
                    await planRepository.eliminar(idPlanDE);
                    console.log(chalk.blue('============== Plan eliminado =============='));
                }catch(error){
                    console.log(chalk.red(error.message));
                };
                await pausar();
                break;
            case 'regresar':
                salir = true;
                console.log(chalk.green(`\nRegresando al menu principal...`));
        }
    }
}

export default mostrarMenuPlanes;