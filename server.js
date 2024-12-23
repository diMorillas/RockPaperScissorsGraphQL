/**
 * @fileoverview
 * Juego de Piedra, Papel o Tijera implementado con GraphQL.
 * Este servidor permite iniciar partidas, agregar jugadores, hacer movimientos
 * y consultar el estado de una partida, todo gestionado a través de GraphQL.
 * 
 * @version 1.0.0
 * @author Didac Morillas, Pau Morillas
 * 
 * El juego consiste en dos jugadores que eligen entre piedra, papel o tijera,
 * donde:
 * - Piedra gana a Tijera.
 * - Tijera gana a Papel.
 * - Papel gana a Piedra.
 * El primer jugador que llegue a 3 puntos gana la partida.
 */

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Crea una instancia de la aplicación Express
const app = express();

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
     * @param {number} ronda Número de ronda (1, 2 o 3).
     * @throws {Error} Si el jugador ya hizo su movimiento en esta ronda.
     */
    hacerMovimiento(jugador, movimiento, ronda) {
        if (this.movimientos[jugador]) {
            throw new Error('El jugador ya hizo su movimiento en esta ronda');
        }
        this.movimientos[jugador] = movimiento;

        // Si ambos jugadores han hecho su movimiento
        if (Object.keys(this.movimientos).length === 2) {
            this.estado = 'jugando';
            this.determinarPunto(ronda);

            // Limpiar los movimientos para la siguiente ronda
            this.movimientos = {};
        }
    }

    /**
     * Determina el ganador de la ronda y actualiza los puntos.
     * @param {number} ronda Número de la ronda (1, 2 o 3).
     */
    determinarPunto(ronda) {
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
            // Jugador 1 gana la ronda
            this.puntos.jugador1 += 1;
        } else {
            // Jugador 2 gana la ronda
            this.puntos.jugador2 += 1;
        }

        // Revisar si un jugador llega a 3 puntos (gana la partida)
        if (this.puntos.jugador1 === 3) {
            this.estado = 'finalizada';
            this.ganador = jugador1;
        } else if (this.puntos.jugador2 === 3) {
            this.estado = 'finalizada';
            this.ganador = jugador2;
        }
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
            ganador: this.ganador
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
    hacerMovimiento(codiPartida: ID!, jugador: String, movimiento: String, ronda: Int): Partida
    acabarPartida(codiPartida: ID!): String
}
`);

/**
 * Resolvers para las consultas y mutaciones.
 */
const arrel = {
    /**
     * Consulta el estado de una partida.
     * @param {Object} args Argumentos de la consulta.
     * @param {string} args.codiPartida Código de la partida.
     * @returns {Object} El estado de la partida.
     */
    consultarEstado: ({ codiPartida }) => {
        const partida = partidas[codiPartida];
        if (partida) {
            return {
                codiPartida: partida.codiPartida,
                estado: partida.estado,
                jugadores: partida.jugadores,
                puntos: partida.puntos,
                ganador: partida.ganador
            };
        }
        throw new Error('Partida no encontrada');
    },

    /**
     * Inicia una nueva partida.
     * @param {Object} args Argumentos de la mutación.
     * @param {string} args.codiPartida Código de la nueva partida.
     * @returns {Object} La nueva partida creada.
     */
    iniciarPartida: ({ codiPartida }) => {
        if (!partidas[codiPartida]) {
            partidas[codiPartida] = new Partida(codiPartida);
        }
        return partidas[codiPartida];
    },

    /**
     * Agrega un jugador a una partida.
     * @param {Object} args Argumentos de la mutación.
     * @param {string} args.codiPartida Código de la partida.
     * @param {string} args.jugador Nombre del jugador.
     * @returns {Object} La partida con el jugador agregado.
     * @throws {Error} Si la partida ya tiene 2 jugadores.
     */
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

    /**
     * Realiza un movimiento en una partida.
     * @param {Object} args Argumentos de la mutación.
     * @param {string} args.codiPartida Código de la partida.
     * @param {string} args.jugador Nombre del jugador.
     * @param {string} args.movimiento Movimiento del jugador ('piedra', 'papel', 'tijera').
     * @param {number} args.ronda Número de ronda (1, 2 o 3).
     * @returns {Object} La partida después de realizar el movimiento.
     * @throws {Error} Si la partida no existe.
     */
    hacerMovimiento: ({ codiPartida, jugador, movimiento, ronda }) => {
        if (partidas[codiPartida]) {
            const partida = partidas[codiPartida];
            partida.hacerMovimiento(jugador, movimiento, ronda);
            return partida;
        }
        throw new Error('Partida no encontrada');
    },

    /**
     * Elimina una partida.
     * @param {Object} args Argumentos de la mutación.
     * @param {string} args.codiPartida Código de la partida a eliminar.
     * @returns {string} Mensaje de éxito.
     * @throws {Error} Si la partida no existe.
     */
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
