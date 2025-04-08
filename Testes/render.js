/**
 * Módulo de renderização para a interface do usuário
 * Contém funções para atualizar a interface com os dados dos jogadores
 */

// Importações necessárias
import { players, turns } from './config.js';

/**
 * Renderiza apenas os indicadores (não recria os controles)
 */
export function renderIndicators() {
  document.getElementById("round").innerText = `Tempo: ${turns} (Dia ${turns + 1})`;
  
  players.forEach((player, index) => {
      // Cores para indicadores
      const getInflationClass = (inflation) => {
          if (inflation < 2) return '';
          if (inflation < 5) return 'warning';
          return 'negative';
      };
      
      const getGrowthClass = (growth) => {
          if (growth < 0) return 'negative';
          if (growth < 1) return 'warning';
          return 'positive';
      };
      
      const getDebtClass = (debt, gdp) => {
          const ratio = debt/gdp;
          if (ratio > 1) return 'negative';
          if (ratio > 0.7) return 'warning';
          return '';
      };
  
      // Atualiza apenas os valores dos indicadores e suas classes
      document.getElementById(`treasury-${index}`).innerText = `$${(player.treasury / 1_000_000_000).toFixed(2)} bi`;

      // Atualiza o indicador de caixa com a dedução, se existir
      const treasuryEl = document.getElementById(`treasury-${index}`);
      if (player.dailyDeduction > 0) {
          treasuryEl.innerHTML = `$${(player.treasury / 1_000_000_000).toFixed(2)} bi `; //<span class="negative">(-$${(player.dailyDeduction / 1_000_000_000).toFixed(2)} bi/dia)</span>
      } else {
          treasuryEl.innerHTML = `$${(player.treasury / 1_000_000_000).toFixed(2)} bi`;
      }
      
      const debtEl = document.getElementById(`debt-${index}`);
      debtEl.innerText = `$${(player.publicDebt / 1_000_000_000).toFixed(2)} bi (${(player.publicDebt/player.gdp*100).toFixed(1)}% do PIB)`;
      debtEl.className = getDebtClass(player.publicDebt, player.gdp);
      
      document.getElementById(`gdp-${index}`).innerText = `$${(player.gdp / 1_000_000_000).toFixed(2)} bi`;
      
      const growthEl = document.getElementById(`growth-${index}`);
      growthEl.innerText = `${player.gdpGrowth.toFixed(2)}%`;
      growthEl.className = getGrowthClass(player.gdpGrowth);
      
      // Mostrar o impacto permanente, se existir
      if (player.permanentWithdrawal > 0.1) {
          // Verificar se o elemento já existe
          if (!document.getElementById(`permanent-impact-${index}`)) {
              const playerEl = document.getElementById(`player${index + 1}`);
              const impactEl = document.createElement('div');
              impactEl.id = `permanent-impact-${index}`;
              impactEl.className = 'stat';
              
              // Inserir após o elemento do caixa
              const treasuryEl = document.getElementById(`treasury-${index}`);
              if (treasuryEl) {
                  playerEl.insertBefore(impactEl, treasuryEl.nextSibling);
              } else {
                  playerEl.appendChild(impactEl);
              }
          }
          
          // Atualizar o elemento
          const impactEl = document.getElementById(`permanent-impact-${index}`);
          const impactClass = player.permanentWithdrawal > 5 ? 'negative' : 
                              (player.permanentWithdrawal > 2 ? 'warning' : '');
          impactEl.innerHTML = `Perda Permanente: <span class="${impactClass}">${player.permanentWithdrawal.toFixed(1)}%</span>`;
          impactEl.style.display = 'block';
      } else {
          const impactEl = document.getElementById(`permanent-impact-${index}`);
          if (impactEl) {
              impactEl.style.display = 'none';
          }
      }

      // Adicione um elemento para mostrar o multiplicador de recuperação, se não existir
      if (!document.getElementById(`recovery-${index}`)) {
          const playerEl = document.getElementById(`player${index + 1}`);
          const recoveryEl = document.createElement('div');
          recoveryEl.id = `recovery-${index}`;
          recoveryEl.className = 'stat';
          
          // Inserir após o elemento de caixa
          const treasuryEl = document.getElementById(`treasury-${index}`);
          if (treasuryEl && treasuryEl.nextSibling) {
              playerEl.insertBefore(recoveryEl, treasuryEl.nextSibling);
          } else {
              playerEl.appendChild(recoveryEl);
          }
      }
      
      // Atualizar o elemento com o valor atual
      const recoveryEl = document.getElementById(`recovery-${index}`);
      if (player.recoveryMultiplier < 1.0) {
          const recoveryClass = player.recoveryMultiplier < 0.6 ? 'negative' : 
                                (player.recoveryMultiplier < 0.8 ? 'warning' : '');
          recoveryEl.innerHTML = `Recuperação Fiscal: <span class="${recoveryClass}">${(player.recoveryMultiplier * 100).toFixed(1)}%</span>`;
          recoveryEl.style.display = 'block';
      } else {
          recoveryEl.style.display = 'none';
      }
      
      const unemploymentEl = document.getElementById(`unemployment-${index}`);
      unemploymentEl.innerText = `${player.unemployment.toFixed(1)}%`;
      unemploymentEl.className = player.unemployment > 8 ? 'negative' : '';
      
      document.getElementById(`pop-${index}`).innerText = `${player.popularity.toFixed(1)}%`;
      
      const inflationEl = document.getElementById(`inflation-${index}`);
      inflationEl.innerText = `${player.inflation.toFixed(1)}%`;
      inflationEl.className = getInflationClass(player.inflation);
      
      // Atualiza a taxa de mercado na parte de emissão de títulos
      const riskSpread = Math.max(0, (player.publicDebt / player.gdp - 0.6) * 100);
      const marketInterestRate = player.interestRate + riskSpread / 100;
      document.getElementById(`market-rate-${index}`).innerText = marketInterestRate.toFixed(2);
  });
}

