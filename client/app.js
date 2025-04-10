// app.js - Inicialização e configuração principal

import { initializeState, state } from './state.js';
import { initAuth } from './auth.js';
import { initRooms } from './rooms.js';
import { initSocketHandlers, socket } from './socket-handler.js';
import { initUIHandlers } from './ui.js';
import { initializeMap } from './map.js';
import { setupChat } from './chat.js';
import { loadCountriesData } from './api.js';
import { updateSidetools } from './economy-updater.js';
import { initializeShips, setupShipSocketHandlers } from './chips.js'; // Importação do módulo de navios

// Inicializa a aplicação
function initApp() {
  // Inicializa o estado global
  initializeState();
  
  // Inicializa os manipuladores de eventos
  initUIHandlers();
  initAuth();
  initRooms();
  initSocketHandlers();
  
  // Inicializa os handlers para navios
  setupShipSocketHandlers();

  // Carrega os dados dos países
  loadCountriesData().then(data => {
    state.countriesData = data;
    console.log('Dados dos países carregados.');
    
    // Se o estado do jogador já estiver definido, atualiza a interface
    if (state.myCountry && state.countriesData[state.myCountry]) {
      updateSidetools();
    }
  });
  
  // Quando um usuário entra em uma sala, inicializa o mapa, o chat e os navios
  socket.on('roomJoined', (roomData) => {
    // Inicializa o mapa
    initializeMap(socket.username);
    
    // Inicializa o chat
    setupChat(socket.username);
    
    // Verifica se o mapa já existe
    if (state.map) {
      // Se o mapa já está carregado, inicializa os navios imediatamente
      if (state.map.loaded()) {
        console.log('Mapa já carregado, inicializando sistema de navios...');
        initializeShips();
      } else {
        // Se o mapa existe mas não está carregado, aguarda o evento 'load'
        state.map.once('load', () => {
          console.log('Mapa carregado, inicializando sistema de navios...');
          initializeShips();
        });
      }
    } else {
      // Se o mapa não existe, configura um temporizador para verificar novamente
      console.log('Mapa não inicializado, aguardando...');
      const checkMapInterval = setInterval(() => {
        if (state.map) {
          clearInterval(checkMapInterval);
          if (state.map.loaded()) {
            console.log('Mapa agora disponível e carregado, inicializando sistema de navios...');
            initializeShips();
          } else {
            state.map.once('load', () => {
              console.log('Mapa agora disponível e carregado, inicializando sistema de navios...');
              initializeShips();
            });
          }
        }
      }, 500); // Verifica a cada 500ms
    }
    
    
    // Garante que a aba de economia esteja aberta por padrão
    setTimeout(() => {
      const sidetools = document.getElementById('sidetools');
      sidetools.classList.add('active');
      
      // Certifica-se que a aba economia está ativa
      const economyTab = document.querySelector('.tab[data-target="economy"]');
      const economyContent = document.getElementById('economy');
      
      // Ativa a aba de economia na sidetools
      document.querySelectorAll('#sidetools .tab').forEach(tab => tab.classList.remove('active'));
      if (economyTab) economyTab.classList.add('active');
      
      // Ativa o conteúdo da economia na sidetools
      document.querySelectorAll('#sidetools .tab-content').forEach(content => content.classList.remove('active'));
      if (economyContent) economyContent.classList.add('active');
    }, 1000);
  });
  
  // Adiciona event listeners para os botões de ações econômicas
  document.addEventListener('DOMContentLoaded', () => {
    // Inicializa listeners de eventos para a interface econômica
    initializeEconomyListeners();
  });

  // Inicializa event listeners para a interface econômica
  function initializeEconomyListeners() {
    // Exemplo: Listener para botões de ação militar
    const declareWarBtn = document.querySelector('.war-actions .danger');
    if (declareWarBtn) {
      declareWarBtn.addEventListener('click', () => {
        const targetSelect = document.getElementById('target-country');
        const target = targetSelect.value;
        
        if (target && state.myCountry) {
          if (confirm(`Declarar guerra contra ${target}?`)) {
            socket.emit('militaryAction', {
              action: 'declareWar',
              target: target
            });
          }
        } else {
          alert('Selecione um país-alvo primeiro.');
        }
      });
    }
    
    // Exemplo: Listener para botões de diplomacia
    const diplomaticBtns = document.querySelectorAll('.diplomacy-options .action-btn');
    diplomaticBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSelect = document.getElementById('country-select');
        const target = targetSelect.value;
        
        if (!target) {
          alert('Selecione um país-alvo primeiro.');
          return;
        }
        
        const action = btn.textContent.trim();
        console.log(`Ação diplomática: ${action} com ${target}`);
        
        // Aqui você pode implementar a lógica para as ações diplomáticas
        // Por exemplo, emitir um evento para o servidor
      });
    });
    
    // Adiciona um listener para quando o usuário clica em um país diferente no mapa
    // Garante que a sidetools continue mostrando os dados do país do jogador
    document.addEventListener('countrySelected', (event) => {
      // Atualiza apenas a sidebar com o país selecionado
      // A sidetools continua mostrando dados do país do jogador
      if (state.myCountry) {
        updateSidetools();
      }
    });
  }
}

// Executa a inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initApp);

// Exporta funções globais e estado para debug e acesso
export { state, socket };