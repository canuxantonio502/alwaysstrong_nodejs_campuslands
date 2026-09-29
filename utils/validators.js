export const esEmailValido = (correo) => /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(correo ?? '');
export const esTelefonoValido = (telefono) => /^[0-9+\- ]{8,15}$/.test(telefono ?? '');
export const esNumeroEnRango = (valor, min, max) => typeof valor === 'number' && valor >= min && valor <= max;
export const esFechaValida = (fecha) => !isNaN(new Date(fecha).getTime());