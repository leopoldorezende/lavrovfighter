// economy-updater.js - Atualiza a interface com base nos dados econômicos

import { state } from './state.js';

// Função para atualizar todas as áreas da sidetools (Economia, Política e Militar) com os dados do país do jogador
function updateSidetools() {
  if (!state.myCountry || !state.countriesData || !state.countriesData[state.myCountry]) {
    console.log(`Dados para o país do jogador (${state.myCountry}) não encontrados`);
    return;
  }

  // Obtém os dados do país do jogador
  const country = state.countriesData[state.myCountry];
  
 // Atualiza o nome do país do jogador acima das abas na sidetools
 const countryDisplayElement = document.getElementById('player-country-display');
 if (countryDisplayElement) {
   countryDisplayElement.textContent = state.myCountry;
 }

  // Atualiza cada área da sidetools
  updateEconomyTab(country);
  updatePoliticsTab(country);
  updateMilitaryTab(country);
}

// Atualiza a aba de Economia
function updateEconomyTab(country) {
  if (!country.economy) {
    console.log(`Dados econômicos para o país ${country.name} não encontrados`);
    return;
  }
  
  const economy = country.economy;
  
  // Valores principais
  document.getElementById('gdp-value').textContent = formatCurrency(economy.gdp.value);
  document.getElementById('gdp-growth').textContent = economy.gdpGrowth.toFixed(1);
  document.getElementById('treasury-value').textContent = formatCurrency(economy.treasury.value);
  document.getElementById('debt-value').textContent = `${economy.publicDebtToGdp}% do PIB`;
  document.getElementById('inflation-value').textContent = `${economy.inflation}% ao ano`;
  document.getElementById('unemployment-value').textContent = `${economy.unemployment}%`;
  document.getElementById('popularity-value').textContent = `${economy.popularity}%`;
  
  // Commodities e Manufatura
  document.getElementById('commodities-value').textContent = formatCurrency(economy.commodities.value);
  document.getElementById('manufacturing-value').textContent = formatCurrency(economy.manufacturing.value);
  
  // Recursos naturais e nível tecnológico
  document.getElementById('resources-value').textContent = convertToTextLevel(economy.naturalResources);
  document.getElementById('technology-value').textContent = economy.technologyLevel;
  
  // Parâmetros ajustáveis
  document.getElementById('interest-rate').textContent = `${economy.interestRate}% ao ano`;
  document.getElementById('tax-rate').textContent = `${economy.taxBurden}% do PIB`;
  document.getElementById('public-services-value').textContent = `${economy.publicServices}%`;
  
  // Valores derivados ou estimados
  const researchPct = Math.round(economy.technologyLevel / 2);
  const defensePct = Math.round(country.military?.militaryPower || 5) / 2;
  
  document.getElementById('research-value').textContent = `${researchPct}%`;
  document.getElementById('defense-value').textContent = `${defensePct}%`;
  
  // Calcula outros valores derivados
  const debtPaymentPct = Math.round(economy.publicDebtToGdp * 0.6 / 10);
  const stateExpensesPct = 100 - economy.publicServices - researchPct - defensePct - debtPaymentPct;
  
  document.getElementById('debt-payment-value').textContent = `${debtPaymentPct}%`;
  document.getElementById('state-expenses-value').textContent = `${stateExpensesPct}%`;
  
  // Estimativa para emissão de títulos e retiradas
  const bondsValue = Math.round(economy.publicDebt.value * 0.05);
  const cashWithdrawal = Math.round(economy.treasury.value * 0.1);
  
  document.getElementById('bonds-value').textContent = formatCurrency(bondsValue);
  document.getElementById('cash-withdrawal-value').textContent = formatCurrency(cashWithdrawal);
}

