# AlwayStrong Gym Management - NodeJS

Aplicación de línea de comandos (CLI) desarrollada en **Node.js** para que un entrenador personal o gimnasio gestione de forma integral a sus clientes: planes de entrenamiento, contratos, seguimiento físico, nutrición y finanzas. Construida aplicando Programación Orientada a Objetos, principios SOLID y patrones de diseño, con persistencia real en **MySQL** mediante transacciones.

> Proyecto individual — CampusLands, Ruta NodeJS, Guatemala 2026.

---

## Tabla de contenido

- [Descripción del proyecto](#descripción-del-proyecto)
- [Tecnologías y librerías](#tecnologías-y-librerías)
- [Instrucciones de instalación y uso](#instrucciones-de-instalación-y-uso)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Principios SOLID aplicados](#principios-solid-aplicados)
- [Patrones de diseño usados y dónde](#patrones-de-diseño-usados-y-dónde)
- [Consideraciones técnicas](#consideraciones-técnicas)
- [Planeación SCRUM](#planeación-scrum)
- [Video de presentación](#video-de-presentación)
- [Créditos](#créditos)

---

## Descripción del proyecto

Always-Strong resuelve la falta de un sistema centralizado para gestionar la operación de un gimnasio. Permite:

- **Clientes**: crear, listar, actualizar y eliminar, asociándolos a uno o varios planes de entrenamiento.
- **Planes de entrenamiento**: crear con nombre, duración, metas físicas y nivel (principiante, intermedio, avanzado); renovar, cancelar o finalizar.
- **Contratos**: se generan **automáticamente** al asignar un plan a un cliente (condiciones, precio, fechas de inicio/fin calculadas con `dayjs`).
- **Seguimiento físico**: registro semanal de peso, grasa corporal, medidas, enlace a fotos y comentarios; visualización cronológica; eliminación de registros.
- **Nutrición**: planes de alimentación por cliente/contrato, registro de alimentos por día con calorías, y reporte nutricional semanal.
- **Finanzas**: registro de ingresos y egresos, y consulta de balance por cliente o por rango de fechas.
- **Backup (Copia de seguridad)**: exportación completa o selectiva de las colecciones del sistema en formato JSON con timestamp ISO en la carpeta `/backups`.
- **Restore (Restauración)**: recuperación de datos a partir de archivos de respaldo, con validación previa de compatibilidad de estructura/esquema y confirmación explícita del usuario bajo transacciones atómicas.

Las operaciones críticas (generación de contrato, cancelación de plan, registro de movimientos financieros, y restauración de respaldos) se ejecutan dentro de **transacciones reales de MySQL** (`BEGIN` / `COMMIT` / `ROLLBACK`), garantizando que nunca queden datos inconsistentes ante un error a mitad de camino.

## Tecnologías y librerías

| Librería | Uso |
|---|---|
| [mysql2](https://www.npmjs.com/package/mysql2) | Driver de conexión a MySQL con soporte de promesas y transacciones |
| [inquirer](https://www.npmjs.com/package/inquirer) | Menús y formularios interactivos en consola |
| [chalk](https://www.npmjs.com/package/chalk) | Mensajes de éxito, advertencia y error con color |
| [dotenv](https://www.npmjs.com/package/dotenv) | Carga de variables de entorno (credenciales de BD) |
| [dayjs](https://www.npmjs.com/package/dayjs) | Cálculo y manejo de fechas (vigencia de contratos, reportes) |
| [cli-table3](https://www.npmjs.com/package/cli-table3) | Tablas legibles en consola para listados y reportes |

Requisitos: **Node.js 18+** y **MySQL 8.x**.

## Instrucciones de instalación y uso

```bash
# 1. Clonar el repositorio
git clone https://github.com/canuxantonio502/alwaysstrong_nodejs_campuslands
cd alwaysstrong_nodejs_campuslands

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con host, usuario, contraseña y nombre de la base de datos

# 4. Crear la base de datos y las tablas
mysql -u root -p < sql/ddl.sql

# 5. Iniciar la aplicación
npm start
```

Al iniciar, se muestra el menú principal con acceso a los módulos de Clientes, Planes, Contratos, Seguimiento, Nutrición y Finanzas.

## Estructura del proyecto

```
alwaysstrong_nodejs_campuslands/
├── .env.example        # Variables de entorno de ejemplo
├── .gitignore
├── package.json
├── app.js              # Punto de entrada: levanta el menú principal
├── backups/            # Almacenamiento de archivos de respaldo (.json)
├── exports/            # Exportación de progresos individuales (.json)
├── config/
│   └── database.js     # Pool de conexiones mysql2 (lee .env con dotenv)
├── models/             # Entidades con validación por campo (POO)
├── repositories/        # Patrón Repository: única capa que ejecuta SQL
│   ├── backupRepository.js     # Operaciones de persistencia y restauración atómica
│   └── ...
├── factory/
│   └── contratoFactory.js  # Patrón Factory: construcción de contratos
├── services/            # Reglas de negocio y transacciones reales
│   ├── backupService.js        # Lógica de respaldo completo/parcial y metadatos
│   ├── restoreService.js       # Validación de compatibilidad y control de restauración
│   └── ...
├── commands/            # Menús inquirer + mensajes chalk por módulo
│   ├── backupCommands.js       # UI interactiva de respaldo
│   ├── restoreCommands.js      # UI interactiva de validación y restauración
│   └── ...
├── utils/
│   ├── consola.js       # Helpers de UI reutilizables (encabezado, pausar)
│   ├── formatters.js    # Formato de fecha y moneda
│   └── validators.js    # Validaciones reutilizables
└── sql/
    ├── ddl.sql           # Definición de tablas y relaciones
    └── seed.sql          # Datos sintéticos para pruebas
```

**Flujo de dependencias**: `commands` → `services` → (`repositories` + `factory`) → `config/database`. Ningún módulo ejecuta SQL directamente salvo los `repositories`.

## Principios SOLID aplicados

- **S — Single Responsibility**: cada capa tiene una única razón de cambio. Los `models` solo validan, los `repositories` solo persisten (incluyendo `backupRepository.js`), los `services` (`backupService.js`, `restoreService.js`, etc.) solo deciden reglas de negocio y los `commands` solo interactúan con el usuario.
- **O — Open/Closed**: las colecciones y entidades a respaldar/restaurar están desacopladas en una configuración abierta a extensión, sin modificar la lógica interna de exportación o inserción SQL.
- **L — Liskov Substitution**: todos los repositories y servicios exponen contratos e interfaces consistentes, garantizando sustitución limpia y comportamiento predecible ante errores.
- **I — Interface Segregation**: la lógica de respaldo y restauración está segregada en componentes específicos (`BackupService` y `RestoreService`) en lugar de acoplar responsabilidades no relacionadas en una sola clase monolítica.
- **D — Dependency Inversion**: `BackupService` y `RestoreService` dependen de la abstracción del repositorio (`BackupRepository`) inyectada en el constructor, desacoplándose de llamadas directas a MySQL.

## Patrones de diseño usados y dónde

### Repository
**Dónde**: carpeta `/repositories` (`clienteRepository.js`, `planRepository.js`, `contratoRepository.js`, `seguimientoRepository.js`, `nutricionRepository.js`, `finanzasRepository.js`, `backupRepository.js`).

Encapsula todas las consultas SQL de las entidades y operaciones de respaldo/restauración detrás de métodos de alto nivel, aislando `mysql2` del resto del sistema.

### Factory
**Dónde**: `factory/contratoFactory.js`, usado por `services/contratoService.js`.

Centraliza la construcción de un `Contrato` a partir de un cliente y un plan: calcula `fecha_fin` con `dayjs` sumando la duración del plan, copia el precio base y arma las condiciones — evitando duplicar esa lógica en cada lugar donde se genera un contrato.

## Consideraciones técnicas

- **Transacciones reales**: implementadas en `services/contratoService.js` (cancelación de plan, con rollback de seguimientos asociados), `services/finanzasService.js` (registro de movimientos financieros) y `repositories/backupRepository.js` (restauración atómica de colecciones con desactivación/reactivación controlada de `FOREIGN_KEY_CHECKS` y rollback total ante cualquier falla).
- **Validaciones por campo**: cada clase en `/models` valida tipo de dato, campos requeridos, formatos y rangos en su propio constructor, antes de que cualquier repository intente persistirla.
- **Variables de entorno**: las credenciales de MySQL nunca se codifican directamente; se leen desde `.env` (excluido del control de versiones vía `.gitignore`).
- **Conventional Commits**: el historial de commits sigue el formato `feat:`, `fix:`, `docs:`, `refactor:`, referenciando la historia de usuario correspondiente cuando aplica (p. ej. `feat: generación automática de contrato (HU-05)`).

## Planeación SCRUM

La planeación completa (roles, sprints, requerimientos funcionales/no funcionales e historias de usuario con criterios de aceptación) está documentada en el PDF adjunto al repositorio: `docs/Planeacion_SCRUM_Always-Strong.pdf`.

## Video de presentación

Video explicando los principios y patrones aplicados, dónde se ubican en el código, y una demo funcional por consola: `https://youtu.be/bOwPztq6V8c`.

---

## :feather: Autores
He aquí los responsables de que este proyecto se haya podido llevar a cabo:

* **Antonio Canux** - *Único colaborador* - [canuxantonio502](https://github.com/canuxantonio502)

### Trainers
* **Eduin Salas** - *Trainer Colombia* - [esalascampuslands](https://github.com/esalascampuslands)
* **Andre Lopez** - *Trainer Guatemala* - [anndreloopez012](https://github.com/anndreloopez012)
