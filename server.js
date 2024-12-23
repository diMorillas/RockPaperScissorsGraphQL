const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

// Clase Partida para 2 jugadores
class Partida {
    constructor(codiPartida) {
        this.codiPartida = codiPartida;
        this.jugadores = []; // Jugadores
        this.movimientos = {}; // Movimientos de los jugadores
        this.estado = 'esperando'; // esperando que ambos jugadores jueguen
        this.ganador = null; // Ganador de la partida
    }

    agregarJugador(jugador) {
        if (this.jugadores.length < 2) {
            this.jugadores.push(jugador);
            return true;
        }
        return false;
    }

    hacerMovimiento(jugador, movimiento) {
        if (this.movimientos[jugador]) {
            throw new Error('El jugador ya hizo su movimiento');
        }
        this.movimientos[jugador] = movimiento;
        
        // Si ambos jugadores han hecho su movimiento, determinar el ganador
        if (Object.keys(this.movimientos).length === 2) {
            this.estado = 'jugando';
            this.determinarGanador();
        }
    }

    determinarGanador() {
        const [jugador1, jugador2] = this.jugadores;
        const movimiento1 = this.movimientos[jugador1];
        const movimiento2 = this.movimientos[jugador2];

        // Lógica de piedra, papel o tijera
        if (movimiento1 === movimiento2) {
            this.ganador = 'empate';
        } else if (
            (movimiento1 === 'piedra' && movimiento2 === 'tijera') ||
            (movimiento1 === 'papel' && movimiento2 === 'piedra') ||
            (movimiento1 === 'tijera' && movimiento2 === 'papel')
        ) {
            this.ganador = jugador1;
        } else {
            this.ganador = jugador2;
        }
    }

    consultarEstado() {
        return {
            estado: this.estado,
            jugadores: this.jugadores,
            movimientos: this.movimientos,
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
    movimientos: [String]
    ganador: String
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

const arrel = {
    consultarEstado: ({ codiPartida }) => {
        if (partidas[codiPartida]) {
            return partidas[codiPartida].consultarEstado();
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
