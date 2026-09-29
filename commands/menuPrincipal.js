import menuClientes from './clienteCommands.js';
import menuPlanes from './planCommands.js';
import menuContratos from './contratoCommands.js';
import menuFinanzas from './finanzasCommands.js';
import menuSeguimiento from './seguimientoCommands.js';
import menuNutricion from './nutricionCommands.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import pool from '../config/database.js';

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

const mostrarMenuPrincipal = async () => {
    let salir = false;

    while(!salir){
        console.clear();
        console.log(chalk.blue.bold('============================================'));
        console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
        console.log(chalk.blue.bold('============================================'));

        const { opcion } = await inquirer.prompt([
            {
                type: 'select',
                name: 'opcion',
                message: '¿Qué módulo deseas gestionar?',
                loop: false,
                choices: [
                    {name: `1. Gestión de ${chalk.cyan('Clientes')}`, value: 'clientes'},
                    {name: `2. Gestión de ${chalk.cyan('Planes de entrenamiento')}`, value: 'planes'},
                    {name: `3. Gestión de ${chalk.cyan('Contratos')}`, value: 'contratos'},
                    {name: `4. Gestión de ${chalk.cyan('Seguimientos')}`, value: 'seguimientos'},
                    {name: `5. Gestión de ${chalk.cyan('Nutrición')}`, value: 'nutrición'},
                    {name: `6. Gestión de ${chalk.cyan('Finanzas')}`, value: 'finanzas'},
                    new inquirer.Separator(),
                    {name: chalk.red('0. Salir'), value: 'salir'}
                ]
            }
        ]);

        switch(opcion){
            case 'clientes':
                await menuClientes();
                break;
            case 'planes':
                await menuPlanes();
                break;
            case 'contratos':
                await menuContratos();
                break; 
            case 'seguimientos':
                await menuSeguimiento();
                break;
            case 'nutrición':
                await menuNutricion();
                break;
            case 'finanzas':
                await menuFinanzas();
                break;
            case 'salir':
                salir = true;
                console.log(chalk.green(`\nCerrando el sistema... Feliz día!!!`));
                
                if (pool){
                    await pool.end();
                }
                break;
        }
    }
}

export default mostrarMenuPrincipal;