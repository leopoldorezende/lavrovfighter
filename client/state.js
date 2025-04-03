// state.js - Gerenciamento de estado global da aplicação

// Estado global da aplicação
const state = {
    map: null,
    players: [],
    myCountry: null,
    customData: {},
    currentRoom: null,
    roomCountries: {}, // Armazena países por sala: {salaA: "Brasil", salaB: "Argentina"}
    currentChatMode: 'public', // 'public' ou nome do jogador para privado
    chatHistories: {
      public: []
    }
  };
  
  // Restaura países por sala do localStorage
  function initializeState() {
    const savedRoomCountries = localStorage.getItem('roomCountries');
    if (savedRoomCountries) {
      try {
        state.roomCountries = JSON.parse(savedRoomCountries);
        console.log('Países por sala restaurados:', state.roomCountries);
      } catch (e) {
        console.error('Erro ao restaurar países por sala:', e);
      }
    }
  }
  
  // Exporta as funções e o estado
  export { state, initializeState };