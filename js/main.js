/*----- constants -----*/
const PLAYER_COLORS = { DARK: '#000', LIGHT: '#fff' };
const PIECE_TYPES = { DARK: 'dark', LIGHT: 'light' };

/*----- cached elements -----*/
const board = document.getElementById('board');
const gameOverModal = document.getElementById('gameOverModal');
const modalMessage = document.getElementById('modalMessage');
const closeModalButton = document.getElementById('closeModal');
const restartButton = document.getElementById('restartButton');

/*----- event listeners -----*/
restartButton.addEventListener('click', resetGame);
document.addEventListener('DOMContentLoaded', initializeGame);

// Initialize game state
const cells = [];
let selectedCell = null;
let darkPlayerScore = 0;
let lightPlayerScore = 0;

  // Create the board and initialize cells array
function createBoard() {
  for (let row = 0; row < 8; row++) {
    cells[row] = [];
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      const cellClass = `cell ${row % 2 === col % 2 ? 'dark' : 'light'}`;
      cell.className = cellClass;
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleCellClick);
      cells[row][col] = cell;
      board.appendChild(cell);
    }
  }
}

function addInitialPieces() {
  const darkPieces = [
    [0, 1], [0, 3], [0, 5], [0, 7],
    [1, 0], [1, 2], [1, 4], [1, 6],
    [2, 1], [2, 3], [2, 5], [2, 7]
  ];

  const lightPieces = [
    [5, 0], [5, 2], [5, 4], [5, 6],
    [6, 1], [6, 3], [6, 5], [6, 7],
    [7, 0], [7, 2], [7, 4], [7, 6]
  ];

  const pieceMapping = { dark: darkPieces, light: lightPieces };
  for (const type in pieceMapping) {
    pieceMapping[type].forEach(coords => {
      const [row, col] = coords;
      const piece = createPiece(type);
      cells[row][col].appendChild(piece);
    });
  }
}

/*----- functions -----*/

function createPiece(type) {
  const piece = document.createElement('div');
  piece.className = `piece ${type}`;
  piece.style.backgroundColor = type === PIECE_TYPES.DARK ? PLAYER_COLORS.DARK : PLAYER_COLORS.LIGHT;
  return piece;
}

function updateScores() {
  document.getElementById('darkScore').textContent = `Dark Player Score: ${darkPlayerScore}`;
  document.getElementById('lightScore').textContent = `Light Player Score: ${lightPlayerScore}`;
}

// Initialize the game when the DOM is loaded
function initializeGame() {
  createBoard();
  addInitialPieces();
}

// Function to handle a cell click event
function handleCellClick(event) {
  const cell = event.target;
  if (!selectedCell) {
    if (cell.classList.contains('piece')) {
      selectCell(cell);
    }
  } else {
    if (cell.classList.contains('selected')) {
      unselectCell(cell);
    } else {
      movePiece(selectedCell, cell);
      unselectCell(selectedCell);
    }
    if (selectedCell) {
      unselectCell(selectedCell);
    }
  }
}

// Reset the game state
function resetGame() {
  clearHighlightedMoves();
  unselectCell(selectedCell);
  clearBoard();
  initializeGame();
  gameOverModal.style.display = 'none';
}

function clearBoard() {
  cells.forEach(row => {
    row.forEach(cell => {
      cell.innerHTML = '';
    });
  });
}

function movePiece(fromCell, toCell) {
  if (isValidMove(fromCell, toCell)) {
    const fromPiece = fromCell.querySelector('.piece');
    toCell.appendChild(fromPiece);

    function shouldCrown(cell, type) {
      const row = parseInt(cell.dataset.row);
      return (type === PIECE_TYPES.DARK && row === 0) ||
        (type === PIECE_TYPES.LIGHT && row === 7);
    }
    const fromType = fromPiece.classList.contains(PIECE_TYPES.DARK) ? PIECE_TYPES.DARK : PIECE_TYPES.LIGHT;
    if (shouldCrown(toCell, fromType)) {
      fromPiece.classList.add('king');
    }

    // Clear the fromCell
    fromCell.innerHTML = '';
    // Check if the moved piece should be crowned as a king
    checkKingPiece(toCell);
    // Check for game over condition and display modal
    if (gameIsOver()) {
      const winner = determineWinner(); // Implement this function to determine the winner
      const message = winner ? `Player ${winner} wins!` : "It's a tie!";
      displayGameOverModal(message);
    }
  }
}

