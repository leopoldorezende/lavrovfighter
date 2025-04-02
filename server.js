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
let eligibleCountries = []; // Lista dinâmica de países elegíveis para sorteio
let players = [];

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('join', (username) => {
    let playerState;

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
  });

  socket.on('chatMessage', ({ username, message }) => {
    const playerState = playerStates.get(username);
    if (playerState) {
      playerState.customData.lastMessage = message; // Atualiza a última mensagem
      const country = playerState.country || 'Sem país';
      const fullUsername = `${country} - ${username}`;
      console.log('Mensagem recebida no servidor:', { username: fullUsername, message });
      io.emit('chatMessage', { username: fullUsername, message });
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
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});