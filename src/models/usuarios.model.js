const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuariosSchema = Schema({ 
    nombreEmpresa: String,
    usuario: String,
    password: String,
    rol: String,
    cantidadEmpleados: Number
});

module.exports = mongoose.model('Usuarios', UsuariosSchema);