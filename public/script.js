const { ApolloClient, InMemoryCache, gql } = window['@apollo/client'];

// Crear cliente Apollo
const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
    cache: new InMemoryCache()
});

// Función para ejecutar mutaciones de GraphQL
function ejecutarMutation(mutation, variables) {
    return client.mutate({
        mutation: gql`${mutation}`,
        variables: variables
    });
}

// Función para ejecutar consultas de GraphQL
function ejecutarQuery(query, variables) {
    return client.query({
        query: gql`${query}`,
        variables: variables
    });
}

document.getElementById('iniciarJocBtn').addEventListener('click', () => {
    const codiPartida = document.getElementById('codiPartida').value;

    const mutation = `
        mutation {
            iniciarPartida(codiPartida: "${codiPartida}") {
                codiPartida
            }
        }
    `;
    
    ejecutarMutation(mutation).then(response => {
        alert('Partida iniciada');
    });
});

document.getElementById('agregarJugadorBtn').addEventListener('click', () => {
    const codiPartida = document.getElementById('codiPartida').value;
    const jugador1 = document.getElementById('jugador1').value;
    const jugador2 = document.getElementById('jugador2').value;

    const mutation1 = `
        mutation {
            agregarJugador(codiPartida: "${codiPartida}", jugador: "${jugador1}") {
                jugadores
            }
        }
    `;
    const mutation2 = `
        mutation {
            agregarJugador(codiPartida: "${codiPartida}", jugador: "${jugador2}") {
                jugadores
            }
        }
    `;
    
    ejecutarMutation(mutation1).then(() => {
        ejecutarMutation(mutation2).then(() => {
            alert('Jugadores agregados');
        });
    });
});

document.getElementById('hacerMovimientoBtn').addEventListener('click', () => {
    const codiPartida = document.getElementById('codiPartida').value;
    const movimiento = document.getElementById('movimiento').value;
    const jugador = document.getElementById('jugador1').value; // Lógica para elegir entre los jugadores

    const mutation = `
        mutation {
            hacerMovimiento(codiPartida: "${codiPartida}", jugador: "${jugador}", movimiento: "${movimiento}") {
                movimientos
            }
        }
    `;

    ejecutarMutation(mutation).then(() => {
        alert('Movimiento realizado');
    });
});

document.getElementById('consultarEstadoBtn').addEventListener('click', () => {
    const codiPartida = document.getElementById('codiPartida').value;

    const query = `
        query {
            consultarEstado(codiPartida: "${codiPartida}") {
                estado
                jugadores
                movimientos
                ganador
            }
        }
    `;
    
    ejecutarQuery(query).then(response => {
        const data = response.data.consultarEstado;
        document.getElementById('estadoPartida').innerHTML = `
            <p>Estado: ${data.estado}</p>
            <p>Jugadores: ${data.jugadores.join(', ')}</p>
            <p>Movimientos: ${JSON.stringify(data.movimientos)}</p>
            <p>Ganador: ${data.ganador || 'Aún no hay ganador'}</p>
        `;
    });
});

document.getElementById('acabarJocBtn').addEventListener('click', () => {
    const codiPartida = document.getElementById('codiPartida').value;

    const mutation = `
        mutation {
            acabarPartida(codiPartida: "${codiPartida}")
        }
    `;
    
    ejecutarMutation(mutation).then(() => {
        alert('Partida acabada');
    });
});
