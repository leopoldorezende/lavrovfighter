const socket = io();

const state = {
  map: null,
  players: [],
  myCountry: null,
  customData: {}
};

const enterButton = document.getElementById('enterButton');
const usernameInput = document.getElementById('username');

fetch('/countryData.json')
  .then(response => response.json())
  .then(data => {
    console.log('countryData carregado:', data);
  })
  .catch(error => console.error('Erro ao carregar countryData:', error));

// Verifica se já existe um usuário salvo ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    usernameInput.value = savedUsername;
    enterGame();
  }
});

enterButton.onclick = enterGame;
usernameInput.onkeyup = (e) => {
  if (e.key === 'Enter') enterGame();
};

function enterGame() {
  const usernameInputValue = usernameInput.value.trim();
  let username = usernameInputValue;

  const savedUsername = localStorage.getItem('username');
  if (!username && savedUsername) {
    username = savedUsername;
  }

  if (username) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    localStorage.setItem('username', username);
    socket.username = username;
    socket.emit('join', username);
    initializeMap(username); // Inicializa o mapa primeiro
    setupChat(username);
  } else {
    alert('Por favor, digite um nome!');
  }
}

function getCountryCenter(country) {
  if (!state.map || !state.map.loaded()) {
    console.log('Mapa não está totalmente carregado');
    return [0, 0];
  }
  const source = state.map.getSource('countries');
  if (!source) {
    console.log('Fonte de países não disponível');
    return [0, 0];
  }
  const features = source._data.features;
  const feature = features.find(f => f.properties.name === country);
  if (!feature) {
    console.log(`País "${country}" não encontrado no Mapbox`);
    return [0, 0];
  }
  const center = turf.centerOfMass(feature).geometry.coordinates;
  console.log(`Centro de ${country}:`, center);
  return center;
}

function initializeMap(username) {
  fetch('/api/mapbox', {
    headers: { 'Authorization': 'lavrovpass' }
  })
    .then(response => {
      if (!response.ok) throw new Error('Não autorizado');
      return response.json();
    })
    .then(data => {
      mapboxgl.accessToken = data.token;

      state.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 0],
        zoom: 1.5,
        maxBounds: [[-180, -90], [180, 90]]
      });

      state.map.on('load', () => {
        console.log('Mapa carregado com sucesso');
        state.map.addSource('countries', {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1'
        });

        state.map.addLayer({
          'id': 'country-fills',
          'type': 'fill',
          'source': 'countries',
          'source-layer': 'country_boundaries',
          'paint': {
            'fill-color': [
              'case',
              ['==', ['get', 'name_en'], state.myCountry], 'rgba(255, 255, 0, 0.8)',
              ['in', ['get', 'name_en'], ['literal', state.players.map(p => p.match(/\((.*)\)/)?.[1] || '')]], 'rgba(0, 255, 0, 0.8)',
              'rgba(30, 50, 70, 0)'
            ],
            'fill-opacity': 0.8
          }
        });

        // Remove labels desnecessários
        const layers = state.map.getStyle().layers;
        layers.forEach(layer => {
          if (layer.type === 'symbol' && !layer.id.includes('country')) {
            state.map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });

        // Centraliza no país assim que o mapa carregar, se myCountry já estiver definido
        if (state.myCountry) {
          centerMapOnCountry(state.myCountry);
        }
      });

      state.map.on('moveend', () => {
        const center = state.map.getCenter();
        socket.emit('updatePosition', { username: socket.username, position: [center.lng, center.lat] });
      });
    })
    .catch(error => console.error('Erro ao carregar mapa:', error));
}

function centerMapOnCountry(country) {
  if (!state.map) {
    console.log('Mapa não inicializado');
    return;
  }

  if (!state.map.loaded()) {
    console.log('Aguardando carregamento completo do mapa');
    state.map.once('load', () => {
      console.log('Mapa carregado, centralizando agora');
      performCentering(country);
    });
    return;
  }

  performCentering(country);
}

function performCentering(country) {
  const center = state.customData.lastPosition && state.customData.lastPosition[0] !== 0
    ? state.customData.lastPosition
    : getCountryCenter(country);
  if (center[0] === 0 && center[1] === 0) {
    console.log('Coordenadas inválidas, não centralizando');
    return;
  }
  console.log(`Centralizando em ${country} com coordenadas:`, center);
  state.map.flyTo({
    center: center,
    zoom: 4,
    speed: 0.8,
    curve: 1,
    essential: true
  });
  updateMapColors();
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
  if (state.map && state.map.loaded()) {
    updateMapColors();
  }
}

function updateMapColors() {
  if (!state.map || !state.map.getLayer('country-fills')) return;
  const activeCountries = state.players.map(player => player.match(/\((.*)\)/)?.[1] || '');
  state.map.setPaintProperty('country-fills', 'fill-color', [
    'case',
    ['==', ['get', 'name_en'], state.myCountry], 'rgba(255, 255, 0, 0.8)',
    ['in', ['get', 'name_en'], ['literal', activeCountries]], 'rgba(0, 255, 0, 0.8)',
    'rgba(30, 50, 70, 0)'
  ]);
}

function setupChat(username) {
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.getElementById('chat-messages');

  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      socket.emit('chatMessage', { username, message });
      chatInput.value = '';
    }
  }

  chatSend.onclick = sendMessage;
  chatInput.onkeyup = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  socket.on('chatMessage', ({ username: sender, message }) => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender.includes(username) ? 'self' : 'other');
    msgDiv.textContent = `${sender}: ${message}`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

socket.on('updatePlayers', (players) => {
  console.log('Jogadores atualizados:', players);
  updatePlayerList(players);
});

socket.on('stateRestored', (playerState) => {
  console.log('Estado restaurado:', playerState);
  state.myCountry = playerState.country;
  state.customData = playerState.customData || {};
  localStorage.setItem('myCountry', playerState.country);

  if (state.customData.lastMessage) {
    console.log('Última mensagem enviada:', state.customData.lastMessage);
  }

  // Centraliza o mapa imediatamente após receber o estado
  centerMapOnCountry(state.myCountry);
});

socket.on('connect', () => {
  console.log('Conectado ao servidor com ID:', socket.id);
});

function logout() {
  localStorage.removeItem('username');
  localStorage.removeItem('myCountry');
  socket.disconnect();
  document.getElementById('login-screen').style.display = 'block';
  document.getElementById('game-screen').style.display = 'none';
}