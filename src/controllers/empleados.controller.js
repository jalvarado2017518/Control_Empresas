const Empleados = require('../models/empleados.model');
const Usuarios = require('../models/usuarios.model');

const Pdfmake = require('pdfmake'); 

//INSERTAR EMPLEADO
function agregarEmpleados(req, res){
    var parametros = req.body;
    var empleadosModel = new Empleados();
    var usuarioModelo = new Usuarios();
        if(parametros.nombre && parametros.apellido && parametros.puesto && parametros.departamento){
            empleadosModel.nombre = parametros.nombre;
            empleadosModel.apellido = parametros.apellido;
            if(req.user.rol == 'ADMIN'){
                empleadosModel.idEmpresa = parametros.idEmpresa;
            }else if(req.user.rol == 'Empresa'){
                empleadosModel.idEmpresa = req.user.sub;
            }
            empleadosModel.puesto = parametros.puesto;
            empleadosModel.departamento = parametros.departamento;

                if(req.user.rol == 'ADMIN'){
                    return res.status(500).send({ mensaje: "Error en la petición"});
                }else{
                empleadosModel.save((err, empleadoGuardado) => {
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                    if(!empleadoGuardado) return res.status(500).send({ mensaje: "No se pudo guardar el empleado"});

                    Empleados.find({idEmpresa: req.user.sub}, (err, cantidadEmpleados) => {
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion" })
                        if(!cantidadEmpleados) return res.status(500).send({ mensaje: 'no se pudieron encontrar los empleados'})

                        Usuarios.findByIdAndUpdate({_id: req.user.sub}, {cantidadEmpleados: cantidadEmpleados.length}, (err, actualizarEmpleados) => {
                            if(err) return res.status(500).send({ mensaje: "Error en la peticion" })
                            if(!actualizarEmpleados) return res.status(500).send({ mensaje: 'no se puede actualizar la cantidad de empleados'})
    
                        })
                    })
                    return res.status(200).send({ empleado: empleadoGuardado });
                });
            }
        } else{
            return res.status(500).send({ mensaje: "Llene todos los campos, por favor" });
        }
}

//EDITAR EMPLEADO
function editarEmpleado(req, res) {//
    var idEmpleado = req.params.idEmpleado;
    var parametros = req.body;
    if(req.user.rol == 'ADMIN'){
        Empleados.findOneAndUpdate({ _id: idEmpleado},parametros,{ new: true },(error, empleadoEditado) => {
            if (error) return res.status(500).send({ Error: "Error en la peticion" });
            if (!empleadoEditado) return res.status(500).send({ Mensaje: "Esta empresa no se puede modificar" });
    
            return res.status(200).send({ empleado: empleadoEditado });
        });
    }else if(req.user.rol == 'Empresa'){
        Empleados.findOneAndUpdate({ _id: idEmpleado, idEmpresa: req.user.sub },parametros,{ new: true },(error, empleadoEditado) => {
            if (error) return res.status(500).send({ Error: "Error en la peticion" });
            if (!empleadoEditado) return res.status(500).send({ Mensaje: "Esta empresa no se puede modificar" });
    
            return res.status(200).send({ empleado: empleadoEditado });
        });
    }
    
    
}

//eliminar empleado
function eliminarEmpleado(req, res) {
    var idEmpleado = req.params.idEmpleado;
    if(req.user.rol == 'ADMIN'){
        Empleados.findOneAndDelete({ _id: idEmpleado}, {new: true}, (err, empleadoEliminado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!empleadoEliminado) return res.status(404).send({message: 'Esta empresa no se puede modificar'});
            Empleados.find({idEmpresa: req.user.sub}, (err, cantidadEmpleados) => {
                if(err) return res.status(500).send({ mensaje: "Error en la peticion" })
                if(!cantidadEmpleados) return res.status(500).send({ mensaje: 'no se han encontrado los empleados'})
                Usuarios.findByIdAndUpdate({_id: req.user.sub}, {cantidadEmpleados: cantidadEmpleados.length}, (err, actualizarEmpleados) => {
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if(!actualizarEmpleados) return res.status(500).send({ mensaje: 'no se pudo actualizar la cantidad de empleados'})
                })
            })
            return res.status(200).send({empleado: empleadoEliminado});
        }) 
    }else if(req.user.rol == 'Empresa'){
        Empleados.findOneAndDelete({ _id: idEmpleado, idEmpresa: req.user.sub }, {new: true}, (err, empleadoEliminado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!empleadoEliminado) return res.status(404).send({message: 'Esta empresa no se puede modificar'});
    
            Empleados.find({idEmpresa: req.user.sub}, (err, cantidadEmpleados) => {
                if(err) return res.status(500).send({ mensaje: "Error en la peticion" })
                if(!cantidadEmpleados) return res.status(500).send({ mensaje: 'no se han podido encontrar los empleados'})
    
                Usuarios.findByIdAndUpdate({_id: req.user.sub}, {cantidadEmpleados: cantidadEmpleados.length}, (err, actualizarEmpleados) => {
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if(!actualizarEmpleados) return res.status(500).send({ mensaje: 'no se pudo actualizar la cantidad'})
                })
            })
            return res.status(200).send({empleado: empleadoEliminado});
        }) 
    }
}

