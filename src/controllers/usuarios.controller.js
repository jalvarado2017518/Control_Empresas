const Usuarios = require('../models/usuarios.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../service/jwt');

//TERMINADO
function UsuarioPrincipal(){ 
    Usuarios.find({rol: 'Admin', usuario: 'Admin'}, (err, usuarioEcontrado) => {
        if(usuarioEcontrado.length ==0){
            bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                Usuarios.create({
                    nombreEmpresa: null,
                    usuario: 'Admin',
                    password: passwordEncriptada,
                    rol: 'Admin',
                    cantidadEmpleados: null
                })
            });
        }
    })
}

//editar TERMINADO
function EditarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;
    var parametros = req.body;
   if(req.user.rol == 'Empresa'){
    if(idUsuario !== req.user.sub) return res.status(500).send({mensaje: 'Usted no tiene permitido editar otras empresas'});
    Usuarios.findByIdAndUpdate(idUsuario, parametros, {new: true}, (err, usuarioActualizado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioActualizado) return res.status(404).send({message: 'No se encontro el usuario'});

        return res.status(200).send({empresa: usuarioActualizado});
    });
   }else{
    Usuarios.findByIdAndUpdate(idUsuario, parametros, {new: true}, (err, usuarioActualizado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioActualizado) return res.status(404).send({message: 'No se han encontrado los usuarios'});
        return res.status(200).send({usuarios: usuarioActualizado});
    });
   }
}

//agregar empresa TERMINADO
function RegistrarEmpresa(req, res){
    var parametros = req.body;
    var usuarioModelo = new Usuarios();
    
    if(req.user.rol == 'Empresa'){
        return res.status(500).send({mensaje: 'No tienes acceso a crear empresas'});
    }else{
        if (parametros.nombre && parametros.usuario && parametros.password) {
            usuarioModelo.nombreEmpresa = parametros.nombreEmpresa;
            usuarioModelo.usuario = parametros.usuario;
            usuarioModelo.rol = 'Empresa';   
            usuarioModelo.cantidadEmpleados = 0;
            Usuarios.find({usuario: parametros.usuario}, (err, usuarioEcontrado) => {
                if(usuarioEcontrado == 0){
                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModelo.password = passwordEncriptada;
                        usuarioModelo.save((err, usuarioGuardado) => {
                            if(err) return res.status(500).send({message: 'Error en la peticion'});
                            if(!usuarioGuardado) return res.status(404).send({message: 'No se encontraron usuarios'});
                            return res.status(200).send({usuario: usuarioGuardado});
                        });
                    });
                }else{
                    return res.status(500).send({mensaje: 'Ingrese otro tipo de usuario'});
                }                 
            })
        }else{
            return res.status(500).send({mensaje: 'Llene todos los campos'});
        }
    } 
}

//eliminar TERMINADO
function EliminarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;

    if(req.user.rol == 'Empresa'){
        if(idUsuario !== req.user.sub) return res.status(500).send({mensaje: 'Usted no tiene permitido eliminar otras empresas'});
        Usuarios.findByIdAndDelete(idUsuario, {new: true}, (err, usuarioEliminado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioEliminado) return res.status(404).send({message: 'No se han encontraron usuarios'});

        return res.status(200).send({empresa: usuarioEliminado});
    })
    }else if(req.user.rol == 'ADMIN'){
        Usuarios.findByIdAndDelete(idUsuario, {new: true}, (err, usuarioEliminado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!usuarioEliminado) return res.status(404).send({message: 'No se han encontraron usuarios'});
    
            return res.status(200).send({usuarios: usuarioEliminado});
        })
    }else{
        return res.status(500).send({mensaje: 'Error en la petición'})
    }

    
}

//login TERMINADO
function Login(req, res) {
    var parametros = req.body;

    Usuarios.findOne({usuario: parametros.usuario}, (err, usuarioEcontrado) =>{
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(usuarioEcontrado){
            bcrypt.compare(parametros.password, usuarioEcontrado.password, (err, verificacionPassword)=>{
                if(verificacionPassword){
                    if(parametros.obtenerToken === 'true'){
                        return res.status(500).send({token: jwt.crearToken(usuarioEcontrado)});
                    }else{
                        usuarioEcontrado.password = undefined;
                        return res.status(200).send({usuario: usuarioEcontrado});
                    }
                }else{
                    return res.status(500).send({message: 'la contraseña no coincide'});
                }
            });

        }else{
            return res.status(500).send({mensaje: 'Error en la petición'});
        }
    });
}

module.exports = {
    UsuarioPrincipal,
    EditarUsuario,
    RegistrarEmpresa,
    EliminarUsuario,
    Login
    }