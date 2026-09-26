import menuClientes from './clienteCommands.js';
import menuPlanes from './planCommands.js';
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
                choices: [
                    {name: `1. Gestión de ${chalk.cyan('Clientes')}`, value: 'clientes'},
                    {name: `2. Gestión de ${chalk.cyan('Planes de entrenamiento')}`, value: 'planes'},
                    {name: `3. Gestión de ${chalk.cyan('Seguimientos')}`, value: 'seguimientos'},
                    {name: `4. Gestión de ${chalk.cyan('Nutrición')}`, value: 'nutrición'},
                    {name: `5. Gestión de ${chalk.cyan('Finanzas')}`, value: 'finanzas'},
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
            case 'seguimientos':
                console.log(chalk.yellow(`\nEntrando al módulo de Seguimientos`));
                await pausar();
                break;
            case 'nutrición':
                console.log(chalk.yellow(`\nEntrando al módulo de Nutrición`));
                await pausar();
                break;
            case 'finanzas':
                console.log(chalk.yellow(`\nEntrando al módulo de Finanzas`));
                await pausar();
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