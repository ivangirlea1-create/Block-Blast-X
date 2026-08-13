// ==========================================
// BLOCK BLAST X
// ==========================================


// ===============================
// SAVE
// ===============================

let save = JSON.parse(
  localStorage.getItem("blockBlastX") || "{}"
);

let coins = save.coins || 0;
let bestScore = save.bestScore || 0;

let powers = {
  bomb: save.bomb || 0,
  line: save.line || 0,
  undo: save.undo || 0
};


// ===============================
// GAME
// ===============================

const SIZE = 8;

let board = [];

let score = 0;

let combo = 0;

let selectedPiece = null;

let pieces = [];

let lastBoard = null;

let gameRunning = false;

let powerMode = null;


// ===============================
// COLORS
// ===============================

const colors = [
  "#42a5ff",
  "#ff4d6d",
  "#ffd23f",
  "#55d68a",
  "#b66cff",
  "#ff8b38"
];


// ===============================
// SHAPES
// ===============================

const shapes = [

  [[1]],

  [[1,1]],

  [[1,1,1]],

  [[1,1,1,1]],

  [[1],[1]],

  [[1],[1],[1]],

  [[1],[1],[1],[1]],

  [
    [1,1],
    [1,1]
  ],

  [
    [1,1,1],
    [0,1,0]
  ],

  [
    [1,1,0],
    [0,1,1]
  ],

  [
    [0,1,1],
    [1,1,0]
  ],

  [
    [1,0],
    [1,1]
  ],

  [
    [0,1],
    [1,1]
  ],

  [
    [1,1,1],
    [1,0,0]
  ],

  [
    [1,1,1],
    [0,0,1]
  ],

  [
    [1,1,1],
    [0,1,0],
    [0,1,0]
  ],

  [
    [1,0,0],
    [1,1,1]
  ]

];


// ===============================
// DOM
// ===============================

const menu =
  document.getElementById("menu");

const game =
  document.getElementById("game");

const shop =
  document.getElementById("shop");

const gameOver =
  document.getElementById("gameOver");

const pauseScreen =
  document.getElementById("pauseScreen");

const boardElement =
  document.getElementById("board");

const piecesElement =
  document.getElementById("pieces");


// ===============================
// SAVE
// ===============================

function saveGame() {

  localStorage.setItem(
    "blockBlastX",
    JSON.stringify({
      coins,
      bestScore,
      bomb: powers.bomb,
      line: powers.line,
      undo: powers.undo
    })
  );

}


// ===============================
// MENU
// ===============================

function updateMenu() {

  document.getElementById(
    "menuCoins"
  ).textContent = coins;

  document.getElementById(
    "menuBest"
  ).textContent = bestScore;

}


function showMenu() {

  gameRunning = false;

  menu.classList.remove("hidden");

  game.classList.add("hidden");

  shop.classList.add("hidden");

  gameOver.classList.add("hidden");

  pauseScreen.classList.add("hidden");

  updateMenu();

}


// ===============================
// PLAY
// ===============================

document.getElementById(
  "playBtn"
).onclick = startGame;


function startGame() {

  menu.classList.add("hidden");

  shop.classList.add("hidden");

  gameOver.classList.add("hidden");

  pauseScreen.classList.add("hidden");

  game.classList.remove("hidden");

  score = 0;

  combo = 0;

  powerMode = null;

  gameRunning = true;

  createBoard();

  createPieces();

  updateHUD();

}


// ===============================
// BOARD
// ===============================

function createBoard() {

  board = [];

  for (let y = 0; y < SIZE; y++) {

    board[y] = [];

    for (let x = 0; x < SIZE; x++) {

      board[y][x] = null;

    }

  }

  renderBoard();

}


