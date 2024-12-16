const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Query {
    consultarEstatPartida(codiPartida: String!): GameState
  }

  type Mutation {
    iniciarJoc(codiPartida: String!): GameState
    moureJugador(codiPartida: String!, jugador: String!, tipusMoviment: String!): GameState
    acabarJoc(codiPartida: String!): String
  }

  type GameState {
    codiPartida: String!
    jugador1: String
    jugador2: String
    estat: String
    guanyador: String
    historial: [String]
  }
`;

module.exports = { typeDefs };