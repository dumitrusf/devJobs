const Vacante = require('../models/Vacantes');
const { body, validationResult } = require('express-validator');


exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Fill out the form and publish your vacancy',
        trix: true
    });
};

// agrega las vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

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
        barra: true
    });
};

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean();

    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        trix: true
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
        body('titulo').trim().escape().notEmpty().withMessage('Agrega un Titulo a la Vacante').run(req),
        body('empresa').trim().escape().notEmpty().withMessage('Agrega una Empresa').run(req),
        body('ubicacion').trim().escape().notEmpty().withMessage('Agrega una Ubicación').run(req),
        body('contrato').trim().escape().notEmpty().withMessage('Selecciona el Tipo de Contrato').run(req),
        body('skills').trim().escape().notEmpty().withMessage('Agrega al menos una habilidad').run(req),
    ]);

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));

        const vacante = await Vacante.findOne({ url: req.params.url }).lean();

        return res.render('editar-vacante', {
            vacante: {
                ...vacante,
                ...req.body,
                skills: req.body.skills ? req.body.skills.split(',') : vacante.skills
            },
            nombrePagina: `Editar - ${req.body.titulo || vacante.titulo}`,
            trix: true,
            mensajes: req.flash()
        });
    }

    next();
};