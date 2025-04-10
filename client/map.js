// map.js - Funcionalidades do mapa

import { state } from './state.js';
import { loadCountriesData, loadCountriesCoordinates, getMapboxToken, loadRoutesData } from './api.js';
import { displayCountryDetails } from './country-details.js';
import { initializeShips } from './chips.js'; // Importação do módulo de navios

let countriesCoordinates = {
  customZoomLevels: {},
  countries: {}
};

let currentRouteSources = [];
let currentRouteLayers = [];

// Inicializar o mapa
async function initializeMap(username) {
  try {
    if (state.map && state.map.loaded()) {
      console.log('Mapa já inicializado, atualizando apenas');
      if (state.myCountry) {
        setTimeout(() => {
          centerMapOnCountry(state.myCountry);
        }, 500);
      }
      return;
    }

    const coordinates = await loadCountriesCoordinates();
    if (coordinates) {
      countriesCoordinates = coordinates;
      console.log('Coordenadas carregadas com sucesso:', countriesCoordinates);
    }

    const token = await getMapboxToken();
    mapboxgl.accessToken = token;

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.innerHTML = '';
    }

    state.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/leopoldorezende/cklv3mqga2ki517m1zqftm5vp',
      language: "Portuguese",
      center: [0, 0],
      zoom: 1.5,
      maxZoom: 5.5,
      projection: 'globe' // Adicionado para suportar visualização de globo
    });

    // Adiciona efeito de névoa para melhor visualização dos oceanos
    state.map.on('style.load', () => {
      state.map.setFog({
        'color': 'rgb(217, 230, 255)',
        'high-color': 'rgb(243, 246, 255)',
        'horizon-blend': 0.1,
        'space-color': 'rgb(36, 42, 80)',
        'star-intensity': 0.4
      });
    });

    state.map.on('load', () => {
      console.log('Mapa carregado com sucesso');

      if (!state.map.getSource('countries')) {
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
              ['==', ['get', 'name_en'], state.myCountry], 'rgba(255, 213, 0, 0.9)',
              ['in', ['get', 'name_en'], ['literal', state.players.map(p => p.match(/\((.*)\)/)?.[1] || '')]], 'rgba(132, 93, 238, 0.9)',
              'rgba(30, 50, 70, 0)'
            ],
            'fill-opacity': 0.9
          }
        });

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
      } else {
        console.log('Fonte "countries" já existe, atualizando camadas');
        if (state.map.getLayer('country-fills')) {
          state.map.setPaintProperty('country-fills', 'fill-color', [
            'case',
            ['==', ['get', 'name_en'], state.myCountry], 'rgba(255, 213, 0, 0.9)',
            ['in', ['get', 'name_en'], ['literal', state.players.map(p => p.match(/\((.*)\)/)?.[1] || '')]], 'rgba(132, 93, 238, 0.9)',
            'rgba(30, 50, 70, 0)'
          ]);
        }
        if (state.map.getLayer('country-borders')) {
          state.map.setPaintProperty('country-borders', 'line-opacity', [
            'case',
            ['==', ['get', 'name_en'], state.myCountry], 1,
            ['in', ['get', 'name_en'], ['literal', state.players.map(p => p.match(/\((.*)\)/)?.[1] || '')]], 1,
            0
          ]);
        }
      }

      const layers = state.map.getStyle().layers;
      if (layers) {
        layers.forEach(layer => {
          if (layer && layer.type === 'symbol' && layer.id && !layer.id.includes('country')) {
            state.map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
          if (layer && layer.id && (layer.id.includes('road') || layer.id.includes('street') || layer.id.includes('highway'))) {
            state.map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
          if (layer && layer.id && layer.id.includes('admin') && 
             (layer.id.includes('state') || 
             layer.id.includes('province') || 
             layer.id.toLowerCase().includes('admin-1'))) {
            state.map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });
      }

      addCountryClickHandler();

      // Inicializa o sistema de navios após o mapa estar completamente carregado
      setTimeout(() => {
        initializeShips();
        
        if (state.myCountry) {
          console.log('Centralizando automaticamente no país do jogador:', state.myCountry);
          centerMapOnCountry(state.myCountry);
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
function addCountryClickHandler() {
  loadCountriesData().then(countriesData => {
    state.countriesData = countriesData;
    state.map.on('click', (e) => {
      // Verifica se a camada 'ships-layer' existe antes de consultá-la
      if (state.map.getLayer('ships-layer')) {
        // Verifica se clicou em um navio - se sim, não prossegue com a ação do país
        const shipFeatures = state.map.queryRenderedFeatures(e.point, {
          layers: ['ships-layer']
        });
        
        if (shipFeatures.length > 0) {
          // Clicou em um navio, não faz nada com os países
          return;
        }
      }
      
      e.originalEvent.stopPropagation();
      const sidebar = document.getElementById('sidebar');
      const features = state.map.queryRenderedFeatures(e.point, {
        layers: ['country-fills']
      });
      if (features.length > 0) {
        const clickedCountry = features[0].properties.name_en;
        // Se o país estiver presente em countriesData
        if (state.countriesData && state.countriesData[clickedCountry]) {
          console.log(`País válido clicado: ${clickedCountry}`);
          clearRoutes();
          centerMapOnCountry(clickedCountry);
          displayCountryDetails(clickedCountry);
          loadRoutesData().then(rotas => {
            if (rotas && rotas[clickedCountry] && Object.keys(rotas[clickedCountry]).length > 0) {
              displayCountryRoutes(clickedCountry);
            } else {
              console.log(`Não há rotas para o país ${clickedCountry}`);
            }
          }).catch(err => console.error(err));
          document.dispatchEvent(new CustomEvent('countrySelected', { 
            detail: { country: clickedCountry }
          }));
          const sidebarTabs = document.querySelectorAll('#sidebar .tab');
          const sidebarContents = document.querySelectorAll('#sidebar .tab-content');
          sidebarTabs.forEach(t => t.classList.remove('active'));
          sidebarContents.forEach(c => c.classList.remove('active'));
          const countryTab = document.querySelector('#sidebar .tab[data-target="country"]');
          const countryContent = document.getElementById('country');
          if (countryTab) countryTab.classList.add('active');
          if (countryContent) countryContent.classList.add('active');
          if (window.innerWidth <= 1200) {
            sidebar.classList.add('active');
          }
        } else {
          // Caso o país clicado não esteja em countriesData, remove as rotas exibidas anteriormente
          console.log(`País ${clickedCountry} não encontrado em countriesData. Removendo rotas.`);
          clearRoutes();
        }
      } else {
         console.log("Clique em área sem país. Removendo rotas.");
         clearRoutes();
      }
    });
  });
}



function getCountryCenter(country) {
  if (!state.map || !state.map.loaded()) {
    console.log('Mapa não está totalmente carregado');
    return [0, 0];
  }
  try {
    if (countriesCoordinates.countries && countriesCoordinates.countries[country]) {
      console.log(`Usando coordenadas personalizadas para ${country}:`, countriesCoordinates.countries[country]);
      return countriesCoordinates.countries[country];
    }
    if (state.countriesData && state.countriesData[country] && state.countriesData[country].coordinates) {
      console.log(`Usando coordenadas de countriesData para ${country}:`, state.countriesData[country].coordinates);
      return state.countriesData[country].coordinates;
    }
    const features = state.map.querySourceFeatures('countries', {
      sourceLayer: 'country_boundaries',
      filter: ['==', ['get', 'name_en'], country]
    });
    if (features.length > 0) {
      const feature = features[0];
      const center = turf.centerOfMass(feature).geometry.coordinates;
      console.log(`Centro calculado de ${country}:`, center);
      return center;
    } else {
      console.log(`Geometria para "${country}" não encontrada no viewport atual`);
      const currentZoom = state.map.getZoom();
      const currentCenter = state.map.getCenter();
      state.map.setZoom(1);
      state.map.setCenter([0, 0]);
      setTimeout(() => {
        const globalFeatures = state.map.querySourceFeatures('countries', {
          sourceLayer: 'country_boundaries',
          filter: ['==', ['get', 'name_en'], country]
        });
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
  const center = getCountryCenter(country);
  if (center[0] === 0 && center[1] === 0) {
    console.log('Coordenadas inválidas, não centralizando');
    return;
  }
  animateToPosition(center, country);
}

function animateToPosition(center, country) {
  console.log(`Centralizando em ${country} com coordenadas:`, center);
  let zoomLevel = 4;
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

function clearRoutes() {
  currentRouteLayers.forEach(layerId => {
    if (state.map.getLayer(layerId)) state.map.removeLayer(layerId);
  });
  currentRouteSources.forEach(sourceId => {
    if (state.map.getSource(sourceId)) state.map.removeSource(sourceId);
  });
  currentRouteLayers = [];
  currentRouteSources = [];
}

function displayCountryRoutes(country) {
  loadRoutesData()
    .then(rotas => {
      if (rotas && rotas[country] && Object.keys(rotas[country]).length > 0) {
        let count = 0;
        for (const rota in rotas[country]) {
          const coords = rotas[country][rota];
          if (!coords || coords.length === 0) continue;
          const sourceId = `${country}-source-${count}`;
          const layerId = `${country}-layer-${count}`;
          if (state.map.getSource(sourceId)) {
            if (state.map.getLayer(layerId)) {
              state.map.removeLayer(layerId);
            }
            state.map.removeSource(sourceId);
          }
          currentRouteSources.push(sourceId);
          currentRouteLayers.push(layerId);
          state.map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: coords
              }
            }
          });
          state.map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
              'line-width': 2
            }
          });
          count++;
        }
      } else {
        console.log(`Não há rotas para o país ${clickedCountry}`);
      }
    })
    .catch(error => {
      console.error('Erro ao carregar rotas:', error);
    });
}



export { initializeMap, getCountryCenter, centerMapOnCountry };