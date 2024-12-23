

## Empezar una partida

**En GraphQL**

mutation {
  iniciarPartida(codiPartida: "partida1") {
    codiPartida
    estado
    jugadores
    puntos {
      jugador1
      jugador2
    }
  }
}


## Unir jugadores

**En GraphQL**

mutation {
  agregarJugador(codiPartida: "partida1", jugador: "Jugador 1") {
    codiPartida
    estado
    jugadores
    puntos {
      jugador1
      jugador2
    }
  }
}

mutation {
  agregarJugador(codiPartida: "partida1", jugador: "Jugador 2") {
    codiPartida
    estado
    jugadores
    puntos {
      jugador1
      jugador2
    }
  }
}



## Turno Jugadores

**En GraphQL**

mutation {
  hacerMovimiento(codiPartida: "partida1", jugador: "Jugador 1", movimiento: "piedra") {
    codiPartida
    estado
    jugadores
    puntos {
      jugador1
      jugador2
    }
  }
}

mutation {
  hacerMovimiento(codiPartida: "partida1", jugador: "Jugador 2", movimiento: "papel") {
    codiPartida
    estado
    jugadores
    puntos {
      jugador1
      jugador2
    }
  }
}

## Consulta Partida

**En GraphQL**

**En GraphQL**

query {
  consultarEstado(codiPartida: "partida1") {
    codiPartida
    estado
    jugadores
    puntos {
      jugador1
      jugador2
    }
    ganador
    ronda
  }
}

## Borrar partida

**En GraphQL**

mutation {
  acabarPartida(codiPartida: "partida1")
}
