const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
require('dotenv').config();

// Serve os arquivos estáticos
app.use(express.static(__dirname));

// Endpoint protegido que retorna o token do Mapbox
app.get('/api/mapbox', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== process.env.MY_SECRET) {
    return res.status(401).send('Não autorizado');
  }
  res.json({ token: process.env.MAP_APIKEY });
});

let players = [];

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('join', (username) => {
    socket.username = username;
    if (!players.includes(username)) {
      players.push(username);
    }
    console.log('Jogadores atualizados:', players);
    io.emit('updatePlayers', players);
  });

  socket.on('chatMessage', ({ username, message }) => {
    console.log('Mensagem recebida no servidor:', { username, message });
    io.emit('chatMessage', { username, message });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      players = players.filter(player => player !== socket.username);
      console.log('Jogador desconectado, nova lista:', players);
      io.emit('updatePlayers', players);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});