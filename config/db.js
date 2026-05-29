const mongoose = require('mongoose');
const { getMongoUrl } = require('./database');

const mongoUrl = getMongoUrl();

if (!mongoUrl) {
    throw new Error(
        'No hay URL de MongoDB. Define DATABASE (Atlas) o enlaza MONGO_URL del servicio Mongo en Railway.'
    );
}

mongoose.connect(mongoUrl);

mongoose.connection.on('open', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.log(error);
});

require('../models/Usuarios');
require('../models/Vacantes');
