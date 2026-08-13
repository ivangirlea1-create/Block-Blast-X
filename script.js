// ==========================================
// BLOCK BLAST X
// Полное управление пальцем
// ==========================================

const SIZE = 8;

const colors = [
  "#36a5ff",
  "#ff4770",
  "#ffd23f",
  "#55d98a",
  "#b66cff",
  "#ff8a38"
];

const shapes = [

  [[1]],

  [[1,1]],

  [[1,1,1]],

  [[1,1,1,1]],

  [[1],[1]],

  [[1],[1],[1]],

  [[1],[1],[1],[1]],

  [[1,1],[1,1]],

  [[1,1,1],
   [0,1,0]],

  [[1,1,0],
   [0,1,1]],

  [[0,1,1],
   [1,1,0]],

  [[1,0],
   [1,1]],

  [[0,1],
   [1,1]],

  [[1,1,1],
   [1,0,0]],

  [[1,1,1],
   [0,0,1]],

  [[1,0,0],
   [1,1,1]],

  [[1,1,1],
   [0,1,0],
   [0,1,0]]

];


// ==========================================
// SAVE
// ==========================================

let saved =
  JSON.parse(
    localStorage.getItem(
      "BlockBlastXSave"
    ) || "{}"
  );

let coins =
  saved.coins || 0;

let best =
  saved.best || 0;

let powers = {

  bomb:
    saved.bomb || 0,

  line:
    saved.line || 0,

  undo:
    saved.undo || 0

};


// ==========================================
// GAME VARIABLES
// ==========================================

let board = [];

let pieces = [];

let score = 0;

let combo = 0;

let selected = null;

let dragging = false;

let dragElement = null;

let dragPieceIndex = null;

let previewX = -1;

let previewY = -1;

let lastBoard = null;

let gameActive = false;

let paused = false;

let powerMode = null;


// ==========================================
// ELEMENTS
// ==========================================

const menu =
  document.getElementById("menu");

const game =
  document.getElementById("game");

const shop =
  document.getElementById("shop");

const gameOver =
  document.getElementById("gameOver");

const pause =
  document.getElementById("pause");

const boardElement =
  document.getElementById("board");

const piecesElement =
  document.getElementById("pieces");


// ==========================================
// SAVE
// ==========================================

function saveGame() {

  localStorage.setItem(
    "BlockBlastXSave",

    JSON.stringify({

      coins: coins,

      best: best,

      bomb: powers.bomb,

      line: powers.line,

      undo: powers.undo

    })
  );

}


// ==========================================
// MENU
// ==========================================

function updateMenu() {

  document.getElementById(
    "menuCoins"
  ).textContent = coins;

  document.getElementById(
    "menuBest"
  ).textContent = best;

}


function showMenu() {

  gameActive = false;

  menu.classList.remove(
    "hidden"
  );

  game.classList.add(
    "hidden"
  );

  shop.classList.add(
    "hidden"
  );

  gameOver.classList.add(
    "hidden"
  );

  pause.classList.add(
    "hidden"
  );

  updateMenu();

}


// ==========================================
// START GAME
// ==========================================

document.getElementById(
  "playBtn"
).onclick = startGame;


function startGame() {

  menu.classList.add(
    "hidden"
  );

  shop.classList.add(
    "hidden"
  );

  gameOver.classList.add(
    "hidden"
  );

  pause.classList.add(
    "hidden"
  );

  game.classList.remove(
    "hidden"
  );

  score = 0;

  combo = 0;

  selected = null;

  dragging = false;

  powerMode = null;

  gameActive = true;

  paused = false;

  lastBoard = null;

  createBoard();

  createPieces();

  updateHUD();

}


// ==========================================
// BOARD
// ==========================================

function createBoard() {

  board = [];

  for (
    let y = 0;
    y < SIZE;
    y++
  ) {

    board[y] = [];

    for (
      let x = 0;
      x < SIZE;
      x++
    ) {

      board[y][x] = null;

    }

  }

  renderBoard();

}


