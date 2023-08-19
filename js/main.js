/*----- constants -----*/
const PLAYER_COLORS = {
  DARK: '#000',
  LIGHT: '#fff'
};

const PIECE_TYPES = {
  DARK: 'dark',
  LIGHT: 'light'
};

const cells = [];
let selectedCell = null;

/*----- cached elements -----*/
const board = document.getElementById('board');
const gameOverModal = document.getElementById('gameOverModal');
const modalMessage = document.getElementById('modalMessage');
const closeModalButton = document.getElementById('closeModal');

/*----- event listeners -----*/
document.addEventListener('DOMContentLoaded', () => {
  // Create the board and initialize cells array
  for (let row = 0; row < 8; row++) {
    cells[row] = [];
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.className = `cell ${row % 2 === col % 2 ? 'dark' : 'light'}`;
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleCellClick);
      cells[row][col] = cell;
      board.appendChild(cell);
    }
  }

  // Add initial pieces
  addInitialPieces(cells);
});

function addInitialPieces(cells) {
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

  darkPieces.forEach(coords => {
    const [row, col] = coords;
    const piece = createPiece(PIECE_TYPES.DARK);
    cells[row][col].appendChild(piece);
  });

  lightPieces.forEach(coords => {
    const [row, col] = coords;
    const piece = createPiece(PIECE_TYPES.LIGHT);
    cells[row][col].appendChild(piece);
  });
}

function createPiece(type) {
  const piece = document.createElement('div');
  piece.className = `piece ${type}`;
  piece.style.backgroundColor = type === PIECE_TYPES.DARK ? PLAYER_COLORS.DARK : PLAYER_COLORS.LIGHT;
  return piece;
}

/*----- functions -----*/
function handleCellClick(event) {
  const cell = event.target;
  if (!selectedCell) {
    if (cell.classList.contains('piece')) {
      selectedCell = cell;
      cell.classList.add('selected');
    }
  } else {
    if (cell.classList.contains('selected')) {
      cell.classList.remove('selected');
      selectedCell = null;
    } else {
      movePiece(selectedCell, cell);
      selectedCell.classList.remove('selected');
      selectedCell = null;
    }
  }
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
  // Check if the move is a diagonal move (one step)
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  if (rowDiff === 1 && colDiff === 1) {
    // Check if the destination cell is empty
    if (!toCell.querySelector('.piece')) {
      return true;
    }
  }
  // Check if the move is a capturing move (two steps)
  if (rowDiff === 2 && colDiff === 2) {
    const opponentRow = (fromRow + toRow) / 2;
    const opponentCol = (fromCol + toCol) / 2;
    const opponentCell = cells[opponentRow][opponentCol];

    if (
      opponentCell &&
      opponentCell.querySelector('.piece') &&
      !toCell.querySelector('.piece') &&
      !fromCell.querySelector('.piece').classList.contains('king')
    ) {
      return true;
    }
  }

  return false;
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

function gameIsOver() {
  const darkPiecesRemaining = document.querySelectorAll('.piece.dark').length;
  const lightPiecesRemaining = document.querySelectorAll('.piece.light').length;

  if (darkPiecesRemaining === 0 || lightPiecesRemaining === 0) {
    return true; // Game is over if one player has no pieces left
  }

  return false;
}

function determineWinner() {
  const darkPiecesRemaining = document.querySelectorAll('.piece.dark').length;
  const lightPiecesRemaining = document.querySelectorAll('.piece.light').length;

  if (darkPiecesRemaining > lightPiecesRemaining) {
    return 'DARK'; // Dark player wins
  } else if (lightPiecesRemaining > darkPiecesRemaining) {
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





// Additional features...

// Implement capturing and multi-jump logic if needed

// Add event listeners for additional game features
