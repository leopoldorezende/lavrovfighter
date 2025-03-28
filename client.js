const socket = io();

function enterGame() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        socket.emit('join', username);
    } else {
        alert('Por favor, digite um nome!');
    }
}

socket.on('updatePlayers', (players) => {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        playerList.appendChild(li);
    });
});