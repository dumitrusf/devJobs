document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

     // Limpiar las alertas
     let alertas = document.querySelector('.alertas');

     if(alertas) {
         limpiarAlertas();
     }

    if(skills) {
        skills.addEventListener('click', agregarSkills);
        // una vez que estamos en editar, llamar la función
        skillsSeleccionados();
    }

    const vacantesListado = document.querySelector('.panel-administracion');

    if(vacantesListado){
        vacantesListado.addEventListener('click', accionesListado);
    }

})

const skills = new Set();
const agregarSkills = e => {
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            // quitarlo del set y quitar la clase
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            // agregarlo al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    } 
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
}

