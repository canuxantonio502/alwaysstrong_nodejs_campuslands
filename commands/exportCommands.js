import inquirer from 'inquirer';
import chalk from 'chalk';
import ExportService from '../services/exportService.js';
import { pausar } from '../utils/consola.js';

const generarRespaldoProgreso = async () => {
    console.clear();
    console.log(chalk.blue.bold('============================================'));
    console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
    console.log(chalk.blue.bold('=------------------------------------------='));
    console.log(chalk.blue.bold('=           RESPALDO DE PROGRESO           ='));
    console.log(chalk.blue.bold('============================================'));

    const { idONombre } = await inquirer.prompt([
        { type: 'input', name: 'idONombre', message: 'ID o nombre del cliente: ' }
    ]);

    try {
        const exportService = new ExportService();
        const resultado = await exportService.generarRespaldoProgreso(idONombre);

        console.log(chalk.green(`\nRespaldo generado correctamente en: ${resultado.ruta}`));
        console.log(chalk.blue(` Contratos/planes incluidos: ${resultado.totalContratos}`));
        console.log(chalk.blue(` Registros de avance físico: ${resultado.totalAvances}`));
        console.log(chalk.blue(` Planes nutricionales: ${resultado.totalPlanesNutricionales}`));
    } catch (error) {
        console.log(chalk.red(`\nNo se pudo generar el respaldo: ${error}`));
    }

    await pausar();
};

export default generarRespaldoProgreso;