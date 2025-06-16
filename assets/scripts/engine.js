function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

let combatants = [];
let nextId = 1; // Para gerar IDs únicos para cada combatente

// Referências aos elementos HTML
const combatantNameInput = document.getElementById('combatant-name');
const combatantDextery = document.getElementById('dextery');
const initiativeBonusInput = document.getElementById('initiative-bonus');
const combatantTypeInput =  document.querySelector('input[name="combatant-type"]:checked').value;
const isSurprised = false; // Inicialmente, não está surpreso
const isFallen = false; // Inicialmente, não está caído
const addCombatantBtn = document.getElementById('add-combatant-btn');
const combatantsListUl = document.getElementById('combatants-list');
const rollAllBtn = document.getElementById('roll-all-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const initiativeOrderOl = document.getElementById('initiative-order');

const dataAtual = new Date();
const anoAtual = dataAtual.getFullYear();

document.getElementById("ano").textContent = anoAtual;

// Função para adicionar um novo combatente
function addCombatant() {
    const name = combatantNameInput.value.trim();
    const dextery = parseInt(combatantDextery.value) || 0; // Padrão para 0 se não for um número válido
    const bonus = parseInt(initiativeBonusInput.value);
    const type = document.querySelector('input[name="combatant-type"]:checked').value;
    const isSurprised = document.querySelector('input[name="isSurpised"]:checked').value === "true";
    const isFallen = false;
    console.log("DEX: "+dextery);

    if (!name) {
        alert('Por favor, insira o nome do combatente.');
        return;
    }
    if (isNaN(bonus)) {
        alert('Por favor, insira um bônus de iniciativa válido.');
        return;
    }

    const newCombatant = {
        id: `combatant-${nextId++}`,
        name: name,
        dextery: dextery,
        modDex: Math.floor((dextery - 10) / 2),
        bonusIniciativa: bonus,
        type: type,
        isSurprised: isSurprised,
        isFallen: isFallen,
        resultadoRolagem: null, // Ainda não rolou
        totalIniciativa: null   // Ainda não rolou
    };

    combatants.push(newCombatant);
    console.log ("Combatente ModDex added:", newCombatant.modDex);
    renderCombatantsList();

    // Limpar os campos de entrada
    combatantNameInput.value = '';
    initiativeBonusInput.value = '0';
    combatantNameInput.focus(); // Coloca o foco de volta no nome
}

// Função utilitária para exibir se está surpreso
function getSurpresoInfo(combatant) {
    return combatant.isSurprised ? '<span style="color:red;">está surpreso</span>' : '';
}

function modifyBonus(combatantId) {
    const combatant = combatants.find(c => c.id === combatantId);
    if (combatant) {
        const novoBonus = prompt(
            `Digite o novo bônus de iniciativa para ${combatant.name} (pode ser negativo):`,
            combatant.bonusIniciativa
        );
        if (novoBonus !== null) {
            const valor = parseInt(novoBonus, 10);
            if (!isNaN(valor)) {
                combatant.bonusIniciativa = valor;
                // Atualiza a iniciativa se já tiver rolado
                if (combatant.resultadoRolagem !== null) {
                    combatant.totalIniciativa = combatant.resultadoRolagem + valor;
                }
                renderCombatantsList();
            } else {
                alert('Por favor, insira um número válido.');
            }
        }
    }
}

// Função para renderizar a lista de combatentes adicionados
function renderCombatantsList() {
    combatantsListUl.innerHTML = ''; // Limpa a lista existente

    combatants.forEach(combatant => {
        const li = document.createElement('li');
        li.dataset.id = combatant.id; // Armazena o ID no elemento li

        let initiativeInfo = '';
        if (combatant.totalIniciativa !== null) {
            initiativeInfo = `(Rolagem: ${combatant.resultadoRolagem}, Total: ${combatant.totalIniciativa})`;
        }

         // Adiciona "está surpreso" se necessário
        const surpresoInfo = getSurpresoInfo(combatant);

        li.innerHTML = `
            <div class="combatant-info">
                <strong>${combatant.type}:</strong> ${combatant.name}, Modificador de deztreza: ${combatant.modDex}, Bônus: ${combatant.bonusIniciativa}) ${initiativeInfo} ${surpresoInfo}
            </div>
            <div class="combatant-actions">
                <button class="roll-single-btn" data-id="${combatant.id}">Rolar</button>
                <button class="remove-btn" data-id="${combatant.id}">Remover</button>
                <button class="surprised-btn" data-id="${combatant.id}">Surpreender</button>
                <button class="fallen-btn" data-id="${combatant.id}">Caído</button>
                <button class="bonus-btn" data-id="${combatant.id}">Modificar Bônus</button>
            </div>
        `;
        combatantsListUl.appendChild(li);
    });

    // Atualiza os event listeners para os botões "Rolar" e "Remover"
    addEventListenersToCombatantButtons();
    displayInitiativeOrder(); // Atualiza a ordem da iniciativa também
}

// Adiciona event listeners para os botões "Rolar" e "Remover" dinamicamente
function addEventListenersToCombatantButtons() {
    document.querySelectorAll('.roll-single-btn').forEach(button => {
        button.onclick = (event) => rollInitiative(event.target.dataset.id);
    });
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.onclick = (event) => removeCombatant(event.target.dataset.id);
    });
    document.querySelectorAll('.surprised-btn').forEach(button => {
        button.onclick = (event) => toggleSurprised(event.target.dataset.id);
    });
    document.querySelectorAll('.fallen-btn').forEach(button => {
        button.onclick = (event) => toggleIsFallen(event.target.dataset.id);
    });
    document.querySelectorAll('.bonus-btn').forEach(button => {
        button.onclick = (event) => modifyBonus(event.target.dataset.id);
    });
}

