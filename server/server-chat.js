// server-chat.js - Lógica do sistema de chat

function setupChatHandlers(io, socket, gameState) {
    // Solicitação de histórico de chat privado
    socket.on('requestPrivateHistory', (targetUsername) => {
      const username = socket.username;
      if (!username || !targetUsername) return;
      
      const roomName = gameState.userToRoom.get(username);
      if (!roomName) return;
      
      const room = gameState.rooms.get(roomName);
      if (!room) return;
      
      const chatKey = gameState.getPrivateChatKey(username, targetUsername);
      const history = room.chatHistory.private.get(chatKey) || [];
      
      socket.emit('chatHistory', { 
        type: 'private', 
        target: targetUsername,
        messages: history 
      });
    });
  
    // Recebimento de mensagens (públicas ou privadas)
    socket.on('chatMessage', ({ username, message, isPrivate, recipient }) => {
      const roomName = gameState.userToRoom.get(username);
      if (!roomName) return;
      
      const stateKey = `${username}:${roomName}`;
      const playerState = gameState.playerStates.get(stateKey);
      if (!playerState) return;
      
      const room = gameState.rooms.get(roomName);
      if (!room) return;
      
      const country = playerState.country || 'Sem país';
      const fullUsername = `${country} - ${username}`;
      playerState.customData.lastMessage = message; // Atualiza a última mensagem
      
      // Cria objeto de mensagem
      const messageObj = { 
        username: fullUsername, 
        message, 
        timestamp: Date.now(),
        isPrivate: isPrivate,
        recipient: recipient
      };
      
      if (isPrivate && recipient) {
        // Mensagem privada
        const chatKey = gameState.getPrivateChatKey(username, recipient);
        
        // Inicializa o histórico se não existir
        if (!room.chatHistory.private.has(chatKey)) {
          room.chatHistory.private.set(chatKey, []);
        }
        
        // Adiciona a mensagem ao histórico privado
        const history = room.chatHistory.private.get(chatKey);
        history.push(messageObj);
        
        // Limita o tamanho do histórico
        if (history.length > gameState.MAX_CHAT_HISTORY) {
          history.shift();
        }
        
        console.log(`Mensagem privada de ${username} para ${recipient} na sala ${roomName}:`, message);
        
        // Encontrar o socket.id do destinatário
        let recipientSocketId = null;
        for (const [socketId, user] of gameState.socketIdToUsername.entries()) {
          if (user === recipient) {
            recipientSocketId = socketId;
            break;
          }
        }
        
        // Envia apenas para o remetente e o destinatário
        socket.emit('chatMessage', messageObj);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('chatMessage', messageObj);
        }
      } else {
        // Mensagem pública
        room.chatHistory.public.push(messageObj);
        
        // Limita o tamanho do histórico
        if (room.chatHistory.public.length > gameState.MAX_CHAT_HISTORY) {
          room.chatHistory.public.shift();
        }
        
        console.log(`Mensagem pública na sala ${roomName}:`, messageObj);
        io.to(roomName).emit('chatMessage', messageObj);
      }
    });
  }
  
  module.exports = { setupChatHandlers };