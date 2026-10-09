import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import path from 'path';
import RestoreService from '../services/restoreService.js';
import { pausar, encabezado } from '../utils/consola.js';

const menuRestore = async () => {
    let salir = false;
    const restoreService = new RestoreService();

    while (!salir) {
        encabezado('RESTAURACIÓN DE COPIA (RESTORE)');

        // 1. Obtener lista de respaldos disponibles
        let archivos = [];
        try {
            archivos = await restoreService.listarArchivosBackup();
        } catch (error) {
            console.log(chalk.red(`\nError al acceder a la carpeta de respaldos: ${error.message}`));
            await pausar();
            return;
        }

        const choices = [];

        if (archivos.length > 0) {
            choices.push(new inquirer.Separator('--- Respaldos disponibles en /backups ---'));
            archivos.forEach((a, index) => {
                const fechaLegible = new Date(a.fechaModificacion).toLocaleString();
                choices.push({
                    name: `${chalk.bold(a.nombre)} ${chalk.gray(`(${a.tamanoKb} KB, modificado: ${fechaLegible})`)}`,
                    value: a.ruta
                });
            });
            choices.push(new inquirer.Separator());
        }

        choices.push({ name: `Ingresar ruta manual de archivo JSON`, value: '__manual__' });
        choices.push(new inquirer.Separator());
        choices.push({ name: chalk.red('0. Regresar al menú principal'), value: 'regresar' });

        if (archivos.length === 0) {
            console.log(chalk.yellow('\nNo se encontraron archivos de respaldo en la carpeta /backups.'));
        }

        const { archivoSeleccionado } = await inquirer.prompt([
            {
                type: 'select',
                name: 'archivoSeleccionado',
                message: 'Seleccione el archivo de respaldo a restaurar:',
                choices: choices,
                loop: false
            }
        ]);

        if (archivoSeleccionado === 'regresar') {
            salir = true;
            break;
        }

        let rutaFinal = archivoSeleccionado;
        if (archivoSeleccionado === '__manual__') {
            const { rutaManual } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'rutaManual',
                    message: 'Ingrese la ruta absoluta o relativa al archivo .json de respaldo: ',
                    validate: (input) => input.trim().length > 0 ? true : 'Debe ingresar una ruta válida.'
                }
            ]);
            rutaFinal = path.resolve(rutaManual.trim());
        }

        // 2. Validación obligatoria de compatibilidad
        console.log(chalk.cyan('\nValidando compatibilidad del respaldo con el sistema y la base de datos...'));
        let validacion;
        try {
            validacion = await restoreService.validarCompatibilidad(rutaFinal);
        } catch (error) {
            console.log(chalk.red(`\nError durante el proceso de validación: ${error.message}`));
            await pausar();
            continue;
        }

        if (!validacion.esCompatible) {
            console.log(chalk.red.bold('\n✖ EL ARCHIVO NO ES COMPATIBLE PARA RESTAURACIÓN'));
            console.log(chalk.red('Se detectaron los siguientes errores de compatibilidad:'));
            validacion.errores.forEach((err, i) => {
                console.log(chalk.red(`  ${i + 1}. ${err}`));
            });

            if (validacion.advertencias.length > 0) {
                console.log(chalk.yellow('\nAdvertencias adicionales:'));
                validacion.advertencias.forEach(adv => console.log(chalk.yellow(`  • ${adv}`)));
            }

            console.log(chalk.gray('\nPor seguridad, la restauración ha sido bloqueada.'));
            await pausar();
            continue;
        }

        // Mostrar resumen de compatibilidad positiva
        console.log(chalk.green.bold('\n✔ COMPATIBILIDAD VALIDADA CORRECTAMENTE'));
        if (validacion.advertencias.length > 0) {
            console.log(chalk.yellow('\nAdvertencias detectadas:'));
            validacion.advertencias.forEach(adv => console.log(chalk.yellow(`  • ${adv}`)));
        }

        const resumen = validacion.resumen;
        console.log(chalk.white(`\nArchivo:       ${chalk.cyan.bold(resumen.archivo)}`));
        console.log(chalk.white(`Aplicación:    ${chalk.cyan(resumen.app)} (v${resumen.version})`));
        console.log(chalk.white(`Timestamp:     ${chalk.cyan(resumen.timestamp ?? 'N/A')}`));
        console.log(chalk.white(`Modalidad:     ${resumen.tipo === 'completo' ? chalk.green('Respaldo Completo') : chalk.yellow('Respaldo Parcial')}`));

        const tableDetalles = new Table({
            head: [
                chalk.cyan.bold('Colección / Tabla'),
                chalk.cyan.bold('Registros en Respaldo')
            ]
        });

        for (const [col, cant] of Object.entries(resumen.resumenColecciones)) {
            tableDetalles.push([col, chalk.yellow(cant)]);
        }
        tableDetalles.push([chalk.bold('TOTAL REGISTROS'), chalk.green.bold(resumen.totalRegistros)]);
        console.log('\n' + tableDetalles.toString());

        // 3. Opción de restaurar todas o subconjunto de colecciones
        let coleccionesARestaurar = resumen.colecciones;
        if (resumen.colecciones.length > 1) {
            const { modoRestauracion } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'modoRestauracion',
                    message: '¿Cómo desea aplicar la restauración?',
                    loop: false,
                    choices: [
                        { name: `1. Restaurar ${chalk.green('todas')} las colecciones del archivo (${resumen.colecciones.length})`, value: 'todas' },
                        { name: `2. ${chalk.cyan('Seleccionar')} colecciones específicas a restaurar`, value: 'seleccionar' },
                        new inquirer.Separator(),
                        { name: chalk.red('0. Cancelar y volver'), value: 'cancelar' }
                    ]
                }
            ]);

            if (modoRestauracion === 'cancelar') {
                console.log(chalk.yellow('\nOperación cancelada por el usuario.'));
                await pausar();
                continue;
            }

            if (modoRestauracion === 'seleccionar') {
                const { coleccionesElegidas } = await inquirer.prompt([
                    {
                        type: 'checkbox',
                        name: 'coleccionesElegidas',
                        message: 'Marque las colecciones que desea restaurar:',
                        choices: resumen.colecciones.map(c => ({
                            name: `${c} (${resumen.resumenColecciones[c] ?? 0} registros)`,
                            value: c
                        })),
                        validate: (input) => input.length > 0 ? true : 'Debe seleccionar al menos una colección.'
                    }
                ]);
                coleccionesARestaurar = coleccionesElegidas;
            }
        }

        // 4. Preguntar confirmación explícita antes de ejecutar
        console.log(chalk.yellow.bold('\n⚠️  ADVERTENCIA DE SEGURIDAD:'));
        console.log(chalk.yellow('Esta acción reemplazará los datos actuales en las colecciones seleccionadas:'));
        console.log(chalk.yellow(`[ ${coleccionesARestaurar.join(', ')} ]`));
        console.log(chalk.yellow('con la información contenida en el archivo de respaldo.'));

        const { confirmar } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmar',
                message: chalk.red.bold('¿Está seguro de que desea proceder con la restauración de la base de datos?'),
                default: false
            }
        ]);

        if (!confirmar) {
            console.log(chalk.yellow('\nOperación cancelada por el usuario. No se modificó ningún dato en la base de datos.'));
            await pausar();
            continue;
        }

        // 5. Ejecutar la restauración transaccional
        try {
            console.log(chalk.cyan('\nRestaurando información en transacción segura...'));
            const resultadoRestauracion = await restoreService.ejecutarRestauracion(
                validacion.datosBackup,
                coleccionesARestaurar
            );

            console.log(chalk.green.bold('\n✔ ¡RESTAURACIÓN COMPLETADA CON ÉXITO!'));

            const tableResultado = new Table({
                head: [
                    chalk.cyan.bold('Colección / Tabla'),
                    chalk.cyan.bold('Registros Restaurados')
                ]
            });

            for (const [col, cant] of Object.entries(resultadoRestauracion.coleccionesRestauradas)) {
                tableResultado.push([col, chalk.green(cant)]);
            }
            tableResultado.push([
                chalk.bold('TOTAL REGISTROS INSERTADOS'),
                chalk.green.bold(resultadoRestauracion.totalRegistros)
            ]);

            console.log('\n' + tableResultado.toString());
        } catch (error) {
            console.log(chalk.red.bold(`\n✖ Error crítico durante la restauración: ${error.message}`));
            console.log(chalk.yellow('La transacción fue revertida (ROLLBACK). La base de datos permanece en su estado anterior.'));
        }

        await pausar();
    }
};

export default menuRestore;
