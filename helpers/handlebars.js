module.exports = {
  seleccionarSkills(seleccionadas, options) {
    if (typeof seleccionadas === "object" && seleccionadas.fn) {
      options = seleccionadas;
      seleccionadas = [];
    }

    const skills = [
      "HTML5",
      "CSS3",
      "CSSGrid",
      "Flexbox",
      "JavaScript",
      "JavaScript ES6",
      "jQuery",
      "Node",
      "Angular",
      "VueJS",
      "ReactJS",
      "React Hooks",
      "Redux",
      "Apollo",
      "GraphQL",
      "TypeScript",
      "PHP",
      "Laravel",
      "Symfony",
      "Python",
      "Django",
      "ORM",
      "Sequelize",
      "Mongoose",
      "SQL",
      "MVC",
      "WordPress",
    ];

    let html = "";
    skills.forEach((skill) => {
      if (seleccionadas.includes(skill)) {
        html += `<li class="activo">${skill}</li>`;
      } else {
        html += `<li>${skill}</li>`;
      }
    });

    return html;
  },

  tipoContrato: (seleccionado, opciones) => {
    return opciones
      .fn(this)
      .replace(
        new RegExp(` value="${seleccionado}"`),
        '$& selected="selected"',
      );
  },
  mostrarAlertas(mensajes, options) {
    if (typeof mensajes === 'object' && mensajes.fn) {
      options = mensajes;
      mensajes = {};
    }

    let html = '';
    Object.keys(mensajes).forEach(categoria => {
      const clase = categoria === 'exito' ? 'correcto' : categoria;

      mensajes[categoria].forEach(mensaje => {
        const items = Array.isArray(mensaje) ? mensaje : [mensaje];
        items.forEach(texto => {
          html += `<div class="${clase} alerta">${texto}</div>`;
        });
      });
    });

    return html;
  },
};
