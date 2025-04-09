// api.js - Comunicação com APIs externas

// Carrega os dados dos países do servidor
function loadCountriesData() {
  return fetch('/countriesData.json')
    .then(response => response.json())
    .then(data => {
      console.log('countriesData carregado:', data);
      return data;
    })
    .catch(error => {
      console.error('Erro ao carregar countriesData:', error);
      return null;
    });
}

// Obtém token do Mapbox do servidor
function getMapboxToken() {
  return fetch('/api/mapbox', {
    headers: { 'Authorization': 'lavrovpass' }
  })
    .then(response => {
      if (!response.ok) throw new Error('Não autorizado');
      return response.json();
    })
    .then(data => data.token)
    .catch(error => {
      console.error('Erro ao obter token do Mapbox:', error);
      throw error;
    });
}

// Carrega as coordenadas dos países do servidor
function loadCountriesCoordinates() {
  return fetch('/countriesCoordinates.json')
    .then(response => response.json())
    .then(data => {
      console.log('coordenadas carregadas:', data);
      return data;
    })
    .catch(error => {
      console.error('Erro ao carregar as coordenadas:', error);
      return null;
    });
}

// Nova função para carregar os dados de rotas do servidor
function loadRoutesData() {
  return fetch('/rotas.json')
    .then(response => response.json())
    .then(data => {
      console.log('Rotas carregadas:', data);
      return data;
    })
    .catch(error => {
      console.error('Erro ao carregar rotas:', error);
      return null;
    });
}

export { loadCountriesData, loadCountriesCoordinates, getMapboxToken, loadRoutesData };
