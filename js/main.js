/*----- constants -----*/
const BLACK_PLAYER = -1;
const WHITE_PLAYER = 1;

/*----- state variables -----*/
let currentPlayer = 1;
let posNewPosition = [];
let capturedPosition = [];
let coordinates;

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
    console.log('these are the coordinates', coordinates)
    console.log(p)
    enableToCapture(p, coordinates);
  } else {
    if (posNewPosition.length > 0) {
      console.log('hello')
      enableToMove(p);
    }
  }

  if (currentPlayer === board[row][column]) {
    player = reverse(currentPlayer);
    let captured = findPieceCaptured(p, player)
    console.log(captured)
    if (captured.length === 0) {
      console.log('no captured')
      findPossibleNewPosition(p, player);
    } else if (captured.length > 0) {
      coordinates = findPieceCaptured(p, player);
      console.log(coordinates)
      // enableToCapture(coordinates)
      findPossibleNewPosition(p, player)
      findCapturedPossibleMove(p, player, coordinates)
    }
  }
}

function enableToCapture(p, coordinates) {
  let old = coordinates.find(c => c.capturedColumn === p.column + 1 || c.capturedColumn === p.column - 1)
  console.log(old)
  console.log('ppppp', p)
  console.log(capturedPosition)

  if (board[p.row][p.column] === 0) {
    board[p.row][p.column] = currentPlayer;
  }
  board[old.capturedRow][old.capturedColumn] = 0;
  if (readyToMove !== null) {
    board[readyToMove.row][readyToMove.column] = 0;
  }

  readyToMove = null;
  capturedPosition = [];
  posNewPosition = [];
  coordinates = null;
  displayCurrentPlayer();
  buildBoard();
  checkForWin(); // Check for a win after every move

}

function enableToMove(p) {
  let find = false;
  let newPosition = null;
  console.log(posNewPosition)
  // check if the case where the player play the selected piece can move on
  posNewPosition.forEach((element) => {
    if (element.compare(p)) {
      find = true;
      newPosition = element;
      return;
    }
  });
  console.log(find)
  if (find) moveThePiece(newPosition);
  else buildBoard();
}

function moveThePiece(newPosition) {
  console.log(newPosition)
  console.log('ready', readyToMove)
  board[newPosition.row][newPosition.column] = currentPlayer;
  board[readyToMove.row][readyToMove.column] = 0;

  // init value
  readyToMove = null;
  posNewPosition = [];
  capturedPosition = [];
  coordinates = null;

  currentPlayer = reverse(currentPlayer);

  displayCurrentPlayer();
  buildBoard();
}

function findCapturedPossibleMove(p, player, coordinates) {

  coordinates.forEach(c => markPossiblePosition(p, player, c.column, c.row, true))
  readyToMove = p;

}

function findPossibleNewPosition(piece, player) {
  if (board[piece.row + player][piece.column + 1] === 0) {
    console.log('1', board[piece.row + player][piece.column + 1])
    readyToMove = piece;
    markPossiblePosition(piece, player, 1);
  }
  if (board[piece.row + player][piece.column - 1] === 0) {
    console.log('2', board[piece.row + player][piece.column + 1])
    readyToMove = piece;
    markPossiblePosition(piece, player, -1);
  }


}

function markPossiblePosition(p, player = 0, column = 0, row = 0, capture) {

  if (capture) {
    attribute = `${row}-${column}`
    position = document.querySelector("[data-position='" + attribute + "']");
    if (position) {
      position.style.background = "blue";
      // // save where it can move
      capturedPosition.push(new Piece(p.row + player, p.column + column));
    }
  } else {
    attribute = parseInt(p.row + player + row) + "-" + parseInt(p.column + column);
    position = document.querySelector("[data-position='" + attribute + "']");
    if (position) {
      position.style.background = "blue";
      // // save where it can move
      posNewPosition.push(new Piece(p.row + player, p.column + column));
    }
  }


  console.log(position)
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
  let found = [];
  if (p.row >= 2 && p.column >= 2) {
    if (
      board[p.row - 1][p.column - 1] === player &&
      board[p.row - 2][p.column - 2] === 0
    ) {
      found.push({ row: p.row - 2, column: (p.column - 2) }, { capturedRow: p.row - 1, capturedColumn: p.column - 1 });
    }
    if (
      p.column + 2 < board[p.row - 1].length &&
      board[p.row - 1][p.column + 1] === player &&
      board[p.row - 2][p.column + 2] === 0
    ) {
      found.push({ row: p.row - 2, column: p.column + 2 }, { capturedRow: p.row - 1, capturedColumn: p.column + 1 });
    }
    if (
      p.row + 2 < board.length &&
      board[p.row + 1][p.column - 1] === player &&
      board[p.row + 2][p.column - 2] === 0
    ) {
      found.push({ row: p.row + 2, column: p.column - 2 }, { capturedRow: p.row + 1, capturedColumn: p.column - 1 });
    }
    if (
      p.row + 2 < board.length &&
      p.column + 2 < board[p.row + 1].length &&
      board[p.row + 1][p.column + 1] === player &&
      board[p.row + 2][p.column + 2] === 0
    ) {
      found.push({ row: p.row + 2, column: p.column + 2 }, { capturedRow: p.row + 1, capturedColumn: p.column + 1 });
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
