/**
 * Módulo para gerenciamento dos jogadores
 * Contém funções para atualizar estatísticas e estado dos jogadores
 */

// Importações necessárias
import { 
    BASE_INTEREST_RATE, 
    BASE_PUBLIC_INVESTMENT, 
    BASE_TAX_BURDEN,
    economicWave,
    noise
  } from './config.js';
  
  import { 
    calculateInterestRateImpact, 
    calculateInvestmentImpact, 
    calculateTaxBurdenImpact 
  } from './calcs.js';
  
  import { updateSuggestions } from './updates.js';
  
  /**
   * Atualiza as estatísticas dos jogadores
   * @param {Object} player - Objeto do jogador
   * @param {number} index - Índice do jogador
   */
  export function updatePlayer(player, index) {
      // Ciclos econômicos e choques externos (comuns a todos jogadores)
      const economicCycle = economicWave(0.0002, 180, 0, turns); // Ciclo mais suave e longo
      const externalShock = Math.random() < 0.005 ? noise(0.0005) : 0; // Choques menos frequentes e menos intensos
      const initialTreasury = player.treasury;
  
      // Atualização dos históricos
      player.interestRateHistory.push(player.interestRate);
      if (player.interestRateHistory.length > 10) player.interestRateHistory.shift();
  
      player.investmentHistory.push(player.publicInvestment);
      if (player.investmentHistory.length > 10) player.investmentHistory.shift();
  
      player.inflationHistory.push(player.inflation);
      if (player.inflationHistory.length > 12) player.inflationHistory.shift();
      
      player.taxBurdenHistory.push(player.taxBurden);
      if (player.taxBurdenHistory.length > 10) player.taxBurdenHistory.shift();
  
      // Cálculo de variações
      const interestRateVariation = player.interestRate - player.interestRateHistory[0];
      const investmentVariation = player.publicInvestment - player.investmentHistory[0];
      const taxBurdenVariation = player.taxBurden - player.taxBurdenHistory[0];
  
      // Atualização da inflação - menos sensível para evitar oscilações bruscas
      // Modelo Phillips Curve - relação inversa entre desemprego e inflação
      const inflationaryPressure = (player.publicInvestment - BASE_PUBLIC_INVESTMENT) * 0.02 - (player.interestRate - BASE_INTEREST_RATE) * 0.1;
      
      // Ajuste pela curva de Phillips (inflação e desemprego)
      const phillipsAdjustment = -0.015 * (player.unemployment - 7);
      
      // Inércia inflacionária (média móvel)
      const averageInflation = player.inflationHistory.reduce((a, b) => a + b, 0) / player.inflationHistory.length;
      const inflationaryInertia = (averageInflation - player.inflation) * 0.08;
      
      // Nova inflação considerando todos os fatores - reduzido coeficiente para mais estabilidade
      player.inflation += inflationaryPressure * 0.03 + phillipsAdjustment + inflationaryInertia;
      player.inflation = Math.max(0, Math.min(30, player.inflation));
  
      // Calcular impacto da carga tributária
      const taxBurdenImpact = calculateTaxBurdenImpact(player.taxBurden, player.gdp);
      
      // Ajuste do desemprego - agora considera também carga tributária
      const unemploymentPressure = -0.0008 * player.gdpGrowth + 0.006 * (player.interestRate - BASE_INTEREST_RATE) + taxBurdenImpact.unemployment / 100;
      player.unemployment += unemploymentPressure;
      player.unemployment = Math.max(3, Math.min(25, player.unemployment));
      
      // Cálculo do impacto da taxa de juros e investimento no PIB
      const interestRateImpact = calculateInterestRateImpact(player.interestRate, player.gdp);
      const investmentImpact = calculateInvestmentImpact(player.publicInvestment, player.gdp, player.inflation);
      
      // Fator de estabilidade para evitar quedas bruscas do PIB
      const stabilityFactor = 0.0002; // Pequeno impulso positivo constante
      
      // Usamos o crescimentoPIBIntrinseco (constante) como base
      const baseGrowth = player.intrinsicGdpGrowth / 365; 
      
      // Crescimento do PIB diário com todos os fatores + fator de estabilidade + impacto tributário
      const dailyGrowth = (baseGrowth / 100) + interestRateImpact + investmentImpact + stabilityFactor + economicCycle + externalShock + taxBurdenImpact.growth;
      
      // Limitamos as oscilações diárias para evitar instabilidades
      const limitedDailyGrowth = Math.max(-0.001, Math.min(0.003, dailyGrowth));
      player.dailyGrowth = limitedDailyGrowth * 100; // Em percentual
      
      // Atualização do PIB com crescimento limitado
      player.previousGdp = player.gdp; // Guarda valor anterior para cálculo diário
      player.gdp *= (1 + limitedDailyGrowth);
      
      // Redução do PIB pela inflação (ajuste real x nominal) - impacto reduzido
      const realInflationImpact = -player.inflation / 365 / 150; // Reduzido o impacto da inflação
      player.gdp *= (1 + realInflationImpact);
  
      // Verificar se houve grande perda de caixa recentemente
      if (player.majorTreasuryLoss) {
          // MODIFICADO: Gradualmente recuperar a capacidade de recuperação (mais rapidamente)
          player.recoveryMultiplier = Math.min(player.recoveryLimit, player.recoveryMultiplier + 0.0001); // Aumentado de 0.00005 para 0.0001
          
          // MODIFICADO: Quando o multiplicador de recuperação volta a 80%, consideramos que a economia se recuperou
          if (player.recoveryMultiplier >= player.recoveryLimit * 0.8) { // Reduzido de 0.95 para 0.8
              player.majorTreasuryLoss = false;
          }
      }
      // Cálculo da arrecadação com impacto da perda de caixa
      const taxRate = (player.taxBurden / 100) * (1 - 0.004 * (player.unemployment - 7));
          
      // Este valor representa a perda permanente de capacidade de arrecadação devido às retiradas
       const permanentReducer = Math.max(0, 1 - (player.permanentWithdrawal / 100));
  
      // Aplicar o multiplicador de recuperação à arrecadação e o redutor permanente
      const dailyRevenue = player.gdp * taxRate / 365 * player.recoveryMultiplier * permanentReducer;
      
      // Cálculo dos gastos públicos
      const dailyPublicExpenses = (player.gdp * (player.publicInvestment / 100)) / 365;
      
      // Gasto com juros da dívida pública
      const dailyInterestExpense = player.publicDebt * (player.interestRate / 100 / 365);
  
      // Verificar se há dedução diária programada e aplicá-la
      let appliedDeduction = 0;
      if (player.dailyDeduction > 0) {
          appliedDeduction = player.dailyDeduction;
          player.treasury -= player.dailyDeduction;
      }
      
      // Atualização do saldo (resultado primário)
      const dailyBalance = dailyRevenue - dailyPublicExpenses - dailyInterestExpense;
      player.treasury += dailyBalance;
      
      // Detectar mudanças significativas no caixa (para diagnóstico)
      const treasuryChange = player.treasury - initialTreasury;
      const percentageChange = Math.abs(treasuryChange / initialTreasury) * 100;
      
      // Logar informações detalhadas sobre fluxos de caixa apenas para mudanças significativas
      if (percentageChange > 10 && index === 0 && turns % 100 === 0) {  // Apenas para o jogador 1 e a cada 100 turnos
          console.log(`[Diagnóstico] Jogador ${index+1}, Turno ${turns}:`);
          console.log(`Caixa inicial: $${initialTreasury/1e9} bi`);
          console.log(`Arrecadação: +$${dailyRevenue/1e9} bi`);
          console.log(`Gastos públicos: -$${dailyPublicExpenses/1e9} bi`);
          console.log(`Juros da dívida: -$${dailyInterestExpense/1e9} bi`);
          console.log(`Dedução programada: -$${appliedDeduction/1e9} bi`);
          console.log(`Saldo diário: $${dailyBalance/1e9} bi`);
          console.log(`Caixa final: $${player.treasury/1e9} bi (${treasuryChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%)`);
      }
      
      // Perda de caixa severa pode levar a maior dependência de empréstimos de emergência a taxas desfavoráveis
      if (player.treasury < 0 && player.majorTreasuryLoss) {
          // Taxa de juros emergencial mais alta para cobrir o déficit
          const emergencyRate = player.interestRate * 1.5;
          const dailyEmergencyInterest = Math.abs(player.treasury) * (emergencyRate / 100 / 365);
          
          // Adicionar juros emergenciais e transferir para a dívida
          player.publicDebt += Math.abs(player.treasury) + dailyEmergencyInterest;
          player.treasury = 0;
      }
      else if (player.treasury > player.gdp * 0.1) {
          // Superávit significativo: redução da dívida
          const amortization = (player.treasury - player.gdp * 0.05) * 0.3;
          player.publicDebt -= Math.min(amortization, player.publicDebt);
          player.treasury -= amortization;
      }
      
      // Limitação na redução da dívida (realista)
      if (player.publicDebt < player.gdp * 0.3) {
          player.publicDebt = player.gdp * 0.3; // Dívida mínima estrutural
      }
      
      // Cálculo da popularidade
      let popularityImpact = 0;
      
      // Fatores que afetam a popularidade
      const growthImpact = (player.gdpGrowth - 1) * 0.2;
      const inflationImpact = -(player.inflation - 2) * 0.3;
      const unemploymentImpact = -(player.unemployment - 7) * 0.2;
      const debtImpact = -((player.publicDebt / player.gdp) - 0.6) * 0.05;
      
      // Impacto da carga tributária na popularidade
      const taxBurdenPopularityImpact = taxBurdenImpact.popularity;
      
      popularityImpact += growthImpact + inflationImpact + unemploymentImpact + debtImpact + taxBurdenPopularityImpact;
      
      // Efeito de médio prazo (tendência de regressão à média)
      popularityImpact += (50 - player.popularity) * 0.005;
      
      // Onda de aprovação (ciclo político)
      const popularityCycle = economicWave(0.1, 180, index, turns);
      popularityImpact += popularityCycle;
      
      // Ruído (eventos aleatórios afetando popularidade)
      popularityImpact += noise(0.2);
      
      player.popularity += popularityImpact;
      player.popularity = Math.max(5, Math.min(95, player.popularity));
  
      // Atualizar as sugestões de controle baseadas na situação atual
      updateSuggestions(player, index);
  }