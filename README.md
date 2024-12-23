# Piedra, Papel o Tijera con GraphQL y Express
¡Bienvenidos al **README** de nuestro proyecto! Aquí encontrarás todo lo necesario para
jugar al clásico **Piedra, Papel o Tijera**, pero llevado a otro nivel.
Implementado con **GraphQL** y **Express**, este servidor te permitirá crear partidas,
agregar jugadores, hacer movimientos y consultar el estado de las partidas.
## Funcionalidades
1. **Iniciar partidas**
2. **Unir jugadores**
3. **Hacer movimientos**
4. **Consultar el estado de la partida**
5. **Finalizar una partida**
---
## Requisitos previos
1. Tener **Node.js** y **npm** instalados en tu máquina.
2. Instalar las dependencias ejecutando:
```bash
npm install
```
---
## Cómo usarlo
### **1. Iniciar una partida**
```graphql
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
```
---
### **2. Unir jugadores**
#### **Jugador 1**
```graphql
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
```
#### **Jugador 2**
```graphql
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

```
---
### **3. Turno de los jugadores**
#### **Movimiento del Jugador 1**
```graphql
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
```
#### **Movimiento del Jugador 2**
```graphql
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
```
---
### **4. Consultar el estado de la partida**
#### **GraphQL**
```graphql
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
```
#### **Postman**
```json
{
 "query": "query { consultarEstado(codiPartida: \"12345\") { codiPartida estado
jugadores puntos { jugador1 jugador2 } ganador } }"
}
```
---
### **5. Borrar partida**
#### **GraphQL y Postman**
```graphql
mutation {
 acabarPartida(codiPartida: "partida1")
}
```
---
## Autores
**Didac Morillas** y **Pau Morillas**