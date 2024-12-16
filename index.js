const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs } = require("./schema");
const { resolvers } = require("./resolvers");

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });

const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("Servidor corriendo en http://localhost:4000/graphql");
  });
};

startServer();