// ==========================================
// RENDER BOARD
// ==========================================

function renderBoard() {

  boardElement.innerHTML = "";

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

      const cell =
        document.createElement(
          "div"
        );

      cell.className =
        "cell";

      cell.dataset.x = x;

      cell.dataset.y = y;

      if (
        board[y][x] !== null
      ) {

        cell.classList.add(
          "filled"
        );

        cell.style.background =
          colors[
            board[y][x]
          ];

      }

      boardElement.appendChild(
        cell
      );

    }

  }

  showPreview();

}


// ==========================================
// CREATE PIECES
// ==========================================

function createPieces() {

  pieces = [];

  for (
    let i = 0;
    i < 3;
    i++
  ) {

    pieces.push({

      shape:
        shapes[
          Math.floor(
            Math.random() *
            shapes.length
          )
        ],

      color:
        Math.floor(
          Math.random() *
          colors.length
        )

    });

  }

  renderPieces();

}


// ==========================================
// RENDER PIECES
// ==========================================

function renderPieces() {

  piecesElement.innerHTML = "";

  pieces.forEach(
    (piece, index) => {

      const element =
        document.createElement(
          "div"
        );

      element.className =
        "piece";

      element.dataset.index =
        index;

      const mini =
        document.createElement(
          "div"
        );

      mini.className =
        "mini";

      mini.style.gridTemplateColumns =
        `repeat(
          ${piece.shape[0].length},
          17px
        )`;


      piece.shape.forEach(
        row => {

          row.forEach(
            block => {

              const b =
                document.createElement(
                  "div"
                );

              b.className =
                "miniBlock";

              if (block) {

                b.style.background =
                  colors[
                    piece.color
                  ];

              } else {

                b.style.visibility =
                  "hidden";

              }

              mini.appendChild(b);

            }
          );

        }
      );


      element.appendChild(mini);

      element.addEventListener(
        "pointerdown",
        startDrag
      );

      piecesElement.appendChild(
        element
      );

    }
  );

}


// ==========================================
// START DRAG
// ==========================================

function startDrag(event) {

  if (
    !gameActive ||
    paused ||
    powerMode
  ) {
    return;
  }

  const element =
    event.currentTarget;

  dragPieceIndex =
    Number(
      element.dataset.index
    );

  const piece =
    pieces[
      dragPieceIndex
    ];

  if (!piece) return;

  dragging = true;

  selected =
    dragPieceIndex;

  element.setPointerCapture(
    event.pointerId
  );

  element.classList.add(
    "selected"
  );

  createDragPiece(
    piece
  );

  moveDrag(event);

  event.preventDefault();

}


// ==========================================
// DRAG VISUAL
// ==========================================

function createDragPiece(
  piece
) {

  removeDragPiece();

  dragElement =
    document.createElement(
      "div"
    );

  dragElement.className =
    "dragPiece";

  const blockSize = 30;

  const gap = 3;

  const width =
    piece.shape[0].length;

  const height =
    piece.shape.length;


  dragElement.style.width =
    (
      width * blockSize +
      (width - 1) * gap
    ) + "px";


  dragElement.style.height =
    (
      height * blockSize +
      (height - 1) * gap
    ) + "px";


  piece.shape.forEach(
    (row, y) => {

      row.forEach(
        (block, x) => {

          if (!block) return;

          const b =
            document.createElement(
              "div"
            );

          b.className =
            "dragBlock";

          b.style.background =
            colors[
              piece.color
            ];

          b.style.left =
            x *
            (blockSize + gap)
            + "px";

          b.style.top =
            y *
            (blockSize + gap)
            + "px";

          dragElement.appendChild(
            b
          );

        }
      );

    }
  );

  document.body.appendChild(
    dragElement
  );

}


// ==========================================
// MOVE DRAG
// ==========================================

