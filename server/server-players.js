// server-players.js - Lógica de gerenciamento de jogadores

function setupPlayerHandlers(io, socket, gameState) {
    // Atualização da posição do jogador no mapa
    socket.on('updatePosition', ({ username, position }) => {
      const roomName = gameState.userToRoom.get(username);
      if (!roomName) return;
      
      const stateKey = `${username}:${roomName}`;
      const playerState = gameState.playerStates.get(stateKey);
      
      if (playerState) {
        playerState.customData.lastPosition = position; // Atualiza a posição
        console.log(`Posição atualizada para ${username} na sala ${roomName}:`, position);
      }
    });
  
    // Esta função pode ser expandida para incluir outras funcionalidades relacionadas a jogadores,
    // como atualização de pontuação, mudança de estado (online/offline), etc.
    
    // Exemplo de como seria uma função para atualizar a pontuação de um jogador:
    /*
    socket.on('updateScore', ({ score }) => {
      const username = socket.username;
      if (!username) return;
      
      const roomName = gameState.userToRoom.get(username);
      if (!roomName) return;
      
      const stateKey = `${username}:${roomName}`;
      const playerState = gameState.playerStates.get(stateKey);
      
      if (playerState) {
        playerState.customData.score = score;
        console.log(`Pontuação atualizada para ${username}: ${score}`);
        
        // Notificar outros jogadores, se necessário
        io.to(roomName).emit('playerScoreUpdated', {
          username: username,
          score: score
        });
      }
    });
    */
  }
  
  module.exports = { setupPlayerHandlers };