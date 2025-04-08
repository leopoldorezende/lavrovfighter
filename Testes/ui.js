/**
 * Módulo de interface do usuário para simulação econômica
 * Contém funções para gerenciar controles e interações do usuário
 */

// Importação do módulo config inteiro, sem desestruturação
import * as config from './config.js';
import { updatePlayer } from './player.js';
import { renderIndicators, renderSuggestions } from './render.js';
import { addWithdrawalButton } from './actions.js';

/**
 * Prepara os controles dos jogadores (chamado apenas uma vez na inicialização)
 */
export function prepareControls() {
  config.players.forEach((player, index) => {
    const element = document.getElementById(`player${index + 1}`);
    const controlsHtml = config.controls.map(control => {
      let min, max;
      if (control === 'interestRate') {
        min = 0;
        max = 30;
      } else if (control === 'taxBurden') {
        min = 20;
        max = 60;
      } else if (control === 'publicInvestment') {
        min = 20;
        max = 80;
      }
      
      let labelText;
      if (control === 'interestRate') {
        labelText = 'TAXA DE JUROS';
      } else if (control === 'taxBurden') {
        labelText = 'CARGA TRIBUTÁRIA';
      } else if (control === 'publicInvestment') {
        labelText = 'INVESTIMENTO PÚBLICO';
      }
      
      return `
        <div class="slider-group">
          <label>${labelText}: 
            <span id="val-${control}-${index}">${player[control]}</span>%</label>
          <input type="range" id="slider-${control}-${index}" min="${min}" max="${max}" value="${player[control]}" step="0.25" 
            oninput="updateControlValue(${index}, '${control}', this.value)" />
        </div>
      `;
    }).join('');

    // Área para sugestões econômicas
    const suggestionsHtml = `
      <div id="suggestions-${index}" class="suggestions">
        <h3>Recomendações Econômicas</h3>
        <div class="suggestion-item">
          <span>Juros: ${player.suggestions.interestRate.message}</span>
          <button class="btn-apply" onclick="applySuggestion(${index}, 'interestRate', ${player.suggestions.interestRate.value})">Aplicar</button>
        </div>
        <div class="suggestion-item">
          <span>Carga Tributária: ${player.suggestions.taxBurden.message}</span>
          <button class="btn-apply" onclick="applySuggestion(${index}, 'taxBurden', ${player.suggestions.taxBurden.value})">Aplicar</button>
        </div>
        <div class="suggestion-item">
          <span>Investimento: ${player.suggestions.investment.message}</span>
          <button class="btn-apply" onclick="applySuggestion(${index}, 'investment', ${player.suggestions.investment.value})">Aplicar</button>
        </div>
      </div>
    `;

    // Área para emissão de títulos (mantida fora da atualização automática)
    const bondIssueHtml = `
      <hr>
      <div class="slider-group">
        <label>EMISSÃO DE TÍTULOS ($ bi): <span id="val-issue-${index}">10</span> 
          <small>(Taxa de mercado: <span id="market-rate-${index}">${(player.interestRate).toFixed(2)}</span>%)</small>
        </label>
        <input type="range" min="1" max="100" step="1" value="10" id="slider-issue-${index}" 
          oninput="document.getElementById('val-issue-${index}').innerText = this.value">
        <button onclick="issueBonds(${index})">Emitir Títulos</button>
      </div>
    `;

    // Conteúdo completo do player
    element.innerHTML = `
      <h2>${player.name}</h2>
      <div class="stat">Caixa: <span id="treasury-${index}">$${(player.treasury / 1_000_000_000).toFixed(2)} bi</span></div>
      <div class="stat">Dívida Pública: <span id="debt-${index}">$${(player.publicDebt / 1_000_000_000).toFixed(2)} bi (${(player.publicDebt/player.gdp*100).toFixed(1)}% do PIB)</span></div>
      <div class="stat">PIB: <span id="gdp-${index}">$${(player.gdp / 1_000_000_000).toFixed(2)} bi</span></div>
      <div class="stat">Crescimento Anualizado: <span id="growth-${index}">${player.gdpGrowth.toFixed(2)}%</span> (trimestral)</div>
      
      <div class="stat">Desemprego: <span id="unemployment-${index}">${player.unemployment.toFixed(1)}%</span></div>
      <div class="stat">Popularidade: <span id="pop-${index}">${player.popularity.toFixed(1)}%</span></div>
      <div class="stat">Inflação: <span id="inflation-${index}">${player.inflation.toFixed(1)}%</span></div>
 
      <br />
      
      <div class="stat">Variação Diária: <span id="daily-growth-${index}">${player.dailyGrowth.toFixed(4)}%</span></div>
      <div class="stat">Carga Tributária: <span id="tax-burden-${index}">${player.taxBurden.toFixed(1)}%</span></div>

      <br />
      
      ${controlsHtml}
      ${suggestionsHtml}
      ${bondIssueHtml}
    `;
  });
  addWithdrawalButton();
}

