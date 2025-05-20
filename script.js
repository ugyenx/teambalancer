let players = JSON.parse(localStorage.getItem('players')) || [];
let editingIndex = null;

const playerList = document.getElementById('playerList');
const addPlayerForm = document.getElementById('addPlayerForm');
const nameInput = document.getElementById('name');
const skillInput = document.getElementById('skill');
const divideTeamsBtn = document.getElementById('divideTeamsBtn');
const teamsOutput = document.getElementById('teamsOutput');

function savePlayers() {
    localStorage.setItem('players', JSON.stringify(players));
}

function renderPlayers() {
    playerList.innerHTML = '';
    players.forEach((player, i) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `player-${i}`;
        checkbox.value = i;

        const label = document.createElement('label');
        label.htmlFor = `player-${i}`;
        label.textContent = `${player.name} (Skill: ${player.skill})`;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => {
            editingIndex = i;
            nameInput.value = player.name;
            skillInput.value = player.skill;
            document.getElementById('addPlayerBtn').textContent = 'Update Player';
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'deleteBtn';
        deleteBtn.onclick = () => {
            if (confirm(`Delete player "${player.name}"?`)) {
                players.splice(i, 1);
                savePlayers();
                renderPlayers();
                resetForm();
            }
        };

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        playerList.appendChild(li);
    });
}

function resetForm() {
    editingIndex = null;
    nameInput.value = '';
    skillInput.value = '';
    document.getElementById('addPlayerBtn').textContent = 'Add Player';
}

addPlayerForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const skill = Number(skillInput.value);

    if (!name || isNaN(skill) || skill < 1 || skill > 100) {
        alert('Please enter a valid name and skill between 1 and 100.');
        return;
    }

    if (editingIndex !== null) {
        players[editingIndex] = { name, skill };
    } else {
        players.push({ name, skill });
    }

    savePlayers();
    renderPlayers();
    resetForm();
});

divideTeamsBtn.addEventListener('click', () => {
    const selectedIndexes = [...playerList.querySelectorAll('input[type=checkbox]:checked')]
        .map(cb => parseInt(cb.value));

    if (selectedIndexes.length < 2) {
        alert('Select at least 2 players to divide teams.');
        return;
    }

    const selectedPlayers = selectedIndexes.map(i => players[i]);

    let bestDiff = Infinity;
    let bestSplit = [];

    function backtrack(index, teamA, teamB, sumA, sumB) {
        if (index === selectedPlayers.length) {
            const diff = Math.abs(sumA - sumB);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestSplit = [teamA.slice(), teamB.slice()];
            }
            return;
        }

        const player = selectedPlayers[index];

        teamA.push(player);
        backtrack(index + 1, teamA, teamB, sumA + player.skill, sumB);
        teamA.pop();

        teamB.push(player);
        backtrack(index + 1, teamA, teamB, sumA, sumB + player.skill);
        teamB.pop();
    }

    backtrack(0, [], [], 0, 0);

    const [team1, team2] = bestSplit;

    teamsOutput.innerHTML = `
    <h4>Team 1</h4>
    <ul>${team1.map(p => `<li>${p.name} (Skill: ${p.skill})</li>`).join('')}</ul>
    <h4>Team 2</h4>
    <ul>${team2.map(p => `<li>${p.name} (Skill: ${p.skill})</li>`).join('')}</ul>
    <p><strong>Skill Difference:</strong> ${bestDiff}</p>
  `;
});

// Initial render
renderPlayers();
