const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmpleadosSchema = Schema({ 
    nombre: String,
    apellido: String,
    idEmpresa: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
    puesto: String,
    departamento: String
});

module.exports = mongoose.model('Empleados', EmpleadosSchema);