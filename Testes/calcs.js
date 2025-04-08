/**
 * Módulo de cálculos econômicos para simulação financeira
 * Contém funções para modelar os impactos de decisões econômicas
 */

// Importações necessárias
import { 
  BASE_INTEREST_RATE, 
  BASE_PUBLIC_INVESTMENT, 
  BASE_TAX_BURDEN 
} from './config.js';

/**
 * Calcula o impacto da taxa de juros no PIB
 * @param {number} interestRate - Taxa de juros atual (%)
 * @param {number} gdp - PIB atual
 * @returns {number} - Impacto no crescimento do PIB (valor fracionário)
 */
export function calculateInterestRateImpact(interestRate, gdp) {
  // Validação de entrada
  if (typeof interestRate !== 'number' || typeof gdp !== 'number') {
    console.error('calculateInterestRateImpact: Parâmetros inválidos');
    return 0;
  }

  // Função sigmoide para modelar o impacto da taxa de juros
  // Sensibilidade reduzida em torno da taxa neutra para maior estabilidade
  const neutralRate = BASE_INTEREST_RATE;
  const sensitivity = 0.6; // Reduzido de 0.8 para 0.6
  
  // Diferença entre taxa atual e taxa neutra
  const delta = interestRate - neutralRate;
  
  // Cálculo de impacto baseado no comportamento econômico
  let impact;
  if (delta <= 0) {
    // Taxa de juros abaixo da neutra: estímulo econômico, mas risco de inflação
    // Impacto reduzido para maior estabilidade
    impact = 0.00008 * Math.abs(delta) * (1 - Math.exp(-sensitivity * Math.abs(delta)));
  } else {
    // Taxa de juros acima da neutra: contração econômica
    // Impacto reduzido para maior estabilidade
    impact = -0.0001 * delta * (1 + Math.exp(sensitivity * delta/2));
  }
  
  return impact;
}

/**
 * Calcula o impacto do investimento público no PIB
 * @param {number} investment - Investimento público como % do PIB
 * @param {number} gdp - PIB atual
 * @param {number} inflation - Taxa de inflação atual (%)
 * @returns {number} - Impacto no crescimento do PIB (valor fracionário)
 */
export function calculateInvestmentImpact(investment, gdp, inflation) {
  // Validação de entrada
  if (typeof investment !== 'number' || typeof gdp !== 'number' || typeof inflation !== 'number') {
    console.error('calculateInvestmentImpact: Parâmetros inválidos');
    return 0;
  }

  const neutralInvestment = BASE_PUBLIC_INVESTMENT; // % considerado neutro
  const delta = investment - neutralInvestment;
  
  // Modelamos eficácia reduzida quando o investimento é excessivo (retornos decrescentes)
  let multiplier;
  
  if (delta <= 0) {
    // Austeridade: impacto negativo no curto prazo, mas pode reduzir inflação
    // Impacto reduzido para mais estabilidade
    multiplier = 0.00002 * delta; // Negativo, mas com menor intensidade
  } else {
    // Expansão: impacto positivo que diminui com alta inflação
    const effectiveness = Math.max(0, 1 - (inflation / 12)); // Menos sensível à inflação
    // Fator de suavização para evitar crescimento explosivo com altos investimentos
    const smoothingFactor = Math.max(0.6, 1 - (delta / 40)); 
    multiplier = 0.00002 * delta * effectiveness * smoothingFactor;
  }
  
  // Efeito de longo prazo (infraestrutura)
  const investmentBase = investment / 100;
  // Adicionamos uma pequena constante para garantir um impacto positivo mínimo
  const longTermImpact = (0.000008 * investmentBase * gdp) + (0.000003 * gdp);
  
  // Limitamos o impacto para evitar oscilações extremas
  const totalImpact = multiplier + longTermImpact / gdp;
  return Math.max(-0.0005, Math.min(0.0005, totalImpact));
}

/**
 * Calcula o impacto da carga tributária no PIB e outras variáveis econômicas
 * @param {number} taxBurden - Carga tributária como % do PIB
 * @param {number} gdp - PIB atual
 * @returns {Object} - Objeto com impactos no crescimento, desemprego e popularidade
 */
export function calculateTaxBurdenImpact(taxBurden, gdp) {
  // Validação de entrada
  if (typeof taxBurden !== 'number' || typeof gdp !== 'number') {
    console.error('calculateTaxBurdenImpact: Parâmetros inválidos');
    return { growth: 0, unemployment: 0, popularity: 0 };
  }

  const neutralBurden = BASE_TAX_BURDEN; // % é considerado neutro
  const delta = taxBurden - neutralBurden;
  
  // Curva de Laffer: impacto no crescimento é mais negativo quando a carga se desvia significativamente do ponto ótimo
  // Por simplicidade, consideramos o ponto neutro como próximo do ótimo para a economia simulada
  
  // Impacto no crescimento (curva em U invertido)
  let growthImpact;
  if (delta <= 0) {
    // Carga menor que a neutra: positiva para o crescimento até certo ponto, 
    // depois negativa devido à falta de infraestrutura
    if (delta > -10) {
      // Pequena redução na carga
      growthImpact = 0.00003 * Math.abs(delta); 
    } else {
      // Redução muito grande na carga: efeitos negativos devido à falta de infraestrutura
      growthImpact = 0.00003 * 10 - 0.00002 * (Math.abs(delta) - 10);
    }
  } else {
    // Carga maior que a neutra: impacto negativo exponencial
    growthImpact = -0.00004 * delta * (1 + 0.05 * delta);
  }
  
  // Impacto no desemprego (correlação positiva com alta carga)
  const unemploymentImpact = 0.01 * delta;
  
  // Impacto na popularidade (correlação negativa com alta carga)
  const popularityImpact = -0.2 * delta;
  
  return {
    growth: growthImpact,
    unemployment: unemploymentImpact,
    popularity: popularityImpact
  };
}