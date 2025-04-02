// map.js - Funcionalidades do mapa

import { socket } from './socket-handler.js';
import { state } from './state.js';

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

// Obter o centro de um país
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

// Atualizar as cores dos países no mapa
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

export { initializeMap, getCountryCenter, centerMapOnCountry, updateMapColors };