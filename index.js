const path = require('path');

require('./config/env');
require('./config/db');

const express = require('express');
const { engine } = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('./config/passport');
const createError = require('http-errors');
const { getMongoUrl } = require('./config/database');

const router = require('./routes');

const app = express();

// Body Parser, leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handlebars as view engine
app.engine('handlebars',
    engine({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars')
    })
);
app.set('view engine', 'handlebars');

// static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { index: false }));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    name: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: getMongoUrl() })
}));

// Alertas y flash messages
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Crear nuestro middleware
app.use((req, res, next) => {
    res.locals.usuario = req.user ? req.user.toObject() : null;
    res.locals.mensajes = req.flash();
    next();
});

app.use('/', router());

// 404 pagina no existente
app.use((req, res, next) => {
    next(createError(404, ''));
});

// Administración de los errores
app.use((error, req, res, next) => {
    const status = error.status || 500;
    res.locals.mensaje = status === 404 ? '' : error.message;
    res.locals.status = status;
    res.status(status);
    res.render('error', {
        nombrePagina: `Error ${status}`
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});