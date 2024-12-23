const apiUrl = 'http://localhost:4000/graphql';

// Función para iniciar la partida
function iniciarPartida() {
    const codiPartida = document.getElementById("codiPartida").value;
    const jugador1 = document.getElementById("jugador1").value;
    const jugador2 = document.getElementById("jugador2").value;
    /*document.getElementById('spookyMusic').play()*/

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

// Función para hacer el movimiento
function hacerMovimiento() {
    const codiPartida = document.getElementById("codiPartida").value;
    const jugador = document.getElementById("jugadorSeleccionado").value; // Tomamos el jugador seleccionado
    const movimiento = document.getElementById("movimientoJugador").value;

    // Validación de que el movimiento esté seleccionado
    if (!movimiento) {
        alert("Por favor, elige un movimiento.");
        return;
    }

    // Enviar la mutación de hacer el movimiento al servidor
    const query = `
        mutation {
            hacerMovimiento(codiPartida: "${codiPartida}", jugador: "${jugador}", movimiento: "${movimiento}") {
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
            console.log(response.data);
            mostrarEstado(codiPartida); // Mostrar estado después de hacer el movimiento

            // Mostrar un alert cuando el jugador haya hecho su movimiento
            alert(`${jugador} ha realizado el movimiento: ${movimiento}`);

            alternarJugador(codiPartida); // Alternar jugador después del movimiento
        })
        .catch(error => console.error("Error al hacer el movimiento:", error));
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
            <div style="opacity: 0.7;">
                <p style="color: #C21035;"><strong>Código de la partida:</strong> ${estado.codiPartida}</p>
                <p style="color: #C21035;"><strong>Estado:</strong> ${estado.estado}</p>
                <p style="color: #C21035;"><strong>Jugadores:</strong><br> ${estado.jugadores.join(" and ")}</p>
                <hr>
                <p style="color: #C21035;font-size: 24px;"><strong>Round:</strong> ${estado.ronda}</p>
                <p style="color: #C21035;"> ${estado.jugadores[0]}: ${estado.puntos.jugador1}<br> ${estado.jugadores[1]}: ${estado.puntos.jugador2}</p>
                ${estado.ganador ? `<p style="color: #C21035;"><strong>Winner:</strong> ${estado.ganador}</p>` : ''}
            </div>
            `;
            mostrarSelectJugador(estado.jugadores);
        })
        .catch(error => console.error("Error al consultar estado:", error));
}

// Mostrar el select para elegir qué jugador tira
function mostrarSelectJugador(jugadores) {
    const selectJugador = document.getElementById("jugadorSeleccionado");
    selectJugador.innerHTML = ""; // Limpiar opciones previas

    jugadores.forEach(jugador => {
        const option = document.createElement("option");
        option.value = jugador;
        option.textContent = jugador;
        selectJugador.appendChild(option);
    });

    // Habilitar el select del jugador para que se pueda cambiar entre rondas
    document.getElementById("movimiento").style.display = "block"; // Mostrar el formulario de movimiento
}

// Función para eliminar la partida
function eliminarPartida() {
    const codiPartida = document.getElementById("codiPartida").value;

    // Validación de que el código de partida esté presente
    if (!codiPartida) {
        alert("Por favor, ingresa el código de la partida.");
        return;
    }

    // Enviar la mutación para eliminar la partida
    const query = `
        mutation {
            acabarPartida(codiPartida: "${codiPartida}")
        }
    `;

    axios.post(apiUrl, { query })
        .then(response => {
            console.log(response.data);
            alert("La partida ha sido eliminada.");
            // Limpiar el estado de la partida
            limpiarEstado();
        })
        .catch(error => console.error("Error al eliminar la partida:", error));
}

// Función para limpiar el estado de la partida en la interfaz
function limpiarEstado() {
    // Limpiar los campos y ocultar el formulario de movimiento
    document.getElementById("codiPartida").value = '';
    document.getElementById("jugador1").value = '';
    document.getElementById("jugador2").value = '';
    document.getElementById("jugadorSeleccionado").innerHTML = '';
    document.getElementById("movimientoJugador").value = '';
    document.getElementById("estadoPartida").innerHTML = '';
    document.getElementById("movimiento").style.display = "none"; // Ocultar formulario de movimiento
    document.getElementById("eliminarPartidaBtn").style.display = "none"; // Ocultar botón de eliminar
}

// Actualizar el estado cada 5 segundos
setInterval(() => {
    const codiPartida = document.getElementById("codiPartida").value;
    if (codiPartida) {
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
                mostrarEstado(codiPartida); // Actualizar el estado
            })
            .catch(error => console.error("Error al consultar estado:", error));
    }
}, 5000);
