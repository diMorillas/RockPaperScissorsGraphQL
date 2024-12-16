const { startGame, makeMove, endGame, getGameState } = require("./gameLogic");

const resolvers = {
  Query: {
    consultarEstatPartida: (_, { codiPartida }) => {
      return getGameState(codiPartida);
    },
  },

  Mutation: {
    iniciarJoc: (_, { codiPartida }) => {
      return startGame(codiPartida);
    },
    moureJugador: (_, { codiPartida, jugador, tipusMoviment }) => {
      return makeMove(codiPartida, jugador, tipusMoviment);
    },
    acabarJoc: (_, { codiPartida }) => {
      return endGame(codiPartida);
    },
  },
};

module.exports = { resolvers };
