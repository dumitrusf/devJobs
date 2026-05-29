const Vacante = require('../models/Vacantes');
const { body, validationResult } = require('express-validator');


exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Fill out the form and publish your vacancy',
        cerrarSesion: true,
        nombre: req.user.nombre,
        trix: true
    });
};

// agrega las vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

    vacante.autor = req.user._id;
    
    // crear arreglo de habilidades (skills)
    vacante.skills = req.body.skills.split(',');

    // almacenarlo en la base de datos
    const nuevaVacante = await vacante.save();

    // redireccionar a la vacante
    res.redirect(`/vacantes/${nuevaVacante.url}`);

};

// Muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor').lean();
    // si no hay resultados
    if(!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina : vacante.titulo,
        cerrarSesion: true,
        nombre: req.user.nombre,
        barra: true
    });
};

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean();

    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        trix: true,
        skillsInput: vacante.skills.join(',')
    });
};

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    } );

    res.redirect(`/vacantes/${vacante.url}`);
};

// Validar y sanitizar (express-validator v7 — el curso usa v5 con req.sanitizeBody)
exports.validarVacante = async (req, res, next) => {
    await Promise.all([
        body('titulo').trim().notEmpty().withMessage('Add a Title to the Vacancy').run(req),
        body('empresa').trim().notEmpty().withMessage('Add a Company').run(req),
        body('ubicacion').trim().notEmpty().withMessage('Add a Location').run(req),
        body('contrato').trim().notEmpty().withMessage('Select the Type of Contract').run(req),
        body('skills').trim().notEmpty().withMessage('Add at least one skill').run(req),
    ]);

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        errores.array().forEach(error => req.flash('error', error.msg));

        const skillsInput = req.body.skills || '';
        const skills = skillsInput ? skillsInput.split(',') : [];
        const datosVacante = { ...req.body, skills };

        if (!req.params.url) {
            return res.render('nueva-vacante', {
                nombrePagina: 'Nueva Vacante',
                tagline: 'Fill out the form and publish your vacancy',
                cerrarSesion: true,
                nombre: req.user.nombre,
                trix: true,
                vacante: datosVacante,
                skillsInput,
                mensajes: req.flash()
            });
        }

        const vacante = await Vacante.findOne({ url: req.params.url }).lean();

        return res.render('editar-vacante', {
            vacante: {
                ...vacante,
                ...datosVacante
            },
            nombrePagina: `Editar - ${req.body.titulo || vacante.titulo}`,
            cerrarSesion: true,
            nombre: req.user.nombre,
            trix: true,
            skillsInput,
            mensajes: req.flash()
        });
    }

    next();
};