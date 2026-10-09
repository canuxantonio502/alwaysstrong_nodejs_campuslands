import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import BackupService, { COLECCIONES_DISPONIBLES } from '../services/backupService.js';
import { pausar, encabezado } from '../utils/consola.js';

const menuBackup = async () => {
    let salir = false;
    const backupService = new BackupService();

    while (!salir) {
        encabezado('COPIA DE SEGURIDAD (BACKUP)');

        const { opcion } = await inquirer.prompt([
            {
                type: 'select',
                name: 'opcion',
                message: '¿Qué tipo de respaldo deseas generar?',
                loop: false,
                choices: [
                    { name: `1. Respaldo ${chalk.green('completo')} (Todas las colecciones)`, value: 'completo' },
                    { name: `2. ${chalk.cyan('Selección')} personalizada de colecciones`, value: 'personalizado' },
                    new inquirer.Separator(),
                    { name: chalk.red('0. Regresar al menú principal'), value: 'regresar' }
                ]
            }
        ]);

        switch (opcion) {
            case 'completo': {
                try {
                    console.log(chalk.cyan('\nGenerando respaldo completo del proyecto...'));
                    const resultado = await backupService.generarBackup();

                    mostrarResultadoBackup(resultado);
                } catch (error) {
                    console.log(chalk.red(`\nError al generar el respaldo: ${error.message}`));
                }
                await pausar();
                break;
            }

            case 'personalizado': {
                const choices = COLECCIONES_DISPONIBLES.map(col => ({
                    name: `${chalk.bold(col.nombre)} - ${chalk.gray(col.descripcion)}`,
                    value: col.id
                }));

                const { seleccion } = await inquirer.prompt([
                    {
                        type: 'checkbox',
                        name: 'seleccion',
                        message: 'Seleccione las colecciones a incluir en el respaldo:',
                        choices: choices,
                        validate: (input) => {
                            if (!input || input.length === 0) {
                                return 'Debe seleccionar al menos una colección para respaldar.';
                            }
                            return true;
                        }
                    }
                ]);

                if (!seleccion || seleccion.length === 0) {
                    console.log(chalk.yellow('\nOperación cancelada: no se seleccionó ninguna colección.'));
                    await pausar();
                    break;
                }

                try {
                    console.log(chalk.cyan(`\nGenerando respaldo de ${seleccion.length} colección(es)...`));
                    const resultado = await backupService.generarBackup({ colecciones: seleccion });

                    mostrarResultadoBackup(resultado);
                } catch (error) {
                    console.log(chalk.red(`\nError al generar el respaldo: ${error.message}`));
                }
                await pausar();
                break;
            }

            case 'regresar':
                salir = true;
                break;
        }
    }
};

/**
 * Renderiza el reporte final del respaldo en una tabla estética en consola
 */
const mostrarResultadoBackup = (resultado) => {
    console.log(chalk.green.bold('\n✔ Respaldo generado satisfactoriamente.'));
    console.log(chalk.white(`Archivo:    ${chalk.yellow.bold(resultado.archivo)}`));
    console.log(chalk.white(`Ubicación:  ${chalk.cyan(resultado.ruta)}`));
    console.log(chalk.white(`Timestamp:  ${chalk.cyan(resultado.timestamp)}`));
    console.log(chalk.white(`Modalidad:  ${resultado.tipo === 'completo' ? chalk.green('Completo') : chalk.yellow('Parcial')}`));

    const table = new Table({
        head: [
            chalk.cyan.bold('Colección / Tabla'),
            chalk.cyan.bold('Registros Respaldados')
        ]
    });

    for (const [col, cantidad] of Object.entries(resultado.resumen)) {
        table.push([col, chalk.yellow(cantidad)]);
    }

    table.push([chalk.bold('TOTAL REGISTROS'), chalk.green.bold(resultado.totalRegistros)]);

    console.log('\n' + table.toString());
};

export default menuBackup;
