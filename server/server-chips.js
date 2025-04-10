// server-chips.js - Gerenciamento de navios no servidor

/**
 * Configura os handlers de socket relacionados aos navios
 * @param {Server} io - Instância do Socket.io Server
 * @param {Socket} socket - Socket do cliente conectado
 * @param {Object} gameState - Estado global do jogo
 */
function setupShipHandlers(io, socket, gameState) {
    // Inicializa estruturas para gerenciar navios se ainda não existirem
    if (!gameState.ships) {
      gameState.ships = new Map(); // Mapa para armazenar os navios por sala
    }
    
    // Solicita os dados dos navios
    socket.on('requestShipsData', () => {
      const username = gameState.socketIdToUsername.get(socket.id);
      if (!username) {
        socket.emit('error', 'Usuário não autenticado');
        return;
      }
      
      const roomName = gameState.userToRoom.get(username);
      if (!roomName) {
        socket.emit('error', 'Usuário não está em nenhuma sala');
        return;
      }
      
      // Obtém os navios da sala atual
      let roomShips = gameState.ships.get(roomName);
      
      // Se a sala não tiver navios, inicializa um array vazio
      if (!roomShips) {
        roomShips = {
          type: 'FeatureCollection',
          features: []
        };
        gameState.ships.set(roomName, roomShips);
      }
      
      // Envia os dados dos navios para o cliente
      socket.emit('shipsData', roomShips);
    });
    
    // Adiciona um novo navio
    socket.on('addShip', (shipInfo) => {
      const username = gameState.socketIdToUsername.get(socket.id);
      if (!username) {
        socket.emit('error', 'Usuário não autenticado');
        return;
      }
      
      const roomName = gameState.userToRoom.get(username);
      if (!roomName) {
        socket.emit('error', 'Usuário não está em nenhuma sala');
        return;
      }
      
      // Verifica se o navio pertence ao usuário
      if (shipInfo.properties.owner !== username) {
        socket.emit('error', 'Você só pode adicionar seus próprios navios');
        return;
      }
      
      // Obtém os navios da sala atual
      let roomShips = gameState.ships.get(roomName);
      
      // Se a sala não tiver navios, inicializa um array vazio
      if (!roomShips) {
        roomShips = {
          type: 'FeatureCollection',
          features: []
        };
        gameState.ships.set(roomName, roomShips);
      }
      
      // Verifica se o usuário já tem a cota máxima de navios (3)
      const userShips = roomShips.features.filter(ship => ship.properties.owner === username);
      if (userShips.length >= 3) {
        socket.emit('error', 'Você já atingiu o limite de 3 navios');
        return;
      }
      
      // Cria um novo Feature para o navio
      const newShip = {
        type: 'Feature',
        properties: shipInfo.properties,
        geometry: {
          type: 'Point',
          coordinates: shipInfo.coordinates
        }
      };
      
      // Adiciona o navio ao array
      roomShips.features.push(newShip);
      
      // Notifica todos os usuários na sala sobre o novo navio
      io.to(roomName).emit('shipUpdated', {
        id: shipInfo.id,
        coordinates: shipInfo.coordinates,
        properties: shipInfo.properties
      });
      
      console.log(`Navio ${shipInfo.id} adicionado por ${username} na sala ${roomName}`);
    });
    
    // Atualiza a posição de um navio existente
    socket.on('updateShipPosition', (data) => {
      const username = gameState.socketIdToUsername.get(socket.id);
      if (!username) {
        socket.emit('error', 'Usuário não autenticado');
        return;
      }
      
      const roomName = gameState.userToRoom.get(username);
      if (!roomName) {
        socket.emit('error', 'Usuário não está em nenhuma sala');
        return;
      }
      
      // Obtém os navios da sala atual
      let roomShips = gameState.ships.get(roomName);
      if (!roomShips) {
        socket.emit('error', 'Não há navios nesta sala');
        return;
      }
      
      // Encontra o navio com o ID especificado
      const shipIndex = roomShips.features.findIndex(ship => ship.properties.id === data.id);
      if (shipIndex === -1) {
        socket.emit('error', 'Navio não encontrado');
        return;
      }
      
      // Verifica se o navio pertence ao usuário
      if (roomShips.features[shipIndex].properties.owner !== username) {
        socket.emit('error', 'Você só pode mover seus próprios navios');
        return;
      }
      
      // Atualiza as coordenadas do navio
      roomShips.features[shipIndex].geometry.coordinates = data.coordinates;
      
      // Notifica todos os usuários na sala sobre a atualização
      io.to(roomName).emit('shipUpdated', {
        id: data.id,
        coordinates: data.coordinates,
        properties: roomShips.features[shipIndex].properties
      });
      
      console.log(`Posição do navio ${data.id} atualizada por ${username} na sala ${roomName}`);
    });
    
    // Limpa os navios do usuário quando ele sai da sala
    socket.on('leaveRoom', () => {
      const username = gameState.socketIdToUsername.get(socket.id);
      if (!username) return;
      
      const roomName = gameState.userToRoom.get(username);
      if (!roomName) return;
      
      // Obtém os navios da sala atual
      let roomShips = gameState.ships.get(roomName);
      if (!roomShips) return;
      
      // Remove os navios do usuário
      roomShips.features = roomShips.features.filter(ship => ship.properties.owner !== username);
      
      // Notifica todos os usuários na sala sobre a atualização
      io.to(roomName).emit('shipsData', roomShips);
      
      console.log(`Navios de ${username} removidos da sala ${roomName}`);
    });
    
    // Também limpa os navios quando a sala é excluída
    socket.on('deleteRoom', (roomName) => {
      // Verifica se o usuário é o dono da sala
      const username = gameState.socketIdToUsername.get(socket.id);
      const room = gameState.rooms.get(roomName);
      
      if (room && room.owner === username) {
        // Remove os navios da sala
        gameState.ships.delete(roomName);
        console.log(`Navios da sala ${roomName} removidos`);
      }
    });
        
    // Limpa os navios do usuário quando ele se desconecta
    socket.on('disconnect', () => {
        const username = gameState.socketIdToUsername.get(socket.id);
        if (!username) return;
        
        const roomName = gameState.userToRoom.get(username);
        if (!roomName) return;
        
        let roomShips = gameState.ships.get(roomName);
        if (!roomShips) return;
        
        // Guarda os IDs dos navios que serão removidos
        const removedShips = roomShips.features.filter(ship => 
        ship.properties.owner === username
        );
        
        // Remove os navios do usuário
        roomShips.features = roomShips.features.filter(ship => 
        ship.properties.owner !== username
        );
        
        // Notifica todos os usuários na sala sobre a atualização
        io.to(roomName).emit('shipsData', roomShips);
        
        // Também emite um evento específico de desconexão para que o cliente saiba remover os círculos
        io.to(roomName).emit('playerDisconnected', username);
        
        // Para cada navio removido, emite um evento individual
        removedShips.forEach(ship => {
        io.to(roomName).emit('shipRemoved', ship.properties.id);
        });
        
        console.log(`Navios de ${username} removidos após desconexão`);
    });
  }
  
  module.exports = { setupShipHandlers };