/**
 * Avança um turno na simulação
 */
export function advanceTurn() {
  // Armazenar os valores anteriores do caixa para comparação
  const previousTreasuries = config.players.map(player => player.treasury);
  
  // Modificando a variável importada - agora acessamos via config.turns
  config.turns++;
  
  config.players.forEach((player, index) => {
    updatePlayer(player, index);
    
    // Atualização do crescimento do PIB a cada 90 rodadas (trimestre)
    if (config.turns % config.QUARTERLY_UPDATE_INTERVAL === 0) {
      const quarterlyGrowth = ((player.gdp - player.previousQuarterlyGdp) / player.previousQuarterlyGdp);
      
      // Aplicamos um suavizador para evitar picos de crescimento irrealistas
      const smoothedGrowth = quarterlyGrowth * 0.7; // Suavizamos o crescimento trimestral
      
      // CORREÇÃO: Aplicamos limitadores ao crescimento anualizado para evitar valores irrealistas
      const annualizedGrowth = Math.pow(1 + smoothedGrowth, 4) - 1; // Anualizado
      
      // Limitamos o crescimento entre -5% e +5% anual (valores mais realistas e estáveis)
      player.gdpGrowth = Math.max(-5, Math.min(5, annualizedGrowth * 100));
      
      // IMPORTANTE: Não atualizamos o crescimentoPIBIntrinseco, que permanece constante
      
      player.previousQuarterlyGdp = player.gdp;
      
      // Mantemos um histórico dos últimos 4 valores de crescimento (1 ano)
      player.growthHistory.push(player.gdpGrowth);
      if (player.growthHistory.length > 4) {
        player.growthHistory.shift();
      }
    }
    
    // Verificar mudanças significativas no caixa (para diagnóstico)
    const difference = player.treasury - previousTreasuries[index];
    const percentageChange = Math.abs(difference / previousTreasuries[index]) * 100;
    
    // Logar apenas mudanças significativas (mais de 5%)
    if (percentageChange > 5 && config.turns > 1) {
      console.log(`[Turno ${config.turns}] Jogador ${index+1}: Mudança significativa no caixa`);
      console.log(`Anterior: $${previousTreasuries[index]/1e9} bi, Atual: $${player.treasury/1e9} bi`);
      console.log(`Diferença: $${difference/1e9} bi (${percentageChange.toFixed(2)}%)`);
    }
  });

  renderIndicators();

  // Atualiza sugestões apenas a cada 10 ciclos
  // Usamos variável global suggestionsUpdateCounter agora
  window.suggestionsUpdateCounter++;
  if (window.suggestionsUpdateCounter >= 10) {
    renderSuggestions();
    window.suggestionsUpdateCounter = 0;
  } else if(window.suggestionsUpdateCounter == 1) {
    renderSuggestions();
  }
  
  updateDate();
}

/**
 * Alterna entre o modo automático e manual da simulação
 */
export function toggleAutoPlay() {
  // Acessando as variáveis globais via window para garantir que estamos modificando as corretas
  if (window.autoPlayActive) {
    clearInterval(window.autoPlayInterval);
    window.autoPlayActive = false;
    document.getElementById("autoPlay").textContent = "Auto Play (1 turno/seg)";
  } else {
    window.autoPlayInterval = setInterval(advanceTurn, 50);
    window.autoPlayActive = true;
    document.getElementById("autoPlay").textContent = "Parar Auto Play";
  }
}

/**
 * Atualiza o valor de um controle quando o usuário move o slider
 * @param {number} playerIndex - Índice do jogador
 * @param {string} control - Nome do controle
 * @param {string} value - Valor do controle
 */
export function updateControlValue(playerIndex, control, value) {
  const numericValue = parseFloat(value);
  config.players[playerIndex][control] = numericValue;
  document.getElementById(`val-${control}-${playerIndex}`).innerText = numericValue.toFixed(2);
}

/**
 * Atualiza a data do jogo
 */
export function updateDate() {
  config.currentDate.setDate(config.currentDate.getDate() + 1);
  const day = config.currentDate.getDate().toString().padStart(2, '0');
  const month = (config.currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = config.currentDate.getFullYear();
  document.getElementById("date").innerText = `Data: ${day}/${month}/${year}`;
}

// Exportamos as funções para o escopo global para serem acessadas pelos event handlers inline
window.updateControlValue = updateControlValue;
window.advanceTurn = advanceTurn;
window.toggleAutoPlay = toggleAutoPlay;
window.issueBonds = window.issueBonds || function(){};
window.applySuggestion = window.applySuggestion || function(){};
window.makeWithdrawal = window.makeWithdrawal || function(){};

// Para garantir que as variáveis do config também estejam acessíveis globalmente
window.autoPlayActive = window.autoPlayActive || false;
window.autoPlayInterval = window.autoPlayInterval || null;
window.suggestionsUpdateCounter = window.suggestionsUpdateCounter || 0;
window.turns = window.turns || 0;