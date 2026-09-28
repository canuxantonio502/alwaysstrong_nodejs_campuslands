import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3'
import ContratoRepository from '../repositories/contratoRepository.js';

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

const mostrarMenuContratos = async () => {
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
                    {name: `2. ${chalk.cyan('Listar')} todos los contratos`, value: 'listar'},
                    {name: `3. ${chalk.cyan('Actualizar')} contrato`, value: 'actualizar'},
                    {name: `4. ${chalk.cyan('Cancelar')} contrato`, value: 'eliminar'},
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
                console.log(chalk.blue.bold('=            BÚSQUEDA DE CONTRATO          ='));
                console.log(chalk.blue.bold('============================================'));
                const { idContrato } = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idContrato',
                        message: 'Ingrese el ID del contrato: '
                    }
                ]);
                try {
                    const contratoRepository = new ContratoRepository();
                    const contratoHallado = await contratoRepository.buscarPorId(idContrato);
                    console.log(chalk.blue('============== Plan encontrado ============='));
                    console.log(JSON.stringify(contratoHallado, null, 2));
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
                console.log(chalk.blue.bold('=            LISTADO DE CONTRATOS          ='));
                console.log(chalk.blue.bold('============================================'));
                
                const contratoRepository = new ContratoRepository();
                const listaContratos = await contratoRepository.listar();

                // console.log(listaPlanes);

                // 1. Inicializar la tabla definiendo los encabezados con color
                const table = new Table({
                    head: [
                        chalk.cyan.bold('id_contrato'),
                        chalk.cyan.bold('id_cliente'),
                        chalk.cyan.bold('id_plan'),
                        chalk.cyan.bold('condiciones'),
                        chalk.cyan.bold('precio'),
                        chalk.cyan.bold('fecha_fin')
                    ],
                    chars: {
                        'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
                        'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
                        'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
                        'right': '║', 'right-mid': '╢', 'middle': '│'
                    } // Este bloque opcional le da un estilo de bordes dobles muy profesional
                });

                // 2. Recorrer el listado e insertar las filas
                listaContratos.forEach(contrato => {
                    table.push([
                        contrato.id_contrato,
                        contrato.id_cliente,
                        contrato.id_plan,
                        contrato.condiciones,
                        contrato.precio,
                        contrato.fecha_fin
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
                console.log(chalk.blue.bold('=         ACTUALIZACIÓN DE CONTRATO        ='));
                console.log(chalk.blue.bold('============================================'));
                const { idContratoUP } = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idContratoUP',
                        message: 'Ingrese el ID del contrato a actualizar: '
                    }
                ]);
                const actualizarContrato = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'fechaFin',
                        message: 'Ingrese la nueva fecha fin del contrato: '
                    },
                    {
                        type: 'input',
                        name: 'estado',
                        message: 'Ingrese el estado del plan: '
                    }
                ]);
                try {
                    const contratoRepository = new ContratoRepository();
                    await contratoRepository.actualizar(idContratoUP, actualizarContrato);
                    const contratoActual = await contratoRepository.buscarPorId(idContratoUP);
                    console.log(chalk.blue('============ Contrato actualizado ==========='));
                    console.log(JSON.stringify(contratoActual, null, 2));
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
                console.log(chalk.blue.bold('=          CANCELACIÓN DE CONTRATO         ='));
                console.log(chalk.blue.bold('============================================'));
                const { idContratoDE } = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idContratoDE',
                        message: 'Ingrese el ID del contrato: '
                    }
                ]);
                try {
                    const contratoRepository = new ContratoRepository();
                    await contratoRepository.eliminar(idContratoDE);
                    console.log(chalk.blue('============== Contrato cancelado =============='));
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

export default mostrarMenuContratos;