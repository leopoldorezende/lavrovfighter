// Importar o state
import { state } from './state.js';

// Função para exibir os detalhes do país
function displayCountryDetails(countryName) {
  // Verifica se temos os dados do país
  if (!state.countriesData || !state.countriesData[countryName]) {
    console.log(`Dados para o país ${countryName} não encontrados`);
    return;
  }

  // Obtém os dados do país selecionado
  const country = state.countriesData[countryName];
  
  // Ativa a aba de país
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-target') === 'country') {
      tab.classList.add('active');
    }
  });
  
  contents.forEach(content => {
    content.classList.remove('active');
    if (content.id === 'country') {
      content.classList.add('active');
    }
  });
  
  // Cria o HTML com as informações do país
  let countryDetailsContainer = document.getElementById('country-details');
  
  // Verifica se o elemento existe
  if (!countryDetailsContainer) {
    console.error('Elemento #country-details não encontrado no DOM');
    
    // Tenta criar o elemento se não existir
    const countryTab = document.getElementById('country');
    if (countryTab) {
      console.log('Criando elemento #country-details dinamicamente');
      const detailsDiv = document.createElement('div');
      detailsDiv.id = 'country-details';
      countryTab.appendChild(detailsDiv);
      
      // Atualiza a referência
      countryDetailsContainer = detailsDiv;
    } else {
      console.error('Elemento #country também não encontrado. Não é possível mostrar detalhes do país.');
      return;
    }
  }
  
  // Nome localizado do país
  const localizedName = country.name || countryName;
  
  // Verifica se este país tem um jogador online
  let playerName = null;
  if (state.players && state.players.length > 0) {
    // Busca um jogador que tenha este país
    for (const player of state.players) {
      // O formato é "username (country)"
      const match = player.match(/(.+) \((.+)\)/);
      if (match && match[2] === countryName) {
        playerName = match[1];
        break;
      }
    }
  }
  
  // Estrutura o HTML com as informações do país
  let html = `
    <h3>${localizedName}</h3>
    ${playerName ? `<p class="player-name">Controlado por: <strong>${playerName}</strong></p>` : ''}
    <div class="country-info">
      <div class="country-stats">
        <p><strong>População:</strong> ${formatValue(country.population)}</p>
        <p><strong>PIB:</strong> ${formatValue(country.gdp)}</p>
        <p><strong>Tesouro:</strong> ${formatValue(country.treasury)}</p>
        <p><strong>P&D:</strong> ${formatValue(country.researchDevelopment)}</p>
        <p><strong>Felicidade:</strong> ${formatValue(country.happiness)}</p>
      </div>
      
      <div class="country-military">
        <h4>Poder Militar</h4>
        ${createMilitaryStats(country.military)}
      </div>
      
      <div class="country-relationships">
        <h4>Alianças</h4>
        ${createAlliancesList(country.economicAlliances, 'Econômicas')}
        ${createAlliancesList(country.militaryAlliances, 'Militares')}
      </div>
      
      <div class="country-borders">
        <h4>Fronteiras</h4>
        ${createBordersList(country.borders)}
      </div>
    </div>
  `;
  
  // Atualiza o conteúdo na div
  countryDetailsContainer.innerHTML = html;
}

// Formata valores com unidades
function formatValue(valueObj) {
  if (!valueObj) return 'N/A';
  
  if (typeof valueObj === 'object') {
    return `${valueObj.value} ${valueObj.unit || ''}`;
  }
  
  return valueObj;
}

// Cria representação visual do poder militar
function createMilitaryStats(military) {
  if (!military) return '<p>Informações militares não disponíveis</p>';
  
  let html = '<div class="military-bars">';
  
  for (const [force, value] of Object.entries(military)) {
    const forceName = {
      'navy': 'Marinha',
      'airforce': 'Força Aérea',
      'army': 'Exército',
      'space': 'Espacial'
    }[force] || force;
    
    html += `
      <div class="military-stat">
        <span>${forceName}</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${value}%"></div>
        </div>
        <span>${value}/100</span>
      </div>
    `;
  }
  
  html += '</div>';
  return html;
}

// Cria lista de alianças
function createAlliancesList(alliances, title) {
  if (!alliances || alliances.length === 0) {
    return `<p>Sem alianças ${title.toLowerCase()}</p>`;
  }
  
  let html = `<p>${title}:</p><ul class="alliances-list">`;
  
  alliances.forEach(ally => {
    // Se tivermos dados do aliado, usamos o nome localizado
    const allyName = state.countriesData[ally] ? 
      state.countriesData[ally].name : ally;
    
    html += `<li>${allyName}</li>`;
  });
  
  html += '</ul>';
  return html;
}

// Cria lista de fronteiras
function createBordersList(borders) {
  if (!borders || borders.length === 0) {
    return '<p>Sem fronteiras</p>';
  }
  
  let html = '<ul class="borders-list">';
  
  borders.forEach(border => {
    // Se tivermos dados do país fronteiriço, usamos o nome localizado
    const borderCountryName = state.countriesData[border.country] ? 
      state.countriesData[border.country].name : border.country;
    
    const borderType = border.type === 'land' ? 'terrestre' : 'marítima';
    const statusClass = border.enabled ? 'enabled' : 'disabled';
    const statusText = border.enabled ? 'aberta' : 'fechada';
    
    html += `
      <li class="${statusClass}">
        <span class="border-country">${borderCountryName}</span>
        <span class="border-type">(${borderType})</span>
        <span class="border-status">${statusText}</span>
      </li>
    `;
  });
  
  html += '</ul>';
  return html;
}

export { displayCountryDetails };