function isValidMove(fromCell, toCell) {
  const fromRow = parseInt(fromCell.dataset.row);
  const fromCol = parseInt(fromCell.dataset.col);
  const toRow = parseInt(toCell.dataset.row);
  const toCol = parseInt(toCell.dataset.col);
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  if (rowDiff === 2 && colDiff === 2) {
    const jumpedCell = cells[(fromRow + toRow) / 2][(fromCol + toCol) / 2];
    const fromPiece = fromCell.querySelector('.piece');
    const opponentPiece = jumpedCell.querySelector('.piece');
    if (!toCell.querySelector('.piece') && opponentPiece && !fromPiece.classList.contains('king')) {
      const nextCaptureMoves = findCaptureMoves(toCell, fromCell);
      if (nextCaptureMoves.length > 0) {
        highlightAvailableMoves(nextCaptureMoves);
        return false;
      } else {
        return true;
      }
    }
  }
  return false;
}

function findCaptureMoves(currentCell, lastCapturedCell) {
  const capturingMoves = [];
  const currentPlayer = currentCell.querySelector('.piece').classList.contains(PIECE_TYPES.DARK) ? PIECE_TYPES.DARK : PIECE_TYPES.LIGHT;
  const opponentPlayer = currentPlayer === PIECE_TYPES.DARK ? PIECE_TYPES.LIGHT : PIECE_TYPES.DARK;

  const directions = [
    { row: -2, col: -2 }, // Up-left jump
    { row: -2, col: 2 },  // Up-right jump
    { row: 2, col: -2 },  // Down-left jump
    { row: 2, col: 2 }    // Down-right jump
  ];

  for (const direction of directions) {
    const jumpedRow = parseInt(currentCell.dataset.row) - direction.row;
    const jumpedCol = parseInt(currentCell.dataset.col) - direction.col;
    const capturedRow = (parseInt(currentCell.dataset.row) + jumpedRow) / 2;
    const capturedCol = (parseInt(currentCell.dataset.col) + jumpedCol) / 2;
    const landedRow = jumpedRow - direction.row;
    const landedCol = jumpedCol - direction.col;

    if (
      isValidCell({ row: jumpedRow, col: jumpedCol }) &&
      isValidCell({ row: capturedRow, col: capturedCol }) &&
      isOpponentPiece({ row: capturedRow, col: capturedCol }, board) &&
      !isEqualCell({ row: capturedRow, col: capturedCol }, lastCapturedCell)
    ) {
      capturingMoves.push({
        from: cells[landedRow][landedCol],
        to: cells[jumpedRow][jumpedCol],
        captured: cells[capturedRow][capturedCol]
      });
    }
  }

  return capturingMoves;
}

  function highlightAvailableMoves(moves) {
    for (const move of moves) {
      const { to } = move;
      const toCell = cells[to.row][to.col];
      toCell.classList.add('available-move');
      toCell.addEventListener('click', handleHighlightedCellClick);
    }
  }

  function handleHighlightedCellClick(event) {
    const cell = event.target;
    const selectedFromCell = selectedCell;
    const selectedToCell = cell;
    movePiece(selectedFromCell, selectedToCell);
    selectedFromCell.classList.remove('selected');
    selectedCell = null;
    clearHighlightedMoves();
  }

  function clearHighlightedMoves() {
    const availableMoveCells = document.querySelectorAll('.available-move');
    for (const cell of availableMoveCells) {
      cell.classList.remove('available-move');
      cell.removeEventListener('click', handleHighlightedCellClick);
    }
  }

  function checkKingPiece(cell) {
    const piece = cell.querySelector('.piece');
    if (piece) {
      if (piece.classList.contains(PIECE_TYPES.DARK)) {
        if (cell.dataset.row === '0') {
          piece.classList.add('king');
        }
      } else if (piece.classList.contains(PIECE_TYPES.LIGHT)) {
        if (cell.dataset.row === '7') {
          piece.classList.add('king');
        }
      }
    }
  }

function crownPiece(playerType) {
  if (playerType === PIECE_TYPES.DARK) {
    darkPlayerScore++;
  } else if (playerType === PIECE_TYPES.LIGHT) {
    lightPlayerScore++;
  }
}

  function gameIsOver() {
    const darkPiecesRemaining = document.querySelectorAll('.piece.dark').length;
    const lightPiecesRemaining = document.querySelectorAll('.piece.light').length;

    if (darkPiecesRemaining === 0 || lightPiecesRemaining === 0) {
      return true; // Game is over if one player has no pieces left
    }

    return false;
  }

function determineWinner() {
  if (darkPlayerScore > lightPlayerScore) {
    return 'DARK'; // Dark player wins
  } else if (lightPlayerScore > darkPlayerScore) {
    return 'LIGHT'; // Light player wins
  } else {
    return null; // It's a tie
  }
}

  // Function to display the game over modal
  function displayGameOverModal(message) {
    modalMessage.textContent = message;
    gameOverModal.style.display = 'block';

    // Close modal when the 'x' button is clicked
    closeModalButton.onclick = function () {
      gameOverModal.style.display = 'none';
    };
  }