//buscar empleado por id
function BuscarEmpleadosId(req, res) {
    var busqueda = req.params.idBusqueda;
    var parametros = req.body;
    if(req.user.rol == 'ADMIN'){
        Empleados.findOne({_id: busqueda, idEmpresa: parametros.idEmpresa}, (err, usuarioEcontrado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!usuarioEcontrado) return res.status(404).send({message: 'Estos datos no han encontrado'});
    
            return res.status(200).send({usuarios: usuarioEcontrado});
        }).populate('idEmpresa', 'nombreEmpresa');
    }else{
    Empleados.findOne({_id: busqueda, idEmpresa: req.user.sub}, (err, usuarioEcontrado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioEcontrado) return res.status(404).send({message: 'Estos datos no se han encontrado'});

        return res.status(200).send({usuarios: usuarioEcontrado});
    }).populate('idEmpresa', 'nombreEmpresa');
    }
}
//buscar empleado por nombre
function BuscarEmpleadosNombre(req, res) {
    var busqueda = req.params.idBusqueda;
    var parametros = req.body;
    if(req.user.rol == 'ADMIN'){
        Empleados.find({nombre: {$regex: busqueda, $options: 'i'}, idEmpresa: parametros.idEmpresa}, (err, usuarioEcontrado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!usuarioEcontrado) return res.status(404).send({message: 'No se han podido encontrar los usuarios'}); 
            return res.status(200).send({usuarios: usuarioEcontrado});
        }).populate('idEmpresa', 'nombreEmpresa');
    }else{
        Empleados.find({nombre: {$regex: busqueda, $options: 'i'}, idEmpresa: req.user.sub}, (err, usuarioEcontrado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!usuarioEcontrado) return res.status(404).send({message: 'No se han podido encontrar los usuarios'});
    
            return res.status(200).send({usuarios: usuarioEcontrado});
        }).populate('idEmpresa', 'nombreEmpresa');
    }
    
}

function BuscarEmpleadosPuesto(req, res) {
    var busqueda = req.params.idBusqueda;
    var parametros = req.body;
    if(req.user.rol == 'ADMIN'){
        Empleados.find({puesto: {$regex: busqueda, $options: 'i'}, idEmpresa: parametros.idEmpresa}, (err, usuarioEcontrado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!usuarioEcontrado) return res.status(404).send({message: 'No se han podido encontrar los usuarios'});
            return res.status(200).send({usuarios: usuarioEcontrado});
        }).populate('idEmpresa', 'nombreEmpresa');
    }else{
        Empleados.find({puesto: {$regex: busqueda, $options: 'i'}, idEmpresa: req.user.sub}, (err, usuarioEcontrado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!usuarioEcontrado) return res.status(404).send({message: 'No se han podido encontrar los usuarios'});
            return res.status(200).send({usuarios: usuarioEcontrado});
        }).populate('idEmpresa', 'nombreEmpresa');
    }
}

function BuscarEmpleadosDepartamento(req, res) {
    var busqueda = req.params.idBusqueda;
    var parametros = req.body;
    if(req.user.rol == 'ADMIN'){
        Empleados.find({departamento: {$regex: busqueda, $options: 'i'}, idEmpresa: parametros.idEmpresa}, (err, usuarioEcontrado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!usuarioEcontrado) return res.status(404).send({message: 'No se han encontrado los usuarios'});
    
            return res.status(200).send({usuarios: usuarioEcontrado});
        }).populate('idEmpresa', 'nombreEmpresa');
    }else{
        Empleados.find({departamento: {$regex: busqueda, $options: 'i'}, idEmpresa: req.user.sub}, (err, usuarioEcontrado) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});
            if(!usuarioEcontrado) return res.status(404).send({message: 'No se han encontrado los usuarios'});
    
            return res.status(200).send({usuarios: usuarioEcontrado});
        }).populate('idEmpresa', 'nombreEmpresa');
    }
}

