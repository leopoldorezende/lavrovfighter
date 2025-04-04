// rooms.js - Gerenciamento de salas de jogo

import { socket } from './socket-handler.js';
import { state } from './state.js';

// Elementos DOM relacionados às salas
const createRoomButton = document.getElementById('create-room-button');
const roomNameInput = document.getElementById('room-name');
const refreshRoomsButton = document.getElementById('refresh-rooms-button');
const roomList = document.getElementById('room-list');
const exitRoomButton = document.getElementById('exit-room-button');
const currentRoomDisplay = document.getElementById('current-room-display');
const gameScreen = document.getElementById('game-screen');
const roomSelectionScreen = document.getElementById('room-selection-screen');

// Inicializar listeners relacionados às salas
function initRooms() {
  createRoomButton.onclick = createRoom;
  refreshRoomsButton.onclick = refreshRooms;
  exitRoomButton.onclick = exitRoom;
}

// Criar uma nova sala
function createRoom() {
  const roomName = roomNameInput.value.trim();
  if (roomName) {
    socket.emit('createRoom', roomName);
    roomNameInput.value = '';
  } else {
    alert('Por favor, digite um nome para a sala!');
  }
}

// Atualizar lista de salas
function refreshRooms() {
  socket.emit('getRooms');
}

// Voltar para a tela de login
function backToLogin() {
  roomSelectionScreen.style.display = 'none';
  document.getElementById('login-screen').style.display = 'block';
}

// Entrar em uma sala
function joinRoom(roomName) {
  socket.emit('joinRoom', roomName);
}

// Sair da sala atual
function exitRoom() {
  socket.emit('leaveRoom');
}

// Atualizar a lista de salas na interface
function updateRoomsList(rooms) {
  roomList.innerHTML = '';
  if (rooms.length === 0) {
    const noRoomsMsg = document.createElement('li');
    noRoomsMsg.classList.add('no-rooms');
    noRoomsMsg.innerHTML = 'Nenhuma sala disponível.<br /> Crie uma nova!';
    roomList.appendChild(noRoomsMsg);
    return;
  }

  rooms.forEach(room => {
    const roomItem = document.createElement('li');
    roomItem.classList.add('room-item');
    
    const formattedDate = new Date(room.createdAt).toLocaleString('pt-BR');
    
    roomItem.innerHTML = `
      <div class="room-details">
        <h4>${room.name}</h4>
        <p>Criador: ${room.owner}</p>
        <p>Jogadores: ${room.playerCount}</p>
        <p>Criada em: ${formattedDate}</p>
      </div>
      <button class="join-room-btn">Entrar</button>
    `;
    
    roomItem.querySelector('.join-room-btn').addEventListener('click', () => {
      joinRoom(room.name);
    });
    
    roomList.appendChild(roomItem);
  });
}

// Atualizar informações da sala na interface
function updateRoomInfo(roomData) {
  if (!roomData) return;
  
  // Atualiza o nome da sala no cabeçalho
  currentRoomDisplay.textContent = roomData.name;
  
  // Atualiza detalhes da sala na aba de informações
  document.getElementById('room-name-display').textContent = roomData.name;
  document.getElementById('room-owner-display').textContent = roomData.owner;
  document.getElementById('room-players-count').textContent = roomData.playerCount;
  
  // Formata e exibe a data de criação
  const createdDate = new Date(roomData.createdAt);
  document.getElementById('room-created-at').textContent = createdDate.toLocaleString('pt-BR');
  
  // Mostra controles de administrador se o usuário for o dono da sala
  const adminControls = document.getElementById('room-admin-controls');
  adminControls.innerHTML = '';
  
  if (roomData.owner === socket.username) {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir Sala';
    deleteButton.classList.add('delete-room-btn');
    deleteButton.onclick = () => {
      if (confirm('Tem certeza que deseja excluir esta sala?')) {
        socket.emit('deleteRoom', roomData.name);
      }
    };
    adminControls.appendChild(deleteButton);
  }
}

export { 
  initRooms, 
  createRoom, 
  refreshRooms, 
  backToLogin, 
  joinRoom, 
  exitRoom, 
  updateRoomsList, 
  updateRoomInfo 
};