/**
 * Renderiza o painel de sugestões para todos os jogadores
 */
export function renderSuggestions() {
  players.forEach((player, index) => {
      const suggestionsEl = document.getElementById(`suggestions-${index}`);
      if (suggestionsEl) {

          // Verificar se a sugestão é para manter o valor atual
          const interestRateKeepCurrent = player.suggestions.interestRate.message === "Mantenha a taxa de juros atual";
          const taxBurdenKeepCurrent = player.suggestions.taxBurden.message === "Mantenha a carga tributária atual";
          const investmentKeepCurrent = player.suggestions.investment.message === "Mantenha o investimento público atual";
          
          // Atualizar o conteúdo das sugestões
          let suggestionsHtml = `<h3>Recomendações Econômicas</h3>
              <div class="suggestion-item">
              <span>Juros: ${player.suggestions.interestRate.message}</span>
              ${interestRateKeepCurrent ? '' : `<button class="btn-apply" onclick="applySuggestion(${index}, 'interestRate', ${player.suggestions.interestRate.value})">Aplicar</button>`}
              </div>
              <div class="suggestion-item">
              <span>Carga Tributária: ${player.suggestions.taxBurden.message}</span>
              ${taxBurdenKeepCurrent ? '' : `<button class="btn-apply" onclick="applySuggestion(${index}, 'taxBurden', ${player.suggestions.taxBurden.value})">Aplicar</button>`}
              </div>
              <div class="suggestion-item">
              <span>Investimento: ${player.suggestions.investment.message}</span>
              ${investmentKeepCurrent ? '' : `<button class="btn-apply" onclick="applySuggestion(${index}, 'investment', ${player.suggestions.investment.value})">Aplicar</button>`}
              </div>`;
          
          suggestionsEl.innerHTML = suggestionsHtml;
      }
  });
}