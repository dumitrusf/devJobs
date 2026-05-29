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


exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reset your password',
        tagline: 'If you already have an account but forgot your password, enter your email'
    });
};

// Genera el Token en la tabla del usuario
exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });

    if (!usuario) {
        req.flash('error', 'That account does not exist');
        return res.redirect('/reestablecer-password');
    }

    // el usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    // console.log(resetUrl);

    // Enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject : 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    // Todo correcto
    req.flash('exito', 'Check your email for further instructions');
    res.redirect('/iniciar-sesion');
};

// Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: { $gt: Date.now() }
    });

    if (!usuario) {
        req.flash('error', 'This form is no longer valid, please try again');
        return res.redirect('/reestablecer-password');
    }

    res.render('nuevo-password', {
        nombrePagina: 'New Password',
        token: req.params.token
    });
};

// almacena el nuevo password en la BD
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: { $gt: Date.now() }
    });

    // no existe el usuario o el token es invalido
    if (!usuario) {
        req.flash('error', 'This form is no longer valid, please try again');
        return res.redirect('/reestablecer-password');
    }

    // Asignar nuevo password, limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    // agregar y eliminar valores del objeto
    await usuario.save();

    req.flash('exito', 'Password updated successfully');
    res.redirect('/iniciar-sesion');
};