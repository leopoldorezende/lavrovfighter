/**
 * Arquivo de configuração para a simulação econômica
 * Contém constantes, valores iniciais e dados dos jogadores
 */

// Constantes econômicas baseadas na França
export const FRANCE_GDP = 2500000000000; // 2.5 trilhões de euros
export const DEBT_PERCENTAGE_GDP = 0.98; // 98% do PIB (França)
export const BASE_INFLATION = 2.4; // Inflação base em %
export const BASE_GDP_GROWTH = 1.5; // Crescimento base do PIB em %
export const BASE_INTEREST_RATE = 3.5; // Taxa de juros base em %
export const BASE_PUBLIC_INVESTMENT = 21; // Gastos públicos como % do PIB (França)
export const BASE_TAX_BURDEN = 46; // Carga tributária base da França (46% do PIB)

// Constantes econômicas para o Peru
export const PERU_GDP = 240000000000; // 240 bilhões de euros (aproximadamente, convertido de USD)
export const DEBT_PERCENTAGE_GDP_PERU = 0.37; // 37% do PIB (Peru)
export const BASE_INFLATION_PERU = 3.2; // Inflação base no Peru %
export const BASE_GDP_GROWTH_PERU = 2.2; // Crescimento base do PIB em % (média histórica do Peru)
export const BASE_INTEREST_RATE_PERU = 7.25; // Taxa de juros base em % (maior que a França)
export const BASE_PUBLIC_INVESTMENT_PERU = 19; // Gastos públicos como % do PIB (Peru)
export const BASE_TAX_BURDEN_PERU = 16.5; // Carga tributária do Peru (16,5% do PIB - muito menor que a França)
export const BASE_UNEMPLOYMENT_PERU = 6.8; // Taxa de desemprego no Peru

// Variáveis para simulação - usando let para que possam ser modificadas
export let autoPlayInterval = null;
export let autoPlayActive = false;
export const QUARTERLY_UPDATE_INTERVAL = 90; // 90 dias = 1 trimestre
export let suggestionsUpdateCounter = 0; // Contador para atualização de sugestões

/**
 * Função de onda para adicionar ruídos e ciclos econômicos
 * @param {number} amplitude - Amplitude da onda
 * @param {number} frequency - Frequência da onda
 * @param {number} phase - Fase da onda
 * @param {number} turn - Turno atual
 * @returns {number} - Valor da onda no turno atual
 */
export function economicWave(amplitude, frequency, phase, turn) {
  return amplitude * Math.sin((turn/frequency) + phase);
}

/**
 * Função para gerar ruído aleatório
 * @param {number} amplitude - Amplitude máxima do ruído
 * @returns {number} - Valor aleatório entre -amplitude e +amplitude
 */
export function noise(amplitude) {
  return (Math.random() * 2 - 1) * amplitude;
}

