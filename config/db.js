const mongoose = require('mongoose');

if (!process.env.DATABASE) {
    throw new Error('DATABASE no está definida. Configura la variable de entorno DATABASE.');
}

mongoose.connect(process.env.DATABASE);

mongoose.connection.on('open', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.log(error);
});

require('../models/Usuarios');
require('../models/Vacantes');