function moveDrag(event) {

  if (
    !dragging ||
    !dragElement
  ) {
    return;
  }


  const x =
    event.clientX;

  const y =
    event.clientY;


  dragElement.style.left =
    x + "px";

  dragElement.style.top =
    (y - 70) + "px";


  const cell =
    getCellFromScreen(
      x,
      y - 45
    );


  if (!cell) {

    previewX = -1;

    previewY = -1;

    clearPreview();

    return;

  }


  const piece =
    pieces[
      dragPieceIndex
    ];

  if (!piece) return;


  const width =
    piece.shape[0].length;

  const height =
    piece.shape.length;


  // Центр фигуры под пальцем
  let px =
    cell.x -
    Math.floor(
      width / 2
    );

  let py =
    cell.y -
    Math.floor(
      height / 2
    );


  // ======================================
  // ⭐ ГЛАВНОЕ ИСПРАВЛЕНИЕ
  // Прижимаем фигуру к краям
  // ======================================

  px =
    Math.max(
      0,
      Math.min(
        px,
        SIZE - width
      )
    );


  py =
    Math.max(
      0,
      Math.min(
        py,
        SIZE - height
      )
    );


  previewX = px;

  previewY = py;

  showPreview();

}


// ==========================================
// POINTER MOVE
// ==========================================

document.addEventListener(
  "pointermove",

  function(event) {

    if (!dragging) return;

    moveDrag(event);

    event.preventDefault();

  },

  {
    passive: false
  }
);


// ==========================================
// POINTER UP
// ==========================================

document.addEventListener(
  "pointerup",

  function() {

    if (!dragging) return;

    finishDrag();

  }
);


// ==========================================
// FINISH DRAG
// ==========================================

function finishDrag() {

  dragging = false;

  removeDragPiece();


  if (
    dragPieceIndex === null
  ) {

    clearPreview();

    return;

  }


  const piece =
    pieces[
      dragPieceIndex
    ];


  if (
    piece &&
    previewX >= 0 &&
    previewY >= 0 &&
    canPlace(
      piece,
      previewX,
      previewY
    )
  ) {

    putPiece(
      dragPieceIndex,
      previewX,
      previewY
    );

  } else {

    clearPreview();

    renderBoard();

    renderPieces();

  }


  selected = null;

  dragPieceIndex = null;

  clearPreview();

}


// ==========================================
// SCREEN TO CELL
// ==========================================

function getCellFromScreen(
  screenX,
  screenY
) {

  const rect =
    boardElement.getBoundingClientRect();


  if (
    screenX < rect.left ||
    screenX > rect.right ||
    screenY < rect.top ||
    screenY > rect.bottom
  ) {

    return null;

  }


  const cellWidth =
    rect.width / SIZE;

  const cellHeight =
    rect.height / SIZE;


  const x =
    Math.floor(
      (
        screenX -
        rect.left
      ) /
      cellWidth
    );


  const y =
    Math.floor(
      (
        screenY -
        rect.top
      ) /
      cellHeight
    );


  if (
    x < 0 ||
    x >= SIZE ||
    y < 0 ||
    y >= SIZE
  ) {

    return null;

  }


  return {
    x: x,
    y: y
  };

}


// ==========================================
// SHOW PREVIEW
// ==========================================

function showPreview() {

  // ⭐ Всегда сначала убираем старый цвет

  document
    .querySelectorAll(".cell")
    .forEach(
      cell => {

        cell.classList.remove(
          "preview"
        );

        cell.classList.remove(
          "invalid"
        );

      }
    );


  if (
    !dragging ||
    dragPieceIndex === null ||
    previewX < 0 ||
    previewY < 0
  ) {

    return;

  }


  const piece =
    pieces[
      dragPieceIndex
    ];

  if (!piece) return;


  const possible =
    canPlace(
      piece,
      previewX,
      previewY
    );


  for (
    let py = 0;
    py < piece.shape.length;
    py++
  ) {

    for (
      let px = 0;
      px < piece.shape[py].length;
      px++
    ) {

      if (
        !piece.shape[py][px]
      ) {
        continue;
      }


      const x =
        previewX + px;

      const y =
        previewY + py;


      if (
        x >= 0 &&
        x < SIZE &&
        y >= 0 &&
        y < SIZE
      ) {

        const index =
          y * SIZE + x;

        const cell =
          boardElement
            .children[index];


        if (cell) {

          if (possible) {

            cell.classList.add(
              "preview"
            );

          } else {

            cell.classList.add(
              "invalid"
            );

          }

        }

      }

    }

  }

}


