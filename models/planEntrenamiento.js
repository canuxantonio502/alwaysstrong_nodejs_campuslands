class PlanEntrenamiento {
    constructor({nombre, duracionSemanas, metasFisicas, nivel, precioBase}){
        this.nombre = nombre;
        this.duracionSemanas = duracionSemanas;
        this.metasFisicas = metasFisicas;
        this.nivel = nivel;
        this.precioBase = precioBase;
        this.validar();
    }

    validar(){
        if (!this.nombre || this.nombre.trim().length < 3 || this.nombre.length > 100){
            throw new Error("El nombre es obligatorio y debe tener entre 3 y 100 caracteres.");
        }
        if (!this.duracionSemanas || typeof this.duracionSemanas !== 'number' || this.duracionSemanas < 1){
            throw new Error("La duración en semanas es obligatoria y debe ser mayor a 0."); 
        }
        if (this.metasFisicas && this.metasFisicas.length > 250){
            throw new Error("Las metas físicas no pueden exceder los 250 caracteres.");
        }
        const nivelesPermitidos = ['principiante', 'intermedio', 'avanzado'];
        if (this.nivel && !nivelesPermitidos.includes(this.nivel)){
            throw new Error(`El nivel debe ser: ${nivelesPermitidos.join(', ')}.`);
        }
        if (this.precioBase === undefined || typeof this.precioBase !== 'number' || this.precioBase < 0){
            throw new Error("El precio base es obligatorio y no puede ser menor a 0.")
        }
    }
}

export default PlanEntrenamiento;


/*
Prueba de creación de la clase:
const plan = new PlanEntrenamiento({
    nombre: "Espartano",
    duracionSemanas: 15,
    metasFisicas: "Esculpido y remarque muscular",
    nivel: "avanzado",
    precioBase: 5000
});

console.log("Clase creada exitosamente: ", plan);
*/