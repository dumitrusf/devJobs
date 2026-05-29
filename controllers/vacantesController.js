const Vacante = require('../models/Vacantes');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads/cv');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const configuracionMulter = {
    limits: { fileSize: 150000 },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadsDir);
        },
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid format. Only PDF files are allowed'));
        }
    }
};

const upload = multer(configuracionMulter).single('cv');

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
        cerrarSesion: !!req.user,
        nombre: req.user?.nombre,
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

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;
    
    const vacante = await Vacante.findById(id);
    
    if (!vacante) {
        return res.status(404).send('Vacancy not found');
    }
    
    if(verificarAutor(vacante, req.user)){
        // Todo bien, si es el usuario, eliminar
        await vacante.deleteOne();
        res.status(200).send('Vacancy deleted successfully');
    } else {
        // no permitido
        res.status(403).send('Not authorized');
    }
};

// Verificar si el usuario es el autor de la vacante
const verificarAutor = (vacante, usuario) => {
    if (!vacante || !usuario) return false;
    return vacante.autor.toString() === usuario._id.toString();
};

// Subir archivos en PDF
const redirigirVacante = (req, res) => res.redirect(`/vacantes/${req.params.url}`);

exports.subirCV = (req, res, next) => {
    upload(req, res, (error) => {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'The file is too large. Maximum size is 150 KB');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }

            return redirigirVacante(req, res);
        }

        next();
    });
};

exports.contactar = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });

    if (!vacante) {
        return next();
    }

    if (!req.file) {
        req.flash('error', 'You must upload your CV in PDF format');
        return redirigirVacante(req, res);
    }

    vacante.candidatos.push({
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    });

    await vacante.save();

    req.flash('exito', 'Your application has been sent successfully');
    redirigirVacante(req, res);
};

exports.mostrarCandidatos = async (req, res) => {
    const vacante = await Vacante.findById(req.params.vacanteId).lean();

    if (!vacante) {
        req.flash('error', 'Vacancy not found');
        return res.redirect('/administracion');
    }

    if (!verificarAutor(vacante, req.user)) {
        req.flash('error', 'Not authorized');
        return res.redirect('/administracion');
    }

    res.render('candidatos', {
        nombrePagina: `Candidates - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        candidatos: vacante.candidatos
    });
};