function renderBoard(preview = null) {

  boardElement.innerHTML = "";

  for (let y = 0; y < SIZE; y++) {

    for (let x = 0; x < SIZE; x++) {

      const cell =
        document.createElement("div");

      cell.className = "cell";

      const value =
        board[y][x];

      if (value !== null) {

        cell.classList.add("filled");

        cell.style.background =
          colors[value];

      }


      if (
        preview &&
        preview.x === x &&
        preview.y === y
      ) {

        cell.classList.add("preview");

      }


      cell.dataset.x = x;

      cell.dataset.y = y;


      cell.addEventListener(
        "click",
        function () {

          if (powerMode) {

            usePower(
              x,
              y
            );

            return;

          }

          if (
            selectedPiece !== null
          ) {

            placePiece(
              selectedPiece,
              x,
              y
            );

          }

        }
      );


      boardElement.appendChild(cell);

    }

  }

}


// ===============================
// PIECES
// ===============================

function createPieces() {

  pieces = [];

  for (let i = 0; i < 3; i++) {

    const shape =
      shapes[
        Math.floor(
          Math.random() *
          shapes.length
        )
      ];

    pieces.push({

      shape: shape,

      color:
        Math.floor(
          Math.random() *
          colors.length
        )

    });

  }

  renderPieces();

}


function renderPieces() {

  piecesElement.innerHTML = "";

  pieces.forEach(
    function (piece, index) {

      const element =
        document.createElement("div");

      element.className = "piece";


      if (
        selectedPiece === index
      ) {

        element.classList.add(
          "selected"
        );

      }


      const mini =
        document.createElement("div");

      mini.className =
        "miniPiece";


      mini.style.gridTemplateColumns =
        `repeat(${piece.shape[0].length}, 17px)`;


      piece.shape.forEach(
        function (row) {

          row.forEach(
            function (block) {

              const blockElement =
                document.createElement("div");

              blockElement.className =
                "miniBlock";


              if (block) {

                blockElement.style.background =
                  colors[piece.color];

              } else {

                blockElement.style.visibility =
                  "hidden";

              }

              mini.appendChild(
                blockElement
              );

            }
          );

        }
      );


      element.appendChild(mini);


      element.addEventListener(
        "click",
        function () {

          if (powerMode) {

            powerMode = null;

            updatePowerButtons();

          }

          selectedPiece = index;

          renderPieces();

        }
      );


      piecesElement.appendChild(
        element
      );

    }
  );

}


// ===============================
// CHECK PLACE
// ===============================

function canPlace(
  piece,
  startX,
  startY
) {

  const shape =
    piece.shape;

  for (
    let y = 0;
    y < shape.length;
    y++
  ) {

    for (
      let x = 0;
      x < shape[y].length;
      x++
    ) {

      if (!shape[y][x]) {
        continue;
      }

      const bx =
        startX + x;

      const by =
        startY + y;


      if (
        bx < 0 ||
        bx >= SIZE ||
        by < 0 ||
        by >= SIZE
      ) {

        return false;

      }


      if (
        board[by][bx] !== null
      ) {

        return false;

      }

    }

  }

  return true;

}


// ===============================
// PLACE
// ===============================

function placePiece(
  pieceIndex,
  x,
  y
) {

  const piece =
    pieces[pieceIndex];


  if (!piece) {
    return;
  }


  if (
    !canPlace(
      piece,
      x,
      y
    )
  ) {

    shakeBoard();

    return;

  }


  // SAVE BOARD FOR UNDO

  lastBoard =
    board.map(
      row => [...row]
    );


  const shape =
    piece.shape;


  for (
    let py = 0;
    py < shape.length;
    py++
  ) {

    for (
      let px = 0;
      px < shape[py].length;
      px++
    ) {

      if (
        shape[py][px]
      ) {

        board[y + py][x + px] =
          piece.color;

      }

    }

  }


  score +=
    countBlocks(piece) * 10;


  selectedPiece = null;


  renderBoard();

  checkLines();


  pieces.splice(
    pieceIndex,
    1
  );


  if (
    pieces.length === 0
  ) {

    createPieces();

  } else {

    renderPieces();

  }


  updateHUD();


  setTimeout(
    checkGameOver,
    150
  );

}


// ===============================
// COUNT BLOCKS
// ===============================

