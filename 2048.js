(() => {
  const SIZE = 4;
  const tileContainer = document.getElementById("tileContainer");
  const currentScoreEl = document.getElementById("currentScore");
  const bestScoreEl = document.getElementById("bestScore");
  const newGameBtn = document.getElementById("newGameBtn");
  const gameOverPopup = document.getElementById("gameOverPopup");
  const popupScore = document.getElementById("popupScore");
  const popupRetry = document.getElementById("popupRetry");
  const winPopup = document.getElementById("winPopup");
  const winScore = document.getElementById("winScore");
  const keepPlaying = document.getElementById("keepPlaying");

  let grid, score, bestScore, won, gameOver;

  // ===== Tile sizing =====
  const getGridMetrics = () => {
    const wrapper = document.querySelector(".grid-wrapper");
    const wrapperSize = wrapper.offsetWidth;
    const padding = 8;
    const gap = 8;
    const innerSize = wrapperSize - padding * 2;
    const cellSize = (innerSize - gap * (SIZE - 1)) / SIZE;
    return { cellSize, gap, padding: 0 };
  };

  const getTilePos = (row, col) => {
    const { cellSize, gap } = getGridMetrics();
    return {
      top: row * (cellSize + gap),
      left: col * (cellSize + gap),
      size: cellSize,
    };
  };

  // ===== Init =====
  const init = () => {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    score = 0;
    won = false;
    gameOver = false;
    bestScore = parseInt(localStorage.getItem("best2048") || "0", 10);
    bestScoreEl.textContent = bestScore;
    currentScoreEl.textContent = "0";
    gameOverPopup.style.display = "none";
    winPopup.style.display = "none";
    tileContainer.innerHTML = "";
    addRandomTile();
    addRandomTile();
    renderTiles();
  };

  // ===== Random tile =====
  const getEmptyCells = () => {
    const cells = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (grid[r][c] === 0) cells.push({ r, c });
    return cells;
  };

  const addRandomTile = () => {
    const empty = getEmptyCells();
    if (empty.length === 0) return;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return { r, c };
  };

  // ===== Render =====
  const renderTiles = (newTilePos = null, mergedPositions = []) => {
    tileContainer.innerHTML = "";
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) continue;
        const value = grid[r][c];
        const { top, left, size } = getTilePos(r, c);
        const tile = document.createElement("div");

        let tileClass = value <= 2048 ? `tile-${value}` : "tile-super";
        tile.className = `tile ${tileClass}`;

        if (newTilePos && newTilePos.r === r && newTilePos.c === c) {
          tile.classList.add("new-tile");
        }
        if (mergedPositions.some(p => p.r === r && p.c === c)) {
          tile.classList.add("merged-tile");
        }

        tile.style.top = `${top}px`;
        tile.style.left = `${left}px`;
        tile.style.width = `${size}px`;
        tile.style.height = `${size}px`;
        tile.style.fontSize = value >= 1024 ? "1.3rem" : value >= 128 ? "1.6rem" : "1.9rem";
        tile.textContent = value;

        tileContainer.appendChild(tile);
      }
    }
  };

  // ===== Movement logic =====
  const slide = (row) => {
    let arr = row.filter(v => v !== 0);
    const merged = [];
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += arr[i];
        merged.push(arr[i]);
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(v => v !== 0);
    while (arr.length < SIZE) arr.push(0);
    return { result: arr, merged };
  };

  const getColumn = (c) => grid.map(row => row[c]);
  const setColumn = (c, col) => col.forEach((v, r) => { grid[r][c] = v; });

  const move = (direction) => {
    if (gameOver) return;

    const prevGrid = grid.map(r => [...r]);
    const mergedPositions = [];

    if (direction === "left") {
      for (let r = 0; r < SIZE; r++) {
        const { result } = slide(grid[r]);
        grid[r] = result;
      }
    } else if (direction === "right") {
      for (let r = 0; r < SIZE; r++) {
        const { result } = slide([...grid[r]].reverse());
        grid[r] = result.reverse();
      }
    } else if (direction === "up") {
      for (let c = 0; c < SIZE; c++) {
        const { result } = slide(getColumn(c));
        setColumn(c, result);
      }
    } else if (direction === "down") {
      for (let c = 0; c < SIZE; c++) {
        const { result } = slide(getColumn(c).reverse());
        setColumn(c, result.reverse());
      }
    }

    // Check if anything changed
    let changed = false;
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (grid[r][c] !== prevGrid[r][c]) changed = true;

    if (!changed) return;

    // Find merged positions
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (grid[r][c] !== 0 && grid[r][c] !== prevGrid[r][c] && prevGrid[r][c] !== 0)
          mergedPositions.push({ r, c });

    const newTile = addRandomTile();
    updateScore();
    renderTiles(newTile, mergedPositions);

    // Check win
    if (!won) {
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
          if (grid[r][c] === 2048) {
            won = true;
            winScore.textContent = score;
            winPopup.style.display = "flex";
            sendTelegramNotification(`2048: Player reached 2048! Score: ${score}`);
          }
    }

    // Check game over
    if (getEmptyCells().length === 0 && !canMove()) {
      gameOver = true;
      popupScore.textContent = score;
      sendTelegramNotification(`2048: Game Over! Final score: ${score}`);
      setTimeout(() => { gameOverPopup.style.display = "flex"; }, 300);
    }
  };

  const canMove = () => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) return true;
        if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
        if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
      }
    }
    return false;
  };

  const updateScore = () => {
    currentScoreEl.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      localStorage.setItem("best2048", String(bestScore));
    }
  };

  // ===== Input handling =====
  document.addEventListener("keydown", (e) => {
    const keyMap = {
      ArrowLeft: "left", ArrowRight: "right",
      ArrowUp: "up", ArrowDown: "down",
    };
    if (keyMap[e.key]) {
      e.preventDefault();
      move(keyMap[e.key]);
    }
  });

  // Touch / Swipe
  let touchStartX = 0, touchStartY = 0;
  document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absDx = Math.abs(dx), absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 30) return;

    if (absDx > absDy) {
      move(dx > 0 ? "right" : "left");
    } else {
      move(dy > 0 ? "down" : "up");
    }
  }, { passive: true });

  // ===== Buttons =====
  newGameBtn.addEventListener("click", init);
  popupRetry.addEventListener("click", () => { gameOverPopup.style.display = "none"; init(); });
  keepPlaying.addEventListener("click", () => { winPopup.style.display = "none"; });

  // ===== Handle resize =====
  window.addEventListener("resize", () => renderTiles());

  // ===== Start =====
  init();
})();