// Definições dos jogadores com valores da França
export const players = [
  {
    name: 'Test 1', 
    treasury: FRANCE_GDP * 0.05, 
    gdp: FRANCE_GDP, 
    previousGdp: FRANCE_GDP,
    previousQuarterlyGdp: FRANCE_GDP,
    gdpGrowth: BASE_GDP_GROWTH, // Apenas para exibição
    intrinsicGdpGrowth: BASE_GDP_GROWTH, // Valor base constante usado nos cálculos
    dailyGrowth: BASE_GDP_GROWTH / 365,
    interestRate: BASE_INTEREST_RATE, 
    publicInvestment: BASE_PUBLIC_INVESTMENT,
    taxBurden: BASE_TAX_BURDEN,
    popularity: 50, 
    publicDebt: FRANCE_GDP * DEBT_PERCENTAGE_GDP,
    inflation: BASE_INFLATION,
    unemployment: 7.1, // Taxa de desemprego na França
    interestRateHistory: Array(10).fill(BASE_INTEREST_RATE),
    investmentHistory: Array(10).fill(BASE_PUBLIC_INVESTMENT),
    inflationHistory: Array(12).fill(BASE_INFLATION),
    growthHistory: Array(4).fill(BASE_GDP_GROWTH),
    taxBurdenHistory: Array(10).fill(BASE_TAX_BURDEN),
    suggestions: {
      interestRate: { value: BASE_INTEREST_RATE, message: "Mantenha a taxa de juros atual." },
      investment: { value: BASE_PUBLIC_INVESTMENT, message: "Mantenha o investimento público atual." },
      taxBurden: { value: BASE_TAX_BURDEN, message: "Mantenha a carga tributária atual." }
    },
    withdrawalHistory: 0,           // Total acumulado de todas as retiradas
    permanentWithdrawal: 0,         // Impacto permanente na receita (%)
    recoveryLimit: 1.0,             // Limite máximo do multiplicador de recuperação
    dailyDeduction: 0,              // Valor de dedução diária do tesouro
    totalWithdrawn: 0,              // Valores totais retirados (acumulados)
    
    treasuryHistory: [FRANCE_GDP * 0.05], // Armazena histórico do tesouro
    recoveryMultiplier: 1.0,              // Multiplicador que afeta a capacidade de recuperação
    majorTreasuryLoss: false,             // Flag para identificar se houve uma grande perda recente
  },
  {
    name: 'Test 2', 
    treasury: FRANCE_GDP * 0.05, 
    gdp: FRANCE_GDP, 
    previousGdp: FRANCE_GDP,
    previousQuarterlyGdp: FRANCE_GDP,
    gdpGrowth: BASE_GDP_GROWTH, // Apenas para exibição
    intrinsicGdpGrowth: BASE_GDP_GROWTH, // Valor base constante usado nos cálculos
    dailyGrowth: BASE_GDP_GROWTH / 365,
    interestRate: BASE_INTEREST_RATE, 
    publicInvestment: BASE_PUBLIC_INVESTMENT,
    taxBurden: BASE_TAX_BURDEN,
    popularity: 50, 
    publicDebt: FRANCE_GDP * DEBT_PERCENTAGE_GDP,
    inflation: BASE_INFLATION,
    unemployment: 7.1, // Taxa de desemprego na França
    interestRateHistory: Array(10).fill(BASE_INTEREST_RATE),
    investmentHistory: Array(10).fill(BASE_PUBLIC_INVESTMENT),
    inflationHistory: Array(12).fill(BASE_INFLATION),
    growthHistory: Array(4).fill(BASE_GDP_GROWTH),
    taxBurdenHistory: Array(10).fill(BASE_TAX_BURDEN),
    suggestions: {
      interestRate: { value: BASE_INTEREST_RATE, message: "Mantenha a taxa de juros atual." },
      investment: { value: BASE_PUBLIC_INVESTMENT, message: "Mantenha o investimento público atual." },
      taxBurden: { value: BASE_TAX_BURDEN, message: "Mantenha a carga tributária atual." }
    },
    withdrawalHistory: 0,           // Total acumulado de todas as retiradas
    permanentWithdrawal: 0,         // Impacto permanente na receita (%)
    recoveryLimit: 1.0,             // Limite máximo do multiplicador de recuperação
    dailyDeduction: 0,              // Valor de dedução diária do tesouro
    totalWithdrawn: 0,              // Valores totais retirados (acumulados)

    treasuryHistory: [FRANCE_GDP * 0.05], // Armazena histórico do tesouro
    recoveryMultiplier: 1.0,              // Multiplicador que afeta a capacidade de recuperação
    majorTreasuryLoss: false,             // Flag para identificar se houve uma grande perda recente
  },
  {
    name: 'Test 3', 
    treasury: PERU_GDP * 0.04, // 4% do PIB (reservas menores)
    gdp: PERU_GDP, 
    previousGdp: PERU_GDP,
    previousQuarterlyGdp: PERU_GDP,
    gdpGrowth: BASE_GDP_GROWTH_PERU, // Apenas para exibição
    intrinsicGdpGrowth: BASE_GDP_GROWTH_PERU, // Valor base constante usado nos cálculos
    dailyGrowth: BASE_GDP_GROWTH_PERU / 365,
    interestRate: BASE_INTEREST_RATE_PERU, 
    publicInvestment: BASE_PUBLIC_INVESTMENT_PERU,
    taxBurden: BASE_TAX_BURDEN_PERU,
    popularity: 45, // Menor que a França
    publicDebt: PERU_GDP * DEBT_PERCENTAGE_GDP_PERU,
    inflation: BASE_INFLATION_PERU,
    unemployment: BASE_UNEMPLOYMENT_PERU,
    interestRateHistory: Array(10).fill(BASE_INTEREST_RATE_PERU),
    investmentHistory: Array(10).fill(BASE_PUBLIC_INVESTMENT_PERU),
    inflationHistory: Array(12).fill(BASE_INFLATION_PERU),
    growthHistory: Array(4).fill(BASE_GDP_GROWTH_PERU),
    taxBurdenHistory: Array(10).fill(BASE_TAX_BURDEN_PERU),
    suggestions: {
      interestRate: { value: BASE_INTEREST_RATE_PERU, message: "Mantenha a taxa de juros atual." },
      investment: { value: BASE_PUBLIC_INVESTMENT_PERU, message: "Mantenha o investimento público atual." },
      taxBurden: { value: BASE_TAX_BURDEN_PERU, message: "Mantenha a carga tributária atual." }
    },
    withdrawalHistory: 0,           // Total acumulado de todas as retiradas
    permanentWithdrawal: 0,         // Impacto permanente na receita (%)
    recoveryLimit: 0.85,            // Limite máximo do multiplicador de recuperação (menor que a França)
    dailyDeduction: 0,              // Valor de dedução diária do tesouro
    totalWithdrawn: 0,              // Valores totais retirados (acumulados)
    
    treasuryHistory: [PERU_GDP * 0.04], // Armazena histórico do tesouro
    recoveryMultiplier: 1.0,            // Multiplicador que afeta a capacidade de recuperação
    majorTreasuryLoss: false,           // Flag para identificar se houve uma grande perda recente
  }
];

export const controls = ['interestRate', 'taxBurden', 'publicInvestment'];
export let turns = 0;  // Usando let pois o valor será modificado
export let currentDate = new Date(2025, 0, 1); // 1 de Janeiro de 2025