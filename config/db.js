const mongoose = require('mongoose');
const { getMongoUrl } = require('./database');

const mongoUrl = getMongoUrl();

if (!mongoUrl) {
    throw new Error(
        'No MongoDB URL. Define DATABASE (Atlas) or link MONGO_URL from the Mongo service on Railway.'
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
