// chips.js - Gerenciamento de navios no jogo

import { state, shipState } from './state.js';
import { socket } from './socket-handler.js';
import { updateShipsList, updateEnemyShipsList, focusOnShip } from './ui.js';

// Configurações para os navios
const SHIP_CONFIG = {
  actionRadius: 200, // Raio de ação em km
  shipLimit: 3,      // Número máximo de navios por jogador
  // Pontos conhecidos no oceano para colocar navios em caso de emergência
  oceanPoints: [
    [-40, -30], // Atlântico Sul
    [0, 0],     // Atlântico Central
    [160, 0],   // Pacífico
    [90, 0],    // Índico
    [-150, 30]  // Pacífico Norte
  ]
};

// Adiciona a funcionalidade de navios ao mapa
function initializeShips() {
  if (!state.map || !state.map.loaded()) {
    console.log('Mapa não inicializado. Os navios serão carregados quando o mapa estiver pronto.');
    return;
  }

  // Carrega contornos de terra para verificar colisões
  loadLandBoundaries()
    .then(landGeojson => {
      state.landGeojson = landGeojson;
      console.log('Dados de contorno de terra carregados');
      
      // Adiciona a fonte de dados de navios ao mapa
      if (!state.map.getSource('ships')) {
        state.map.addSource('ships', {
          type: 'geojson',
          data: shipState
        });
        
        // Carrega ícone de navio e adiciona a camada
        loadShipIcon();
        
        // Adiciona event listeners para drag and drop
        addShipEventListeners();

        // Adiciona listener para eventos do botão de reset
        document.addEventListener('resetShips', resetPlayerShips);
      }
      
      // Solicita os dados atuais dos navios ao servidor
      socket.emit('requestShipsData');
    })
    .catch(error => {
      console.error('Erro ao carregar contornos de terra:', error);
      // Continua mesmo sem os dados de terra
      if (!state.map.getSource('ships')) {
        state.map.addSource('ships', {
          type: 'geojson',
          data: shipState
        });
        
        loadShipIcon();
        addShipEventListeners();
        
        // Adiciona listener para eventos do botão de reset
        document.addEventListener('resetShips', resetPlayerShips);
      }
      
      socket.emit('requestShipsData');
    });
}

// Carrega os contornos de terra para verificar colisões
async function loadLandBoundaries() {
  try {
    const response = await fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_land.geojson');
    return await response.json();
  } catch (err) {
    console.error("Erro ao carregar contornos de terra:", err);
    return null;
  }
}

