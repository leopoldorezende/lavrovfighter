// api.js - Comunicação com APIs externas

// Carrega os dados dos países do servidor
function loadCountryData() {
    return fetch('/countryData.json')
      .then(response => response.json())
      .then(data => {
        console.log('countryData carregado:', data);
        return data;
      })
      .catch(error => {
        console.error('Erro ao carregar countryData:', error);
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
  
  export { loadCountryData, getMapboxToken };