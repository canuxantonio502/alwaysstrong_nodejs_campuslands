class Cliente{
    constructor({nombre, telefono, correo, fechaIngreso, estado}){
        this.nombre = nombre;
        this.telefono = telefono;
        this.correo = correo;
        this.fechaIngreso = fechaIngreso;
        this.estado = estado;
        this.validar();
    }

    validar(){
        if(!this.nombre || this.nombre.trim().length < 3){
            throw new Error("El nombre del cliente es obligatorio (mínimo 3 caracteres).");
        }
        if(!/^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(this.correo)){
            throw new Error("Correo electrónico inválido.");
        }
        if(!/^[0-9+\- ]{8,15}$/.test(this.telefono)){
            throw new Error("Número de teléfono inválido");
        }
    }
}

export default Cliente;



//Prueba de creación de la clase:

// const cliente = new Cliente({
//     nombre: "Ana",
//     telefono: "31003100",
//     correo: "analitiac@example.com",
//     fechaIngreso: new Date(),
//     estado: 'activo'
// });

// console.log("Clase Cliente creada correctamente:", cliente);