// Carrega o ícone de navio e adiciona a camada ao mapa
function loadShipIcon() {
  const shipIcon = new Image();
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" width="400" height="400">
    <path d="M50,250 L200,400 L800,400 L950,250 L800,100 L200,100 Z" fill="#ccc" stroke="#333" stroke-width="10"/>
    <rect x="350" y="150" width="300" height="200" fill="#777" stroke="#333" stroke-width="5"/>
    <rect x="450" y="50" width="100" height="100" fill="#777" stroke="#333" stroke-width="5"/>
    <circle cx="200" cy="250" r="50" fill="#777" stroke="#fff" stroke-width="5"/>
    <circle cx="800" cy="250" r="50" fill="#aaa" stroke="#fff" stroke-width="5"/>
    <rect x="500" y="150" width="0" height="200" fill="#fff" stroke="#fff" stroke-width="20"/>
  </svg>`;
  
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  shipIcon.onload = () => {
    state.map.addImage('ship-icon', shipIcon, { pixelRatio: 2 });
    
    state.map.addLayer({
      id: 'ships-layer',
      type: 'symbol',
      source: 'ships',
      layout: {
        'icon-image': 'ship-icon',
        'icon-size': 0.2,
        'icon-allow-overlap': true,
        'text-field': ['get', 'name'],
        'text-offset': [0, 1],
        'text-anchor': 'top',
        'text-size': 16,
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        // Usa uma expressão para definir cores diferentes com base no proprietário do navio
        'text-color': [
          'case',
          ['==', ['get', 'owner'], socket.username || state.playerName], 
          'rgba(94, 78, 0, 0.9)', // Amarelo para seus navios
          'rgba(83, 38, 204, 0.9)'  // Roxo para navios de outros jogadores
        ]
      }
    });
    
    // Atualiza os círculos de raio para todos os navios
    updateAllRadiusCircles();
  };
  
  shipIcon.src = url;
}

// Adiciona event listeners para interação com os navios
function addShipEventListeners() {
  // Estado de arrastar
  let isDragging = false;
  let draggedShipId = null;
  let updateRequested = false;
  
  // ----------- SUPORTE PARA MOUSE -----------
  // Event listener para quando o usuário clica em um navio
  state.map.on('mousedown', 'ships-layer', (e) => {
    handlePointerDown(e);
  });
  
  // Event listener para mover o navio quando arrastado
  state.map.on('mousemove', (e) => {
    if (!isDragging) return;
    
    handlePointerMove(e);
  });
  
  // Event listener para quando o usuário solta o navio
  state.map.on('mouseup', (e) => {
    if (!isDragging) return;
    
    handlePointerUp(e);
  });
  
  // Event listener para quando o cursor sai do mapa
  state.map.on('mouseleave', () => {
    if (!isDragging) return;
    
    isDragging = false;
    draggedShipId = null;
    state.map.getCanvas().style.cursor = '';
  });
  
  // ----------- SUPORTE PARA TOUCHSCREEN -----------
  // Event listener para toque em um navio
  state.map.on('touchstart', 'ships-layer', (e) => {
    if (e.points.length !== 1) return; // Ignora multi-touch
    
    handlePointerDown(e);
  });
  
  // Event listener para mover o dedo com o navio
  state.map.on('touchmove', (e) => {
    if (!isDragging || e.points.length !== 1) return;
    
    // Previne o scroll da página enquanto arrasta
    e.preventDefault();
    
    handlePointerMove(e);
  });
  
  // Event listener para quando o usuário levanta o dedo
  state.map.on('touchend', (e) => {
    if (!isDragging) return;
    
    handlePointerUp(e);
  });
  
  // Event listener para quando o toque é cancelado
  state.map.on('touchcancel', () => {
    if (!isDragging) return;
    
    isDragging = false;
    draggedShipId = null;
  });
  
  // ----------- FUNÇÕES COMPARTILHADAS -----------
  // Função para lidar com o início do arrasto (mousedown ou touchstart)
  function handlePointerDown(e) {
    // Previne comportamento padrão
    e.preventDefault();
    
    // Verifica se o navio é do usuário atual
    const features = state.map.queryRenderedFeatures(e.point, { layers: ['ships-layer'] });
    if (!features.length) return;
    
    const shipOwner = features[0].properties.owner;
    const playerName = socket.username || state.playerName;
    
    if (shipOwner !== playerName) {
      console.log(`Este navio pertence a ${shipOwner}. Você só pode mover seus próprios navios.`);
      return;
    }
    
    isDragging = true;
    draggedShipId = features[0].properties.id;
    state.map.getCanvas().style.cursor = 'grabbing';
    
    // Destaca o navio na lista da UI
    document.querySelectorAll('.ship-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.id === draggedShipId) {
        item.classList.add('active');
      }
    });
  }
  
  // Função para lidar com o movimento durante o arrasto (mousemove ou touchmove)
  function handlePointerMove(e) {
    // Para touchmove, precisamos acessar as coordenadas do toque
    let lngLat;
    
    if (e.type === 'touchmove') {
      // Obter coordenadas do toque para eventos touch
      lngLat = state.map.unproject(e.point);
    } else {
      // Usar e.lngLat para eventos de mouse
      lngLat = e.lngLat;
    }
    
    const newCoordinates = [lngLat.lng, lngLat.lat];
    
    if (!updateRequested) {
      updateRequested = true;
      requestAnimationFrame(() => {
        updateShipPosition(draggedShipId, newCoordinates, false);
        updateRequested = false;
      });
    }
  }
  
  // Função para lidar com o fim do arrasto (mouseup ou touchend)
  function handlePointerUp(e) {
    // Para touchend, precisamos usar a última posição conhecida
    let coordinates;
    
    if (e.type === 'touchend') {
      // Se for touchend, usamos a última posição conhecida do navio
      const shipIndex = shipState.features.findIndex(f => f.properties.id === draggedShipId);
      if (shipIndex !== -1) {
        coordinates = shipState.features[shipIndex].geometry.coordinates;
      } else {
        // Fallback se não encontrar o navio no estado
        coordinates = state.map.unproject(e.point);
        coordinates = [coordinates.lng, coordinates.lat];
      }
    } else {
      // Para mouse, usamos a posição atual
      coordinates = [e.lngLat.lng, e.lngLat.lat];
    }
    
    handleShipPositioning(draggedShipId, coordinates);
    
    isDragging = false;
    draggedShipId = null;
    state.map.getCanvas().style.cursor = '';
  }
}

// Atualiza a posição de um navio
function updateShipPosition(shipId, coordinates, permanent = true) {
  const shipIndex = shipState.features.findIndex(f => f.properties.id === shipId);
  if (shipIndex === -1) return;
  
  // Atualiza as coordenadas no estado local
  shipState.features[shipIndex].geometry.coordinates = coordinates;
  
  // Atualiza o mapa
  if (state.map.getSource('ships')) {
    state.map.getSource('ships').setData(shipState);
  }
  
  // Atualiza o círculo de raio
  updateRadiusCircle(shipId);
  
  // Atualiza a lista de navios na UI
  updateShipsList();
  
  // Se for uma alteração permanente, enviar ao servidor
  if (permanent) {
    socket.emit('updateShipPosition', {
      id: shipId,
      coordinates: coordinates
    });
  }
}

// Verifica a posição do navio e o reposiciona se necessário (evita continentes)
function handleShipPositioning(shipId, coordinates) {
  let finalCoordinates = coordinates;
  
  if (state.landGeojson && isPointOnLand(coordinates)) {
    finalCoordinates = findNearestCoast(coordinates);
  } else if (!state.landGeojson) {
    // Fallback se não tivermos dados de terra
    finalCoordinates = emergencyRelocate(coordinates);
  }
  
  updateShipPosition(shipId, finalCoordinates, true);
}

// Verifica se um ponto está em terra
function isPointOnLand(point) {
  if (!state.landGeojson) return false;
  
  try {
    const pointFeature = turf.point(point);
    for (const feature of state.landGeojson.features) {
      if (turf.booleanPointInPolygon(pointFeature, feature)) {
        return true;
      }
    }
    return false;
  } catch (e) {
    console.error("Erro ao verificar terreno:", e);
    return false;
  }
}

// Encontra o ponto mais próximo no litoral
function findNearestCoast(point) {
  if (!state.landGeojson) return point;
  
  try {
    let minDistance = Infinity;
    let closestPoint = point;
    
    for (const feature of state.landGeojson.features) {
      let coastline;
      
      if (feature.geometry.type === 'Polygon') {
        coastline = feature.geometry.coordinates[0];
      } else if (feature.geometry.type === 'MultiPolygon') {
        coastline = [];
        for (const polygon of feature.geometry.coordinates) {
          coastline = coastline.concat(polygon[0]);
        }
      } else {
        continue;
      }
      
      for (const coastPoint of coastline) {
        const distance = turf.distance(point, coastPoint, {units: 'kilometers'});
        
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = coastPoint;
        }
      }
    }
    
    // Calcula um ponto afastado da costa (em direção ao mar)
    const dx = point[0] - closestPoint[0];
    const dy = point[1] - closestPoint[1];
    
    const length = Math.sqrt(dx*dx + dy*dy);
    const ux = dx / length;
    const uy = dy / length;
    
    const offsetDistance = 2.0;
    const offshorePoint = [
      closestPoint[0] - ux * offsetDistance,
      closestPoint[1] - uy * offsetDistance
    ];
    
    // Verifica se o ponto ainda está em terra, se estiver, afasta mais
    if (isPointOnLand(offshorePoint)) {
      return [
        closestPoint[0] - ux * offsetDistance * 3,
        closestPoint[1] - uy * offsetDistance * 3
      ];
    }
    
    return offshorePoint;
  } catch (e) {
    console.error("Erro ao encontrar litoral:", e);
    return point;
  }
}

// Solução de emergência para relocalizar navios
function emergencyRelocate(point) {
  let minDistance = Infinity;
  let bestPoint = SHIP_CONFIG.oceanPoints[0];
  
  for (const oceanPoint of SHIP_CONFIG.oceanPoints) {
    const distance = turf.distance(point, oceanPoint, {units: 'kilometers'});
    if (distance < minDistance) {
      minDistance = distance;
      bestPoint = oceanPoint;
    }
  }
  
  return bestPoint;
}

// Cria ou atualiza o círculo geodésico para representar o raio de ação
function createGeodesicCircle(center, radiusKm, color, id) {
  const options = { steps: 256, units: 'kilometers' };
  const circle = turf.circle(center, radiusKm, options);
  
  // Extrai o código de cor base e ajusta a opacidade para o preenchimento
  const baseColor = color.slice(0, -4); // Remove a parte de opacidade
  const fillColor = baseColor + "0.9)"; // Opacidade de 0.2 para o preenchimento
  const borderColor = baseColor + "0.9)"; // Opacidade de 0.8 para a borda
  
  if (state.map.getSource(`radius-source-${id}`)) {
    state.map.getSource(`radius-source-${id}`).setData(circle);
  } else {
    state.map.addSource(`radius-source-${id}`, { 
      type: 'geojson', 
      data: circle 
    });
    
    state.map.addLayer({
      id: `radius-fill-${id}`,
      type: 'fill',
      source: `radius-source-${id}`,
      paint: { 
        'fill-color': fillColor,
        'fill-opacity': 0.15 
      }
    });
    
    state.map.addLayer({
      id: `radius-border-${id}`,
      type: 'line',
      source: `radius-source-${id}`,
      layout: { 
        'line-cap': 'round', 
        'line-join': 'round' 
      },
      paint: { 
        'line-color': borderColor,
        'line-width': 1,
        'line-opacity': 0.8 
      }
    });
  }
}
// Atualiza o círculo de raio para um navio específico
function updateRadiusCircle(id) {
  const ship = shipState.features.find(f => f.properties.id === id);
  if (ship) {
    // Determina a cor com base no proprietário do navio
    const playerName = socket.username || state.playerName;
    let circleColor;
    
    // Se o navio pertence ao jogador atual, usa amarelo
    if (ship.properties.owner === playerName) {
      circleColor = "rgba(255, 213, 0, 0.9)"; // Amarelo
    } else {
      circleColor = "rgba(132, 93, 238, 0.9)"; // Roxo
    }
    
    // Cria o círculo com a cor determinada
    createGeodesicCircle(
      ship.geometry.coordinates, 
      SHIP_CONFIG.actionRadius, 
      circleColor, 
      id
    );
  }
}

// Atualiza os círculos de raio para todos os navios
function updateAllRadiusCircles() {
  shipState.features.forEach(ship => {
    updateRadiusCircle(ship.properties.id);
  });
}

// Adiciona um novo navio
function addShip(shipInfo) {
  // Determina a cor com base no proprietário do navio para consistência na UI
  const playerName = socket.username || state.playerName;
  const textColor = shipInfo.properties.owner === playerName 
    ? 'rgba(255, 213, 0, 0.9)'  // Amarelo para seus navios
    : 'rgba(132, 93, 238, 0.9)'; // Roxo para navios de outros jogadores
  
  // Armazena a cor do texto para uso na UI
  shipInfo.properties.textColor = textColor;
  
  // Verifica se já temos o navio
  const existingShipIndex = shipState.features.findIndex(f => f.properties.id === shipInfo.id);
  
  if (existingShipIndex !== -1) {
    // Atualiza o navio existente
    shipState.features[existingShipIndex].geometry.coordinates = shipInfo.coordinates;
    shipState.features[existingShipIndex].properties = shipInfo.properties;
  } else {
    // Adiciona um novo navio
    shipState.features.push({
      type: 'Feature',
      properties: shipInfo.properties,
      geometry: {
        type: 'Point',
        coordinates: shipInfo.coordinates
      }
    });
  }
  
  // Atualiza a visualização
  if (state.map && state.map.getSource('ships')) {
    state.map.getSource('ships').setData(shipState);
    updateRadiusCircle(shipInfo.id);
  }
  
  // Atualiza as listas de navios na interface
  updateShipsList();
  updateEnemyShipsList();
}

// Modifique a função updateShips para remover círculos de navios que não existem mais

function updateShips(shipsData) {
  // Guarda IDs dos navios atuais para comparação
  const currentShipIds = shipState.features.map(ship => ship.properties.id);
  
  // Faz uma cópia dos dados recebidos para evitar referência
  shipState.features = shipsData.features ? [...shipsData.features] : [];
  
  // Identifica os navios que foram removidos
  const newShipIds = shipState.features.map(ship => ship.properties.id);
  const removedShipIds = currentShipIds.filter(id => !newShipIds.includes(id));
  
  // Remove os círculos de raio dos navios removidos
  removedShipIds.forEach(shipId => {
    removeShipRadiusCircles(shipId);
  });
  
  if (state.map && state.map.getSource('ships')) {
    state.map.getSource('ships').setData(shipState);
    updateAllRadiusCircles();
  }
  
  // Atualiza as listas de navios na interface
  updateShipsList();
  updateEnemyShipsList();
  
  // Se algum navio foi removido, registre no console
  if (removedShipIds.length > 0) {
    console.log(`Navios removidos: ${removedShipIds.join(', ')}`);
  }
}



function removeShipRadiusCircles(shipId) {
  // Remove as camadas de círculo associadas a este navio
  if (state.map) {
    // Remove a camada de preenchimento do círculo
    if (state.map.getLayer(`radius-fill-${shipId}`)) {
      state.map.removeLayer(`radius-fill-${shipId}`);
    }
    
    // Remove a camada de borda do círculo
    if (state.map.getLayer(`radius-border-${shipId}`)) {
      state.map.removeLayer(`radius-border-${shipId}`);
    }
    
    // Remove a fonte de dados do círculo
    if (state.map.getSource(`radius-source-${shipId}`)) {
      state.map.removeSource(`radius-source-${shipId}`);
    }
    
    console.log(`Círculos de raio removidos para o navio: ${shipId}`);
  }
}


// Cria navios iniciais para o jogador
function createInitialShips() {
  // Define o nome do jogador para uso no shipState
  if (!state.playerName && socket.username) {
    state.playerName = socket.username;
  }
  
  // Verifica se já temos a cota de navios
  const playerName = socket.username || state.playerName;
  const myShips = shipState.features.filter(f => f.properties.owner === playerName);
  
  if (myShips.length >= SHIP_CONFIG.shipLimit) {
    console.log(`Você já possui ${SHIP_CONFIG.shipLimit} navios.`);
    return;
  }
  
  // Função para gerar uma posição inicial no oceano
  const generateInitialPosition = () => {
    // Se temos um país, usamos sua posição como referência
    if (state.myCountry && state.countriesData[state.myCountry]) {
      const country = state.countriesData[state.myCountry];
      if (country.coordinates) {
        // Gera uma posição aleatória no oceano perto do país
        const baseCoords = country.coordinates;
        const offsetX = (Math.random() - 0.5) * 20; // ±10 graus
        const offsetY = (Math.random() - 0.5) * 10; // ±5 graus
        
        return [baseCoords[0] + offsetX, baseCoords[1] + offsetY];
      }
    }
    
    // Fallback: usa uma posição aleatória no oceano
    const oceanPoint = SHIP_CONFIG.oceanPoints[Math.floor(Math.random() * SHIP_CONFIG.oceanPoints.length)];
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 5;
    
    return [oceanPoint[0] + offsetX, oceanPoint[1] + offsetY];
  };
  
  // Determina a cor associada ao jogador
  let playerColor = "#3366CC"; // Cor padrão
  
  // Gera uma cor consistente baseada no nome de usuário
  if (playerName) {
    // Hash simples do nome de usuário
    let hash = 0;
    for (let i = 0; i < playerName.length; i++) {
      hash = playerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Converte para uma cor hexadecimal
    playerColor = '#' + ((hash & 0xFFFFFF) | 0x1000000).toString(16).substring(1);
  }
  
  // Cria os navios que faltam
  const shipsToCreate = SHIP_CONFIG.shipLimit - myShips.length;
  
  for (let i = 0; i < shipsToCreate; i++) {
    // Gera um ID único para o navio
    const shipId = `${playerName}-ship-${Date.now()}-${i}`;
    
    // Posição inicial (no oceano)
    let initialPosition = generateInitialPosition();
    
    // Verifica se a posição é válida (não está em terra)
    if (state.landGeojson && isPointOnLand(initialPosition)) {
      initialPosition = findNearestCoast(initialPosition);
    }
    
    // Nome do navio (baseado no país)
    const shipName = state.myCountry ? `${state.myCountry} ${i+1}` : `Navio ${i+1}`;
    
    // Cria o navio
    const newShip = {
      id: shipId,
      coordinates: initialPosition,
      properties: {
        id: shipId,
        name: shipName,
        owner: playerName,
        country: state.myCountry,
        color: playerColor
      }
    };
    
    // Adiciona localmente
    addShip(newShip);
    
    // Envia ao servidor
    socket.emit('addShip', newShip);
  }
  
  // Foca no primeiro navio do jogador
  const focusShip = shipState.features.find(f => f.properties.owner === playerName);
  if (focusShip) {
    focusOnShip(focusShip.properties.id);
  }
}

// Reposiciona todos os navios do jogador
function resetPlayerShips() {
  const playerName = socket.username || state.playerName;
  
  // Filtra os navios do jogador
  const myShips = shipState.features.filter(f => f.properties.owner === playerName);
  
  // Para cada navio, gera uma nova posição
  myShips.forEach(ship => {
    // Gera uma nova posição aleatória
    let newPosition = generateRandomOceanPosition();
    
    // Verifica se a posição é válida (não está em terra)
    if (state.landGeojson && isPointOnLand(newPosition)) {
      newPosition = findNearestCoast(newPosition);
    }
    
    // Atualiza localmente
    updateShipPosition(ship.properties.id, newPosition, true);
  });
  
  // Foca no primeiro navio reposicionado, se houver algum
  if (myShips.length > 0) {
    focusOnShip(myShips[0].properties.id);
  }
}

// Gera uma posição aleatória no oceano
function generateRandomOceanPosition() {
  // Se temos um país, usamos sua posição como referência
  if (state.myCountry && state.countriesData[state.myCountry]) {
    const country = state.countriesData[state.myCountry];
    if (country.coordinates) {
      // Gera uma posição aleatória no oceano perto do país
      const baseCoords = country.coordinates;
      const offsetX = (Math.random() - 0.5) * 20; // ±10 graus
      const offsetY = (Math.random() - 0.5) * 10; // ±5 graus
      
      return [baseCoords[0] + offsetX, baseCoords[1] + offsetY];
    }
  }
  
  // Fallback: usa uma posição aleatória no oceano
  const oceanPoint = SHIP_CONFIG.oceanPoints[Math.floor(Math.random() * SHIP_CONFIG.oceanPoints.length)];
  const offsetX = (Math.random() - 0.5) * 10;
  const offsetY = (Math.random() - 0.5) * 5;
  
  return [oceanPoint[0] + offsetX, oceanPoint[1] + offsetY];
}

// Configuração de handlers de socket para sincronização dos navios
function setupShipSocketHandlers() {
  // Recebe todos os navios atuais
  socket.on('shipsData', (data) => {
    console.log('Dados de navios recebidos:', data);
    updateShips(data);
  });
  
  // Recebe atualizações de um navio específico
  socket.on('shipUpdated', (shipInfo) => {
    console.log('Navio atualizado:', shipInfo);
    addShip(shipInfo);
  });
  
  // Quando entrar em uma sala, inicializa os navios
  socket.on('roomJoined', () => {
    // Salva o nome do jogador para referência
    state.playerName = socket.username;
    
    // Solicita os dados dos navios
    socket.emit('requestShipsData');
    
    // Cria navios iniciais para o jogador
    setTimeout(() => {
      if (state.map && state.map.loaded()) {
        createInitialShips();
      } else {
        state.map.on('load', () => {
          createInitialShips();
        });
      }
    }, 2000); // Pequeno atraso para garantir que tudo está carregado
  });

  // Adicione um manipulador para o evento playerDisconnected
  socket.on('playerDisconnected', (username) => {
    console.log(`Jogador desconectado: ${username}`);
    
    // Encontre todos os navios do jogador desconectado
    const playerShips = shipState.features.filter(ship => ship.properties.owner === username);
    
    // Remove os círculos de raio para cada navio do jogador
    playerShips.forEach(ship => {
      removeShipRadiusCircles(ship.properties.id);
    });
    
    // Atualiza o estado local removendo os navios do jogador
    shipState.features = shipState.features.filter(ship => ship.properties.owner !== username);
    
    // Atualiza a visualização
    if (state.map && state.map.getSource('ships')) {
      state.map.getSource('ships').setData(shipState);
    }
    
    // Atualiza as listas de navios na interface
    updateShipsList();
    updateEnemyShipsList();
  });
}


socket.on('shipRemoved', (shipId) => {
  console.log(`Navio removido pelo servidor: ${shipId}`);
  
  // Remove o navio do estado local
  const shipIndex = shipState.features.findIndex(ship => ship.properties.id === shipId);
  if (shipIndex !== -1) {
    shipState.features.splice(shipIndex, 1);
    
    // Atualiza a visualização
    if (state.map && state.map.getSource('ships')) {
      state.map.getSource('ships').setData(shipState);
    }
    
    // Remove os círculos de raio
    removeShipRadiusCircles(shipId);
    
    // Atualiza as listas de navios na interface
    updateShipsList();
    updateEnemyShipsList();
  }
});

export { 
  initializeShips, 
  updateShips, 
  addShip, 
  createInitialShips, 
  setupShipSocketHandlers,
  updateShipPosition,
  focusOnShip
};