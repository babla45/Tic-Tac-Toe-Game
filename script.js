const gameBoard = document.getElementById("gameBoard");
const statusDisplay = document.getElementById("status");
const homeButton = document.getElementById("homeButton");
const modeSelection = document.getElementById("modeSelection");
const playerVsPlayerButton = document.getElementById("playerVsPlayer");
const playerVsBotButton = document.getElementById("playerVsBot");
const versionDisplay = document.getElementById("versionDisplay");

// Popup elements
const successPopup = document.getElementById("successPopup");
const popupMessage = document.getElementById("popupMessage");
const popupCloseButton = document.getElementById("popupCloseButton");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let isPlayingWithBot = false;
let botDifficulty = "easy";

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

// Hide success popup and restart the game
popupCloseButton.addEventListener("click", () => {
  successPopup.style.display = "none";
  initializeBoard();
  if (isPlayingWithBot) {
    difficultySection.style.display = "block";
    gameBoard.style.display = "none";
    hideStatus();
  } else {
    gameBoard.style.display = "grid";
    showStatus();
  }
});

// Hide status message
const hideStatus = () => {
  statusDisplay.style.display = "none";
};

// Show status message
const showStatus = () => {
  statusDisplay.style.display = "block";
};

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
const easyBotMove = () => {
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

const mediumBotMove = () => {
  // Block player win if possible, else random
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] === "X" && board[b] === "X" && board[c] === "") {
      board[c] = "O";
      const botCell = gameBoard.querySelector(`[data-index='${c}']`);
      botCell.textContent = "O";
      botCell.classList.add("taken");
      if (!checkWinner()) {
        currentPlayer = "X";
        updateStatus("Player X's turn");
      }
      return;
    }
    if (board[a] === "X" && board[c] === "X" && board[b] === "") {
      board[b] = "O";
      const botCell = gameBoard.querySelector(`[data-index='${b}']`);
      botCell.textContent = "O";
      botCell.classList.add("taken");
      if (!checkWinner()) {
        currentPlayer = "X";
        updateStatus("Player X's turn");
      }
      return;
    }
    if (board[b] === "X" && board[c] === "X" && board[a] === "") {
      board[a] = "O";
      const botCell = gameBoard.querySelector(`[data-index='${a}']`);
      botCell.textContent = "O";
      botCell.classList.add("taken");
      if (!checkWinner()) {
        currentPlayer = "X";
        updateStatus("Player X's turn");
      }
      return;
    }
  }
  // Otherwise, pick random
  easyBotMove();
};

const hardBotMove = () => {
  // Check if a given player has won on a board
  function checkWinForBoard(boardState, player) {
    return winningConditions.some(([a, b, c]) => {
      return boardState[a] === player && boardState[b] === player && boardState[c] === player;
    });
  }

  function getEmptyIndices(boardState) {
    return boardState.reduce((acc, cell, idx) => 
      cell === "" ? acc.concat(idx) : acc, []
    );
  }

  function minimax(newBoard, player) {
    if (checkWinForBoard(newBoard, "X")) {
      return { score: -10 };
    } else if (checkWinForBoard(newBoard, "O")) {
      return { score: 10 };
    } else if (!newBoard.includes("")) {
      return { score: 0 };
    }

    const emptyIndices = getEmptyIndices(newBoard);
    const moves = [];

    for (let i = 0; i < emptyIndices.length; i++) {
      const index = emptyIndices[i];
      const move = { index };
      newBoard[index] = player;

      if (player === "O") {
        move.score = minimax(newBoard, "X").score;
      } else {
        move.score = minimax(newBoard, "O").score;
      }
      newBoard[index] = "";
      moves.push(move);
    }

    let bestMove;
    if (player === "O") {
      let bestScore = -Infinity;
      moves.forEach(m => {
        if (m.score > bestScore) {
          bestScore = m.score;
          bestMove = m;
        }
      });
    } else {
      let bestScore = Infinity;
      moves.forEach(m => {
        if (m.score < bestScore) {
          bestScore = m.score;
          bestMove = m;
        }
      });
    }
    return bestMove;
  }

  // Execute the minimax move
  if (!isGameActive) return;
  const bestMove = minimax([...board], "O");
  board[bestMove.index] = "O";
  const botCell = gameBoard.querySelector(`[data-index='${bestMove.index}']`);
  botCell.textContent = "O";
  botCell.classList.add("taken");
  if (!checkWinner()) {
    currentPlayer = "X";
    updateStatus("Player X's turn");
  }
};

const botMove = () => {
  if (!isGameActive) return;
  if (botDifficulty === "easy") easyBotMove();
  else if (botDifficulty === "medium") mediumBotMove();
  else hardBotMove();
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
  gameBoard.innerHTML = ""; // Clears only the game cells
  board = ["", "", "", "", "", "", "", "", ""];
  isGameActive = true;
  currentPlayer = "X";
  showStatus();
  updateStatus("Player X's turn");

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("data-index", i);
    cell.addEventListener("click", handleCellClick);
    gameBoard.appendChild(cell);
  }
};

// Add function to update version display
const updateVersionDisplay = (mode, difficulty = '') => {
  const text = mode === 'bot' ? `Playing against ${difficulty} Bot` : 'Playing with Friend';
  versionDisplay.textContent = text;
  versionDisplay.style.display = 'inline-block';
};

// Start the game with selected mode
const startGame = (playWithBot) => {
  isPlayingWithBot = playWithBot;
  if (playWithBot) {
    modeSelection.style.display = "none";
    difficultySection.style.display = "block";
    gameBoard.style.display = "none";
    hideStatus();
    versionDisplay.style.display = "none";
  } else {
    difficultySection.style.display = "none";
    gameBoard.style.display = "grid";
    updateVersionDisplay('friend');
    initializeBoard();
  }
};

// Home button functionality
homeButton.addEventListener("click", () => {
  modeSelection.style.display = "flex";
  difficultySection.style.display = "none";
  gameBoard.style.display = "none";
  hideStatus();
  versionDisplay.style.display = "none";
  updateStatus("Player X's turn");
});

// Mode selection
playerVsPlayerButton.addEventListener("click", () => startGame(false));
playerVsBotButton.addEventListener("click", () => startGame(true));

easyDifficulty.addEventListener("click", () => {
  botDifficulty = "easy";
  difficultySection.style.display = "none";
  gameBoard.style.display = "grid";
  updateVersionDisplay('bot', 'Easy');
  initializeBoard();
});

mediumDifficulty.addEventListener("click", () => {
  botDifficulty = "medium";
  difficultySection.style.display = "none";
  gameBoard.style.display = "grid";
  updateVersionDisplay('bot', 'Medium');
  initializeBoard();
});

hardDifficulty.addEventListener("click", () => {
  botDifficulty = "hard";
  difficultySection.style.display = "none";
  gameBoard.style.display = "grid";
  updateVersionDisplay('bot', 'Hard');
  initializeBoard();
});

