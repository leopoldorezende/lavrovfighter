const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
require('dotenv').config();

app.use(express.static(__dirname));

app.get('/api/mapbox', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== process.env.MY_SECRET) {
    return res.status(401).send('Não autorizado');
  }
  res.json({ token: process.env.MAP_APIKEY });
});

let countryData;
try {
  countryData = JSON.parse(fs.readFileSync('countryData.json', 'utf8'));
} catch (error) {
  console.error('Erro ao carregar countryData.json:', error);
  process.exit(1);
}

const availableCountries = Object.keys(countryData); // Lista inicial de todos os países
const playerStates = new Map(); // Mapa para rastrear estados completos dos jogadores
const socketIdToUsername = new Map(); // Mapeamento de socket.id para nome de usuário
let eligibleCountries = []; // Lista dinâmica de países elegíveis para sorteio
let players = [];

// Armazenar histórico de mensagens do chat
const publicChatHistory = [];
const privateChatHistory = new Map(); // Map de "username1:username2" para array de mensagens
const MAX_CHAT_HISTORY = 50; // Limitar o número de mensagens armazenadas

// Função para gerar chave única para chats privados (em ordem alfabética para consistência)
function getPrivateChatKey(user1, user2) {
  return [user1, user2].sort().join(':');
}

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('join', (username) => {
    let playerState;
    socketIdToUsername.set(socket.id, username);

    // Verifica se o jogador já tem um estado salvo
    if (playerStates.has(username)) {
      playerState = playerStates.get(username);
      console.log(`Usuário ${username} reconectado com estado:`, playerState);
    } else {
      let randomCountry;
      if (players.length === 0) {
        const available = availableCountries.filter(
          country => !Array.from(playerStates.values()).some(state => state.country === country)
        );
        if (available.length === 0) {
          socket.emit('error', 'Não há mais países disponíveis para sortear.');
          return;
        }
        randomCountry = available[Math.floor(Math.random() * available.length)];
        eligibleCountries = countryData[randomCountry].borders
          .filter(border => border.enabled)
          .map(border => border.country)
          .filter(country => availableCountries.includes(country));
      } else {
        const available = eligibleCountries.filter(
          country => !Array.from(playerStates.values()).some(state => state.country === country)
        );
        if (available.length === 0) {
          socket.emit('error', 'Não há mais países elegíveis para sortear.');
          return;
        }
        randomCountry = available[Math.floor(Math.random() * available.length)];
        const newBorders = countryData[randomCountry].borders
          .filter(border => border.enabled)
          .map(border => border.country)
          .filter(country => availableCountries.includes(country));
        eligibleCountries = [...new Set([...eligibleCountries, ...newBorders])];
      }

      // Cria o estado inicial do jogador
      playerState = {
        country: randomCountry,
        customData: {
          lastMessage: null,    // Última mensagem enviada
          score: 0,             // Pontuação inicial
          lastPosition: [0, 0]  // Última posição do mapa
        }
      };
      playerStates.set(username, playerState);
    }

    socket.username = username;
    const playerWithCountry = `${username} (${playerState.country})`;
    if (!players.includes(playerWithCountry)) {
      players.push(playerWithCountry);
    }
    console.log('Jogadores atualizados:', players);
    console.log('Países elegíveis atualizados:', eligibleCountries);
    io.emit('updatePlayers', players);
    socket.emit('stateRestored', playerState); // Envia o estado completo ao cliente
    
    // Envia o histórico de mensagens públicas para o cliente
    socket.emit('chatHistory', { type: 'public', messages: publicChatHistory });
  });

  // Solicitação de histórico de chat privado
  socket.on('requestPrivateHistory', (targetUsername) => {
    const username = socket.username;
    if (!username || !targetUsername) return;
    
    const chatKey = getPrivateChatKey(username, targetUsername);
    const history = privateChatHistory.get(chatKey) || [];
    
    socket.emit('chatHistory', { 
      type: 'private', 
      target: targetUsername,
      messages: history 
    });
  });

  // Recebimento de mensagens (públicas ou privadas)
  socket.on('chatMessage', ({ username, message, isPrivate, recipient }) => {
    const playerState = playerStates.get(username);
    if (!playerState) return;
    
    const country = playerState.country || 'Sem país';
    const fullUsername = `${country} - ${username}`;
    playerState.customData.lastMessage = message; // Atualiza a última mensagem
    
    // Cria objeto de mensagem
    const messageObj = { 
      username: fullUsername, 
      message, 
      timestamp: Date.now(),
      isPrivate: isPrivate,
      recipient: recipient
    };
    
    if (isPrivate && recipient) {
      // Mensagem privada
      const chatKey = getPrivateChatKey(username, recipient);
      
      // Inicializa o histórico se não existir
      if (!privateChatHistory.has(chatKey)) {
        privateChatHistory.set(chatKey, []);
      }
      
      // Adiciona a mensagem ao histórico privado
      const history = privateChatHistory.get(chatKey);
      history.push(messageObj);
      
      // Limita o tamanho do histórico
      if (history.length > MAX_CHAT_HISTORY) {
        history.shift();
      }
      
      console.log(`Mensagem privada de ${username} para ${recipient}:`, message);
      
      // Encontrar o socket.id do destinatário
      let recipientSocketId = null;
      for (const [socketId, user] of socketIdToUsername.entries()) {
        if (user === recipient) {
          recipientSocketId = socketId;
          break;
        }
      }
      
      // Envia apenas para o remetente e o destinatário
      socket.emit('chatMessage', messageObj);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('chatMessage', messageObj);
      }
    } else {
      // Mensagem pública
      publicChatHistory.push(messageObj);
      
      // Limita o tamanho do histórico
      if (publicChatHistory.length > MAX_CHAT_HISTORY) {
        publicChatHistory.shift();
      }
      
      console.log('Mensagem pública recebida:', messageObj);
      io.emit('chatMessage', messageObj);
    }
  });

  socket.on('updatePosition', ({ username, position }) => {
    const playerState = playerStates.get(username);
    if (playerState) {
      playerState.customData.lastPosition = position; // Atualiza a posição
      console.log(`Posição atualizada para ${username}:`, position);
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      const playerWithCountry = `${socket.username} (${playerStates.get(socket.username)?.country})`;
      players = players.filter(player => player !== playerWithCountry);
      // Mantém o estado no playerStates para reconexão, mas pode adicionar timeout se desejar
      console.log('Jogador desconectado, nova lista:', players);
      io.emit('updatePlayers', players);
      
      // Remove do mapeamento de socket
      socketIdToUsername.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});