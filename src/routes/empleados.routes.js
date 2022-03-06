const express = require('express');
const empleadoController = require('../controllers/empleados.controller');
const md_autenticacion = require('../middlewares/auntenticacion');


var api = express.Router();


api.post('/empleados/agregar', md_autenticacion.Auth, empleadoController.agregarEmpleados);
api.put('/empleados/editar/:idEmpleado', md_autenticacion.Auth, empleadoController.editarEmpleado);
api.delete('/empleados/eliminar/:idEmpleado', md_autenticacion.Auth, empleadoController.eliminarEmpleado);
api.get('/empleados/buscarId/:idBusqueda', md_autenticacion.Auth, empleadoController.BuscarEmpleadosId);
api.get('/empleados/buscarNombre/:idBusqueda', md_autenticacion.Auth, empleadoController.BuscarEmpleadosNombre);
api.get('/empleados/buscarPuesto/:idBusqueda', md_autenticacion.Auth, empleadoController.BuscarEmpleadosPuesto);
api.get('/empleados/buscarDepartamento/:dBusqueda', md_autenticacion.Auth, empleadoController.BuscarEmpleadosDepartamento);
api.get('/empleados', md_autenticacion.Auth, empleadoController.obtenerEmpleadosPorEmpresa);
api.get('/empleados/generarPDF', md_autenticacion.Auth, empleadoController.crearPDF);

module.exports = api;