// ==========================================
// CLEAR PREVIEW
// ==========================================

function clearPreview() {

  document
    .querySelectorAll(".cell")
    .forEach(
      cell => {

        cell.classList.remove(
          "preview"
        );

        cell.classList.remove(
          "invalid"
        );

      }
    );

  previewX = -1;

  previewY = -1;

}


// ==========================================
// REMOVE DRAG
// ==========================================

function removeDragPiece() {

  if (dragElement) {

    dragElement.remove();

    dragElement = null;

  }

}


// ==========================================
// CAN PLACE
// ==========================================

function canPlace(
  piece,
  startX,
  startY
) {

  for (
    let y = 0;
    y < piece.shape.length;
    y++
  ) {

    for (
      let x = 0;
      x < piece.shape[y].length;
      x++
    ) {

      if (
        !piece.shape[y][x]
      ) {
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


// ==========================================
// PUT PIECE
// ==========================================

function putPiece(
  index,
  x,
  y
) {

  const piece =
    pieces[index];

  if (!piece) return;


  // Сохраняем состояние
  lastBoard =
    board.map(
      row => [...row]
    );


  let blocks = 0;


  piece.shape.forEach(
    (row, py) => {

      row.forEach(
        (value, px) => {

          if (!value) return;

          board[y + py][x + px] =
            piece.color;

          blocks++;

        }
      );

    }
  );


  score +=
    blocks * 10;


  pieces.splice(
    index,
    1
  );


  clearPreview();

  renderBoard();

  checkLines();


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
    100
  );

}


// ==========================================
// CHECK LINES
// ==========================================

function checkLines() {

  const rows = [];

  const cols = [];


  for (
    let y = 0;
    y < SIZE;
    y++
  ) {

    if (
      board[y].every(
        cell =>
          cell !== null
      )
    ) {

      rows.push(y);

    }

  }


  for (
    let x = 0;
    x < SIZE;
    x++
  ) {

    let full = true;


    for (
      let y = 0;
      y < SIZE;
      y++
    ) {

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


  const count =
    rows.length +
    cols.length;


  if (count === 0) {

    combo = 0;

    updateCombo();

    return;

  }


  combo++;


  score +=
    count *
    100 *
    combo;


  coins +=
    count * 10 +
    combo * 5;


  rows.forEach(
    y => {

      for (
        let x = 0;
        x < SIZE;
        x++
      ) {

        board[y][x] = null;

      }

    }
  );


  cols.forEach(
    x => {

      for (
        let y = 0;
        y < SIZE;
        y++
      ) {

        board[y][x] = null;

      }

    }
  );


  renderBoard();

  updateCombo();

  updateHUD();

  saveGame();

}


// ==========================================
// COMBO
// ==========================================

function updateCombo() {

  const element =
    document.getElementById(
      "combo"
    );


  document.getElementById(
    "comboNumber"
  ).textContent = combo;


  if (combo > 0) {

    element.classList.add(
      "show"
    );

  } else {

    element.classList.remove(
      "show"
    );

  }

}


// ==========================================
// GAME OVER
// ==========================================

function checkGameOver() {

  if (!gameActive) return;


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


function endGame() {

  gameActive = false;


  if (
    score > best
  ) {

    best = score;

  }


  const earned =
    Math.max(
      10,
      Math.floor(
        score / 100
      )
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


// ==========================================
// HUD
// ==========================================

function updateHUD() {

  document.getElementById(
    "score"
  ).textContent = score;

  document.getElementById(
    "best"
  ).textContent = best;

  document.getElementById(
    "coins"
  ).textContent = coins;

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


// ==========================================
// PAUSE
// ==========================================

document.getElementById(
  "pauseBtn"
).onclick = function() {

  if (!gameActive) return;

  paused = true;

  pause.classList.remove(
    "hidden"
  );

};


document.getElementById(
  "resumeBtn"
).onclick = function() {

  paused = false;

  pause.classList.add(
    "hidden"
  );

};


document.getElementById(
  "pauseMenuBtn"
).onclick =
  showMenu;


document.getElementById(
  "retryBtn"
).onclick =
  startGame;


document.getElementById(
  "overMenuBtn"
).onclick =
  showMenu;


// ==========================================
// SHOP
// ==========================================

document.getElementById(
  "shopBtn"
).onclick = function() {

  menu.classList.add(
    "hidden"
  );

  shop.classList.remove(
    "hidden"
  );

  updateShop();

};


document.getElementById(
  "backBtn"
).onclick =
  showMenu;


function updateShop() {

  document.getElementById(
    "shopCoins"
  ).textContent = coins;

}


const prices = {

  bomb: 100,

  line: 150,

  undo: 200

};


document
  .querySelectorAll(".buy")
  .forEach(
    button => {

      button.onclick =
        function() {

          const item =
            button.dataset.item;

          const price =
            prices[item];


          if (
            coins < price
          ) {

            button.textContent =
              "❌ НЕТ МОНЕТ";

            setTimeout(
              () => {

                button.textContent =
                  "🪙 " + price;

              },
              900
            );

            return;

          }


          coins -= price;

          powers[item]++;

          saveGame();

          updateShop();

          updateHUD();

        };

    }
  );


// ==========================================
// BOMB
// ==========================================

document.getElementById(
  "bombBtn"
).onclick = function() {

  if (
    powers.bomb <= 0
  ) {

    alert(
      "💣 У тебя нет бомб. Купи их в магазине!"
    );

    return;

  }


  powerMode =
    powerMode === "bomb"
      ? null
      : "bomb";

};


// ==========================================
// LINE
// ==========================================

document.getElementById(
  "lineBtn"
).onclick = function() {

  if (
    powers.line <= 0
  ) {

    alert(
      "⚡ У тебя нет молний. Купи их в магазине!"
    );

    return;

  }


  powerMode =
    powerMode === "line"
      ? null
      : "line";

};


// ==========================================
// POWER CLICK
// ==========================================

boardElement.addEventListener(
  "click",

  function(event) {

    if (!powerMode) return;


    const cell =
      event.target.closest(
        ".cell"
      );


    if (!cell) return;


    const x =
      Number(
        cell.dataset.x
      );

    const y =
      Number(
        cell.dataset.y
      );


    if (
      powerMode === "bomb"
    ) {

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

            board[by][bx] =
              null;

          }

        }

      }


      powers.bomb--;

      score += 50;

    }


    if (
      powerMode === "line"
    ) {

      for (
        let i = 0;
        i < SIZE;
        i++
      ) {

        board[y][i] =
          null;

      }


      powers.line--;

      score += 100;

    }


    coins += 5;

    powerMode = null;

    renderBoard();

    updateHUD();

    saveGame();

  }
);


// ==========================================
// UNDO
// ==========================================

document.getElementById(
  "undoBtn"
).onclick = function() {

  if (!lastBoard) {

    return;

  }


  if (
    powers.undo <= 0
  ) {

    alert(
      "↩️ У тебя нет отмен. Купи её в магазине!"
    );

    return;

  }


  board =
    lastBoard.map(
      row => [...row]
    );


  powers.undo--;

  lastBoard = null;

  renderBoard();

  updateHUD();

  saveGame();

};


// ==========================================
// START
// ==========================================

updateMenu();

updateHUD();
