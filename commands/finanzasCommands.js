import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import FinanzasRepository from '../repositories/finanzasRepository.js';
import FinanzasService from '../services/finanzasService.js';

const pausar = async () => {
    console.log('\n');
    await inquirer.prompt([{ type: 'input', name: 'enter', message: `Presiona ${chalk.green('ENTER')} para continuar...` }]);
};

const mostrarMenuFinanzas = async () => {
    let salir = false;

    while (!salir) {
        console.clear();
        console.log(chalk.blue.bold('============================================'));
        console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
        console.log(chalk.blue.bold('=------------------------------------------='));
        console.log(chalk.blue.bold(`=          GESTIÓN DE MOVIMIENTOS          =`));
        console.log(chalk.blue.bold('============================================'));
        const { opcion } = await inquirer.prompt([
            {
                type: 'select',
                name: 'opcion',
                message: '¿Qué desea hacer?',
                loop: false,
                choices: [
                    { name: `1. Registrar ${chalk.green('ingreso')}`, value: 'ingreso' },
                    { name: `2. Registrar ${chalk.red('egreso')}`, value: 'egreso' },
                    { name: `3. ${chalk.cyan('Listar')} movimientos`, value: 'listar' },
                    { name: `4. Balance por ${chalk.cyan('cliente')}`, value: 'balanceCliente' },
                    { name: `5. Balance por ${chalk.cyan('rango de fechas')}`, value: 'balanceFecha' },
                    new inquirer.Separator(),
                    { name: chalk.red('0. Regresar'), value: 'regresar' }
                ]
            }
        ]);

        switch (opcion) {
            case 'ingreso': {
                console.clear();
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold(`=            REGISTRO DE INGRESO           =`));
                console.log(chalk.blue.bold('============================================'));
                const datos = await inquirer.prompt([
                    { type: 'number', name: 'idCliente', message: 'ID del cliente: ' },
                    { type: 'number', name: 'idContrato', message: 'ID del contrato: ' },
                    { type: 'input', name: 'categoria', message: 'Categoría (mensualidad, sesión individual...): ' },
                    { type: 'number', name: 'monto', message: 'Monto: ' },
                    { type: 'input', name: 'fecha', message: 'Fecha (AAAA-MM-DD): ' }
                ]);
                try {
                    const finanzasService = new FinanzasService();
                    const id = await finanzasService.registrarMovimiento({ ...datos, tipo: 'ingreso' });
                    console.log(chalk.green(`Ingreso registrado con ID: ${id}`));
                } catch (error) {
                    console.log(chalk.red(error.message));
                }
                await pausar();
                break;
            }

            case 'egreso': {
                console.clear();
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold(`=            REGISTRO DE EGRESO            =`));
                console.log(chalk.blue.bold('============================================'));
                const datos = await inquirer.prompt([
                    { type: 'input', name: 'categoria', message: 'Categoría (suplementos, servicios, gastos operativos...): ' },
                    { type: 'number', name: 'monto', message: 'Monto: ' },
                    { type: 'input', name: 'fecha', message: 'Fecha (AAAA-MM-DD): ' }
                ]);
                try {
                    const finanzasService = new FinanzasService();
                    // Un egreso NO lleva idCliente ni idContrato (regla del modelo)
                    const id = await finanzasService.registrarMovimiento({ ...datos, tipo: 'egreso' });
                    console.log(chalk.green(`Egreso registrado con ID: ${id}`));
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
                console.log(chalk.blue.bold(`=          LISTADO DE MOVIMIENTOS          =`));
                console.log(chalk.blue.bold('============================================'));
                const finanzasRepository = new FinanzasRepository();
                const movimientos = await finanzasRepository.listar();
                const table = new Table({
                    head: [chalk.cyan.bold('ID'), chalk.cyan.bold('Tipo'), chalk.cyan.bold('Categoría'), chalk.cyan.bold('Monto'), chalk.cyan.bold('Fecha'), chalk.cyan.bold('Cliente'), chalk.cyan.bold('Contrato')]
                });
                movimientos.forEach(m => table.push([
                    m.id_movimiento,
                    m.tipo === 'ingreso' ? chalk.green(m.tipo) : chalk.red(m.tipo),
                    m.categoria, m.monto, m.fecha?.toISOString().slice(0, 10), m.id_cliente ?? '-', m.id_contrato ?? '-'
                ]));
                console.log(table.toString());
                await pausar();
                break;
            }

            case 'balanceCliente': {
                console.clear();
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold(`=            BALANCE POR CLIENTE           =`));
                console.log(chalk.blue.bold('============================================'));
                const { idCliente } = await inquirer.prompt([{
                    type: 'number',
                    name: 'idCliente',
                    message: 'ID del cliente: '
                }]);
                const finanzasRepository = new FinanzasRepository();
                const balance = await finanzasRepository.balancePorCliente(idCliente);
                console.log(chalk.blue(`Ingresos: Q${balance.total_ingresos ?? 0}`));
                console.log(chalk.blue(`Egresos:  Q${balance.total_egresos ?? 0}`));
                const color = (balance.balance ?? 0) >= 0 ? chalk.green : chalk.red;
                console.log(color(`Balance:  Q${balance.balance ?? 0}`));
                await pausar();
                break;
            }

            case 'balanceFecha': {
                console.clear();
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold(`=             BALANCE POR FECHA            =`));
                console.log(chalk.blue.bold('============================================'));
                const { desde, hasta } = await inquirer.prompt([
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
                const finanzasRepository = new FinanzasRepository();
                const balance = await finanzasRepository.balancePorFecha(desde, hasta);
                console.log(chalk.blue(`Ingresos: Q${balance.total_ingresos ?? 0}`));
                console.log(chalk.blue(`Egresos:  Q${balance.total_egresos ?? 0}`));
                const color = (balance.balance ?? 0) >= 0 ? chalk.green : chalk.red;
                console.log(color(`Balance:  Q${balance.balance ?? 0}`));
                await pausar();
                break;
            }

            case 'regresar':
                salir = true;
                console.log(chalk.green('\nRegresando al menu principal...'));
        }
    }
};

export default mostrarMenuFinanzas;