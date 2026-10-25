/*
 * MI HORARIO UVP · DATOS EDITABLES
 * --------------------------------------------------------------
 * Este es el ÚNICO archivo que necesitas editar para cambiar
 * materias, salones, profesores u horas.
 *
 * Cada clase tiene cuatro campos:
 *   inicio: "08:10"  (formato de 24 horas, siempre HH:MM)
 *   fin: "09:00"
 *   materia: "Nombre de la materia"
 *   salon: "Aula 101"
 *   profesor: "Nombre" (usa "" si no aplica)
 *
 * Para agregar una clase, copia un bloque y cambia sus datos.
 * Respeta las comas entre bloques. Los días vacíos se dejan como [].
 * Puedes añadir días/materias nuevas aquí; no necesitas tocar el diseño.
 * --------------------------------------------------------------
 */
window.MI_HORARIO = {
  carrera: "Ingeniería en Agronomía",
  semestre: "Primer semestre",
  horario: {
    Lunes: [
        {
            inicio: "08:10",
            fin: "09:00",
            materia: "Matemáticas I",
            salon: "1116",
            profesor: "Cecilia"
        },
        {
            inicio: "09:10",
            fin: "10:00",
            materia: "Pensamiento Analítico y Lógico",
            salon: "1108",
            profesor: "Carlos"
        },
        {
            inicio: "10:10",
            fin: "11:00",
            materia: "Pensamiento Analítico y Lógico",
            salon: "1108",
            profesor: "Carlos"
        },
        {
            inicio: "11:10",
            fin: "12:00",
            materia: "Botánica General",
            salon: "2103",
            profesor: "Regina"
        },
        {
            inicio: "12:10",
            fin: "13:00",
            materia: "Botánica General",
            salon: "2103",
            profesor: "Regina"
        },
        {
            inicio: "13:10",
            fin: "14:00",
            materia: "Edafología",
            salon: "2103",
            profesor: "Edgar"
        }
    ],

    Martes: [
        {
            inicio: "10:10",
            fin: "11:00",
            materia: "Edafología",
            salon: "Lab. de Antropometría",
            profesor: "Edgar"
        },
        {
            inicio: "11:10",
            fin: "12:00",
            materia: "Edafología",
            salon: "Lab. de Antropometría",
            profesor: "Edgar"
        },
        {
            inicio: "12:10",
            fin: "13:00",
            materia: "Química",
            salon: "2103",
            profesor: "Asunción"
        },
        {
            inicio: "13:10",
            fin: "14:00",
            materia: "Química",
            salon: "2103",
            profesor: "Asunción"
        }
    ],

    Miércoles: [
        {
            inicio: "07:10",
            fin: "08:00",
            materia: "Matemáticas I",
            salon: "1118",
            profesor: "Cecilia"
        },
        {
            inicio: "08:10",
            fin: "09:00",
            materia: "Matemáticas I",
            salon: "1118",
            profesor: "Cecilia"
        },
        {
            inicio: "09:10",
            fin: "10:00",
            materia: "Botánica General",
            salon: "Lab. C. Bas",
            profesor: "Regina"
        },
        {
            inicio: "10:10",
            fin: "11:00",
            materia: "Botánica General",
            salon: "Lab. C. Bas",
            profesor: "Regina"
        },
        {
            inicio: "11:10",
            fin: "12:00",
            materia: "Edafología",
            salon: "1106",
            profesor: "Edgar"
        },
        {
            inicio: "12:10",
            fin: "13:00",
            materia: "Competencias Digitales",
            salon: "Lab. Info 1",
            profesor: "José"
        },
        {
            inicio: "13:10",
            fin: "14:00",
            materia: "Competencias Digitales",
            salon: "Lab. Info 1",
            profesor: "José"
        },
        {
            inicio: "17:00",
            fin: "19:00",
            materia: "Vóley",
            salon: "Actividad deportiva",
            profesor: ""
        }
    ],

    Jueves: [],

    Viernes: [
        {
            inicio: "09:10",
            fin: "10:00",
            materia: "Matemáticas I",
            salon: "1204",
            profesor: "Cecilia"
        },
        {
            inicio: "10:10",
            fin: "11:00",
            materia: "Pensamiento Analítico y Lógico",
            salon: "1123",
            profesor: "Carlos"
        },
        {
            inicio: "11:10",
            fin: "12:00",
            materia: "Autonomía, Carácter y Propósito",
            salon: "Viti",
            profesor: "Douglas"
        },
        {
            inicio: "12:10",
            fin: "13:00",
            materia: "Autonomía, Carácter y Propósito",
            salon: "Viti",
            profesor: "Douglas"
        },
        {
            inicio: "13:10",
            fin: "14:00",
            materia: "Química",
            salon: "1109",
            profesor: "Asunción"
        }
    ],

    Sábado: [
        {
            inicio: "09:00",
            fin: "11:00",
            materia: "Vóley",
            salon: "Actividad deportiva",
            profesor: ""
        }
    ],

    Domingo: []
}
};
