
exports.mostrarTrabajos = async (req, res, next) => {

    res.render('home', {
        nombrePagina : 'devJobs',
        tagline: 'Find and Post Jobs for Web Developers',
        barra: true,
        boton: true,
    })
}