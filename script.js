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
let playerGoesFirst = true;

const turnSelection = document.getElementById("turnSelection");
const playerFirstButton = document.getElementById("playerFirst");
const botFirstButton = document.getElementById("botFirst");

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
  const popupIcon = document.getElementById("popupIcon");
  popupMessage.textContent = message;
  if (message.includes("Draw")) {
    popupIcon.textContent = "\u{1F91D}";
  } else if (message.includes("Bot")) {
    popupIcon.textContent = "\u{1F916}";
  } else {
    popupIcon.textContent = "\u{1F3C6}";
  }
  successPopup.style.display = "flex";
};

// Hide success popup and restart the game
popupCloseButton.addEventListener("click", () => {
  successPopup.style.display = "none";
  initializeBoard();
  if (isPlayingWithBot) {
    turnSelection.style.display = "flex";
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
      let winMessage;
      if (isPlayingWithBot) {
        // In bot mode, player's mark depends on who went first
        const playerMark = playerGoesFirst ? "X" : "O";
        winMessage = currentPlayer === playerMark ? "You Win!" : "Bot Wins!";
      } else {
        winMessage = `Player ${currentPlayer} Wins!`;
      }
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
  const botMark = playerGoesFirst ? "O" : "X";
  const playerMark = playerGoesFirst ? "X" : "O";
  const emptyCells = board
    .map((cell, index) => (cell === "" ? index : null))
    .filter((index) => index !== null);

  const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];

  if (randomIndex !== undefined) {
    board[randomIndex] = botMark;
    const botCell = gameBoard.querySelector(`[data-index='${randomIndex}']`);
    botCell.textContent = botMark;
    botCell.classList.add("taken", botMark === "X" ? "x-mark" : "o-mark");

    if (!checkWinner()) {
      currentPlayer = playerMark;
      updateStatus("Your turn");
    }
  }
};

const mediumBotMove = () => {
  const botMark = playerGoesFirst ? "O" : "X";
  const playerMark = playerGoesFirst ? "X" : "O";
  // Block player win if possible, else random
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] === playerMark && board[b] === playerMark && board[c] === "") {
      board[c] = botMark;
      const botCell = gameBoard.querySelector(`[data-index='${c}']`);
      botCell.textContent = botMark;
      botCell.classList.add("taken", botMark === "X" ? "x-mark" : "o-mark");
      if (!checkWinner()) {
        currentPlayer = playerMark;
        updateStatus("Your turn");
      }
      return;
    }
    if (board[a] === playerMark && board[c] === playerMark && board[b] === "") {
      board[b] = botMark;
      const botCell = gameBoard.querySelector(`[data-index='${b}']`);
      botCell.textContent = botMark;
      botCell.classList.add("taken", botMark === "X" ? "x-mark" : "o-mark");
      if (!checkWinner()) {
        currentPlayer = playerMark;
        updateStatus("Your turn");
      }
      return;
    }
    if (board[b] === playerMark && board[c] === playerMark && board[a] === "") {
      board[a] = botMark;
      const botCell = gameBoard.querySelector(`[data-index='${a}']`);
      botCell.textContent = botMark;
      botCell.classList.add("taken", botMark === "X" ? "x-mark" : "o-mark");
      if (!checkWinner()) {
        currentPlayer = playerMark;
        updateStatus("Your turn");
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
    const botMk = playerGoesFirst ? "O" : "X";
    const playerMk = playerGoesFirst ? "X" : "O";

    if (checkWinForBoard(newBoard, botMk)) {
      return { score: 10 };
    } else if (checkWinForBoard(newBoard, playerMk)) {
      return { score: -10 };
    } else if (!newBoard.includes("")) {
      return { score: 0 };
    }

    const emptyIndices = getEmptyIndices(newBoard);
    const moves = [];

    for (let i = 0; i < emptyIndices.length; i++) {
      const index = emptyIndices[i];
      const move = { index };
      newBoard[index] = player;

      if (player === botMk) {
        move.score = minimax(newBoard, playerMk).score;
      } else {
        move.score = minimax(newBoard, botMk).score;
      }
      newBoard[index] = "";
      moves.push(move);
    }

    let bestMove;
    if (player === botMk) {
      let bestScore = -Infinity;
      const bestMoves = [];
      moves.forEach(m => {
        if (m.score > bestScore) {
          bestScore = m.score;
          bestMoves.length = 0;
          bestMoves.push(m);
        } else if (m.score === bestScore) {
          bestMoves.push(m);
        }
      });
      bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    } else {
      let bestScore = Infinity;
      const bestMoves = [];
      moves.forEach(m => {
        if (m.score < bestScore) {
          bestScore = m.score;
          bestMoves.length = 0;
          bestMoves.push(m);
        } else if (m.score === bestScore) {
          bestMoves.push(m);
        }
      });
      bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    return bestMove;
  }

  // Execute the minimax move
  if (!isGameActive) return;
  const botMark = playerGoesFirst ? "O" : "X";
  const playerMark = playerGoesFirst ? "X" : "O";
  const bestMove = minimax([...board], botMark);
  board[bestMove.index] = botMark;
  const botCell = gameBoard.querySelector(`[data-index='${bestMove.index}']`);
  botCell.textContent = botMark;
  botCell.classList.add("taken", botMark === "X" ? "x-mark" : "o-mark");
  if (!checkWinner()) {
    currentPlayer = playerMark;
    updateStatus("Your turn");
  }
};

const botMove = () => {
  if (!isGameActive) return;
  const botMark = playerGoesFirst ? "O" : "X";
  if (botDifficulty === "easy") easyBotMove();
  else if (botDifficulty === "medium") mediumBotMove();
  else hardBotMove();
};

// Handle cell click
const handleCellClick = (event) => {
  const cellIndex = event.target.getAttribute("data-index");

  if (board[cellIndex] !== "" || !isGameActive) return;

  // In bot mode, only allow clicking on the player's turn
  const playerMark = isPlayingWithBot ? (playerGoesFirst ? "X" : "O") : currentPlayer;
  const botMark = playerGoesFirst ? "O" : "X";

  if (isPlayingWithBot && currentPlayer !== playerMark) return;

  board[cellIndex] = currentPlayer;
  event.target.textContent = currentPlayer;
  event.target.classList.add("taken");
  event.target.classList.add(currentPlayer === "X" ? "x-mark" : "o-mark");

  if (!checkWinner()) {
    if (isPlayingWithBot) {
      currentPlayer = botMark;
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
    modeSelection.style.display = "none";
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
  turnSelection.style.display = "none";
  gameBoard.style.display = "none";
  hideStatus();
  versionDisplay.style.display = "none";
  updateStatus("Player X's turn");
});

// Mode selection
playerVsPlayerButton.addEventListener("click", () => startGame(false));
playerVsBotButton.addEventListener("click", () => startGame(true));

// Difficulty selection -> show turn selection
const selectDifficulty = (difficulty, label) => {
  botDifficulty = difficulty;
  difficultySection.style.display = "none";
  turnSelection.style.display = "flex";
  // Store label for version display later
  turnSelection.dataset.difficultyLabel = label;
};

easyDifficulty.addEventListener("click", () => selectDifficulty("easy", "Easy"));
mediumDifficulty.addEventListener("click", () => selectDifficulty("medium", "Medium"));
hardDifficulty.addEventListener("click", () => selectDifficulty("hard", "Hard"));

// Turn selection
const startBotGame = (playerFirst) => {
  playerGoesFirst = playerFirst;
  turnSelection.style.display = "none";
  gameBoard.style.display = "grid";
  const diffLabel = turnSelection.dataset.difficultyLabel || botDifficulty;
  updateVersionDisplay('bot', diffLabel);
  initializeBoard();

  if (!playerFirst) {
    // Bot goes first as X
    currentPlayer = "X";
    updateStatus("Bot's turn");
    setTimeout(botMove, 500);
  }
};

playerFirstButton.addEventListener("click", () => startBotGame(true));
botFirstButton.addEventListener("click", () => startBotGame(false));