function obtenerEmpleadosPorEmpresa(req, res) {
    var parametros = req.body;
    if(req.user.rol == 'ADMIN'){
        Empleados.find({idEmpresa: parametros.idEmpresa}, (err, empleadosEncontrados) => {
            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
            if(!empleadosEncontrados) return res.status(404).send({mensaje: 'Error al obtener todos los empleados'});
    
            return res.status(200).send({Sus_empleados: empleadosEncontrados});
        }).populate('idEmpresa', 'nombreEmpresa');
    }else{
    Empleados.find({idEmpresa: req.user.sub}, (err, empleadosEncontrados) => {
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!empleadosEncontrados) return res.status(404).send({mensaje: 'Error al obtener todos los empleados'});

        return res.status(200).send({Sus_empleados: empleadosEncontrados});
    }).populate('idEmpresa', 'nombreEmpresa');
    }
}
//crear pdf
function crearPDF(req, res) {
    var usuario = req.user.sub
    Empleados.find({ idEmpresa: usuario }, (err, empleadoSend) => {
        if (err) return res.status(500).send({ mensaje: 'No se encontraron los empleados' });
        const fs = require('fs');
        const Pdfmake = require('pdfmake');
        var fonts = {
            Roboto: {
                normal: './fonts/roboto/Roboto-Regular.ttf',
                bold: './fonts/roboto/Roboto-Medium.ttf',
                italics: './fonts/roboto/Roboto-Italic.ttf',
                bolditalics: './fonts/roboto/Roboto-MediumItalic.ttf'
            }
        };
        let pdf = new Pdfmake(fonts);
        let content = [{
            text: 'Detalles de todos los empleados',
             fontSize: 45, 
             alignment: 'center', 
             color: '#084078',
             bold: true,
             margin: [0,0,0,20]
        }]

        for (let i = 0; i < empleadoSend.length; i++) {
            let array = i + 1;
            content.push({
                text: ' ',
            })
            content.push({
                text: ' ',
            })

            content.push({
                text: ' ',
            })

            content.push({
                text: [array + ')Empleado:'] + ' '+ empleadoSend[i].nombre,
                fontSize: 12
            })
            content.push({
                text: 'Puesto:' + ' ' + empleadoSend[i].puesto,
                fontSize: 12
            })
            content.push({
                text: 'Departamento:' + ' ' + empleadoSend[i].departamento,
                fontSize: 12
            })
            content.push({
                text: 'Nombre de la Empresa: ', 
                alignment: 'center', 
                fontSize: 20, fontFamily: 'Roboto', 
                fontWeight: 'bold'
            })
           
            content.push({
                text: empleadoSend[i].idEmpresa.nombre, 
                alignment: 'center', 
                fontSize: 20, fontFamily: 'Roboto', 
                fontWeight: 'bold'
            })

        }
        content.push({
            text: ' ',
        })
        content.push({
            text: ' ',
        })
        content.push({
            text: 'Empleados Totales:' + ' ' + empleadoSend.length, 
            alignment: 'end', 
            color: '#000000', 
            fontSize: 20,
        })


        let docDefinition = {
            contect: content,
            pageSize: {
                width: 595.28,
                height: 841.89  
              },
              background: function () {
                return {
                    canvas: [
                        {
                            type: 'rect',
                            x: 0,
                            y: 0,
                            w: 595,
                            h: 100,
                            color: '#000000'
                        },
                        {
                            type: 'rect',
                            x: 0,
                            y: 20,
                            w: 595,
                            h: 51,
                            color: '#000000'
                        }
                    ]

                }
            }
        }

        let pdfDoc = pdf.createPdfKitDocument(docDefinition, {});
        pdfDoc.pipe(fs.createWriteStream("pdfs/reporte-empleados.pdf"));
        pdfDoc.end();
    })
}

module.exports = {
    agregarEmpleados,
    editarEmpleado,
    eliminarEmpleado,
    BuscarEmpleadosId,
    BuscarEmpleadosNombre,
    BuscarEmpleadosPuesto,
    BuscarEmpleadosDepartamento,
    obtenerEmpleadosPorEmpresa,
    crearPDF
}
