/*----- constants -----*/
const BLACK_PLAYER = -1;
const WHITE_PLAYER = 1;

/*----- state variables -----*/
let currentPlayer = 1;
let posNewPosition = [];
let capturedPosition = [];

/*----- cached elements -----*/
const modal = document.getElementById("easyModal");
const game = document.getElementById("game");

/*----- event listeners -----*/
game.addEventListener("click", movePiece);

/*----- functions -----*/
class Piece {
  constructor(row, column) {
    this.row = row;
    this.column = column;
  }

  compare(piece) {
    return piece.row === this.row && piece.column === this.column;
  }
}

function modalOpen(blackCount) {
    const winnerName = blackCount === 0 ? "White" : "Black";
    const loserName = blackCount !== 0 ? "White" : "Black";

    document.getElementById("winner").innerHTML = winnerName;
    document.getElementById("loser").innerHTML = loserName;
    modal.classList.add("effect");
  }

  const board = [
    [0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
    [-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
    [0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
    [-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  ];

  buildBoard();

  function buildBoard() {
    game.innerHTML = "";
    let black = 0;
    let white = 0;
   for (let i = 0; i < board.length; i++) {
   const element = board[i];
      let row = document.createElement("div");
      row.setAttribute("class", "row");

      for (let j = 0; j < element.length; j++) {
        const elmt = element[j];
        let col = document.createElement("div");
        let piece = document.createElement("div");
        let caseType = "";
        let occupied = "";

        if (i % 2 === 0) {
          if (j % 2 === 0) {
            caseType = "Whitecase";
          } else {
            caseType = "blackCase";
          }
        } else {
          if (j % 2 !== 0) {
            caseType = "Whitecase";
          } else {
            caseType = "blackCase";
          }
        }

        // add the piece if the case isn't empty
        if (board[i][j] === 1) {
          occupied = "whitePiece";
        } else if (board[i][j] === -1) {
          occupied = "blackPiece";
        } else {
          occupied = "empty";
        }

        piece.setAttribute("class", "occupied " + occupied);

        // set row and colum in the case
        piece.setAttribute("row", i);
        piece.setAttribute("column", j);
        piece.setAttribute("data-position", i + "-" + j);

        //add event listener to each piece
        piece.addEventListener("click", movePiece);

        col.appendChild(piece);

        col.setAttribute("class", "column " + caseType);
        row.appendChild(col);

        // counter number of each piece
        if (board[i][j] === -1) {
          black++;
        } else if (board[i][j] === 1) {
          white++;
        }

        //display the number of piece for each player
        displayCounter(black, white);
      }

      game.appendChild(row);
    }
  }

function movePiece(e) {
    let piece = e.target;
    const row = parseInt(piece.getAttribute("row"));
    const column = parseInt(piece.getAttribute("column"));
    let p = new Piece(row, column);
  console.log("Clicked piece row:", row);
  console.log("Clicked piece column:", column);
    if (capturedPosition.length > 0) {
      enableToCapture(p);
    } else {
      if (posNewPosition.length > 0) {
        enableToMove(p);
      }
    }

    if (currentPlayer === board[row][column]) {
      player = reverse(currentPlayer);
      if (!findPieceCaptured(p, player)) {
        findPossibleNewPosition(p, player);
      }
    }
  }

function enableToCapture(p) {
    let find = false;
    let pos = null;
    let old = null;

    capturedPosition.forEach((element) => {
      if (element.newPosition.compare(p)) {
        find = true;
        pos = element.newPosition;
        old = element.pieceCaptured;
        return;
      }
    });

    if (find) {
      board[pos.row][pos.column] = currentPlayer;

      if (readyToMove !== null) {
        board[readyToMove.row][readyToMove.column] = 0;
      }

      if (old !== null) {
        board[old.row][old.column] = 0;
      }

      readyToMove = null;
      capturedPosition = [];
      posNewPosition = [];
      displayCurrentPlayer();
      buildBoard();
      checkForWin(); // Check for a win after every move
    } else {
      buildBoard();
    }
  }

function enableToMove(p) {
  let find = false;
  let newPosition = null;
  // check if the case where the player play the selected piece can move on
  posNewPosition.forEach((element) => {
    if (element.compare(p)) {
      find = true;
      newPosition = element;
      return;
    }
  });

  if (find) moveThePiece(newPosition);
  else buildBoard();
}

function moveThePiece(newPosition) {
  board[newPosition.row][newPosition.column] = currentPlayer;
  board[readyToMove.row][readyToMove.column] = 0;

  // init value
  readyToMove = null;
  posNewPosition = [];
  capturedPosition = [];

  currentPlayer = reverse(currentPlayer);

  displayCurrentPlayer();
  buildBoard();
}

function findPossibleNewPosition(piece, player) {
  function findPossibleNewPosition(piece, player) {
    if (board[piece.row + player][piece.column + 1] === 0) {
      readyToMove = piece;
      markPossiblePosition(piece, player, 1);
    }

    if (board[piece.row + player][piece.column - 1] === 0) {
      readyToMove = piece;
      markPossiblePosition(piece, player, -1);
    }
  }
}

function markPossiblePosition(p, player = 0, direction = 0) {
    attribute = parseInt(p.row + player) + "-" + parseInt(p.column + direction);

    position = document.querySelector("[data-position='" + attribute + "']");
    if (position) {
      position.style.background = "green";
      // // save where it can move
      posNewPosition.push(new Piece(p.row + player, p.column + direction));
    }
  }

function displayCurrentPlayer() {
    var container = document.getElementById("next-player");
    if (container.classList.contains("whitePiece")) {
      container.setAttribute("class", "occupied blackPiece");
    } else {
      container.setAttribute("class", "occupied whitePiece");
    }
  }

function findPieceCaptured(p, player) {
  let found = false;
  if (p.row >= 2 && p.column >= 2) {
    if (
      board[p.row - 1][p.column - 1] === player &&
      board[p.row - 2][p.column - 2] === 0
    ) {
      found = true;
    }
    if (
      p.column + 2 < board[p.row - 1].length &&
      board[p.row - 1][p.column + 1] === player &&
      board[p.row - 2][p.column + 2] === 0
    ) {
      found = true;
    }
    if (
      p.row + 2 < board.length &&
      board[p.row + 1][p.column - 1] === player &&
      board[p.row + 2][p.column - 2] === 0
    ) {
      found = true;
    }
    if (
      p.row + 2 < board.length &&
      p.column + 2 < board[p.row + 1].length &&
      board[p.row + 1][p.column + 1] === player &&
      board[p.row + 2][p.column + 2] === 0
    ) {
      found = true;
    }
  }
  return found;
}

function checkForWin() {
  let blackPieces = 0;
  let whitePieces = 0;

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === -1) {
        blackPieces++;
      } else if (board[i][j] === 1) {
        whitePieces++;
      }
    }
  }
  if (blackPieces === 0) {
    modalOpen(1); // 1 represents white player wins
  } else if (whitePieces === 0) {
    modalOpen(-1); // -1 represents black player wins
  }
}

function displayCounter(black, white) {
  const blackContainer = document.getElementById("black-player-count-pieces");
  const whiteContainer = document.getElementById("white-player-count-pieces");
  blackContainer.innerHTML = black;
  whiteContainer.innerHTML = white;
}

function modalClose() {
   modal.classList.remove("effect");
  }

function reverse(player) {
  return player === BLACK_PLAYER ? WHITE_PLAYER : BLACK_PLAYER;
}

/* Initialize the game */
buildBoard();
