const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

module.exports = (opciones) => {
    const archivo = `${opciones.archivo}.handlebars`;
    const ruta = path.resolve(__dirname, '../views/emails', archivo);
    const source = fs.readFileSync(ruta, 'utf8');
    const template = handlebars.compile(source);

    return template(opciones);
};
