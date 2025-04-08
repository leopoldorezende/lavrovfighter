/**
 * Módulo de ações para simulação econômica
 * Contém funções para realizar ações de jogadores
 */

// Importações necessárias
import { players } from './config.js';
import { renderIndicators } from './render.js';
import { updateSuggestions } from './updates.js';

/**
 * Aplica uma sugestão específica aos controles do jogador
 * @param {number} playerIndex - Índice do jogador
 * @param {string} type - Tipo de sugestão (interestRate, tax, publicInvestment)
 * @param {number} value - Valor a ser aplicado
 */
export function applySuggestion(playerIndex, type, value) {
    if (type === 'interestRate') {
        players[playerIndex].interestRate = value;
        document.getElementById(`slider-interestRate-${playerIndex}`).value = value;
        document.getElementById(`val-interestRate-${playerIndex}`).innerText = value.toFixed(2);
    } else if (type === 'publicInvestment') {
        players[playerIndex].publicInvestment = value;
        document.getElementById(`slider-publicInvestment-${playerIndex}`).value = value;
        document.getElementById(`val-publicInvestment-${playerIndex}`).innerText = value.toFixed(2);
    } else if (type === 'taxBurden') {
        players[playerIndex].taxBurden = value;
        document.getElementById(`slider-taxBurden-${playerIndex}`).value = value;
        document.getElementById(`val-taxBurden-${playerIndex}`).innerText = value.toFixed(2);
    }
    
    // Atualiza as sugestões após aplicar uma mudança
    updateSuggestions(players[playerIndex], playerIndex);
    renderSuggestions();
    // Reinicia o contador para evitar outra atualização imediata
    suggestionUpdateCounter = 0;
}

/**
 * Emite títulos públicos para o jogador
 * @param {number} playerIndex - Índice do jogador
 */
export function issueBonds(playerIndex) {
    const issueSliderId = `slider-issue-${playerIndex}`;
    const value = parseInt(document.getElementById(issueSliderId).value) * 1_000_000_000;
    
    // Taxa de juros de mercado depende da proporção dívida/PIB
    const player = players[playerIndex];
    const riskSpread = Math.max(0, (player.publicDebt / player.gdp - 0.6) * 100);
    const marketInterestRate = player.interestRate + riskSpread / 100;
    
    // Efeito na taxa de juros quando emite muitos títulos de uma vez
    const issueImpact = value / player.gdp * 10;
    
    // Salvar o valor anterior do caixa (para debug/verificação)
    const previousTreasury = player.treasury;
    
    // Atualizamos os valores persistentes do jogador
    const valueWithImpact = value * (1 + issueImpact/100);
    player.treasury += value;
    player.publicDebt += valueWithImpact;
    
    // Se o Auto Play estiver ativo, pausamos temporariamente
    let autoPlayWasActive = false;
    if (autoPlayActive) {
        autoPlayWasActive = true;
        clearInterval(autoPlayInterval);
        autoPlayActive = false;
        document.getElementById("autoPlay").textContent = "Auto Play (1 turno/seg)";
    }
    
    // Atualizamos os indicadores na interface
    renderIndicators();
    
    // Logging para diagnóstico
    console.log(`Emissão de títulos - Jogador ${playerIndex+1}:`);
    console.log(`Caixa antes: $${previousTreasury/1e9} bilhões`);
    console.log(`Valor emitido: $${value/1e9} bilhões`);
    console.log(`Caixa depois: $${player.treasury/1e9} bilhões`);
    
    // Reiniciamos o auto play se estava ativo antes
    if (autoPlayWasActive) {
        setTimeout(() => {
            autoPlayInterval = setInterval(advanceTurn, 50);
            autoPlayActive = true;
            document.getElementById("autoPlay").textContent = "Parar Auto Play";
        }, 1000); // Esperamos 1 segundo antes de reativar
    }
}

/**
 * Adiciona o botão de retirada na interface para todos os jogadores
 */
export function addWithdrawalButton() {
    players.forEach((player, index) => {
        // Encontrar o elemento do jogador
        const element = document.getElementById(`player${index + 1}`);
        
        // Verificar se o elemento existe e não possui já o botão de retirada
        if (element && !document.getElementById(`withdrawal-container-${index}`)) {
            // Criar um container para o botão e input de retirada
            const withdrawalContainer = document.createElement('div');
            withdrawalContainer.id = `withdrawal-container-${index}`;
            withdrawalContainer.className = 'slider-group';
            withdrawalContainer.style.marginTop = '15px';
            
            // HTML para o container de retirada
            withdrawalContainer.innerHTML = `
                <hr>
                <label>RETIRADA ($ bi): 
                <input type="number" id="withdrawal-value-${index}" min="1" max="100" step="1" value="5" style="width: 60px;">
                </label>
                <button id="btn-withdrawal-${index}" onclick="makeWithdrawal(${index})">Retirada</button>
            `;
            
            // Adicionar o container ao elemento do jogador
            element.appendChild(withdrawalContainer);
        }
    });
}

