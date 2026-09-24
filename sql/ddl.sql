USE always_strong;

CREATE TABLE IF NOT EXISTS clientes(
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(11),
    correo VARCHAR(100) UNIQUE,
    fecha_ingreso DATE NOT NULL,
    estado ENUM('activo', 'inactivo')
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS planes_entrenamiento(
    id_plan INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) UNIQUE,
    duracion_semanas INT NOT NULL,
    metas_fisicas VARCHAR(250),
    nivel ENUM('principiante', 'intermedio', 'avanzado'),
    precio_base DECIMAL(10, 2) NOT NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contratos(
    id_contrato INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT NOT NULL,
    id_plan INT NOT NULL,
    condiciones TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado ENUM('activo', 'renovado', 'cancelado', 'finalizado'),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_plan) REFERENCES planes_entrenamiento(id_plan)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seguimientos(
    id_seguimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_contrato INT NOT NULL,
    fecha DATE NOT NULL,
    peso DECIMAL(5, 2),
    grasa_corporal DECIMAL(5, 2),
    medidas VARCHAR(255),
    foto_url VARCHAR(255),
    comentarios TEXT,
    FOREIGN KEY (id_contrato) REFERENCES contratos(id_contrato)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS planes_nutricionales(
    id_plan_nutricional INT PRIMARY KEY AUTO_INCREMENT,
    id_contrato INT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    FOREIGN KEY (id_contrato) REFERENCES contratos(id_contrato)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alimentos_dia(
    id_alimento INT PRIMARY KEY AUTO_INCREMENT,
    id_plan_nutricional INT NOT NULL,
    fecha DATE NOT NULL,
    nombre_alimento VARCHAR(100) NOT NULL,
    calorias DECIMAL(6, 2) NOT NULL,
    FOREIGN KEY (id_plan_nutricional) REFERENCES planes_nutricionales(id_plan_nutricional)
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS movimientos_financieros(
    id_movimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT,
    id_contrato INT,
    tipo ENUM('ingreso', 'egreso'),
    categoria VARCHAR(50),
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATE NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_contrato) REFERENCES contratos(id_contrato)
)ENGINE=InnoDB;



