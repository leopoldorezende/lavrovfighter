// country-details.js

// Importar o state e updateSidetools (mantida a importação caso seja necessária em outros contextos)
import { state } from './state.js';
import { updateSidetools } from './economy-updater.js';

// Função para exibir os detalhes do país
function displayCountryDetails(countryName) {
  // Verifica se temos os dados do país
  if (!state.countriesData || !state.countriesData[countryName]) {
    console.log(`Dados para o país ${countryName} não encontrados`);
    return;
  }

  // Obtém os dados do país selecionado
  const country = state.countriesData[countryName];
  
  // Em vez de selecionar todas as abas com .tab, selecionamos apenas as da sidebar
const sidebar = document.getElementById('sidebar');
const tabs = sidebar.querySelectorAll('.tab');
const contents = sidebar.querySelectorAll('.tab-content');

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
  
  if (!countryDetailsContainer) {
    console.error('Elemento #country-details não encontrado no DOM');
    const countryTab = document.getElementById('country');
    if (countryTab) {
      console.log('Criando elemento #country-details dinamicamente');
      const detailsDiv = document.createElement('div');
      detailsDiv.id = 'country-details';
      countryTab.appendChild(detailsDiv);
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
    for (const player of state.players) {
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
        <p><strong>População:</strong> ${formatNumber(country.population)}</p>
        <p><strong>PIB:</strong> ${formatValue(country.economy.gdp)} (${country.economy.gdpGrowth}%)</p>
        <p><strong>Tesouro:</strong> ${formatValue(country.economy.treasury)}</p>
        <p><strong>IDH:</strong> ${country.hdi}</p>
        <p><strong>Desemprego:</strong> ${country.economy.unemployment}%</p>
      </div>
      
      <div class="country-military">
        <h4>Poder Militar</h4>
        ${createMilitaryStats(country.military)}
      </div>
      
      <div class="country-economy">
        <h4>Economia</h4>
        <p><strong>Inflação:</strong> ${country.economy.inflation}%</p>
        <p><strong>Dívida Pública:</strong> ${country.economy.publicDebtToGdp}% do PIB</p>
        <p><strong>Taxa de Juros:</strong> ${country.economy.interestRate}%</p>
        <p><strong>Popularidade:</strong> ${country.economy.popularity}%</p>
      </div>
      
      <div class="country-relationships">
        <h4>Alianças</h4>
        ${createAlliancesList(country.politics.economicAlliances, 'Econômicas')}
        ${createAlliancesList(country.politics.militaryAlliances, 'Militares')}
      </div>
      
      <div class="country-borders">
        <h4>Fronteiras</h4>
        ${createBordersList(country.borders)}
      </div>
    </div>
  `;
  
  // Atualiza o conteúdo na div
  countryDetailsContainer.innerHTML = html;
  
  // Removida a chamada a updateSidetools para que a sidetools não seja resetada automaticamente
}

// Função para formatar números com separadores
function formatNumber(value) {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('pt-BR').format(value);
}

// Função para formatar valores com unidades
function formatValue(valueObj) {
  if (!valueObj) return 'N/A';
  if (typeof valueObj === 'object') {
    if (valueObj.value >= 1000) {
      return `${(valueObj.value / 1000).toFixed(1)} trilhões ${valueObj.unit || ''}`;
    }
    return `${valueObj.value} ${valueObj.unit || ''}`;
  }
  return valueObj;
}

// Cria representação visual do poder militar
function createMilitaryStats(military) {
  if (!military) return '<p>Informações militares não disponíveis</p>';
  let html = '<div class="military-bars">';
  const militaryComponents = {
    'navy': 'Marinha',
    'airforce': 'Força Aérea',
    'army': 'Exército',
    'missiles': 'Mísseis'
  };
  for (const [force, label] of Object.entries(militaryComponents)) {
    if (military[force] !== undefined) {
      html += `
        <div class="military-stat">
          <span>${label}</span>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${military[force]}%"></div>
          </div>
          <span>${military[force]}/100</span>
        </div>
      `;
    }
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
  alliances.forEach(alliance => {
    const allyName = alliance.country;
    const condition = alliance.condition;
    html += `<li>${allyName} <span class="alliance-condition">(${condition})</span></li>`;
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
    const borderCountryName = border.country;
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
