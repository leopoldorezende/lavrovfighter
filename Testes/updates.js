/**
 * Módulo de atualizações para a simulação econômica
 * Contém funções para atualizar a data e gerar sugestões para os jogadores
 */

// Importações necessárias
import { 
    BASE_INTEREST_RATE, 
    BASE_PUBLIC_INVESTMENT, 
    BASE_TAX_BURDEN,
    currentDate
  } from './config.js';
  
  /**
   * Atualiza a data do jogo
   */
  export function updateDate() {
    currentDate.setDate(currentDate.getDate() + 1);
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    document.getElementById("date").innerText = `Data: ${day}/${month}/${year}`;
  }
  
  /**
   * Gera sugestões de controle baseadas na situação econômica
   * @param {Object} player - Objeto do jogador
   * @param {number} index - Índice do jogador
   */
  export function updateSuggestions(player, index) {
    // Função auxiliar para calcular ajustes proporcionais
    function calculateProportionalAdjustment(currentValue, neutralValue, min, max) {
      const delta = currentValue - neutralValue;
      const maxDistance = Math.max(neutralValue - min, max - neutralValue);
      
      // Calcula a porcentagem do desvio em relação ao desvio máximo possível
      const deviationPercentage = Math.abs(delta) / maxDistance;
      
      // Ajuste proporcional: quanto maior o desvio, maior o ajuste recomendado
      let adjustment;
      if (deviationPercentage < 0.2) {
        // Desvio pequeno: ajuste suave
        adjustment = 0.5;
      } else if (deviationPercentage < 0.4) {
        // Desvio médio: ajuste moderado
        adjustment = 1.0;
      } else if (deviationPercentage < 0.6) {
        // Desvio significativo: ajuste mais forte
        adjustment = 2.0;
      } else if (deviationPercentage < 0.8) {
        // Desvio grande: ajuste substancial
        adjustment = 3.0;
      } else {
        // Desvio extremo: ajuste drástico
        adjustment = 4.0;
      }
      
      // O ajuste sempre move na direção do valor neutro
      return delta > 0 ? -adjustment : adjustment;
    }
  
    // Sugestões para carga tributária
    const neutralTaxBurden = BASE_TAX_BURDEN; // 46% para a França
    
    if (player.publicDebt > player.gdp * 1.1 && player.taxBurden < 50) {
      // Dívida muito alta: aumentar tributos (ajuste mais substancial)
      const adjustment = Math.min(4.0, (player.publicDebt / player.gdp - 1.1) * 10);
      const newTaxBurden = Math.min(60, player.taxBurden + adjustment);
      player.suggestions.taxBurden = {
        value: newTaxBurden,
        message: `Aumente para ${newTaxBurden.toFixed(1)}% para reduzir o déficit fiscal grave`
      };
    } else if (player.unemployment > 10 && player.taxBurden > 40) {
      // Desemprego alto: reduzir tributos para estimular economia (proporcional ao desemprego)
      const adjustment = Math.min(5.0, (player.unemployment - 10) * 0.5);
      const newTaxBurden = Math.max(30, player.taxBurden - adjustment);
      player.suggestions.taxBurden = {
        value: newTaxBurden,
        message: `Reduza para ${newTaxBurden.toFixed(1)}% para combater o desemprego de ${player.unemployment.toFixed(1)}%`
      };
    } else if (player.gdpGrowth < 0.5 && player.taxBurden > neutralTaxBurden) {
      // Crescimento baixo: reduzir carga (ajuste proporcional ao crescimento baixo)
      const adjustment = Math.min(3.0, (0.5 - player.gdpGrowth) * 2);
      const newTaxBurden = Math.max(35, player.taxBurden - adjustment);
      player.suggestions.taxBurden = {
        value: newTaxBurden,
        message: `Reduza para ${newTaxBurden.toFixed(1)}% para estimular o crescimento estagnado`
      };
    } else if (player.inflation > 5 && player.taxBurden < neutralTaxBurden) {
      // Inflação alta com carga baixa: aumentar para reduzir consumo (proporcional à inflação)
      const adjustment = Math.min(4.0, (player.inflation - 5) * 0.4);
      const newTaxBurden = Math.min(55, player.taxBurden + adjustment);
      player.suggestions.taxBurden = {
        value: newTaxBurden,
        message: `Aumente para ${newTaxBurden.toFixed(1)}% para reduzir o consumo e a inflação de ${player.inflation.toFixed(1)}%`
      };
    } else if (Math.abs(player.taxBurden - neutralTaxBurden) > 8) {
      // Carga muito diferente da neutra: normalizar gradualmente (proporcionalmente ao desvio)
      const adjustment = calculateProportionalAdjustment(player.taxBurden, neutralTaxBurden, 25, 60);
      const newTaxBurden = player.taxBurden + adjustment;
      const message = adjustment > 0 ? "aumentar" : "reduzir";
      player.suggestions.taxBurden = {
        value: newTaxBurden,
        message: `Recomendamos ${message} para ${newTaxBurden.toFixed(1)}% para normalizar a política fiscal`
      };
    } else {
      // Manter estabilidade
      player.suggestions.taxBurden = {
        value: player.taxBurden,
        message: "Mantenha a carga tributária atual"
      };
    }
    
    // Sugestões para taxa de juros
    const neutralInterestRate = BASE_INTEREST_RATE; // 3.5% para o modelo
    
    if (player.inflation > 5) {
      // Inflação alta: aumentar juros (proporcional à gravidade da inflação)
      const adjustment = Math.min(3.0, (player.inflation - 5) * 0.3);
      const newInterestRate = Math.min(15, player.interestRate + adjustment);
      player.suggestions.interestRate = {
        value: newInterestRate,
        message: `Aumente para ${newInterestRate.toFixed(2)}% para combater a inflação alta de ${player.inflation.toFixed(1)}%`
      };
    } else if (player.inflation < 1.5 && player.gdpGrowth < 1) {
      // Inflação baixa e crescimento baixo: reduzir juros (ajuste mais forte)
      const adjustment = Math.min(2.0, (1 - player.gdpGrowth) * 1.0);
      const newInterestRate = Math.max(0.25, player.interestRate - adjustment);
      player.suggestions.interestRate = {
        value: newInterestRate,
        message: `Reduza para ${newInterestRate.toFixed(2)}% para estimular o crescimento`
      };
    } else if (player.unemployment > 9) {
      // Desemprego alto: reduzir juros moderadamente (proporcional ao desemprego)
      const adjustment = Math.min(2.5, (player.unemployment - 9) * 0.25);
      const newInterestRate = Math.max(0.5, player.interestRate - adjustment);
      player.suggestions.interestRate = {
        value: newInterestRate,
        message: `Reduza para ${newInterestRate.toFixed(2)}% para combater o desemprego de ${player.unemployment.toFixed(1)}%`
      };
    } else if (Math.abs(player.interestRate - neutralInterestRate) > 2) {
      // Juros muito longe do neutro: normalizar gradualmente
      const adjustment = calculateProportionalAdjustment(player.interestRate, neutralInterestRate, 0, 15);
      const newInterestRate = player.interestRate + adjustment;
      const message = adjustment > 0 ? "aumentar" : "reduzir";
      player.suggestions.interestRate = {
        value: newInterestRate,
        message: `Recomendamos ${message} para ${newInterestRate.toFixed(2)}% para equilibrar a política monetária`
      };
    } else {
      // Manter estabilidade
      player.suggestions.interestRate = {
        value: player.interestRate,
        message: "Mantenha a taxa de juros atual"
      };
    }
    
    // Sugestões para investimento público
    const neutralInvestment = BASE_PUBLIC_INVESTMENT; // 21% para o modelo
    
    if (player.gdpGrowth < 0) {
      // Recessão: aumentar investimento (proporcional à gravidade da recessão)
      const adjustment = Math.min(8.0, Math.abs(player.gdpGrowth) * 2);
      const newInvestment = Math.min(50, player.publicInvestment + adjustment);
      player.suggestions.investment = {
        value: newInvestment,
        message: `Aumente significativamente para ${newInvestment.toFixed(2)}% para combater a recessão`
      };
    } else if (player.gdpGrowth < 1 && player.unemployment > 8) {
      // Estagnação com desemprego: aumentar investimento (proporcional ao desemprego)
      const adjustment = Math.min(5.0, (player.unemployment - 8) * 0.5);
      const newInvestment = Math.min(35, player.publicInvestment + adjustment);
      player.suggestions.investment = {
        value: newInvestment,
        message: `Aumente para ${newInvestment.toFixed(2)}% para estimular empregos`
      };
    } else if (player.publicDebt > player.gdp * 1.1) {
      // Dívida muito alta: reduzir investimento (proporcional à dívida)
      const adjustment = Math.min(4.0, (player.publicDebt / player.gdp - 1.1) * 10);
      const newInvestment = Math.max(15, player.publicInvestment - adjustment);
      player.suggestions.investment = {
        value: newInvestment,
        message: `Reduza para ${newInvestment.toFixed(2)}% para controlar a dívida de ${(player.publicDebt/player.gdp*100).toFixed(1)}% do PIB`
      };
    } else if (player.inflation > 6 && player.publicInvestment > neutralInvestment) {
      // Inflação alta e investimento acima do neutro: reduzir gastos (proporcional à inflação)
      const adjustment = Math.min(5.0, (player.inflation - 6) * 0.5);
      const newInvestment = Math.max(neutralInvestment, player.publicInvestment - adjustment);
      player.suggestions.investment = {
        value: newInvestment,
        message: `Reduza para ${newInvestment.toFixed(2)}% para diminuir a pressão inflacionária de ${player.inflation.toFixed(1)}%`
      };
    } else if (Math.abs(player.publicInvestment - neutralInvestment) > 8) {
      // Investimento muito longe do neutro: normalizar gradualmente
      const adjustment = calculateProportionalAdjustment(player.publicInvestment, neutralInvestment, 10, 50);
      const newInvestment = player.publicInvestment + adjustment;
      const message = adjustment > 0 ? "aumentar" : "reduzir";
      player.suggestions.investment = {
        value: newInvestment,
        message: `Recomendamos ${message} para ${newInvestment.toFixed(2)}% para equilibrar os gastos públicos`
      };
    } else {
      // Manter estabilidade
      player.suggestions.investment = {
        value: player.publicInvestment,
        message: "Mantenha o investimento público atual"
      };
    }
  }