const express = require('express');
const { engine } = require('express-handlebars');
const router = require('./routes');
const path = require('path');

const app = express();

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

app.use('/', router());

app.listen(5001, () => {
    console.log('Server is running on port 3000');
});

