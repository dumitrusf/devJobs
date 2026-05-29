const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('./config/passport');

require('dotenv').config({ path: 'variables.env' });
require('./controllers/authController');
require('./config/db');

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
app.use(express.static(path.join(__dirname, 'uploads'), { index: false }));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    name: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE })
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

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

