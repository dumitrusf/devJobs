const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');    
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    // Crear Vacantes
    router.get('/vacantes/nueva',
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    );
    router.post('/vacantes/nueva',
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    );

    // Eliminar Vacantes
    router.delete('/vacantes/eliminar/:id',
        authController.verificarUsuario,
        vacantesController.eliminarVacante
    );

    // Muestra una vacante
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    // Editar Vacante (auth middleware en S.36)
    router.get('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacantesController.formEditarVacante
    );
    router.post('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacante
    );

    // Crear Cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro,
        usuariosController.crearUsuario
    );
    
    // Autenticar Usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion',authController.autenticarUsuario);
    

    // Panel de administración
    router.get('/administracion',
        authController.verificarUsuario,
        authController.mostrarPanel
    );

    // Editar Perfil
    router.get('/editar-perfil', 
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.verificarUsuario,
        usuariosController.subirImagen,
        usuariosController.validarPerfil,
        usuariosController.editarPerfil
    );
    
    // cerrar sesion
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );
    
    return router;
}