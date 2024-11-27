const gameBoard = document.getElementById("gameBoard");
const statusDisplay = document.getElementById("status");
const restartButton = document.getElementById("restartButton");
const modeSelection = document.getElementById("modeSelection");
const playerVsPlayerButton = document.getElementById("playerVsPlayer");
const playerVsBotButton = document.getElementById("playerVsBot");

// Popup elements
const successPopup = document.getElementById("successPopup");
const popupMessage = document.getElementById("popupMessage");
const popupCloseButton = document.getElementById("popupCloseButton");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let isPlayingWithBot = false;

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Update the game status
const updateStatus = (message) => {
  statusDisplay.textContent = message;
};

// Display success popup
const showSuccessPopup = (message) => {
  popupMessage.textContent = message;
  successPopup.style.display = "flex";
};

// Hide success popup
popupCloseButton.addEventListener("click", () => {
  successPopup.style.display = "none";
});

// Check if there's a winner
const checkWinner = () => {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      const winMessage = currentPlayer === "X" ? "You Win!" : isPlayingWithBot ? "Bot Wins!" : `Player ${currentPlayer} Wins!`;
      showSuccessPopup(winMessage);
      isGameActive = false;
      return true;
    }
  }
  if (!board.includes("")) {
    showSuccessPopup("It's a Draw!");
    isGameActive = false;
    return true;
  }
  return false;
};

// Bot's move (simple AI)
const botMove = () => {
  if (!isGameActive) return;

  const emptyCells = board
    .map((cell, index) => (cell === "" ? index : null))
    .filter((index) => index !== null);

  const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];

  if (randomIndex !== undefined) {
    board[randomIndex] = "O";
    const botCell = gameBoard.querySelector(`[data-index='${randomIndex}']`);
    botCell.textContent = "O";
    botCell.classList.add("taken");

    if (!checkWinner()) {
      currentPlayer = "X";
      updateStatus("Player X's turn");
    }
  }
};

// Handle cell click
const handleCellClick = (event) => {
  const cellIndex = event.target.getAttribute("data-index");

  if (board[cellIndex] !== "" || !isGameActive) return;

  board[cellIndex] = currentPlayer;
  event.target.textContent = currentPlayer;
  event.target.classList.add("taken");

  if (!checkWinner()) {
    if (isPlayingWithBot) {
      currentPlayer = "O";
      updateStatus("Bot's turn");
      setTimeout(botMove, 500);
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      updateStatus(`Player ${currentPlayer}'s turn`);
    }
  }
};

// Initialize the game board
const initializeBoard = () => {
  gameBoard.innerHTML = "";
  board = ["", "", "", "", "", "", "", "", ""];
  isGameActive = true;
  currentPlayer = "X";
  updateStatus("Player X's turn");

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("data-index", i);
    cell.addEventListener("click", handleCellClick);
    gameBoard.appendChild(cell);
  }
};

// Start the game with selected mode
const startGame = (playWithBot) => {
  isPlayingWithBot = playWithBot;
  modeSelection.style.display = "none";
  gameBoard.style.display = "grid";
  restartButton.style.display = "block";
  initializeBoard();
};

// Restart the game
restartButton.addEventListener("click", () => startGame(isPlayingWithBot));

// Mode selection
playerVsPlayerButton.addEventListener("click", () => startGame(false));
playerVsBotButton.addEventListener("click", () => startGame(true));
