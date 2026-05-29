const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug').default;
const shortid = require('shortid');

const vacantesSchema =  new mongoose.Schema({
    titulo: {
        type: String, 
        required: 'The name of the vacancy is required',
        trim : true
    }, 
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'The location is required'
    },
    salario: {
        type: String,
        default: 0,
        trim: true,
    },
    contrato: {
        type: String,
        trim: true,
    },
    descripcion: {
        type: String,
        trim: true,
    },
    url : {
        type: String,
        lowercase:true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv : String
    }], 
    autor : {
        type: mongoose.Schema.ObjectId, 
        ref: 'Usuarios',
        required: 'The author is required'
    }
});

vacantesSchema.pre('save', function() {
    if (!this.isNew) return;

    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;
});

// Crear un indice de texto para el buscador
vacantesSchema.index({
    titulo: 'text',
    descripcion: 'text',
    skills: 'text'
});


module.exports = mongoose.model('Vacante', vacantesSchema);