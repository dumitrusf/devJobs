const Usuarios = require('../models/Usuarios');
const { body, validationResult } = require('express-validator');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Create your account in devJobs',
        tagline: 'Start publishing your vacancies for free, you only need to create an account'
    });
};

exports.validarRegistro = async (req, res, next) => {
    await Promise.all([
        body('nombre').trim().escape().notEmpty().withMessage('The name cannot be empty').run(req),
        body('email').trim().escape().isEmail().withMessage('Add a valid email').run(req),
        body('password').trim().notEmpty().withMessage('The password cannot be empty')
            .isLength({ min: 6 }).withMessage('The password must be at least 6 characters').run(req),
        body('confirmar').trim().custom(value => value === req.body.password)
            .withMessage('The password is different').run(req),
    ]);

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        errores.array().forEach(error => req.flash('error', error.msg));

        return res.render('crear-cuenta', {
            nombrePagina: 'Create your account in devJobs',
            tagline: 'Start publishing your vacancies for free, you only need to create an account',
            mensajes: req.flash(),
            nombre: req.body.nombre,
            email: req.body.email
        });
    }

    next();
};

exports.crearUsuario = async (req, res, next) => {
    const usuario = new Usuarios(req.body);

    try {
        await usuario.save();
        req.flash('exito', 'Account created correctly');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error.message || 'Error creating the account');

        res.render('crear-cuenta', {
            nombrePagina: 'Create your account in devJobs',
            tagline: 'Start publishing your vacancies for free, you only need to create an account',
            mensajes: req.flash(),
            nombre: req.body.nombre,
            email: req.body.email
        });
    }
};

