// app.js - Inicialização e configuração principal

import { initializeState, state } from './state.js';
import { initAuth } from './auth.js';
import { initRooms } from './rooms.js';
import { initSocketHandlers, socket } from './socket-handler.js';
import { initUIHandlers } from './ui.js';
import { initializeMap } from './map.js';
import { setupChat } from './chat.js';
import { loadCountriesData } from './api.js';

// Inicializa a aplicação
function initApp() {
  // Inicializa o estado global
  initializeState();
  
  // Inicializa os manipuladores de eventos
  initUIHandlers();
  initAuth();
  initRooms();
  initSocketHandlers();

  // Carrega os dados dos países
  loadCountriesData().then(data => {
    console.log('Dados dos países carregados.');
  });
  
  // Quando um usuário entra em uma sala, inicializa o mapa e o chat
  socket.on('roomJoined', (roomData) => {
    // Inicializa o mapa
    initializeMap(socket.username);
    
    // Inicializa o chat
    setupChat(socket.username);
  });
}

// Executa a inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initApp);

// Exporta funções globais e estado para debug e acesso
export { state, socket };