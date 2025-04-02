// map.js - Funcionalidades do mapa

import { socket } from './socket-handler.js';
import { state } from './state.js';
import { loadCountryData } from './api.js';

// Inicializar o mapa
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

        // Adiciona camada de preenchimento para os países
        state.map.addLayer({
          'id': 'country-fills',
          'type': 'fill',
          'source': 'countries',
          'source-layer': 'country_boundaries',
          'paint': {
            'fill-color': [
              'case',
              ['==', ['get', 'name_en'], state.myCountry], 'rgba(255, 220, 0, 0.8)',
              ['in', ['get', 'name_en'], ['literal', state.players.map(p => p.match(/\((.*)\)/)?.[1] || '')]], 'rgba(0, 200, 50, 0.8)',
              'rgba(30, 50, 70, 0)'
            ],
            'fill-opacity': 0.8
          }
        });
        
        // Adiciona camada de borda para os países ativos
        state.map.addLayer({
          'id': 'country-borders',
          'type': 'line',
          'source': 'countries',
          'source-layer': 'country_boundaries',
          'layout': {},
          'paint': {
            'line-color': '#333333',
            'line-width': 1,
            'line-opacity': [
              'case',
              ['==', ['get', 'name_en'], state.myCountry], 1,
              ['in', ['get', 'name_en'], ['literal', state.players.map(p => p.match(/\((.*)\)/)?.[1] || '')]], 1,
              0
            ]
          }
        });

        // Remove labels desnecessários
        const layers = state.map.getStyle().layers;
        layers.forEach(layer => {
          if (layer.type === 'symbol' && !layer.id.includes('country')) {
            state.map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });

        // Adiciona handler de clique para os países
        addCountryClickHandler();
        
        // Centraliza no país do jogador logo após o mapa carregar completamente
        // Aguarda um pequeno período para garantir que todos os dados do mapa estejam disponíveis
        setTimeout(() => {
          if (state.myCountry) {
            console.log('Centralizando automaticamente no país do jogador:', state.myCountry);
            centerMapOnCountry(state.myCountry);
          } else {
            console.log('País do jogador não definido, usando visão padrão do mapa');
          }
        }, 500);
      });

      // Removido o evento moveend para não salvar as coordenadas a cada movimento
    })
    .catch(error => console.error('Erro ao carregar mapa:', error));
}

// Adiciona handler para clique nos países
function addCountryClickHandler() {
  // Carrega dados dos países para validar cliques
  loadCountryData().then(countryData => {
    state.countryData = countryData;
    
    // Adiciona o handler de evento para clique no mapa
    state.map.on('click', (e) => {
      // Utiliza o Mapbox para encontrar os recursos no ponto clicado
      const features = state.map.queryRenderedFeatures(e.point, {
        layers: ['country-fills']
      });
      
      if (features.length > 0) {
        const clickedCountry = features[0].properties.name_en;
        console.log(`País clicado: ${clickedCountry}`);
        
        // Verifica se o país existe no countryData
        if (countryData && countryData[clickedCountry]) {
          centerMapOnCountry(clickedCountry);
        } else {
          console.log(`País ${clickedCountry} não encontrado no countryData`);
        }
      }
    });
  });
}

