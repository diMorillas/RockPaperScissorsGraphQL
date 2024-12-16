let games = {}; // Simula una base de datos de partidas

const startGame = (codiPartida) => {
  if (games[codiPartida]) return games[codiPartida]; // Si ya existe, retorna el estado

  games[codiPartida] = {
    codiPartida,
    jugador1: null,
    jugador2: null,
    estat: "esperando", // esperando jugadores
    guanyador: null,
    historial: [],
  };

  return games[codiPartida];
};

const makeMove = (codiPartida, jugador, tipusMoviment) => {
  const game = games[codiPartida];

  if (!game) return { error: "Partida no encontrada" };

  if (game.estat === "esperando") {
    // Si aún se están esperando jugadores, se asignan
    if (!game.jugador1) {
      game.jugador1 = jugador;
    } else if (!game.jugador2) {
      game.jugador2 = jugador;
    }

    if (game.jugador1 && game.jugador2) {
      game.estat = "jugando";
    }
  }

  // Comprobar que ambos jugadores han jugado
  if (game.estat === "jugando") {
    game.historial.push(`${jugador} eligió ${tipusMoviment}`);
    
    if (game.historial.length === 2) {
      const [move1, move2] = game.historial.slice(-2);
      const result = checkWinner(move1, move2);

      game.guanyador = result.winner;
      game.estat = "finalizado";
    }
  }

  return game;
};

const endGame = (codiPartida) => {
  const game = games[codiPartida];

  if (game) {
    delete games[codiPartida]; // Elimina la partida de la "base de datos"
    return "Juego terminado y datos eliminados";
  }

  return "Partida no encontrada";
};

const getGameState = (codiPartida) => {
  return games[codiPartida] || null;
};

// Lógica para determinar el ganador
const checkWinner = (move1, move2) => {
  const moves = {
    piedra: 0,
    papel: 1,
    tijera: 2,
  };

  const move1Choice = move1.split(" ")[2].toLowerCase();
  const move2Choice = move2.split(" ")[2].toLowerCase();

  const result = (moves[move1Choice] - moves[move2Choice] + 3) % 3;

  if (result === 0) {
    return { winner: "Empate" };
  }

  return result === 1
    ? { winner: "Jugador 1" }
    : { winner: "Jugador 2" };
};

module.exports = { startGame, makeMove, endGame, getGameState };
