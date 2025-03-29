// client.js
const socket = io();

const state = {
    map: null,
    players: []
};

function enterGame() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        initializeMap();
        socket.emit('join', username);
        setupChat(username);
    } else {
        alert('Por favor, digite um nome!');
    }
}

function initializeMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGVvcG9sZG9yZXplbmRlIiwiYSI6ImNqOG9zaXVyazA3anozNG8weTVrcnl4NDgifQ._89Jf3MABokdSiU0fqX84w';
    state.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 0],
        zoom: 1.5,
        maxBounds: [[-180, -90], [180, 90]]
    });
}

function updatePlayerList(players) {
    state.players = players;
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        playerList.appendChild(li);
    });
}

function setupChat(username) {
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatInput || !chatSend || !chatMessages) {
        console.error('Elementos de chat não encontrados no DOM');
        return;
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            console.log('Enviando mensagem:', { username, message });
            socket.emit('chatMessage', { username, message });
            chatInput.value = '';
        }
    }

    chatSend.onclick = sendMessage;
    chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    socket.on('chatMessage', ({ username: sender, message }) => {
        console.log('Mensagem recebida no cliente:', { sender, message }); // Log para depuração
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(sender === username ? 'self' : 'other');
        msgDiv.textContent = `${sender}: ${message}`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

socket.on('updatePlayers', (players) => {
    updatePlayerList(players);
});

// Log para verificar conexão
socket.on('connect', () => {
    console.log('Conectado ao servidor com ID:', socket.id);
});