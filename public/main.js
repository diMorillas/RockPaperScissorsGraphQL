const apiUrl = 'http://localhost:4000/graphql';

// Función para iniciar la partida
function iniciarPartida() {
    const codiPartida = document.getElementById("codiPartida").value;
    const jugador1 = document.getElementById("jugador1").value;
    const jugador2 = document.getElementById("jugador2").value;

    // Validación de campos obligatorios
    if (!codiPartida || !jugador1 || !jugador2) {
        alert("Por favor, ingresa el código de la partida y los nombres de ambos jugadores.");
        return;
    }

    // Enviar la mutación de iniciar partida al servidor
    const query = `
        mutation {
            iniciarPartida(codiPartida: "${codiPartida}") {
                codiPartida
                estado
                jugadores
            }
        }
    `;
    
    axios.post(apiUrl, { query })
        .then(response => {
            // Mostrar la respuesta del servidor
            console.log(response.data);
            agregarJugador(codiPartida, jugador1);
            agregarJugador(codiPartida, jugador2);
        })
        .catch(error => console.error("Error al iniciar la partida:", error));
}

// Función para agregar un jugador a la partida
function agregarJugador(codiPartida, jugador) {
    const query = `
        mutation {
            agregarJugador(codiPartida: "${codiPartida}", jugador: "${jugador}") {
                codiPartida
                jugadores
            }
        }
    `;

    axios.post(apiUrl, { query })
        .then(response => {
            console.log(response.data);
            mostrarEstado(codiPartida); // Mostrar estado después de agregar el jugador
        })
        .catch(error => console.error("Error al agregar jugador:", error));
}

// Función para consultar el estado de la partida
function mostrarEstado(codiPartida) {
    const query = `
        query {
            consultarEstado(codiPartida: "${codiPartida}") {
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
    `;
    
    axios.post(apiUrl, { query })
        .then(response => {
            const estado = response.data.data.consultarEstado;
            const estadoDiv = document.getElementById("estadoPartida");
            estadoDiv.innerHTML = `
                <p><strong>Código de la partida:</strong> ${estado.codiPartida}</p>
                <p><strong>Estado:</strong> ${estado.estado}</p>
                <p><strong>Jugadores:</strong> ${estado.jugadores.join(", ")}</p>
                <p><strong>Puntos:</strong> Jugador 1: ${estado.puntos.jugador1}, Jugador 2: ${estado.puntos.jugador2}</p>
                <p><strong>Ronda:</strong> ${estado.ronda}</p>
                ${estado.ganador ? `<p><strong>Ganador:</strong> ${estado.ganador}</p>` : ''}
            `;
        })
        .catch(error => console.error("Error al consultar estado:", error));
}