// Função para rolar a iniciativa para um combatente específico
function rollInitiative(combatantId) {
    const combatant = combatants.find(c => c.id === combatantId);
    if (combatant) {
        const roll = Math.floor(Math.random() * 20) + 1; // d20
        combatant.resultadoRolagem = roll;
        combatant.totalIniciativa = roll + combatant.bonusIniciativa + combatant.modDex;
        renderCombatantsList(); // Renderiza novamente para mostrar os resultados
    }
}

// Função para rolar a iniciativa para todos os combatentes
function rollAllInitiatives() {
    combatants.forEach(combatant => {
        const roll = Math.floor(Math.random() * 20) + 1; // d20
        combatant.resultadoRolagem = roll;
        combatant.totalIniciativa = roll + combatant.bonusIniciativa + combatant.modDex;
    });
    renderCombatantsList(); // Renderiza novamente para mostrar os resultados
}

// Função para remover um combatente
function removeCombatant(combatantId) {
    combatants = combatants.filter(c => c.id !== combatantId);
    renderCombatantsList(); // Atualiza a lista
}

function toggleSurprised(combatantId) {
    const combatant = combatants.find(c => c.id === combatantId);
    if (combatant) {
        combatant.isSurprised = !combatant.isSurprised;
        renderCombatantsList(); // Renderiza novamente para atualizar a visualização
    }
}

function toggleIsFallen(combatantId) {
    const combatant = combatants.find(c => c.id === combatantId);
    if (combatant) {
        combatant.isFallen = !combatant.isFallen;
        renderCombatantsList(); // Renderiza novamente para atualizar a visualização
    }
}

// Função para exibir a ordem de iniciativa
function displayInitiativeOrder() {
    initiativeOrderOl.innerHTML = ''; // Limpa a lista existente

    const combatantsWithInitiative = combatants.filter(c => c.totalIniciativa !== null);

    // Ordena os combatentes
    combatantsWithInitiative.sort((a, b) => {
        // Primeiro, ordena pelo totalIniciativa (maior para menor)
        if (a.isSurprised !== b.isSurprised) {
            return a.isSurprised - b.isSurprised; // false (0) vem antes de true (1)
        }
        if (b.totalIniciativa !== a.totalIniciativa) {
            return b.totalIniciativa - a.totalIniciativa;
        }
        return b.bonusIniciativa - a.bonusIniciativa;
    });

    if (combatantsWithInitiative.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum combatente com iniciativa rolada.';
        initiativeOrderOl.appendChild(li);
        return;
    }

    // ... No displayInitiativeOrder:
    

    combatantsWithInitiative.forEach(combatant => {
        const li = document.createElement('li');
        const surpresoInfo = getSurpresoInfo(combatant);

        // Se estiver caído, risca o nome
        if (combatant.isFallen) {
        li.classList.add('fallen');
        }

        li.innerHTML = `
            <strong>${combatant.type}:</strong> <span>${combatant.name}</span> ${surpresoInfo}
            <span>Total: ${combatant.totalIniciativa} (Rolagem: ${combatant.resultadoRolagem} + (Modificador de dextreza:  + ${combatant.modDex}) + (Bônus: ${combatant.bonusIniciativa})</span>
        `;
        initiativeOrderOl.appendChild(li);
    });
}

// Função para limpar todos os combatentes
function clearAll() {
    combatants = [];
    nextId = 1; // Reinicia o contador de IDs
    renderCombatantsList();
}

// Event Listeners principais
addCombatantBtn.addEventListener('click', addCombatant);
rollAllBtn.addEventListener('click', rollAllInitiatives);
clearAllBtn.addEventListener('click', clearAll);

//Listener para o campo de nome do combatente
combatantNameInput.addEventListener('input', handleMonsterAutocomplete);

// Buscar monstros na API conforme o usuário digita
let monsterSuggestions = [];

async function handleMonsterAutocomplete(event) {
    // Só sugere se o tipo selecionado for "Monstro"
    const type = document.querySelector('input[name="combatant-type"]:checked').value;
    if (type !== "Monstro") {
        showSuggestions([]);
        return;
    }
    // Verifica se o campo de nome não está vazio e tem pelo menos 2 caracteres
    const query = event.target.value.trim().toLowerCase();
    if (query.length < 2) {
        showSuggestions([]);
        return;
    }

    // Busca lista de monstros
    const response = await fetch('https://www.dnd5eapi.co/api/monsters');
    const data = await response.json();
    monsterSuggestions = data.results.filter(monster =>
        monster.name.toLowerCase().includes(query)
    ).slice(0, 5); // Limita a 5 sugestões

    showSuggestions(monsterSuggestions);
}

function showSuggestions(suggestions) {
    const ul = document.getElementById('monster-suggestions');
    ul.innerHTML = '';
    suggestions.forEach(monster => {
        const li = document.createElement('li');
        li.textContent = monster.name;
        li.onclick = () => selectMonster(monster);
        ul.appendChild(li);
    });
    ul.style.display = suggestions.length ? 'block' : 'none';
}

async function selectMonster(monster) {
    // Busca detalhes do monstro
    const response = await fetch(`https://www.dnd5eapi.co${monster.url}`);
    const data = await response.json();

    combatantNameInput.value = data.name;
    combatantDextery.value = data.dexterity;
    initiativeBonusInput.value = Math.floor((data.dexterity - 10) / 2);

    showSuggestions([]);
}

// Opcional: Adicionar combatente ao pressionar Enter no campo de bônus
initiativeBonusInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addCombatant();
    }
});

// Renderiza a lista inicial ao carregar a página (estará vazia)
renderCombatantsList();

