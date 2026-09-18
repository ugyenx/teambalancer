// --- State Management ---
let players = JSON.parse(localStorage.getItem("football_players")) || [];
let editingId = null;

// --- DOM Elements ---
const nameInput = document.getElementById("player-name");
const ratingInput = document.getElementById("player-rating");
const ratingDisplay = document.getElementById("rating-display");
const addBtn = document.getElementById("add-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const playerList = document.getElementById("player-list");
const modalPlayerList = document.getElementById("modal-player-list"); // New
const emptyState = document.getElementById("empty-state");
const playerCount = document.getElementById("player-count");
const clearAllBtn = document.getElementById("clear-all-btn");
const generateBtn = document.getElementById("generate-btn");
const generateBtnText = document.getElementById("generate-btn-text");
const resultsArea = document.getElementById("results-area");
const formTitle = document.getElementById("form-title");
const algoSelect = document.getElementById("algorithm-select");
const rosterModal = document.getElementById("roster-modal"); // New
const maximizeRosterBtn = document.getElementById("maximize-roster-btn"); // New

// --- Initialization ---
updateUI();

// --- Event Listeners ---
ratingInput.addEventListener("input", (e) => {
  ratingDisplay.textContent = e.target.value;
});

addBtn.addEventListener("click", handleAddOrUpdate);
cancelEditBtn.addEventListener("click", resetForm);
clearAllBtn.addEventListener("click", () => {
  // Using a custom modal is better than confirm() but for simplicity, we keep the alert message format.
  if (window.confirm("Are you sure you want to delete all players?")) {
    players = [];
    saveData();
    updateUI();
    showToast("All players cleared");
  }
});
generateBtn.addEventListener("click", generateTeams);

// Modal Handlers
maximizeRosterBtn.addEventListener("click", openRosterModal);
document
  .getElementById("close-modal-btn")
  .addEventListener("click", closeRosterModal);
document
  .getElementById("modal-done-btn")
  .addEventListener("click", closeRosterModal);

function openRosterModal() {
  rosterModal.classList.remove("translate-x-full");
  rosterModal.classList.add("translate-x-0");
  // Re-render the list inside the modal to ensure it's up to date
  renderPlayerList(modalPlayerList, false);
}

function closeRosterModal() {
  rosterModal.classList.remove("translate-x-0");
  rosterModal.classList.add("translate-x-full");
  // Update the main UI after modal is closed (in case any changes were missed)
  updateUI();
}

// --- Core Functions ---

function handleAddOrUpdate() {
  const name = nameInput.value.trim();
  const rating = parseInt(ratingInput.value);

  if (!name) {
    showToast("Please enter a player name");
    return;
  }

  if (editingId) {
    // Update existing
    const index = players.findIndex((p) => p.id === editingId);
    if (index !== -1) {
      // Keep existing active state
      players[index] = { ...players[index], name, rating };
      showToast("Player updated");
    }
  } else {
    // Add new (Default active: true)
    const newPlayer = {
      id: Date.now().toString(),
      name,
      rating,
      active: true,
    };
    players.push(newPlayer);
    showToast("Player added");
  }

  saveData();
  resetForm();
  updateUI();
}

function deletePlayer(id) {
  players = players.filter((p) => p.id !== id);
  saveData();
  updateUI();

  // If we are currently editing the deleted player, reset form
  if (editingId === id) resetForm();

  // Also update modal if open
  if (rosterModal.classList.contains("translate-x-0")) {
    renderPlayerList(modalPlayerList, false);
  }
}

function editPlayer(id) {
  const player = players.find((p) => p.id === id);
  if (!player) return;

  // Close modal if open, so user can edit in main form
  if (rosterModal.classList.contains("translate-x-0")) {
    closeRosterModal();
  }

  nameInput.value = player.name;
  ratingInput.value = player.rating;
  ratingDisplay.textContent = player.rating;

  editingId = id;
  formTitle.textContent = "Edit Player";
  addBtn.innerHTML = '<i class="ph ph-check text-lg"></i> Update';
  addBtn.classList.remove("bg-emerald-600", "hover:bg-emerald-700");
  addBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
  cancelEditBtn.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function togglePlayer(id) {
  const index = players.findIndex((p) => p.id === id);
  if (index !== -1) {
    // Toggle active state (handle undefined as true)
    const current = players[index].active !== false;
    players[index].active = !current;
    saveData();
    updateUI();
  }
}

function resetForm() {
  nameInput.value = "";
  ratingInput.value = 50;
  ratingDisplay.textContent = "50";
  editingId = null;
  formTitle.textContent = "Add Player";

  addBtn.innerHTML = '<i class="ph ph-plus-circle text-lg"></i> Add Player';
  addBtn.classList.add("bg-emerald-600", "hover:bg-emerald-700");
  addBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
  cancelEditBtn.classList.add("hidden");
}

function saveData() {
  localStorage.setItem("football_players", JSON.stringify(players));
}

// Renders the player list into a specified container
function renderPlayerList(container, isCompact) {
  container.innerHTML = "";
  const displayList = [...players].reverse();

  displayList.forEach((player) => {
    const isActive = player.active !== false;

    const el = document.createElement("div");
    const opacityClass = isActive
      ? "opacity-100 bg-white border-emerald-500"
      : "inactive bg-gray-50 border-gray-200";
    const iconColor = isActive
      ? "bg-emerald-100 text-emerald-700"
      : "bg-gray-200 text-gray-400";
    const barColor = isActive ? "bg-emerald-400" : "bg-gray-400";
    const checkIcon = isActive
      ? '<i class="ph-fill ph-check-circle text-emerald-500 text-xl"></i>'
      : '<i class="ph ph-circle text-gray-300 text-xl"></i>';

    // Card style
    const cardClasses = isCompact
      ? `player-card cursor-pointer flex items-center justify-between p-3 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md ${opacityClass}`
      : `player-card cursor-pointer flex items-center justify-between p-4 rounded-xl border-l-8 shadow-md transition-all hover:shadow-lg ${opacityClass}`;

    el.className = cardClasses;
    el.onclick = () => togglePlayer(player.id);

    el.innerHTML = `
                    <div class="flex items-center gap-4">
                        <div class="w-6 flex justify-center">
                            ${checkIcon}
                        </div>
                        <div class="h-10 w-10 rounded-full ${iconColor} flex items-center justify-center font-bold text-sm">
                            ${player.rating}
                        </div>
                        <div class="flex flex-col">
                            <span class="font-semibold text-gray-800">${escapeHtml(player.name)}</span>
                            <div class="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div class="h-full ${barColor}" style="width: ${player.rating}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="event.stopPropagation(); editPlayer('${player.id}')" class="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                            <i class="ph ph-pencil-simple text-lg"></i>
                        </button>
                        <button onclick="event.stopPropagation(); deletePlayer('${player.id}')" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                            <i class="ph ph-trash text-lg"></i>
                        </button>
                    </div>
                `;
    container.appendChild(el);
  });

  // Handle empty state separately for the main UI
  if (isCompact) {
    if (players.length > 0) {
      emptyState.classList.add("hidden");
      clearAllBtn.classList.remove("hidden");
      maximizeRosterBtn.classList.remove("hidden");
    } else {
      emptyState.classList.remove("hidden");
      clearAllBtn.classList.add("hidden");
      maximizeRosterBtn.classList.add("hidden");
      resultsArea.classList.add("hidden");
    }
  }
}

function updateUI() {
  // Rerender lists
  renderPlayerList(playerList, true); // Main list (compact)
  if (rosterModal.classList.contains("translate-x-0")) {
    renderPlayerList(modalPlayerList, false); // Modal list (full size)
  }

  // Count total and active
  playerCount.textContent = players.length;
  const activePlayers = players.filter((p) => p.active !== false);

  // Update Generate Button
  if (activePlayers.length < 2) {
    generateBtn.disabled = true;
    generateBtnText.textContent =
      activePlayers.length === 0 ? "Select Players" : "Need 2+ Players";
  } else {
    generateBtn.disabled = false;
    generateBtnText.textContent = `Generate Teams (${activePlayers.length})`;
  }
}

// --- Team Generation Algorithm ---

function generateTeams() {
  // Filter only active players
  let activePlayers = players.filter((p) => p.active !== false);

  if (activePlayers.length < 2) {
    showToast("Need at least 2 active players!");
    return;
  }

  const algorithm = algoSelect.value;

  let teamA = { members: [], totalRating: 0 };
  let teamB = { members: [], totalRating: 0 };

  // Algorithms require players sorted by rating (highest to lowest)
  activePlayers.sort((a, b) => b.rating - a.rating);

  switch (algorithm) {
    case "random":
      // Fisher-Yates Shuffle
      for (let i = activePlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activePlayers[i], activePlayers[j]] = [
          activePlayers[j],
          activePlayers[i],
        ];
      }
      // Simple alternating assignment
      activePlayers.forEach((player, index) => {
        if (index % 2 === 0) addToTeam(teamA, player);
        else addToTeam(teamB, player);
      });
      break;

    case "greedy_balance":
      // Basic Balance (The original implementation)
      activePlayers.forEach((player) => {
        if (teamA.totalRating <= teamB.totalRating) {
          addToTeam(teamA, player);
        } else {
          addToTeam(teamB, player);
        }
      });
      break;

    case "alternating_draft":
      // Alternating Picks (Draft style: High-rated players alternate)
      for (let i = 0; i < activePlayers.length; i++) {
        if (i % 2 === 0) {
          // 1st, 3rd, 5th pick goes to the same team
          addToTeam(teamA, activePlayers[i]);
        } else {
          // 2nd, 4th, 6th pick
          addToTeam(teamB, activePlayers[i]);
        }
      }
      // Handle odd number of players by assigning the last player to the smaller team
      if (teamA.members.length > teamB.members.length) {
        // This case shouldn't happen with the current logic, but as a safeguard:
        if (teamB.totalRating < teamA.totalRating) {
          // Swap last player from A to B
          const lastA = teamA.members.pop();
          teamA.totalRating -= lastA.rating;
          addToTeam(teamB, lastA);
        }
      }
      break;

    case "strict_balance":
      // Strict Balance (More complex grouping for closest total score)
      let currentTeamA = { members: [], totalRating: 0 };
      let currentTeamB = { members: [], totalRating: 0 };

      activePlayers.forEach((player) => {
        const diffA = Math.abs(
          currentTeamA.totalRating + player.rating - currentTeamB.totalRating,
        );
        const diffB = Math.abs(
          currentTeamA.totalRating - (currentTeamB.totalRating + player.rating),
        );

        // Prioritize balancing total score first
        if (diffA < diffB) {
          addToTeam(currentTeamA, player);
        } else if (diffB < diffA) {
          addToTeam(currentTeamB, player);
        } else {
          // If diffs are equal, balance team size
          if (currentTeamA.members.length <= currentTeamB.members.length) {
            addToTeam(currentTeamA, player);
          } else {
            addToTeam(currentTeamB, player);
          }
        }
      });

      teamA = currentTeamA;
      teamB = currentTeamB;
      break;

    default:
      console.error("Unknown algorithm selected.");
      return;
  }

  // 3. Render Results
  renderResults(teamA, teamB);

  // Scroll to results
  resultsArea.classList.remove("hidden");
  setTimeout(() => {
    resultsArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);

  showToast(`Teams Generated (${getAlgoName(algorithm)})`);
}

function addToTeam(team, player) {
  team.members.push(player);
  team.totalRating += player.rating;
}

function getAlgoName(key) {
  const names = {
    random: "Random",
    greedy_balance: "Basic Balance",
    strict_balance: "Strict Balance",
    alternating_draft: "Alternating Picks",
  };
  return names[key] || "Unknown";
}

function renderResults(teamA, teamB) {
  const renderList = (team, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    // Sort by rating within the team for readability
    team.members.sort((a, b) => b.rating - a.rating);

    team.members.forEach((p) => {
      const li = document.createElement("li");
      li.className =
        "flex justify-between items-center bg-white/50 p-2 rounded";
      li.innerHTML = `<span>${escapeHtml(p.name)}</span> <span class="font-bold opacity-60 text-xs">${p.rating}</span>`;
      container.appendChild(li);
    });
  };

  renderList(teamA, "teama-list");
  renderList(teamB, "teamb-list");

  // Update stats
  document.getElementById("teama-score").textContent = teamA.totalRating;
  document.getElementById("teamb-score").textContent = teamB.totalRating;

  const avgA = teamA.members.length
    ? (teamA.totalRating / teamA.members.length).toFixed(1)
    : 0;
  const avgB = teamB.members.length
    ? (teamB.totalRating / teamB.members.length).toFixed(1)
    : 0;

  document.getElementById("teama-avg").textContent = avgA;
  document.getElementById("teamb-avg").textContent = avgB;

  const diff = Math.abs(teamA.totalRating - teamB.totalRating);
  document.getElementById("rating-diff").textContent = diff;
}

// --- Utilities ---

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("opacity-0");
  setTimeout(() => {
    toast.classList.add("opacity-0");
  }, 2500);
}

function escapeHtml(text) {
  if (!text) return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function copyTeams() {
  const teamA = document.getElementById("teama-list").innerText;
  const teamB = document.getElementById("teamb-list").innerText;
  const text = `⚽ Team A:\n${teamA}\n\n⚽ Team B:\n${teamB}`;

  // Clipboard API might fail in iframe without permissions, use fallback
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand("copy");
    showToast("Teams copied to clipboard!");
  } catch (err) {
    showToast("Failed to copy");
  }
  document.body.removeChild(textArea);
}
