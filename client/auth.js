// auth.js - Autenticação e gerenciamento de usuário

import { socket } from './socket-handler.js';

// Elementos DOM relacionados à autenticação
const enterButton = document.getElementById('enterButton');
const usernameInput = document.getElementById('username');
const loginScreen = document.getElementById('login-screen');
const roomSelectionScreen = document.getElementById('room-selection-screen');

// Inicializar listeners relacionados à autenticação
function initAuth() {
  // Verifica se já existe um usuário salvo ao carregar a página
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    usernameInput.value = savedUsername;
  }

  // Configura os event listeners
  enterButton.onclick = authenticate;
  usernameInput.onkeyup = (e) => {
    if (e.key === 'Enter') authenticate();
  };
}

// Autenticação do usuário
function authenticate() {
  const usernameInputValue = usernameInput.value.trim();
  let username = usernameInputValue;

  const savedUsername = localStorage.getItem('username');
  if (!username && savedUsername) {
    username = savedUsername;
  }

  if (username) {
    loginScreen.style.display = 'none';
    roomSelectionScreen.style.display = 'block';
    localStorage.setItem('username', username);
    socket.username = username;
    socket.emit('authenticate', username);
    
    // Solicita a lista de salas disponíveis
    socket.emit('getRooms');
  } else {
    alert('Por favor, digite um nome!');
  }
}

// Desconecta o usuário
function logout() {
  // Mantemos roomCountries no localStorage para preservar os países por sala
  localStorage.removeItem('username');
  socket.disconnect();
  
  // Volta para a tela de login
  loginScreen.style.display = 'block';
  roomSelectionScreen.style.display = 'none';
  document.getElementById('game-screen').style.display = 'none';
}

export { initAuth, authenticate, logout };