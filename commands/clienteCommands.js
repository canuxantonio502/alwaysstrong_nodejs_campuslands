import inquirer from 'inquirer';
import chalk from 'chalk';
import pool from '../config/database.js';
import { createInterface } from 'readline/promises';
import ClienteRepository from '../repositories/clienteRepository.js';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

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

const mostrarMenuCliente = async () => {
    let salir = false;

    while(!salir){
        console.clear();
        console.log(chalk.blue.bold('============================================'));
        console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
        console.log(chalk.blue.bold('=------------------------------------------='));
        console.log(chalk.blue.bold('=            GESTIÓN DE CLIENTES           ='));
        console.log(chalk.blue.bold('============================================'));

        const { opcion } = await inquirer.prompt([
            {
                type: 'select',
                name: 'opcion',
                message: '¿Qué desea hacer?',
                choices: [
                    {name: `1. ${chalk.cyan('Crear')} un nuevo cliente`, value: 'crear'},
                    {name: `2. ${chalk.cyan('Buscar')} cliente por ID`, value: 'buscar'},
                    {name: `3. ${chalk.cyan('Listar')} todos los clientes`, value: 'listar'},
                    {name: `4. ${chalk.cyan('Actualizar')} cliente`, value: 'actualizar'},
                    {name: `5. ${chalk.cyan('Eliminar')} cliente`, value: 'eliminar'},
                    new inquirer.Separator(),
                    {name: chalk.red('0. Regresar'), value: 'regresar'}
                ]
            }
        ]);

        switch(opcion){
            case 'crear':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=         CREACIÓN DE NUEVO CLIENTE        ='));
                console.log(chalk.blue.bold('============================================'));
                await pausar();
                break;
            case 'buscar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=            BÚSQUEDA DE CLIENTE           ='));
                console.log(chalk.blue.bold('============================================'));
                await pausar();
                break;
            case 'listar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=            LISTADO DE CLIENTES           ='));
                console.log(chalk.blue.bold('============================================'));
                await pausar();
                break;
            case 'actualizar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=         ACTUALIZACIÓN DE CLIENTE         ='));
                console.log(chalk.blue.bold('============================================'));
                await pausar();
                break;
            case 'eliminar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=          ELIMINACIÓN DE CLIENTE          ='));
                console.log(chalk.blue.bold('============================================'));
                await pausar();
                break;
            case 'regresar':
                salir = true;
                console.log(chalk.green(`\nRegresando al menu principal...`));
        }
    }
}

export default mostrarMenuCliente;