class MovimientoFinanciero {
    constructor({idCliente, idContrato, tipo, categoria, monto, fecha}){
        this.idCliente = idCliente || null;
        this.idContrato = idContrato || null;
        this.tipo = tipo;
        this.categoria = categoria;
        this.monto = monto; 
        this.fecha = new Date(fecha);
        this.validar();
    }

    validar(){
        if (isNaN(this.fecha.getTime())){
            throw new Error("La fecha es obligatoria y debe ser válida.")
        }
        const tiposPermitidos = ['ingreso', 'egreso'];
        if (this.tipo && !tiposPermitidos.includes(this.tipo)){
            throw new Error(`Los tipos permitidos son: ${tiposPermitidos}.`)
        }
        if (this.categoria && this.categoria.length > 50){
            throw new Error("La categoria no puede exceder los 50 caracteres.")
        }
        if (this.monto === undefined || typeof this.monto !== 'number' || this.monto <= 0){
            throw new Error("El monto es obligatorio y debe ser mayor a 0.")
        }
    }
}

export default MovimientoFinanciero;



const movimiento = new MovimientoFinanciero({
    tipo: 'ingreso',
    categoria: 'cuota semanal',
    monto: 400,
    fecha: '2026-09-10'
})

console.log(movimiento);