/**
 * Realiza uma retirada do caixa do jogador
 * @param {number} playerIndex - Índice do jogador
 */
export function makeWithdrawal(playerIndex) {
    // Obter o valor do input
    const inputElement = document.getElementById(`withdrawal-value-${playerIndex}`);
    const withdrawalValue = parseFloat(inputElement.value) * 1_000_000_000; // Converter para bilhões
    
    // Referência ao jogador
    const player = players[playerIndex];
    
    // Verificar se há saldo suficiente
    if (player.treasury < withdrawalValue) {
        alert(`Jogador ${playerIndex + 1} não tem caixa suficiente para esta retirada!`);
        return;
    }
    
    // Verificar se é uma grande retirada (mais de 30% do caixa atual)
    const withdrawalPercentage = withdrawalValue / player.treasury;
    
    // Subtrair o valor do caixa do jogador
    player.treasury -= withdrawalValue;
    
    // Calcular o impacto como percentual do PIB (reduzido)
    const gdpImpact = withdrawalValue / player.gdp;
    
    // Acumular o total retirado
    player.totalWithdrawn += withdrawalValue;
    
    // Isso faz com que o impacto seja distribuído por 2 anos, sendo menos severo a cada dia
    player.dailyDeduction = player.totalWithdrawn / 730;
    
    // Atualizar o histórico de caixa
    player.treasuryHistory.push(player.treasury);
    if (player.treasuryHistory.length > 10) player.treasuryHistory.shift();
    
    // Atualizar o historico de retiradas total (acumulativo)
    player.withdrawalHistory += withdrawalValue;
    
    // Quanto maior a retirada, maior o impacto, mas com efeito reduzido
    const penalty = Math.min(0.4, withdrawalPercentage * 0.75); // Reduzido de 1.5 para 0.75
    
    // Tornar o efeito cumulativo menos severo para retiradas sequenciais
    const newMultiplier = player.recoveryMultiplier - penalty * 0.15; // Reduzido de 0.3 para 0.15
    player.recoveryMultiplier = Math.max(0.5, newMultiplier); // Aumentado o mínimo de 0.3 para 0.5
    
    // Ativar flag de perda apenas para retiradas significativas
    player.majorTreasuryLoss = withdrawalPercentage > 0.2; // Só ativa para retiradas maiores que 20% do caixa
    
    // Reduzir o impacto na recuperação
    player.recoveryLimit = Math.max(0.85, player.recoveryLimit - (gdpImpact * 2.5)); // Reduzido de 5 para 2.5
    
    // Reduzir o impacto permanente na arrecadação
    // Isso simula a perda permanente de capacidade produtiva, agora menos severa
    player.permanentWithdrawal += gdpImpact * 50; // Reduzido de 100 para 50
        
    // Se for uma grande retirada, aplicar penalidades de longo prazo mais suaves
    if (withdrawalPercentage > 0.4) { // Aumentado o limiar de 0.3 para 0.4
        // Quanto maior a retirada percentual, maior a penalidade (reduzida)
        const penalty = Math.min(0.4, withdrawalPercentage * 0.5); // Reduzido o fator
        player.recoveryMultiplier = Math.max(0.6, 1 - penalty); // Aumentado o mínimo de 0.3 para 0.6
        
        // Se for uma grande perda, também afeta a confiança do mercado, mas com impacto reduzido
        if (withdrawalPercentage > 0.7) { // Aumentado o limiar de 0.6 para 0.7
            // Aumentar a taxa de juros devido ao aumento do risco percebido
            const interestIncrease = withdrawalPercentage * 1; // Reduzido de 2 para 1
            player.interestRate += interestIncrease;
            
            // Atualizar o controle deslizante de juros
            document.getElementById(`slider-interestRate-${playerIndex}`).value = player.interestRate;
            document.getElementById(`val-interestRate-${playerIndex}`).innerText = player.interestRate.toFixed(2);
            
            // Pequeno impacto na inflação (reduzido)
            player.inflation += withdrawalPercentage * 0.25; // Reduzido de 0.5 para 0.25
        }
    }
    
    // Atualizar a interface
    renderIndicators();
    
    console.log(`Retirada realizada: $${withdrawalValue/1e9} bilhões (${(withdrawalPercentage*100).toFixed(1)}% do caixa)`);
    console.log(`Novo multiplicador de recuperação: ${player.recoveryMultiplier.toFixed(2)}`);
    console.log(`Limite de recuperação: ${player.recoveryLimit.toFixed(2)}`);
    console.log(`Impacto permanente: ${player.permanentWithdrawal.toFixed(2)}%`);
    console.log(`Dedução diária: $${(player.dailyDeduction/1e9).toFixed(2)} bi por dia`);
}