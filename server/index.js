const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const { setupRoomHandlers } = require('./server-rooms');
const { setupChatHandlers } = require('./server-chat');
const { setupPlayerHandlers } = require('./server-players');
require('dotenv').config();

// Inicialização Express e Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// API Mapbox
app.get('/api/mapbox', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== process.env.MY_SECRET) {
    return res.status(401).send('Não autorizado');
  }
  res.json({ token: process.env.MAP_APIKEY });
});

// Carrega dados de países
let countryData;
try {
  countryData = JSON.parse(fs.readFileSync('countryData.json', 'utf8'));
} catch (error) {
  console.error('Erro ao carregar countryData.json:', error);
  process.exit(1);
}

// Estrutura para gerenciar salas e estados
const MAX_CHAT_HISTORY = 100; // Limitar o número de mensagens armazenadas

// Função para criar uma nova sala
function createRoom(roomName, creator) {
  const now = new Date();
  const room = {
    name: roomName,
    owner: creator,
    players: [],
    eligibleCountries: [],
    chatHistory: {
      public: [],
      private: new Map()
    },
    createdAt: now.toISOString()
  };
  return room;
}

// Função para gerar chave única para chats privados
function getPrivateChatKey(user1, user2) {
  return [user1, user2].sort().join(':');
}

// Estado global compartilhado
const gameState = {
  rooms: new Map(), // Mapa para armazenar todas as salas
  availableCountries: Object.keys(countryData), // Lista inicial de todos os países
  playerStates: new Map(), // Mapa para rastrear estados completos dos jogadores por sala
  socketIdToUsername: new Map(), // Mapeamento de socket.id para nome de usuário
  userToRoom: new Map(), // Mapeamento de usuário para sala atual
  userRoomCountries: new Map(), // Mapeamento de "usuario:sala" para país atribuído
  countryData: countryData,
  MAX_CHAT_HISTORY: MAX_CHAT_HISTORY,
  createRoom: createRoom,
  getPrivateChatKey: getPrivateChatKey
};

// Configuração de Socket.io
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);
  
  // Adiciona handlers para cada tipo de funcionalidade
  setupRoomHandlers(io, socket, gameState);
  setupChatHandlers(io, socket, gameState);
  setupPlayerHandlers(io, socket, gameState);
  
  // Handler de desconexão
  socket.on('disconnect', () => {
    const username = gameState.socketIdToUsername.get(socket.id);
    if (username) {
      // Lógica de limpeza quando um usuário desconecta
      const roomName = gameState.userToRoom.get(username);
      if (roomName) {
        const room = gameState.rooms.get(roomName);
        if (room) {
          const playerWithCountry = room.players.find(p => p.startsWith(username));
          if (playerWithCountry) {
            room.players = room.players.filter(p => p !== playerWithCountry);
          }
          
          // Atualiza a lista de jogadores para todos na sala
          io.to(roomName).emit('updatePlayers', room.players);
          
          // Se não há mais jogadores na sala e não é o criador, remover a sala
          if (room.players.length === 0 && room.owner !== username) {
            gameState.rooms.delete(roomName);
            
            // Remove os estados dos jogadores relacionados a esta sala
            for (const key of gameState.playerStates.keys()) {
              if (key.endsWith(`:${roomName}`)) {
                gameState.playerStates.delete(key);
              }
            }
            
            // Remove os países atribuídos nesta sala
            for (const key of gameState.userRoomCountries.keys()) {
              if (key.endsWith(`:${roomName}`)) {
                gameState.userRoomCountries.delete(key);
              }
            }
            
            io.emit('roomsList', Array.from(gameState.rooms.entries()).map(([name, room]) => ({
              name,
              owner: room.owner,
              playerCount: room.players.length,
              createdAt: room.createdAt
            })));
          }
        }
        gameState.userToRoom.delete(username);
      }
      gameState.socketIdToUsername.delete(socket.id);
    }
  });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});