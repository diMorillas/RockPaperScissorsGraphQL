const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Crea una instancia de la aplicación Express
const app = express();

// Clase Partida para 2 jugadores
class Partida {
    constructor(codiPartida) {
        this.codiPartida = codiPartida;
        this.jugadores = []; // Jugadores
        this.movimientos = {}; // Movimientos de los jugadores
        this.estado = 'esperando'; // esperando que ambos jugadores jueguen
        this.puntos = { jugador1: 0, jugador2: 0 }; // Puntos de los jugadores
        this.ganador = null; // Ganador de la partida
    }

    agregarJugador(jugador) {
        if (this.jugadores.length < 2) {
            this.jugadores.push(jugador);
            return true;
        }
        return false;
    }

    // Función para hacer un movimiento y determinar el punto correspondiente
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

    // Función para determinar el ganador de cada ronda y actualizar los puntos
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

// Esquema GraphQL
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

// Resolver para consultas y mutaciones
const arrel = {
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

    hacerMovimiento: ({ codiPartida, jugador, movimiento, ronda }) => {
        if (partidas[codiPartida]) {
            const partida = partidas[codiPartida];
            partida.hacerMovimiento(jugador, movimiento, ronda);
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
