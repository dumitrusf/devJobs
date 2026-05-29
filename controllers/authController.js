const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Both fields must be filled'
});

exports.verificarUsuario = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect('/iniciar-sesion');
};

exports.mostrarPanel = async (req, res) => {
    const vacantes = await Vacante.find({ autor: req.user._id }).lean();

    res.render('administracion', {
        nombrePagina: 'Administration Panel',
        tagline: 'Create and Manage your vacancies here',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    });
};

exports.cerrarSesion = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash('exito', 'Session closed correctly');
        res.redirect('/iniciar-sesion');
    });
};

exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reset your password',
        tagline: 'If you already have an account but forgot your password, enter your email'
    });
};

exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });

    if (!usuario) {
        req.flash('error', 'That account does not exist');
        return res.redirect('/iniciar-sesion');
    }

    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    await usuario.save();

    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    // console.log(resetUrl);

    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    req.flash('exito', 'Check your email for further instructions');
    res.redirect('/iniciar-sesion');
};

exports.reestablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token
    });

    if (!usuario) {
        req.flash('error', 'This form is no longer valid, please try again');
        return res.redirect('/reestablecer-password');
    }

    res.render('nuevo-password', {
        nombrePagina: 'New Password'
    });
};

exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token
    });

    if (!usuario) {
        req.flash('error', 'This form is no longer valid, please try again');
        return res.redirect('/reestablecer-password');
    }

    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    await usuario.save();

    req.flash('exito', 'Password updated successfully');
    res.redirect('/iniciar-sesion');
};