// Obter o centro de um país
function getCountryCenter(country) {
  if (!state.map || !state.map.loaded()) {
    console.log('Mapa não está totalmente carregado');
    return [0, 0];
  }
  
  try {
    // Coordenadas personalizadas para países grandes ou de formato irregular
    const customCoordinates = {
      "Russia": [90, 60],          // Centralizado mais na parte habitada
      "United States": [-98, 39.5], // Centro continental dos EUA
      "Canada": [-96, 62],         // Centralizado na parte habitada
      "Brazil": [-53, -10],        // Melhor visualização do território
      "Argentina": [-65, -38],     // Centralizado na parte continental
      "Australia": [134, -25],     // Centralizado no continente
      "China": [105, 35],          // Centralizado na massa terrestre
      "India": [80, 22],           // Centralizado no subcontinente
      "Indonesia": [120, -2],      // Centralizado no arquipélago
      "Mexico": [-102, 23],        // Centralizado no território continental
      "Chile": [-71, -37]          // Posição para melhor visualizar o formato alongado
    };
    
    // Se for um país com coordenadas personalizadas, use-as
    if (customCoordinates[country]) {
      console.log(`Usando coordenadas personalizadas para ${country}:`, customCoordinates[country]);
      return customCoordinates[country];
    }
    
    // Para outros países, primeiro tenta usar os dados do countryData se disponível
    if (state.countryData && state.countryData[country] && state.countryData[country].coordinates) {
      console.log(`Usando coordenadas de countryData para ${country}:`, state.countryData[country].coordinates);
      return state.countryData[country].coordinates;
    }
    
    // Tenta obter a geometria do país via Mapbox
    const features = state.map.querySourceFeatures('countries', {
      sourceLayer: 'country_boundaries',
      filter: ['==', ['get', 'name_en'], country]
    });
    
    if (features.length > 0) {
      // Usa o turf para calcular o centro de massa do país
      const feature = features[0];
      const center = turf.centerOfMass(feature).geometry.coordinates;
      console.log(`Centro calculado de ${country}:`, center);
      return center;
    } else {
      console.log(`Geometria para "${country}" não encontrada no viewport atual`);
      
      // Abordagem alternativa: usa uma visão global para tentar capturar todos os países
      const currentZoom = state.map.getZoom();
      const currentCenter = state.map.getCenter();
      
      // Temporariamente muda para visão global
      state.map.setZoom(1);
      state.map.setCenter([0, 0]);
      
      // Espera um momento para o mapa ser renderizado
      setTimeout(() => {
        const globalFeatures = state.map.querySourceFeatures('countries', {
          sourceLayer: 'country_boundaries',
          filter: ['==', ['get', 'name_en'], country]
        });
        
        // Restaura a visão anterior
        state.map.setZoom(currentZoom);
        state.map.setCenter(currentCenter);
        
        if (globalFeatures.length > 0) {
          const center = turf.centerOfMass(globalFeatures[0]).geometry.coordinates;
          console.log(`Centro alternativo de ${country}:`, center);
          return center;
        }
      }, 100);
      
      console.log(`País "${country}" não encontrado, usando posição padrão`);
      return [0, 0];
    }
  } catch (error) {
    console.error(`Erro ao calcular centro para ${country}:`, error);
    return [0, 0];
  }
}

// Centralizar o mapa em um país
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

// Realizar a centralização no mapa
function performCentering(country) {
  // Sempre calcula o centro do país, ignorando posições anteriores
  const center = getCountryCenter(country);
  if (center[0] === 0 && center[1] === 0) {
    console.log('Coordenadas inválidas, não centralizando');
    return;
  }
  
  animateToPosition(center, country);
}

// Anima o mapa para a posição desejada
function animateToPosition(center, country) {
  console.log(`Centralizando em ${country} com coordenadas:`, center);
  
  // Define zoom personalizado para países grandes
  let zoomLevel = 4; // Zoom padrão
  
  // Países que precisam de zoom personalizado
  const customZoomLevels = {
    "Russia": 3,
    "United States": 3,
    "Canada": 3,
    "Brazil": 3,
    "China": 3,
    "Australia": 3,
    "India": 3.5,
    "Argentina": 3.5,
    "Indonesia": 3.5,
    "Mexico": 3.5,
    "Chile": 3.5
  };
  
  // Aplica zoom personalizado se definido
  if (customZoomLevels[country]) {
    zoomLevel = customZoomLevels[country];
  }
  
  state.map.flyTo({
    center: center,
    zoom: zoomLevel,
    speed: 0.8,
    curve: 1,
    essential: true
  });
  updateMapColors();
}

// Atualizar as cores dos países no mapa
function updateMapColors() {
  if (!state.map || !state.map.getLayer('country-fills')) return;
  const activeCountries = state.players.map(player => player.match(/\((.*)\)/)?.[1] || '');
  
  // Atualiza as cores de preenchimento
  state.map.setPaintProperty('country-fills', 'fill-color', [
    'case',
    ['==', ['get', 'name_en'], state.myCountry], 'rgba(255, 220, 0, 0.8)',
    ['in', ['get', 'name_en'], ['literal', activeCountries]], 'rgba(0, 200, 50, 0.8)',
    'rgba(30, 50, 70, 0)'
  ]);
  
  // Atualiza a visibilidade das bordas
  if (state.map.getLayer('country-borders')) {
    state.map.setPaintProperty('country-borders', 'line-opacity', [
      'case',
      ['==', ['get', 'name_en'], state.myCountry], 1,
      ['in', ['get', 'name_en'], ['literal', activeCountries]], 1,
      0
    ]);
  }
}

export { initializeMap, getCountryCenter, centerMapOnCountry, updateMapColors };