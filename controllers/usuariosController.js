const Usuarios = require('../models/Usuarios');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads/perfiles');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const configuracionMulter = {
    limits: { fileSize: 100000 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    })
};

exports.subirImagen = (req, res, next) => {
    multer(configuracionMulter).single('imagen')(req, res, (err) => {
        if (err) {
            const usuario = req.user.toObject();

            req.flash('error', err.message);

            return res.render('editar-perfil', {
                nombrePagina: 'Edit your profile in devJobs',
                usuario: { ...usuario, ...req.body },
                cerrarSesion: true,
                nombre: req.body.nombre || usuario.nombre,
                imagen: usuario.imagen,
                mensajes: req.flash()
            });
        }

        next();
    });
};

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Create your account in devJobs',
        tagline: 'Start publishing your vacancies for free, you only need to create an account'
    });
};

exports.validarRegistro = async (req, res, next) => {
    await Promise.all([
        body('nombre').trim().notEmpty().withMessage('The name cannot be empty').run(req),
        body('email').trim().isEmail().withMessage('Add a valid email').run(req),
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

exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Sign in devJobs'
    });
};

exports.formEditarPerfil = (req, res) => {
    const usuario = req.user.toObject();

    res.render('editar-perfil', {
        nombrePagina: 'Edit your profile in devJobs',
        usuario,
        cerrarSesion: true,
        nombre: usuario.nombre,
        imagen: usuario.imagen
    });
};

exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;

    if (req.body.password) {
        usuario.password = req.body.password;
    }

    if (req.file) {
        usuario.imagen = req.file.filename;
    }

    try {
        await usuario.save();
        req.flash('exito', 'Changes saved correctly');
        res.redirect('/administracion');
    } catch (error) {
        req.flash('error', error.message || 'Error saving profile');

        res.render('editar-perfil', {
            nombrePagina: 'Edit your profile in devJobs',
            usuario,
            cerrarSesion: true,
            nombre: req.body.nombre,
            imagen: usuario.imagen,
            mensajes: req.flash()
        });
    }
};


// sanitizar y validar el formulario de editar perfiles
exports.validarPerfil = async (req, res, next) => {
    await Promise.all([
        body('nombre').trim().notEmpty().withMessage('The name cannot be empty').run(req),
        body('email').trim().isEmail().withMessage('Add a valid email').run(req),
        body('password')
            .optional({ values: 'falsy' })
            .trim()
            .isLength({ min: 6 })
            .withMessage('The password must be at least 6 characters')
            .run(req),
    ]);

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        errores.array().forEach(error => req.flash('error', error.msg));

        const usuario = req.user.toObject();

        return res.render('editar-perfil', {
            nombrePagina: 'Edit your profile in devJobs',
            usuario: { ...usuario, ...req.body },
            cerrarSesion: true,
            nombre: req.body.nombre || usuario.nombre,
            imagen: usuario.imagen,
            mensajes: req.flash()
        });
    }

    next();
};