function countBlocks(piece) {

  let count = 0;

  piece.shape.forEach(
    row =>
      row.forEach(
        block => {
          if (block) count++;
        }
      )
  );

  return count;

}


// ===============================
// LINES
// ===============================

function checkLines() {

  let rows = [];

  let cols = [];


  for (let y = 0; y < SIZE; y++) {

    if (
      board[y].every(
        cell => cell !== null
      )
    ) {

      rows.push(y);

    }

  }


  for (let x = 0; x < SIZE; x++) {

    let full = true;

    for (let y = 0; y < SIZE; y++) {

      if (
        board[y][x] === null
      ) {

        full = false;

        break;

      }

    }

    if (full) {
      cols.push(x);
    }

  }


  const lines =
    rows.length +
    cols.length;


  if (lines === 0) {

    combo = 0;

    updateCombo();

    return;

  }


  combo++;


  const bonus =
    lines *
    100 *
    combo;


  score += bonus;

  coins +=
    lines * 10 +
    combo * 5;


  // CLEAR ROWS

  rows.forEach(
    y => {

      for (let x = 0; x < SIZE; x++) {

        board[y][x] = null;

      }

    }
  );


  // CLEAR COLUMNS

  cols.forEach(
    x => {

      for (let y = 0; y < SIZE; y++) {

        board[y][x] = null;

      }

    }
  );


  renderBoard();

  updateCombo();

  updateHUD();

  saveGame();

}


// ===============================
// COMBO
// ===============================

function updateCombo() {

  const comboElement =
    document.getElementById("combo");

  document.getElementById(
    "comboNumber"
  ).textContent = combo;


  if (combo > 0) {

    comboElement.classList.add(
      "show"
    );

  } else {

    comboElement.classList.remove(
      "show"
    );

  }

}


// ===============================
// GAME OVER CHECK
// ===============================

function checkGameOver() {

  if (!gameRunning) {
    return;
  }


  for (
    let i = 0;
    i < pieces.length;
    i++
  ) {

    const piece =
      pieces[i];


    for (
      let y = 0;
      y < SIZE;
      y++
    ) {

      for (
        let x = 0;
        x < SIZE;
        x++
      ) {

        if (
          canPlace(
            piece,
            x,
            y
          )
        ) {

          return;

        }

      }

    }

  }


  endGame();

}


// ===============================
// GAME OVER
// ===============================

function endGame() {

  gameRunning = false;

  if (
    score > bestScore
  ) {

    bestScore = score;

  }


  const earned =
    Math.max(
      10,
      Math.floor(score / 100)
    );


  coins += earned;

  saveGame();


  document.getElementById(
    "finalScore"
  ).textContent = score;

  document.getElementById(
    "earnedCoins"
  ).textContent = earned;


  game.classList.add(
    "hidden"
  );

  gameOver.classList.remove(
    "hidden"
  );

}


// ===============================
// PAUSE
// ===============================

document.getElementById(
  "pauseBtn"
).onclick = function () {

  pauseScreen.classList.remove(
    "hidden"
  );

};


document.getElementById(
  "resumeBtn"
).onclick = function () {

  pauseScreen.classList.add(
    "hidden"
  );

};


document.getElementById(
  "pauseMenuBtn"
).onclick = showMenu;


document.getElementById(
  "retryBtn"
).onclick = startGame;


document.getElementById(
  "gameOverMenuBtn"
).onclick = showMenu;


// ===============================
// SHOP
// ===============================

document.getElementById(
  "shopMenuBtn"
).onclick = function () {

  menu.classList.add(
    "hidden"
  );

  shop.classList.remove(
    "hidden"
  );

  updateShop();

};


document.getElementById(
  "backMenuBtn"
).onclick =
showMenu;


function updateShop() {

  document.getElementById(
    "shopCoins"
  ).textContent = coins;

}


