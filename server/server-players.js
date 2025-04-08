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

  // Adicionar manipulador para atualização dos recursos econômicos de um país
  socket.on('updateEconomicResources', ({ resource, value }) => {
    const username = socket.username;
    if (!username) return;
    
    const roomName = gameState.userToRoom.get(username);
    if (!roomName) return;
    
    const stateKey = `${username}:${roomName}`;
    const playerState = gameState.playerStates.get(stateKey);
    
    if (!playerState || !playerState.country) return;
    
    // Verifica se o recurso solicitado é válido
    const country = gameState.countriesData[playerState.country];
    if (!country || !country.economy) {
      console.error(`Dados econômicos não encontrados para ${playerState.country}`);
      return;
    }
    
    // Atualizar o recurso específico (exemplo: ajuste de taxa de juros)
    // Isso dependerá do novo formato
    if (resource === 'interestRate' && country.economy.interestRate !== undefined) {
      // Limita o valor a um intervalo razoável (0-50%)
      const newValue = Math.max(0, Math.min(50, value));
      
      // Registra a alteração no estado do jogador para persistência
      if (!playerState.customData.economyChanges) {
        playerState.customData.economyChanges = {};
      }
      playerState.customData.economyChanges[resource] = newValue;
      
      console.log(`${username} ajustou ${resource} de ${country.economy[resource]} para ${newValue} em ${playerState.country}`);
      
      // Notifica o jogador da mudança
      socket.emit('resourceUpdated', {
        resource: resource,
        value: newValue,
        previousValue: country.economy[resource]
      });
    }
  });
  
  // Adicionar manipulador para ações militares
  socket.on('militaryAction', ({ action, target }) => {
    const username = socket.username;
    if (!username) return;
    
    const roomName = gameState.userToRoom.get(username);
    if (!roomName) return;
    
    const stateKey = `${username}:${roomName}`;
    const playerState = gameState.playerStates.get(stateKey);
    
    if (!playerState || !playerState.country) return;
    
    const country = gameState.countriesData[playerState.country];
    const targetCountry = gameState.countriesData[target];
    
    if (!country || !targetCountry) {
      console.error(`Dados de países não encontrados para ação militar`);
      socket.emit('error', 'Países não encontrados');
      return;
    }
    
    // Verifica se os países fazem fronteira usando o novo formato
    const sharesBorder = country.borders.some(border => 
      border.country === target && border.enabled
    );
    
    if (!sharesBorder) {
      socket.emit('error', `${playerState.country} não faz fronteira com ${target} ou a fronteira está fechada`);
      return;
    }
    
    // Implementação de diferentes ações militares
    switch(action) {
      case 'declareWar':
        // Verificar se o jogador tem recursos militares suficientes
        if (country.military && country.military.army > 30) {
          // Registra a ação no estado do jogador
          if (!playerState.customData.militaryActions) {
            playerState.customData.militaryActions = [];
          }
          playerState.customData.militaryActions.push({
            type: 'declareWar',
            target: target,
            timestamp: Date.now()
          });
          
          // Notifica todos os jogadores na sala
          io.to(roomName).emit('militaryActionDeclared', {
            actor: playerState.country,
            action: 'declareWar',
            target: target
          });
          
          console.log(`${username} (${playerState.country}) declarou guerra contra ${target}`);
        } else {
          socket.emit('error', 'Recursos militares insuficientes para declarar guerra');
        }
        break;
        
      case 'deployTroops':
        // Lógica similar para implantação de tropas
        break;
        
      default:
        socket.emit('error', 'Ação militar não reconhecida');
    }
  });
}

module.exports = { setupPlayerHandlers };