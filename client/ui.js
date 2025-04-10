// ui.js - Manipulação da interface do usuário
import { centerMapOnCountry } from './map.js';
import { state, shipState } from './state.js'; // Importa também o estado dos navios

// Função para atualizar a lista de navios do jogador na interface
function updateShipsList() {
  const shipsList = document.getElementById('ships-list');
  if (!shipsList) return;
  
  // Limpa a lista atual
  shipsList.innerHTML = '';
  
  // Obtém os navios do jogador atual
  const myShips = shipState.features.filter(ship => 
    ship.properties && ship.properties.owner === state.playerName
  );
  
  if (myShips.length === 0) {
    shipsList.innerHTML = '<p>Você não possui navios. Eles serão criados automaticamente quando entrar em uma sala.</p>';
    return;
  }
  
  // Cria um item para cada navio
  myShips.forEach(ship => {
    const shipItem = document.createElement('div');
    shipItem.className = 'ship-item';
    shipItem.dataset.id = ship.properties.id;
    
    // Adiciona cor indicadora
    const colorIndicator = document.createElement('span');
    colorIndicator.className = 'ship-color-indicator';
    colorIndicator.style.backgroundColor = ship.properties.color;
    
    const shipInfo = document.createElement('div');
    shipInfo.className = 'ship-info';
    
    const shipName = document.createElement('div');
    shipName.className = 'ship-name';
    shipName.textContent = ship.properties.name;
    
    const shipCoords = document.createElement('div');
    shipCoords.className = 'ship-coords';
    const [lng, lat] = ship.geometry.coordinates;
    shipCoords.textContent = `Posição: ${lng.toFixed(1)}, ${lat.toFixed(1)}`;
    
    const focusButton = document.createElement('button');
    focusButton.className = 'focus-ship-btn';
    focusButton.textContent = 'Localizar';
    focusButton.onclick = (e) => {
      e.stopPropagation();
      focusOnShip(ship.properties.id);
    };
    
    shipInfo.appendChild(shipName);
    shipInfo.appendChild(shipCoords);
    
    shipItem.appendChild(colorIndicator);
    shipItem.appendChild(shipInfo);
    shipItem.appendChild(focusButton);
    
    // Adiciona evento de clique para selecionar o navio
    shipItem.addEventListener('click', () => {
      // Remove a classe ativa de todos os navios
      document.querySelectorAll('.ship-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Adiciona a classe ativa ao navio selecionado
      shipItem.classList.add('active');
      
      // Foca no navio
      focusOnShip(ship.properties.id);
    });
    
    shipsList.appendChild(shipItem);
  });
}

// Função para atualizar a lista de navios inimigos na interface
function updateEnemyShipsList() {
  const enemyShipsList = document.getElementById('enemy-ships-list');
  if (!enemyShipsList) return;
  
  // Limpa a lista atual
  enemyShipsList.innerHTML = '';
  
  // Obtém os navios de outros jogadores
  const enemyShips = shipState.features.filter(ship => 
    ship.properties && ship.properties.owner !== state.playerName
  );
  
  if (enemyShips.length === 0) {
    enemyShipsList.innerHTML = '<p>Nenhum navio inimigo detectado.</p>';
    return;
  }
  
  // Cria um item para cada navio inimigo
  enemyShips.forEach(ship => {
    const shipItem = document.createElement('div');
    shipItem.className = 'ship-item';
    shipItem.dataset.id = ship.properties.id;
    
    // Adiciona cor indicadora
    const colorIndicator = document.createElement('span');
    colorIndicator.className = 'ship-color-indicator';
    colorIndicator.style.backgroundColor = ship.properties.color;
    
    const shipInfo = document.createElement('div');
    shipInfo.className = 'ship-info';
    
    const shipName = document.createElement('div');
    shipName.className = 'ship-name';
    shipName.textContent = `${ship.properties.name} (${ship.properties.owner})`;
    
    const shipCoords = document.createElement('div');
    shipCoords.className = 'ship-coords';
    const [lng, lat] = ship.geometry.coordinates;
    shipCoords.textContent = `Posição: ${lng.toFixed(1)}, ${lat.toFixed(1)}`;
    
    const focusButton = document.createElement('button');
    focusButton.className = 'focus-ship-btn';
    focusButton.textContent = 'Localizar';
    focusButton.onclick = (e) => {
      e.stopPropagation();
      focusOnShip(ship.properties.id);
    };
    
    shipInfo.appendChild(shipName);
    shipInfo.appendChild(shipCoords);
    
    shipItem.appendChild(colorIndicator);
    shipItem.appendChild(shipInfo);
    shipItem.appendChild(focusButton);
    
    enemyShipsList.appendChild(shipItem);
  });
}

// Função para focar em um navio específico
function focusOnShip(shipId) {
  const ship = shipState.features.find(s => s.properties.id === shipId);
  if (!ship) return;
  
  // Centraliza o mapa nas coordenadas do navio
  if (state.map && state.map.loaded()) {
    state.map.flyTo({
      center: ship.geometry.coordinates,
      zoom: 5,
      speed: 0.8,
      curve: 1,
      essential: true
    });
  }
}

// Inicializa os handlers para elementos da UI
function initUIHandlers() {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const buttonTools = document.getElementById('button-tools');
  const sidetools = document.getElementById('sidetools');
  
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    sidetools.classList.remove('active');
  });
  
  buttonTools.addEventListener('click', () => {
    sidetools.classList.toggle('active');
    sidebar.classList.remove('active');
  });
  

  document.addEventListener('click', (e) => {
    if (window.innerWidth > 1200) return; // Aplica somente em mobile

    const clickedInSidebar = sidebar.contains(e.target);
    const clickedInSidetools = sidetools.contains(e.target);
    const clickedInHamburger = hamburger.contains(e.target);
    const clickedInToolsBtn = buttonTools.contains(e.target);

    // Se o clique ocorrer fora de todos os elementos, fecha ambos
    if (!clickedInSidebar && !clickedInSidetools && !clickedInHamburger && !clickedInToolsBtn) {
      if(sidebar.classList.contains('active') || sidetools.classList.contains('active')) {
        e.stopPropagation();
        sidebar.classList.remove('active');
        sidetools.classList.remove('active');
      }
    }
  }, true);  // Usando o modo de captura

  
  // Manipulador para abas da sidebar
  const sidebarTabs = sidebar.querySelectorAll('.tab');
  const sidebarContents = sidebar.querySelectorAll('.tab-content');
  
  sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');

      sidebarTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      sidebarContents.forEach(c => {
        c.classList.remove('active');
        if(c.id === target) c.classList.add('active');
      });
    });
  });

  // Manipulador para abas do sidetools
  const sidetoolsTabs = sidetools.querySelectorAll('.tab');
  const sidetoolsContents = sidetools.querySelectorAll('.tab-content');
  
  sidetoolsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');

      sidetoolsTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      sidetoolsContents.forEach(c => {
        c.classList.remove('active');
        if(c.id === target) c.classList.add('active');
      });
      
      // Se a aba selecionada for a de navios, atualiza as listas
      if (target === 'ships') {
        updateShipsList();
        updateEnemyShipsList();
      }
    });
  });
  
  // Manipulador para botões específicos da funcionalidade de navios
  const locateShipsBtn = document.getElementById('locate-ships');
  if (locateShipsBtn) {
    locateShipsBtn.addEventListener('click', () => {
      // Encontra os navios do jogador e centraliza no primeiro
      const myShips = shipState.features.filter(ship => 
        ship.properties && ship.properties.owner === state.playerName
      );
      
      if (myShips.length > 0) {
        focusOnShip(myShips[0].properties.id);
      } else {
        alert('Você não possui navios.');
      }
    });
  }
  
  const resetShipsBtn = document.getElementById('reset-ships');
  if (resetShipsBtn) {
    resetShipsBtn.addEventListener('click', () => {
      if (confirm('Deseja reposicionar seus navios? Isso irá relocalizá-los em novas posições no oceano.')) {
        // A lógica de reposicionamento está no chips.js
        document.dispatchEvent(new CustomEvent('resetShips'));
      }
    });
  }
  
  // Reseta a sidebar quando a tela for maior que 1200px
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1200) {
      sidebar.classList.remove('active');
    }
  });
}

// Alterna a visibilidade entre as diferentes telas
function showScreen(screenId) {
  const screens = ['login-screen', 'room-selection-screen', 'game-screen'];
  
  screens.forEach(screen => {
    document.getElementById(screen).style.display = 
      screen === screenId ? 'block' : 'none';
  });
}

export { 
  initUIHandlers, 
  showScreen, 
  updateShipsList, 
  updateEnemyShipsList, 
  focusOnShip 
};