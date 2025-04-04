// map.js - Funcionalidades do mapa

import { state } from './state.js';
import { loadCountriesData, loadCountriesCoordinates, getMapboxToken } from './api.js';
import { displayCountryDetails } from './country-details.js';

// Variável global para armazenar os dados de coordenadas dos países
let countriesCoordinates = {
  customZoomLevels: {},
  countries: {}
};

// Inicializar o mapa
async function initializeMap(username) {
  try {
    // Carrega as coordenadas dos países primeiro
    const coordinates = await loadCountriesCoordinates();
    if (coordinates) {
      countriesCoordinates = coordinates;
      console.log('Coordenadas carregadas com sucesso:', countriesCoordinates);
    }
    
    // Usa a função getMapboxToken do api.js
    const token = await getMapboxToken();
    mapboxgl.accessToken = token;
    
    state.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/leopoldorezende/cklv3mqga2ki517m1zqftm5vp',
      // style: 'mapbox://styles/mapbox/streets-v12',
      // worldview: 'IN',
      language: "Portuguese",
      center: [0, 0],
      zoom: 1.5,
      maxZoom: 6,
      // maxBounds: [[-180, -90], [180, 90]]
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
        // 'filter': ['in', ['get', 'worldview'], ['literal', ['IN', 'all']]],
        'paint': {
          'fill-color': [
            'case',
            ['==', ['get', 'name_en'], state.myCountry], 'rgba(255, 213, 0, 0.9)',
            ['in', ['get', 'name_en'], ['literal', state.players.map(p => p.match(/\((.*)\)/)?.[1] || '')]], 'rgba(132, 93, 238, 0.9)',
            'rgba(30, 50, 70, 0)'
          ],
          'fill-opacity': 0.9
        }
      });


      // Adiciona camada de borda para os países ativos
      state.map.addLayer({
        'id': 'country-borders',
        'type': 'line',
        'source': 'countries',
        'source-layer': 'country_boundaries',
        // 'filter': ['in', ['get', 'worldview'], ['literal', ['IN', 'all']]],
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
        if (layer.id.includes('road') || layer.id.includes('street') || layer.id.includes('highway')) {
          state.map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
        if (layer.id.includes('admin') && 
           (layer.id.includes('state') || 
           layer.id.includes('province') || 
           layer.id.toLowerCase().includes('admin-1'))) {
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
          // Exibe detalhes do país do jogador
          displayCountryDetails(state.myCountry);
        } else {
          console.log('País do jogador não definido, usando visão padrão do mapa');
        }
      }, 1000);
    });
  } catch (error) {
    console.error('Erro ao inicializar o mapa:', error);
  }
}

// Adiciona handler para clique nos países
function addCountryClickHandler() {
  // Carrega dados dos países para validar cliques
  loadCountriesData().then(countriesData => {
    state.countriesData = countriesData;
    
    // Adiciona o handler de evento para clique no mapa
    state.map.on('click', (e) => {
      // Utiliza o Mapbox para encontrar os recursos no ponto clicado
      const features = state.map.queryRenderedFeatures(e.point, {
        layers: ['country-fills']
      });
      
      if (features.length > 0) {
        const clickedCountry = features[0].properties.name_en;
        console.log(`País clicado: ${clickedCountry}`);
        
        // Verifica se o país existe no countriesData
        if (countriesData && countriesData[clickedCountry]) {
          centerMapOnCountry(clickedCountry);
          
          // Exibe os detalhes do país clicado
          displayCountryDetails(clickedCountry);
        } else {
          console.log(`País ${clickedCountry} não encontrado no countriesData`);
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
    // Verifica se o país está no arquivo de coordenadas personalizadas
    if (countriesCoordinates.countries && countriesCoordinates.countries[country]) {
      console.log(`Usando coordenadas personalizadas para ${country}:`, countriesCoordinates.countries[country]);
      return countriesCoordinates.countries[country];
    }
    
    // Para outros países, primeiro tenta usar os dados do countriesData se disponível
    if (state.countriesData && state.countriesData[country] && state.countriesData[country].coordinates) {
      console.log(`Usando coordenadas de countriesData para ${country}:`, state.countriesData[country].coordinates);
      return state.countriesData[country].coordinates;
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
  
  // Define zoom padrão
  let zoomLevel = 4;
  
  // Aplica zoom personalizado se definido no arquivo JSON
  if (countriesCoordinates.customZoomLevels && countriesCoordinates.customZoomLevels[country]) {
    zoomLevel = countriesCoordinates.customZoomLevels[country];
  }
  
  state.map.flyTo({
    center: center,
    zoom: zoomLevel,
    speed: 0.8,
    curve: 1,
    essential: true
  });
}

export { initializeMap, getCountryCenter, centerMapOnCountry };