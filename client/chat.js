// chat.js - Sistema de chat do jogo

import { socket } from './socket-handler.js';
import { state } from './state.js';
import { centerMapOnCountry } from './map.js';


// Configura o sistema de chat
function setupChat(username) {
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');
  
  // Adiciona o cabeçalho do chat se não existir
  if (!document.getElementById('chat-header')) {
    const header = document.createElement('div');
    header.id = 'chat-header';
    header.textContent = 'Chat Público';
    chatMessages.parentNode.insertBefore(header, chatMessages);
  }

  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      const isPrivate = state.currentChatMode !== 'public';
      socket.emit('chatMessage', { 
        username, 
        message, 
        isPrivate, 
        recipient: isPrivate ? state.currentChatMode : null 
      });
      chatInput.value = '';
    }
  }

  chatSend.onclick = sendMessage;
  chatInput.onkeyup = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
}

// Verifica se uma mensagem deve ser exibida no modo atual
function shouldDisplayMessage(messageData) {
  // No modo público, mostra apenas mensagens públicas
  if (state.currentChatMode === 'public') {
    return !messageData.isPrivate;
  }
  
  // No modo privado, mostra apenas mensagens entre o usuário atual e o destinatário selecionado
  return messageData.isPrivate && (
    (messageData.username.includes(socket.username) && messageData.recipient === state.currentChatMode) ||
    (messageData.username.includes(state.currentChatMode) && messageData.recipient === socket.username)
  );
}

// Exibe uma mensagem no chat
function displayMessage(messageData) {
  // Verifica se a mensagem deve ser exibida no modo atual
  if (!shouldDisplayMessage(messageData)) {
    return;
  }
  
  const chatMessages = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  
  // Adiciona classes apropriadas
  const classes = ['message'];
  if (messageData.username.includes(socket.username)) {
    classes.push('self');
  } else {
    classes.push('other');
  }
  if (messageData.isPrivate) {
    classes.push('private');
  }
  msgDiv.classList.add(...classes);
  
  // Se houver timestamp, formatar e exibir hora da mensagem
  let timeDisplay = '';
  if (messageData.timestamp) {
    const date = new Date(messageData.timestamp);
    timeDisplay = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} `;
  }
  
  // Adiciona indicador de privado se for uma mensagem privada
  const privateIndicator = messageData.isPrivate ? '[Privado] ' : '';
  
  msgDiv.innerHTML = `<span>${timeDisplay} ${privateIndicator} ${messageData.username}</span> ${messageData.message}`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Exibe o histórico de mensagens
function displayChatHistory(messages) {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = '';
  messages.forEach(messageData => {
    displayMessage(messageData);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Alterar o modo de chat (público ou privado)
function switchChatMode(mode) {
  console.log(`Alterando modo de chat para: ${mode}`);
  state.currentChatMode = mode;
  
  // Atualiza a lista de jogadores para destacar a seleção atual
  updatePlayerList(state.players);
  
  // Atualiza o cabeçalho do chat
  const chatHeader = document.getElementById('chat-header');
  if (!chatHeader) {
    const header = document.createElement('div');
    header.id = 'chat-header';
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.parentNode.insertBefore(header, chatMessages);
  }
  
  document.getElementById('chat-header').textContent = mode === 'public' 
    ? 'Chat Público' 
    : `Chat Privado com ${mode}`;
  
  // Carrega o histórico apropriado
  if (mode === 'public') {
    displayChatHistory(state.chatHistories.public || []);
  } else {
    // Se já temos o histórico em cache, mostramos; senão, solicitamos ao servidor
    if (state.chatHistories[mode]) {
      displayChatHistory(state.chatHistories[mode]);
    } else {
      socket.emit('requestPrivateHistory', mode);
    }
  }
}

// Atualiza a lista de jogadores na interface
function updatePlayerList(players) {
  state.players = players;
  const youTitle = document.getElementById('you');
  const playerList = document.getElementById('player-list');
  playerList.innerHTML = '';
  
  // Adiciona a opção "Público" como primeiro item
  const publicItem = document.createElement('li');
  publicItem.textContent = 'Público';
  publicItem.classList.add('chat-option');
  if (state.currentChatMode === 'public') {
    publicItem.classList.add('active');
  }
  
  // CORREÇÃO: Adiciona o event listener diretamente ao elemento
  publicItem.addEventListener('click', () => {
    switchChatMode('public');
  });
  
  playerList.appendChild(publicItem);
  
  // Adiciona os jogadores
  players.forEach(player => {
    const username = player.split(' (')[0]; // Extrai o nome sem o país
    if (username !== socket.username) { // Não adicionar a si mesmo como opção de chat privado
      const li = document.createElement('li');
      li.textContent = player;
      li.classList.add('chat-option');
      if (state.currentChatMode === username) {
        li.classList.add('active');
      }
      
      // CORREÇÃO: Adiciona o event listener diretamente ao elemento
      li.addEventListener('click', () => {
        switchChatMode(username);
      });
      
      playerList.appendChild(li);
    } else {
      // Adicionar a si mesmo sem opção de clique
      youTitle.textContent = player;

      // Adiciona o event listener para centralizar no mapa
      youTitle.title = "Clique para centralizar no seu país";
      
      // Remove event listeners antigos para evitar duplicação
      const newYouTitle = youTitle.cloneNode(true);
      youTitle.parentNode.replaceChild(newYouTitle, youTitle);
      
      // Adiciona o novo event listener
      newYouTitle.addEventListener('click', () => {
        if (state.myCountry) {
          console.log("Centralizando no país:", state.myCountry);
          centerMapOnCountry(state.myCountry);
        }
      });
    }
  });
  
  // Adiciona estilos CSS para a lista de jogadores se ainda não existir
  if (!document.getElementById('player-list-styles')) {
    const style = document.createElement('style');
    style.id = 'player-list-styles';
    document.head.appendChild(style);
  }
  
  // ADICIONADO: Atualiza o mapa para refletir os jogadores atuais
  if (state.map && state.map.loaded()) {
    try {
      // Extrai a lista de países dos outros jogadores
      const otherCountries = players
        .map(p => {
          const match = p.match(/\((.*)\)/);
          return match ? match[1] : '';
        })
        .filter(country => country !== state.myCountry && country !== '');
      
      console.log("Atualizando mapa com países dos jogadores:", otherCountries);
      
      // Atualiza a expressão de preenchimento
      state.map.setPaintProperty('country-fills', 'fill-color', [
        'case',
        ['==', ['get', 'name_en'], state.myCountry], 'rgba(255, 220, 0, 0.8)',
        ['in', ['get', 'name_en'], ['literal', otherCountries]], 'rgba(0, 200, 50, 0.8)',
        'rgba(30, 50, 70, 0)'
      ]);
      
      // Atualiza a expressão de borda
      state.map.setPaintProperty('country-borders', 'line-opacity', [
        'case',
        ['==', ['get', 'name_en'], state.myCountry], 1,
        ['in', ['get', 'name_en'], ['literal', otherCountries]], 1,
        0
      ]);
    } catch (error) {
      console.error("Erro ao atualizar camadas do mapa:", error);
    }
  } else {
    console.log("Mapa não está pronto para atualização");
  }
}

export { 
  setupChat, 
  displayMessage, 
  displayChatHistory, 
  switchChatMode, 
  updatePlayerList 
};