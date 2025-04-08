// server-rooms.js - Lógica de gestão de salas

function setupRoomHandlers(io, socket, gameState) {
  // Autenticar usuário (sem entrar em sala ainda)
  socket.on('authenticate', (username) => {
    gameState.socketIdToUsername.set(socket.id, username);
    socket.username = username;
    socket.emit('authenticated', { success: true });
    
    // Envia a lista de salas disponíveis
    socket.emit('roomsList', Array.from(gameState.rooms.entries()).map(([name, room]) => ({
      name,
      owner: room.owner,
      playerCount: room.players.length,
      createdAt: room.createdAt
    })));
  });

  // Obter lista de salas
  socket.on('getRooms', () => {
    socket.emit('roomsList', Array.from(gameState.rooms.entries()).map(([name, room]) => ({
      name,
      owner: room.owner,
      playerCount: room.players.length,
      createdAt: room.createdAt
    })));
  });

  // Criar uma nova sala
  socket.on('createRoom', (roomName) => {
    const username = socket.username;
    if (!username) {
      socket.emit('error', 'Usuário não autenticado');
      return;
    }

    if (gameState.rooms.has(roomName)) {
      socket.emit('error', 'Uma sala com este nome já existe');
      return;
    }

    const room = gameState.createRoom(roomName, username);
    gameState.rooms.set(roomName, room);
    console.log(`Sala ${roomName} criada por ${username}`);
    
    io.emit('roomsList', Array.from(gameState.rooms.entries()).map(([name, room]) => ({
      name,
      owner: room.owner,
      playerCount: room.players.length,
      createdAt: room.createdAt
    })));
    
    socket.emit('roomCreated', { name: roomName, success: true });
  });

  // Excluir uma sala
  socket.on('deleteRoom', (roomName) => {
    const username = socket.username;
    if (!username) {
      socket.emit('error', 'Usuário não autenticado');
      return;
    }

    const room = gameState.rooms.get(roomName);
    if (!room) {
      socket.emit('error', 'Sala não existe');
      return;
    }

    // Verifica se o usuário é o dono da sala
    if (room.owner !== username) {
      socket.emit('error', 'Apenas o criador da sala pode excluí-la');
      return;
    }

    // Notifica todos os jogadores na sala
    io.to(roomName).emit('roomDeleted', { name: roomName });

    // Remove a sala
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

    // Atualiza a lista de salas para todos
    io.emit('roomsList', Array.from(gameState.rooms.entries()).map(([name, room]) => ({
      name,
      owner: room.owner,
      playerCount: room.players.length,
      createdAt: room.createdAt
    })));
  });

  // Entrar em uma sala
  socket.on('joinRoom', (roomName) => {
    const username = socket.username;
    if (!username) {
      socket.emit('error', 'Usuário não autenticado');
      return;
    }

    if (!gameState.rooms.has(roomName)) {
      socket.emit('error', 'Sala não existe');
      return;
    }

    // Remove o jogador da sala atual, se houver
    const currentRoom = gameState.userToRoom.get(username);
    if (currentRoom) {
      const room = gameState.rooms.get(currentRoom);
      if (room) {
        const playerWithCountry = room.players.find(p => p.startsWith(username));
        if (playerWithCountry) {
          room.players = room.players.filter(p => p !== playerWithCountry);
        }
        
        // Atualiza a lista de jogadores para todos na sala atual
        io.to(currentRoom).emit('updatePlayers', room.players);
        
        // Se não há mais jogadores na sala e não é o criador, remover a sala
        if (room.players.length === 0 && room.owner !== username) {
          gameState.rooms.delete(currentRoom);
          io.emit('roomsList', Array.from(gameState.rooms.entries()).map(([name, room]) => ({
            name,
            owner: room.owner,
            playerCount: room.players.length,
            createdAt: room.createdAt
          })));
        }
        
        // Deixa o socket.io room
        socket.leave(currentRoom);
      }
    }

    // Entra na nova sala
    const room = gameState.rooms.get(roomName);
    socket.join(roomName);
    gameState.userToRoom.set(username, roomName);

    // Chave para identificar o par usuário-sala
    const userRoomKey = `${username}:${roomName}`;
    
    let playerState;
    let country;
    
    // Verifica se o jogador já tem um país atribuído para esta sala específica
    if (gameState.userRoomCountries.has(userRoomKey)) {
      // O usuário já esteve nesta sala antes, usa o mesmo país
      country = gameState.userRoomCountries.get(userRoomKey);
      console.log(`${username} já tinha o país ${country} na sala ${roomName}`);
      
      playerState = {
        country: country,
        customData: {
          lastMessage: null,
          score: 0,
          lastPosition: [0, 0]
        }
      };
      
      // Verifica se há dados personalizados salvos para este usuário nesta sala
      const stateKey = `${username}:${roomName}`;
      if (gameState.playerStates.has(stateKey)) {
        playerState.customData = gameState.playerStates.get(stateKey).customData;
      }
    } else {
      // Primeira vez do usuário nesta sala, sorteia um novo país
      let randomCountry;
      
      if (room.players.length === 0) {
        // Primeiro jogador na sala
        const available = gameState.availableCountries.filter(
          country => !room.players.some(p => p.includes(`(${country})`))
        );
        if (available.length === 0) {
          socket.emit('error', 'Não há mais países disponíveis para sortear.');
          return;
        }
        randomCountry = available[Math.floor(Math.random() * available.length)];
        
        // Define os países elegíveis como países que fazem fronteira
        // Verificando borders com enabled=true no novo formato
        const borderCountries = gameState.countriesData[randomCountry].borders
          .filter(border => border.enabled)
          .map(border => border.country)
          .filter(country => gameState.availableCountries.includes(country));
        
        // Se não houver países de fronteira disponíveis, use todos os países disponíveis
        if (borderCountries.length === 0) {
          room.eligibleCountries = gameState.availableCountries.filter(country => country !== randomCountry);
        } else {
          room.eligibleCountries = borderCountries;
        }
      } else {
        // Jogadores subsequentes
        const available = room.eligibleCountries.filter(
          country => !room.players.some(p => p.includes(`(${country})`))
        );
        
        // Se não houver países elegíveis disponíveis, expanda para todos os países não utilizados
        if (available.length === 0) {
          const usedCountries = room.players.map(p => {
            const match = p.match(/\((.*?)\)/);
            return match ? match[1] : null;
          }).filter(Boolean);
          
          const remainingCountries = gameState.availableCountries.filter(
            country => !usedCountries.includes(country)
          );
          
          if (remainingCountries.length === 0) {
            socket.emit('error', 'Não há mais países disponíveis para sortear.');
            return;
          }
          
          randomCountry = remainingCountries[Math.floor(Math.random() * remainingCountries.length)];
          console.log(`Expandindo países elegíveis devido à falta de opções. Sorteado: ${randomCountry}`);
        } else {
          randomCountry = available[Math.floor(Math.random() * available.length)];
        }
        
        // Adiciona novos países de fronteira aos elegíveis
        // Aqui também atualizamos para o novo formato de borders
        const newBorders = gameState.countriesData[randomCountry].borders
          .filter(border => border.enabled)
          .map(border => border.country)
          .filter(country => gameState.availableCountries.includes(country));
        
        room.eligibleCountries = [...new Set([...room.eligibleCountries, ...newBorders])];
      }

      // Armazena o país para este usuário nesta sala específica
      gameState.userRoomCountries.set(userRoomKey, randomCountry);
      country = randomCountry;
      
      // Cria o estado inicial do jogador
      playerState = {
        country: randomCountry,
        customData: {
          lastMessage: null,    // Última mensagem enviada
          score: 0,             // Pontuação inicial
          lastPosition: [0, 0]  // Última posição do mapa
        }
      };
    }
    
    // Salva o estado atual do jogador nesta sala específica
    gameState.playerStates.set(`${username}:${roomName}`, playerState);

    const playerWithCountry = `${username} (${country})`;
    if (!room.players.includes(playerWithCountry)) {
      room.players.push(playerWithCountry);
    }
    
    console.log(`${username} entrou na sala ${roomName} como ${country}`);
    console.log('Jogadores na sala:', room.players);
    console.log('Países elegíveis na sala:', room.eligibleCountries);
    
    // Envia informações da sala para o jogador
    socket.emit('roomJoined', {
      name: roomName,
      owner: room.owner,
      playerCount: room.players.length,
      createdAt: room.createdAt
    });
    
    // Atualiza a lista de jogadores para todos na sala
    io.to(roomName).emit('updatePlayers', room.players);
    
    // Atualiza a lista de salas para todos
    io.emit('roomsList', Array.from(gameState.rooms.entries()).map(([name, room]) => ({
      name,
      owner: room.owner,
      playerCount: room.players.length,
      createdAt: room.createdAt
    })));
    
    // Envia o estado completo ao cliente
    socket.emit('stateRestored', playerState);
    
    // Envia o histórico de mensagens públicas para o cliente
    socket.emit('chatHistory', { 
      type: 'public', 
      messages: room.chatHistory.public 
    });
  });

  // Sair de uma sala
  socket.on('leaveRoom', () => {
    const username = socket.username;
    if (!username) return;
    
    const roomName = gameState.userToRoom.get(username);
    if (!roomName) return;
    
    const room = gameState.rooms.get(roomName);
    if (!room) return;
    
    // Remove o jogador da lista de jogadores da sala
    const playerWithCountry = room.players.find(p => p.startsWith(username));
    if (playerWithCountry) {
      room.players = room.players.filter(p => p !== playerWithCountry);
    }
    
    console.log(`${username} saiu da sala ${roomName}`);
    
    // Sai do socket.io room
    socket.leave(roomName);
    gameState.userToRoom.delete(username);
    
    // Atualiza a lista de jogadores para todos na sala
    io.to(roomName).emit('updatePlayers', room.players);
    
    // Se não há mais jogadores na sala e não é o criador, remover a sala
    if (room.players.length === 0 && room.owner !== username) {
      gameState.rooms.delete(roomName);
    }
    
    // Atualiza a lista de salas para todos
    io.emit('roomsList', Array.from(gameState.rooms.entries()).map(([name, room]) => ({
      name,
      owner: room.owner,
      playerCount: room.players.length,
      createdAt: room.createdAt
    })));
    
    socket.emit('roomLeft');
  });
}

module.exports = { setupRoomHandlers };