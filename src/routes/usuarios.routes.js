const express = require('express');
const usuariosController = require('../controllers/usuarios.controller');
const md_autenticacion = require('../middlewares/auntenticacion');


var api = express.Router();

api.post('/usuarios/agregarEmpresas',md_autenticacion.Auth, usuariosController.RegistrarEmpresa);
api.put('/usuarios/editar/:idUsuario', md_autenticacion.Auth, usuariosController.EditarUsuario);
api.delete('/usuarios/eliminar/:idUsuario', md_autenticacion.Auth, usuariosController.EliminarUsuario);
api.post('/login', usuariosController.Login);

module.exports = api;