// Atualiza a aba de Política
function updatePoliticsTab(country) {
  if (!country.politics) {
    console.log(`Dados políticos para o país ${country.name} não encontrados`);
    return;
  }
  
  const politics = country.politics;
  
  // Atualiza dados na aba de política
  const politicsContent = document.getElementById('politics');
  
  // Limpa o conteúdo atual
  const politicsContainer = politicsContent.querySelector('.politics-container');
  const existingStats = politicsContent.querySelector('.politics-stats');
  if (existingStats) {
    existingStats.remove();
  }
  
  // Cria novo elemento para mostrar os dados políticos
  const statsDiv = document.createElement('div');
  statsDiv.className = 'politics-stats';
  
  // Adiciona informações de suporte parlamentar e da mídia
  const supportInfo = document.createElement('div');
  supportInfo.className = 'support-info';
  supportInfo.innerHTML = `
    <h4>Indicadores de Apoio</h4>
    <div class="support-item">
      <span>Parlamento:</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${politics.parliamentSupport}%"></div>
      </div>
      <span>${politics.parliamentSupport}%</span>
    </div>
    <div class="support-item">
      <span>Mídia:</span>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${politics.mediaSupport}%"></div>
      </div>
      <span>${politics.mediaSupport}%</span>
    </div>
    <div class="protests-info">
      <span>Protestos:</span> <strong>${politics.protests.value} ${politics.protests.unit}</strong>
    </div>
  `;
  
  // Adiciona informações sobre oposição
  const oppositionInfo = document.createElement('div');
  oppositionInfo.className = 'opposition-info';
  oppositionInfo.innerHTML = `
    <h4>Oposição</h4>
    <p><strong>Facção Principal:</strong> ${politics.opposition.mainFaction}</p>
    <p><strong>Força:</strong> ${politics.opposition.strength}%</p>
    <p><strong>Conexões Externas:</strong> ${politics.opposition.foreignConnections.join(', ')}</p>
  `;
  
  // Adiciona informações sobre alianças econômicas
  const economicAlliancesInfo = document.createElement('div');
  economicAlliancesInfo.className = 'alliances-info';
  economicAlliancesInfo.innerHTML = `
    <h4>Alianças Econômicas</h4>
    <ul>
      ${politics.economicAlliances.map(alliance => 
        `<li>${alliance.country} (${alliance.condition})</li>`
      ).join('')}
    </ul>
  `;
  
  // Adiciona informações sobre alianças militares
  const militaryAlliancesInfo = document.createElement('div');
  militaryAlliancesInfo.className = 'alliances-info';
  militaryAlliancesInfo.innerHTML = `
    <h4>Alianças Militares</h4>
    ${politics.militaryAlliances.length > 0 
      ? `<ul>${politics.militaryAlliances.map(alliance => 
        `<li>${alliance.country} (${alliance.condition})</li>`
      ).join('')}</ul>`
      : '<p>Sem alianças militares</p>'
    }
  `;
  
  // Adiciona todos os elementos ao container principal
  statsDiv.appendChild(supportInfo);
  statsDiv.appendChild(oppositionInfo);
  statsDiv.appendChild(economicAlliancesInfo);
  statsDiv.appendChild(militaryAlliancesInfo);
  
  // Insere antes do container de ações políticas
  politicsContent.insertBefore(statsDiv, politicsContainer);
}

// Atualiza a aba de Guerra/Militar
function updateMilitaryTab(country) {
    if (!country.military) {
      console.log(`Dados militares para o país ${country.name} não encontrados`);
      return;
    }
    
    const military = country.military;
    
    // Define os valores militares diretamente como texto
    document.getElementById('army-value').textContent = military.army;
    document.getElementById('navy-value').textContent = military.navy;
    document.getElementById('airforce-value').textContent = military.airforce;
    document.getElementById('missiles-value').textContent = military.missiles;
    
    // Atualiza status nuclear
    const nuclearStatus = document.getElementById('nuclear-status');
    nuclearStatus.textContent = military.nuclearCapability ? 'Sim' : 'Não';
    nuclearStatus.className = military.nuclearCapability ? 'status-yes' : 'status-no';
    
    // Popula o dropdown de países-alvo
    populateTargetCountries(country.name);
  }
  
// Popula o dropdown de países-alvo para operações militares
function populateTargetCountries(countryName) {
  const targetCountrySelect = document.getElementById('target-country');
  
  // Limpa as opções existentes
  targetCountrySelect.innerHTML = '<option value="">Selecione um alvo...</option>';
  
  if (!state.countriesData) return;
  
  // Obtém os dados do país selecionado para verificar as fronteiras
  const country = state.countriesData[countryName];
  if (!country || !country.borders) return;
  
  // Filtra os países com fronteira aberta
  const borderCountries = country.borders
    .filter(border => border.enabled)
    .map(border => border.country);
  
  // Adiciona apenas países com fronteira aberta
  borderCountries.forEach(targetName => {
    const option = document.createElement('option');
    option.value = targetName;
    option.textContent = targetName;
    targetCountrySelect.appendChild(option);
  });
}

// Atualiza o dropdown de países para diplomacia
function populateCountryDropdown(countryName) {
  const countrySelect = document.getElementById('country-select');
  
  // Limpa as opções existentes
  countrySelect.innerHTML = '<option value="">Selecione um país...</option>';
  
  if (!state.countriesData) return;
  
  // Adiciona todos os países exceto o próprio país
  Object.keys(state.countriesData).forEach(targetName => {
    if (targetName !== countryName) {
      const option = document.createElement('option');
      option.value = targetName;
      option.textContent = targetName;
      countrySelect.appendChild(option);
    }
  });
}

// Converte valor numérico para texto descritivo de nível (1-10)
function convertToTextLevel(value) {
  const levels = ['Muito Baixo', 'Baixo', 'Moderado', 'Médio', 'Médio-Alto', 'Alto', 'Muito Alto', 'Excelente', 'Excepcional', 'Supremo'];
  // Ajusta o valor para índice de 0-9
  const index = Math.min(Math.max(Math.floor(value) - 1, 0), 9);
  return levels[index];
}

// Formata valores monetários
function formatCurrency(value) {
  if (typeof value === 'object' && value.value !== undefined) {
    value = value.value;
  }
  return `$${value}`;
}

export { updateSidetools, updateEconomyTab };