// Asegúrate de añadir esto al principio de tu archivo server.js
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Crea una instancia de la aplicación Express
const app = express();

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

/**
 * Juego Piedra-Papel-Tijera - Versión 1.0.0
 * Autores: Didac Morillas y Pau Morillas
 */

/**
 * Clase Partida para 2 jugadores.
 * Representa el estado y las acciones de una partida de Piedra, Papel o Tijera.
 */
class Partida {
    /**
     * Crea una nueva partida.
     * @param {string} codiPartida Código único de la partida.
     */
    constructor(codiPartida) {
        this.codiPartida = codiPartida;
        this.jugadores = []; // Jugadores
        this.movimientos = {}; // Movimientos de los jugadores
        this.estado = 'esperando'; // esperando que ambos jugadores jueguen
        this.puntos = { jugador1: 0, jugador2: 0 }; // Puntos de los jugadores
        this.ganador = null; // Ganador de la partida
        this.ronda = 1; // Rondas
    }

    /**
     * Agrega un jugador a la partida.
     * @param {string} jugador Nombre del jugador.
     * @returns {boolean} True si el jugador fue agregado correctamente, false si ya hay 2 jugadores.
     */
    agregarJugador(jugador) {
        if (this.jugadores.length < 2) {
            this.jugadores.push(jugador);
            return true;
        }
        return false;
    }

    /**
     * Realiza un movimiento y determina el punto correspondiente.
     * @param {string} jugador Nombre del jugador.
     * @param {string} movimiento Movimiento del jugador ('piedra', 'papel', 'tijera').
     * @throws {Error} Si el jugador ya hizo su movimiento en esta ronda.
     */
    hacerMovimiento(jugador, movimiento) {
        if (this.estado === 'finalizada') {
            throw new Error('La partida ha terminado. No se pueden hacer más movimientos.');
        }

        if (this.movimientos[jugador]) {
            throw new Error('El jugador ya hizo su movimiento en esta ronda');
        }

        this.movimientos[jugador] = movimiento;

        // Si ambos jugadores han hecho su movimiento
        if (Object.keys(this.movimientos).length === 2) {
            this.estado = 'jugando';
            this.determinarPunto();

            // Limpiar los movimientos para la siguiente ronda
            this.movimientos = {};
        }
    }

    /**
     * Determina el ganador de la ronda y actualiza los puntos.
     */
    determinarPunto() {
        const [jugador1, jugador2] = this.jugadores;
        const movimiento1 = this.movimientos[jugador1];
        const movimiento2 = this.movimientos[jugador2];

        // Lógica de piedra, papel o tijera
        if (movimiento1 === movimiento2) {
            // Empate
        } else if (
            (movimiento1 === 'piedra' && movimiento2 === 'tijera') ||
            (movimiento1 === 'papel' && movimiento2 === 'piedra') ||
            (movimiento1 === 'tijera' && movimiento2 === 'papel')
        ) {
            this.puntos.jugador1 += 1;
        } else {
            this.puntos.jugador2 += 1;
        }

        // Revisar si un jugador llega a 3 puntos (gana la partida)
        if (this.puntos.jugador1 >= 3 || this.puntos.jugador2 >= 3) {
            this.estado = 'finalizada';
            this.ganador = this.puntos.jugador1 >= 3 ? this.jugadores[0] : this.jugadores[1];
            this.mensajeFinPartida();
        } else {
            // Incrementar la ronda si la partida no ha terminado
            this.ronda += 1;
        }
    }

    /**
     * Muestra el mensaje de fin de partida.
     */
    mensajeFinPartida() {
        console.log("¡Fin de la partida! El juego ha terminado.");
    }

    /**
     * Consulta el estado de la partida.
     * @returns {Object} Estado actual de la partida, incluyendo código, estado, jugadores, puntos y ganador.
     */
    consultarEstado() {
        return {
            codiPartida: this.codiPartida,
            estado: this.estado,
            jugadores: this.jugadores,
            puntos: this.puntos,
            ganador: this.ganador,
            ronda: this.ronda
        };
    }
}

// Almacenamos las partidas activas
const partidas = {};

/**
 * Esquema GraphQL para las consultas y mutaciones.
 */
const esquema = buildSchema(`
type Partida {
    codiPartida: ID!
    estado: String
    jugadores: [String]
    puntos: Puntos
    ganador: String
    ronda: Int
}

type Puntos {
    jugador1: Int
    jugador2: Int
}

type Query {
    consultarEstado(codiPartida: ID!): Partida
}

type Mutation {
    iniciarPartida(codiPartida: ID!): Partida
    agregarJugador(codiPartida: ID!, jugador: String): Partida
    hacerMovimiento(codiPartida: ID!, jugador: String, movimiento: String): Partida
    acabarPartida(codiPartida: ID!): String
}
`);

/**
 * Resolvers para las consultas y mutaciones.
 */
const arrel = {
    consultarEstado: ({ codiPartida }) => {
        const partida = partidas[codiPartida];
        if (partida) {
            return partida.consultarEstado();
        }
        throw new Error('Partida no encontrada');
    },

    iniciarPartida: ({ codiPartida }) => {
        if (!partidas[codiPartida]) {
            partidas[codiPartida] = new Partida(codiPartida);
        }
        return partidas[codiPartida];
    },

    agregarJugador: ({ codiPartida, jugador }) => {
        if (partidas[codiPartida]) {
            const partida = partidas[codiPartida];
            if (partida.agregarJugador(jugador)) {
                return partida;
            } else {
                throw new Error('La partida ya tiene 2 jugadores');
            }
        }
        throw new Error('Partida no encontrada');
    },

    hacerMovimiento: ({ codiPartida, jugador, movimiento }) => {
        if (partidas[codiPartida]) {
            const partida = partidas[codiPartida];
            partida.hacerMovimiento(jugador, movimiento);
            return partida;
        }
        throw new Error('Partida no encontrada');
    },

    acabarPartida: ({ codiPartida }) => {
        if (partidas[codiPartida]) {
            delete partidas[codiPartida];
            return 'Partida eliminada';
        }
        throw new Error('Partida no encontrada');
    }
};

// Servir GraphQL en /graphql
app.use('/graphql', graphqlHTTP({
    schema: esquema,
    rootValue: arrel,
    graphiql: true,
}));

// Iniciar el servidor
app.listen(4000, () => {
    console.log('Servidor GraphQL corriendo en http://localhost:4000/graphql');
});