document.querySelectorAll(
  ".buyBtn"
).forEach(
  function (button) {

    button.onclick = function () {

      const item =
        button.dataset.item;


      const prices = {

        bomb: 100,

        line: 150,

        undo: 200

      };


      const price =
        prices[item];


      if (
        coins < price
      ) {

        button.textContent =
          "❌ НЕ ХВАТАЕТ";

        setTimeout(
          function () {

            button.textContent =
              "🪙 " + price;

          },
          1000
        );

        return;

      }


      coins -= price;

      powers[item]++;

      saveGame();

      updateShop();

      updatePowerButtons();

    };

  }
);


// ===============================
// POWERS
// ===============================

document.getElementById(
  "bombBtn"
).onclick = function () {

  if (
    powers.bomb <= 0
  ) {

    openShopMessage();

    return;

  }


  powerMode =
    powerMode === "bomb"
      ? null
      : "bomb";

  updatePowerButtons();

};


document.getElementById(
  "lineBtn"
).onclick = function () {

  if (
    powers.line <= 0
  ) {

    openShopMessage();

    return;

  }


  powerMode =
    powerMode === "line"
      ? null
      : "line";

  updatePowerButtons();

};


document.getElementById(
  "undoBtn"
).onclick = function () {

  if (
    powers.undo <= 0 ||
    !lastBoard
  ) {

    return;

  }


  board =
    lastBoard.map(
      row => [...row]
    );


  powers.undo--;

  lastBoard = null;

  renderBoard();

  updatePowerButtons();

  saveGame();

};


function updatePowerButtons() {

  document.getElementById(
    "bombCount"
  ).textContent =
    powers.bomb;

  document.getElementById(
    "lineCount"
  ).textContent =
    powers.line;

  document.getElementById(
    "undoCount"
  ).textContent =
    powers.undo;

}


// ===============================
// POWER USE
// ===============================

function usePower(
  x,
  y
) {

  if (
    powerMode === "bomb"
  ) {

    useBomb(x, y);

  }

  else if (
    powerMode === "line"
  ) {

    useLine(y);

  }

}


// ===============================
// BOMB
// ===============================

function useBomb(x, y) {

  if (
    powers.bomb <= 0
  ) {
    return;
  }


  for (
    let dy = -1;
    dy <= 1;
    dy++
  ) {

    for (
      let dx = -1;
      dx <= 1;
      dx++
    ) {

      const bx =
        x + dx;

      const by =
        y + dy;


      if (
        bx >= 0 &&
        bx < SIZE &&
        by >= 0 &&
        by < SIZE
      ) {

        board[by][bx] = null;

      }

    }

  }


  powers.bomb--;

  score += 50;

  coins += 5;

  powerMode = null;

  renderBoard();

  updateHUD();

  updatePowerButtons();

  saveGame();

}


// ===============================
// LINE
// ===============================

function useLine(y) {

  if (
    powers.line <= 0
  ) {
    return;
  }


  for (
    let x = 0;
    x < SIZE;
    x++
  ) {

    board[y][x] = null;

  }


  powers.line--;

  score += 100;

  coins += 10;

  powerMode = null;

  renderBoard();

  updateHUD();

  updatePowerButtons();

  saveGame();

}


// ===============================
// SHOP MESSAGE
// ===============================

function openShopMessage() {

  alert(
    "У тебя закончилась эта способность! Купи её в магазине."
  );

}


// ===============================
// HUD
// ===============================

function updateHUD() {

  document.getElementById(
    "score"
  ).textContent = score;

  document.getElementById(
    "best"
  ).textContent = bestScore;

  document.getElementById(
    "coins"
  ).textContent = coins;

  updatePowerButtons();

}


// ===============================
// BOARD SHAKE
// ===============================

function shakeBoard() {

  boardElement.animate(
    [
      {
        transform:
          "translateX(0)"
      },

      {
        transform:
          "translateX(-5px)"
      },

      {
        transform:
          "translateX(5px)"
      },

      {
        transform:
          "translateX(0)"
      }

    ],
    {
      duration: 180
    }
  );

}


// ===============================
// START
// ===============================

updateMenu();

updatePowerButtons();
