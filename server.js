// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = [];

io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.on('join', (username) => {
        socket.username = username;
        if (!players.includes(username)) {
            players.push(username);
        }
        console.log('Jogadores atualizados:', players); // Log para depuração
        io.emit('updatePlayers', players);
    });

    socket.on('chatMessage', ({ username, message }) => {
        console.log('Mensagem recebida no servidor:', { username, message }); // Confirmação de recebimento
        io.emit('chatMessage', { username, message }); // Retransmite para todos
        console.log('Mensagem enviada para todos os clientes'); // Confirmação de envio
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            players = players.filter(player => player !== socket.username);
            console.log('Jogador desconectado, nova lista:', players); // Log para depuração
            io.emit('updatePlayers', players);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});