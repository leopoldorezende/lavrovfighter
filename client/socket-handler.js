// socket-handler.js - Gerenciamento de eventos de socket

import { state } from './state.js';
import { updateRoomsList, updateRoomInfo } from './rooms.js';
import { centerMapOnCountry } from './map.js';
import { displayMessage, displayChatHistory, updatePlayerList } from './chat.js';

// Inicializa o socket
const socket = io();

// Inicializa os handlers de eventos do socket
function initSocketHandlers() {
  // Eventos de autenticação
  socket.on('authenticated', (data) => {
    if (data.success) {
      console.log('Autenticado com sucesso como', socket.username);
    }
  });

  // Eventos de salas
  socket.on('roomsList', (rooms) => {
    updateRoomsList(rooms);
  });

  socket.on('roomCreated', (data) => {
    if (data.success) {
      console.log(`Sala "${data.name}" criada com sucesso`);
    }
  });

  socket.on('roomJoined', (roomData) => {
    state.currentRoom = roomData.name;
    document.getElementById('room-selection-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    // Atualiza informações da sala
    updateRoomInfo(roomData);
    
    console.log(`Entrou na sala: ${roomData.name}`);
  });

  socket.on('roomLeft', () => {
    state.currentRoom = null;
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('room-selection-screen').style.display = 'block';
    
    // Limpa a lista de jogadores e o chat
    state.players = [];
    state.chatHistories = { public: [] };
    document.getElementById('chat-messages').innerHTML = '';
    
    // Solicita a lista de salas novamente
    socket.emit('getRooms');
  });

  socket.on('roomDeleted', (data) => {
    alert(`A sala "${data.name}" foi excluída.`);
    
    // Se o usuário estava nesta sala, retorna à tela de seleção
    if (state.currentRoom === data.name) {
      state.currentRoom = null;
      document.getElementById('game-screen').style.display = 'none';
      document.getElementById('room-selection-screen').style.display = 'block';
      
      // Limpa a lista de jogadores e o chat
      state.players = [];
      state.chatHistories = { public: [] };
      document.getElementById('chat-messages').innerHTML = '';
      
      // Solicita a lista de salas novamente
      socket.emit('getRooms');
    }
  });

  // Eventos de chat
  socket.on('chatHistory', (data) => {
    console.log(`Histórico de chat ${data.type} recebido:`, data.messages.length, 'mensagens');
    
    // Armazena o histórico no cache
    if (data.type === 'public') {
      state.chatHistories.public = data.messages;
      if (state.currentChatMode === 'public') {
        displayChatHistory(data.messages);
      }
    } else if (data.type === 'private' && data.target) {
      state.chatHistories[data.target] = data.messages;
      if (state.currentChatMode === data.target) {
        displayChatHistory(data.messages);
      }
    }
  });

  socket.on('chatMessage', (messageData) => {
    // Armazena a mensagem no histórico apropriado
    if (!messageData.isPrivate) {
      if (!state.chatHistories.public) {
        state.chatHistories.public = [];
      }
      state.chatHistories.public.push(messageData);
    } else {
      const chatPartner = messageData.username.includes(socket.username) 
        ? messageData.recipient 
        : messageData.username.split(' - ')[1];
      
      if (!state.chatHistories[chatPartner]) {
        state.chatHistories[chatPartner] = [];
      }
      state.chatHistories[chatPartner].push(messageData);
    }
    
    // Exibe a mensagem se estiver no modo de chat correspondente
    displayMessage(messageData);
  });

  // Eventos de jogadores
  socket.on('updatePlayers', (players) => {
    console.log('Jogadores atualizados:', players);
    updatePlayerList(players);
  });

  socket.on('stateRestored', (playerState) => {
    console.log('Estado restaurado:', playerState);
    state.myCountry = playerState.country;
    state.customData = playerState.customData || {};
    
    // Armazena o país associado a esta sala específica
    if (state.currentRoom) {
      state.roomCountries[state.currentRoom] = playerState.country;
      localStorage.setItem('roomCountries', JSON.stringify(state.roomCountries));
    }

    if (state.customData.lastMessage) {
      console.log('Última mensagem enviada:', state.customData.lastMessage);
    }

    // Centraliza o mapa imediatamente após receber o estado
    centerMapOnCountry(state.myCountry);
  });

  // Eventos de conexão
  socket.on('connect', () => {
    console.log('Conectado ao servidor com ID:', socket.id);
  });

  socket.on('error', (message) => {
    alert(`Erro: ${message}`);
  });
}

export { socket, initSocketHandlers };