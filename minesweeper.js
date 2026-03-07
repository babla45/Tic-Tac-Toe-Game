(() => {
  // DOM elements
  const difficultyMenu = document.getElementById("difficultyMenu");
  const gameInfo = document.getElementById("gameInfo");
  const mineGrid = document.getElementById("mineGrid");
  const mineCountEl = document.getElementById("mineCount");
  const timerEl = document.getElementById("timer");
  const resetBtn = document.getElementById("resetBtn");
  const homeButton = document.getElementById("homeButton");
  const resultPopup = document.getElementById("resultPopup");
  const popupIcon = document.getElementById("popupIcon");
  const popupMessage = document.getElementById("popupMessage");
  const popupTime = document.getElementById("popupTime");
  const popupCloseButton = document.getElementById("popupCloseButton");

  // Game config
  const CONFIGS = {
    beginner:     { rows: 9,  cols: 9,  mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert:       { rows: 16, cols: 30, mines: 99 },
  };

  let config = null;
  let grid = [];       // 2D array of cell data
  let gameOver = false;
  let firstClick = true;
  let flagCount = 0;
  let revealedCount = 0;
  let timerInterval = null;
  let seconds = 0;

  // ===== Timer =====
  const startTimer = () => {
    seconds = 0;
    timerEl.textContent = "000";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      seconds++;
      timerEl.textContent = String(seconds).padStart(3, "0");
    }, 1000);
  };

  const stopTimer = () => clearInterval(timerInterval);

  // ===== Grid generation =====
  const createGrid = () => {
    grid = [];
    for (let r = 0; r < config.rows; r++) {
      const row = [];
      for (let c = 0; c < config.cols; c++) {
        row.push({ mine: false, revealed: false, flagged: false, adjacent: 0 });
      }
      grid.push(row);
    }
  };

  const placeMines = (safeR, safeC) => {
    let placed = 0;
    while (placed < config.mines) {
      const r = Math.floor(Math.random() * config.rows);
      const c = Math.floor(Math.random() * config.cols);
      // Don't place on the clicked cell or its neighbors
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      if (grid[r][c].mine) continue;
      grid[r][c].mine = true;
      placed++;
    }
    // Calculate adjacent counts
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (grid[r][c].mine) continue;
        let count = 0;
        forEachNeighbor(r, c, (nr, nc) => { if (grid[nr][nc].mine) count++; });
        grid[r][c].adjacent = count;
      }
    }
  };

  const forEachNeighbor = (r, c, callback) => {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
          callback(nr, nc);
        }
      }
    }
  };

  // ===== Rendering =====
  const renderGrid = () => {
    mineGrid.innerHTML = "";
    mineGrid.style.gridTemplateColumns = `repeat(${config.cols}, 32px)`;

    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        const btn = document.createElement("button");
        btn.className = "mine-cell hidden";
        btn.dataset.row = r;
        btn.dataset.col = c;

        btn.addEventListener("click", () => handleClick(r, c));
        btn.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          handleRightClick(r, c);
        });

        mineGrid.appendChild(btn);
      }
    }
  };

  const getCellEl = (r, c) => mineGrid.querySelector(`[data-row="${r}"][data-col="${c}"]`);

  const updateCellDisplay = (r, c) => {
    const cell = grid[r][c];
    const el = getCellEl(r, c);
    if (!el) return;

    el.className = "mine-cell";

    if (cell.revealed) {
      el.classList.add("revealed");
      if (cell.mine) {
        el.textContent = "💣";
        el.classList.add("mine-shown");
      } else if (cell.adjacent > 0) {
        el.textContent = cell.adjacent;
        el.classList.add(`n${cell.adjacent}`);
      } else {
        el.textContent = "";
      }
    } else if (cell.flagged) {
      el.classList.add("hidden", "flagged");
      el.textContent = "🚩";
    } else {
      el.classList.add("hidden");
      el.textContent = "";
    }
  };

  // ===== Game logic =====
  const handleClick = (r, c) => {
    if (gameOver) return;
    const cell = grid[r][c];
    if (cell.flagged || cell.revealed) return;

    if (firstClick) {
      firstClick = false;
      placeMines(r, c);
      startTimer();
    }

    if (cell.mine) {
      gameOver = true;
      stopTimer();
      cell.revealed = true;
      revealAllMines();
      const el = getCellEl(r, c);
      el.classList.add("mine-exploded");
      resetBtn.textContent = "😵";
      showResult(false);
      return;
    }

    revealCell(r, c);
    checkWin();
  };

  const handleRightClick = (r, c) => {
    if (gameOver) return;
    const cell = grid[r][c];
    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    flagCount += cell.flagged ? 1 : -1;
    mineCountEl.textContent = config.mines - flagCount;
    updateCellDisplay(r, c);
  };

  const revealCell = (r, c) => {
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged || cell.mine) return;

    cell.revealed = true;
    revealedCount++;
    updateCellDisplay(r, c);

    if (cell.adjacent === 0) {
      forEachNeighbor(r, c, (nr, nc) => revealCell(nr, nc));
    }
  };

  const revealAllMines = () => {
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (grid[r][c].mine) {
          grid[r][c].revealed = true;
          updateCellDisplay(r, c);
        }
      }
    }
  };

  const checkWin = () => {
    const totalSafe = config.rows * config.cols - config.mines;
    if (revealedCount === totalSafe) {
      gameOver = true;
      stopTimer();
      resetBtn.textContent = "😎";
      showResult(true);
    }
  };

  const showResult = (won) => {
    popupIcon.textContent = won ? "🏆" : "💥";
    popupMessage.textContent = won ? "You Win!" : "Game Over!";
    popupTime.textContent = `Time: ${seconds} seconds`;
    resultPopup.style.display = "flex";
    const diff = Object.keys(CONFIGS).find(k => CONFIGS[k] === config);
    sendTelegramNotification(`Minesweeper (${diff}): ${won ? 'Win' : 'Loss'} in ${seconds}s`);
  };

  // ===== Start / Reset =====
  const startGame = (difficulty) => {
    config = CONFIGS[difficulty];
    gameOver = false;
    firstClick = true;
    flagCount = 0;
    revealedCount = 0;
    seconds = 0;
    clearInterval(timerInterval);

    mineCountEl.textContent = config.mines;
    timerEl.textContent = "000";
    resetBtn.textContent = "🙂";

    difficultyMenu.style.display = "none";
    gameInfo.style.display = "flex";
    mineGrid.style.display = "inline-grid";
    homeButton.style.display = "inline-flex";

    createGrid();
    renderGrid();
  };

  const goHome = () => {
    gameOver = true;
    stopTimer();
    difficultyMenu.style.display = "flex";
    gameInfo.style.display = "none";
    mineGrid.style.display = "none";
    homeButton.style.display = "none";
  };

  // ===== Event listeners =====
  document.getElementById("beginnerBtn").addEventListener("click", () => startGame("beginner"));
  document.getElementById("intermediateBtn").addEventListener("click", () => startGame("intermediate"));
  document.getElementById("expertBtn").addEventListener("click", () => startGame("expert"));

  resetBtn.addEventListener("click", () => {
    if (config) {
      const diff = Object.keys(CONFIGS).find(k => CONFIGS[k] === config);
      startGame(diff);
    }
  });

  homeButton.addEventListener("click", goHome);

  popupCloseButton.addEventListener("click", () => {
    resultPopup.style.display = "none";
    goHome();
  });
})();
