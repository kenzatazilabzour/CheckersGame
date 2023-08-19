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
    // Move the piece
    toCell.appendChild(fromCell.querySelector('.piece'));

    // Clear the fromCell
    fromCell.innerHTML = '';

    // Implement crown logic for kinged pieces if needed
    checkKingPiece(toCell);
  }
}

function isValidMove(fromCell, toCell) {
  // Implement your move validation logic here
  // Check if the move is valid according to the rules
  // Return true if valid, false otherwise
  return true;
}

function checkKingPiece(cell) {
  // Implement crowning logic here if a piece becomes a king
}

/*----- cached elements  -----*/

/*----- event listeners -----*/
document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('board');

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
  piece.className = 'piece';
  piece.style.backgroundColor = type === PIECE_TYPES.DARK ? PLAYER_COLORS.DARK : PLAYER_COLORS.LIGHT;
  return piece;
}

// Additional features...
// Implement more advanced move validation logic as per the rules of checkers

// Implement capturing and multi-jump logic if needed

// Add event listeners for additional game features
