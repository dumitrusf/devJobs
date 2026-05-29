const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');
const Vacante = require('../models/Vacantes');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Both fields must be filled'
});

// Revisar si el usuario esta autenticado o no
exports.verificarUsuario = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect('/iniciar-sesion');
};

exports.mostrarPanel = async (req, res) => {

    // consultar el usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id }).lean();
    
    res.render('administracion', {
        nombrePagina: 'Administration Panel',
        tagline: 'Create and Manage your vacancies here',
        cerrarSesion: true,
        nombre : req.user.nombre,
        // imagen : req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash('exito', 'Session closed correctly');
        res.redirect('/iniciar-sesion');
    });
};

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    const usuario = await Usuarios.findOne({ email });

    if (!usuario) {
        return done(null, false, { message: 'That user does not exist' });
    }

    if (!usuario.compararPassword(password)) {
        return done(null, false, { message: 'Password incorrect' });
    }

    return done(null, usuario);
}));

passport.serializeUser((usuario, done) => {
    done(null, usuario._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const usuario = await Usuarios.findById(id);
        done(null, usuario);
    } catch (error) {
        done(error);
    }
});
