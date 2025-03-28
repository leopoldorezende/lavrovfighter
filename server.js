const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = [];

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        socket.username = username; // Armazena o nome no socket
        if (!players.includes(username)) { // Evita duplicatas
            players.push(username);
        }
        io.emit('updatePlayers', players); // Envia a lista atualizada para todos
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            players = players.filter(player => player !== socket.username); // Remove o jogador da lista
            io.emit('updatePlayers', players); // Atualiza a lista para todos os conectados
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});