/* ── FF Chess v2 — game.js ── */
/* Full chess engine: board state, move validation, check/checkmate, UI */

// ─── State ───────────────────────────────────────────────────────────────────
let board = [];           // 8x8 array of {type, color} or null
let turn = 'white';
let selected = null;      // {r, c}
let validMoves = [];      // [{r, c, special}]
let history = [];         // stack of board snapshots
let lastMove = null;      // {from, to}
let enPassantTarget = null; // {r, c} square where ep capture lands
let castlingRights = { white: { K: true, Q: true }, black: { K: true, Q: true } };
let gameOver = false;
let currentTheme = 'ff';

// ─── Board Init ──────────────────────────────────────────────────────────────
const INIT_BACK = ['R','N','B','Q','K','B','N','R'];

function newGame() {
  board = Array.from({length:8}, () => Array(8).fill(null));
  // Black back rank (row 0)
  INIT_BACK.forEach((t, c) => board[0][c] = {type: t, color: 'black'});
  // Black pawns (row 1)
  for (let c = 0; c < 8; c++) board[1][c] = {type:'P', color:'black'};
  // White pawns (row 6)
  for (let c = 0; c < 8; c++) board[6][c] = {type:'P', color:'white'};
  // White back rank (row 7)
  INIT_BACK.forEach((t, c) => board[7][c] = {type: t, color: 'white'});

  turn = 'white';
  selected = null;
  validMoves = [];
  history = [];
  lastMove = null;
  enPassantTarget = null;
  castlingRights = { white: { K: true, Q: true }, black: { K: true, Q: true } };
  gameOver = false;

  renderBoard();
  updateStatus();
  document.getElementById('moveLog').textContent = '';
}

// ─── Render Board ─────────────────────────────────────────────────────────────
function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  const validSet = new Set(validMoves.map(m => m.r*8 + m.c));
  const captureSet = new Set(validMoves.filter(m => {
    const target = board[m.r][m.c];
    return target || m.special === 'ep';
  }).map(m => m.r*8 + m.c));

  const whiteKingPos = findKing('white');
  const blackKingPos = findKing('black');
  const whiteInCheck = whiteKingPos && isInCheck('white');
  const blackInCheck = blackKingPos && isInCheck('black');

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      sq.className = 'sq ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
      sq.dataset.r = r;
      sq.dataset.c = c;

      // Highlights
      if (lastMove) {
        if ((r === lastMove.from.r && c === lastMove.from.c) ||
            (r === lastMove.to.r   && c === lastMove.to.c))
          sq.classList.add('last-move');
      }
      if (selected && r === selected.r && c === selected.c)
        sq.classList.add('selected');
      if (validSet.has(r*8+c)) {
        sq.classList.add(captureSet.has(r*8+c) ? 'valid-capture' : 'valid-move');
      }
      if ((whiteInCheck && whiteKingPos.r===r && whiteKingPos.c===c) ||
          (blackInCheck && blackKingPos.r===r && blackKingPos.c===c))
        sq.classList.add('in-check');

      // Piece
      const piece = board[r][c];
      if (piece) {
        sq.appendChild(renderPieceEl(piece.type, piece.color, currentTheme));
      }

      sq.addEventListener('click', () => handleClick(r, c));
      boardEl.appendChild(sq);
    }
  }

  buildLegend(currentTheme, document.getElementById('legend'));
  setupCoords();
  setupTrees();
}

// ─── Click Handler ────────────────────────────────────────────────────────────
function handleClick(r, c) {
  if (gameOver) return;

  const piece = board[r][c];

  // If a move target is clicked
  if (selected) {
    const move = validMoves.find(m => m.r === r && m.c === c);
    if (move) {
      executeMove(selected.r, selected.c, r, c, move.special);
      return;
    }
  }

  // Select own piece
  if (piece && piece.color === turn) {
    selected = {r, c};
    validMoves = getLegalMoves(r, c);
    renderBoard();
    return;
  }

  // Deselect
  selected = null;
  validMoves = [];
  renderBoard();
}

// ─── Execute Move ─────────────────────────────────────────────────────────────
function executeMove(fr, fc, tr, tc, special) {
  // Save history
  history.push({
    board: JSON.parse(JSON.stringify(board)),
    turn, enPassantTarget: enPassantTarget ? {...enPassantTarget} : null,
    castlingRights: JSON.parse(JSON.stringify(castlingRights)),
    lastMove: lastMove ? JSON.parse(JSON.stringify(lastMove)) : null,
  });

  const piece = board[fr][fc];
  const newEP = null;

  // En passant capture
  if (special === 'ep') {
    const dir = piece.color === 'white' ? 1 : -1;
    board[tr + dir][tc] = null;
  }

  // Castling
  if (special === 'castle-K') {
    board[fr][7] = null;
    board[fr][5] = {type:'R', color: piece.color};
  }
  if (special === 'castle-Q') {
    board[fr][0] = null;
    board[fr][3] = {type:'R', color: piece.color};
  }

  // Double pawn push — set en passant target
  let newEnPassant = null;
  if (piece.type === 'P' && Math.abs(tr - fr) === 2) {
    newEnPassant = { r: (fr + tr) / 2, c: fc };
  }

  // Move piece
  board[tr][tc] = piece;
  board[fr][fc] = null;
  enPassantTarget = newEnPassant;

  // Update castling rights
  if (piece.type === 'K') {
    castlingRights[piece.color].K = false;
    castlingRights[piece.color].Q = false;
  }
  if (piece.type === 'R') {
    if (fc === 7) castlingRights[piece.color].K = false;
    if (fc === 0) castlingRights[piece.color].Q = false;
  }

  lastMove = { from:{r:fr,c:fc}, to:{r:tr,c:tc} };
  selected = null;
  validMoves = [];

  // Pawn promotion
  if (piece.type === 'P' && (tr === 0 || tr === 7)) {
    showPromoModal(tr, tc, piece.color);
    return;
  }

  finishTurn(fr, fc, tr, tc, piece);
}

function finishTurn(fr, fc, tr, tc, piece) {
  turn = turn === 'white' ? 'black' : 'white';

  const moveStr = `${piece.color[0].toUpperCase()} ${piece.type}${String.fromCharCode(97+fc)}${8-fr}→${String.fromCharCode(97+tc)}${8-tr}`;
  const log = document.getElementById('moveLog');
  log.textContent = (log.textContent ? log.textContent + '  ' : '') + moveStr;

  renderBoard();
  updateStatus();
}

// ─── Promotion Modal ──────────────────────────────────────────────────────────
let _promoCallback = null;

function showPromoModal(r, c, color) {
  const modal = document.getElementById('promoModal');
  const container = document.getElementById('promoPieces');
  container.innerHTML = '';
  modal.classList.add('show');

  ['Q','R','B','N'].forEach(type => {
    const btn = document.createElement('div');
    btn.className = 'promo-piece';
    btn.appendChild(renderPieceEl(type, color, currentTheme));
    btn.addEventListener('click', () => {
      board[r][c] = {type, color};
      modal.classList.remove('show');
      turn = turn === 'white' ? 'black' : 'white';
      renderBoard();
      updateStatus();
    });
    container.appendChild(btn);
  });
}

// ─── Status ───────────────────────────────────────────────────────────────────
function updateStatus() {
  const bar = document.getElementById('statusBar');
  const theme = THEMES[currentTheme];
  const wLabel = theme.label.white;
  const bLabel = theme.label.black;

  if (isCheckmate(turn)) {
    const winner = turn === 'white' ? bLabel : wLabel;
    bar.textContent = `♚ CHECKMATE — ${winner} Menang!`;
    bar.className = 'status-bar checkmate';
    gameOver = true;
    return;
  }
  if (isStalemate(turn)) {
    bar.textContent = '🤝 Stalemate — Seri!';
    bar.className = 'status-bar checkmate';
    gameOver = true;
    return;
  }

  const label = turn === 'white' ? wLabel : bLabel;
  const inCheck = isInCheck(turn);
  if (inCheck) {
    bar.textContent = `⚠ CHECK! Giliran ${label}`;
    bar.className = 'status-bar check';
  } else {
    bar.textContent = `Giliran ${label} (${turn === 'white' ? 'Putih' : 'Hitam'})`;
    bar.className = 'status-bar';
  }
}

// ─── Undo ─────────────────────────────────────────────────────────────────────
function undoMove() {
  if (!history.length) return;
  const prev = history.pop();
  board = prev.board;
  turn = prev.turn;
  enPassantTarget = prev.enPassantTarget;
  castlingRights = prev.castlingRights;
  lastMove = prev.lastMove;
  gameOver = false;
  selected = null;
  validMoves = [];
  renderBoard();
  updateStatus();
}

// ─── Theme ────────────────────────────────────────────────────────────────────
function setTheme(t) {
  currentTheme = t;
  document.getElementById('btnFF').classList.toggle('active', t === 'ff');
  document.getElementById('btnMonster').classList.toggle('active', t === 'monster');
  renderBoard();
  updateStatus();
}

// ─── Chess Logic ──────────────────────────────────────────────────────────────
function findKing(color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.type === 'K' && board[r][c]?.color === color)
        return {r, c};
  return null;
}

function isSquareAttacked(r, c, byColor) {
  for (let fr = 0; fr < 8; fr++)
    for (let fc = 0; fc < 8; fc++) {
      const p = board[fr][fc];
      if (!p || p.color !== byColor) continue;
      if (getRawMoves(fr, fc, p).some(m => m.r === r && m.c === c))
        return true;
    }
  return false;
}

function isInCheck(color) {
  const king = findKing(color);
  if (!king) return false;
  const opp = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(king.r, king.c, opp);
}

function getRawMoves(r, c, piece) {
  const moves = [];
  const {type, color} = piece;
  const opp = color === 'white' ? 'black' : 'white';

  const push = (tr, tc, special) => {
    if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
      moves.push({r: tr, c: tc, special});
    }
  };

  const slide = (dr, dc) => {
    let tr = r+dr, tc = c+dc;
    while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
      if (board[tr][tc]) {
        if (board[tr][tc].color === opp) push(tr, tc);
        break;
      }
      push(tr, tc);
      tr += dr; tc += dc;
    }
  };

  if (type === 'P') {
    const dir = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    // forward
    if (!board[r+dir]?.[c]) {
      push(r+dir, c);
      if (r === startRow && !board[r+2*dir]?.[c]) push(r+2*dir, c);
    }
    // captures
    [-1,1].forEach(dc => {
      if (board[r+dir]?.[c+dc]?.color === opp) push(r+dir, c+dc);
      // en passant (raw — for attack detection, treat EP square as attackable)
      if (enPassantTarget?.r === r+dir && enPassantTarget?.c === c+dc)
        push(r+dir, c+dc, 'ep');
    });
  }

  if (type === 'N') {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc]) => {
      const tr = r+dr, tc = c+dc;
      if (tr>=0&&tr<8&&tc>=0&&tc<8 && board[tr][tc]?.color !== color) push(tr, tc);
    });
  }

  if (type === 'B' || type === 'Q') {
    [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc]) => slide(dr,dc));
  }

  if (type === 'R' || type === 'Q') {
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => slide(dr,dc));
  }

  if (type === 'K') {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc]) => {
      const tr=r+dr, tc=c+dc;
      if (tr>=0&&tr<8&&tc>=0&&tc<8 && board[tr][tc]?.color !== color) push(tr, tc);
    });
  }

  return moves;
}

function getLegalMoves(r, c) {
  const piece = board[r][c];
  if (!piece) return [];
  const raw = getRawMoves(r, c, piece);
  const legal = [];

  // Add castling for king
  if (piece.type === 'K') {
    const color = piece.color;
    const opp = color === 'white' ? 'black' : 'white';
    const row = color === 'white' ? 7 : 0;
    if (!isInCheck(color)) {
      // Kingside
      if (castlingRights[color].K &&
          !board[row][5] && !board[row][6] &&
          !isSquareAttacked(row, 5, opp) && !isSquareAttacked(row, 6, opp))
        raw.push({r: row, c: 6, special: 'castle-K'});
      // Queenside
      if (castlingRights[color].Q &&
          !board[row][3] && !board[row][2] && !board[row][1] &&
          !isSquareAttacked(row, 3, opp) && !isSquareAttacked(row, 2, opp))
        raw.push({r: row, c: 2, special: 'castle-Q'});
    }
  }

  raw.forEach(move => {
    // Filter out capturing own pieces
    const target = board[move.r][move.c];
    if (target?.color === piece.color) return;

    // Simulate
    const saved = board[move.r][move.c];
    const savedEP = board[r][c];
    let epCaptured = null, epPos = null;

    board[move.r][move.c] = piece;
    board[r][c] = null;

    if (move.special === 'ep') {
      const dir = piece.color === 'white' ? 1 : -1;
      epPos = {r: move.r+dir, c: move.c};
      epCaptured = board[epPos.r][epPos.c];
      board[epPos.r][epPos.c] = null;
    }

    if (!isInCheck(piece.color)) legal.push(move);

    // Restore
    board[r][c] = savedEP;
    board[move.r][move.c] = saved;
    if (epPos) board[epPos.r][epPos.c] = epCaptured;
  });

  return legal;
}

function isCheckmate(color) {
  if (!isInCheck(color)) return false;
  return !hasAnyLegal(color);
}

function isStalemate(color) {
  if (isInCheck(color)) return false;
  return !hasAnyLegal(color);
}

function hasAnyLegal(color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p?.color === color && getLegalMoves(r, c).length > 0) return true;
    }
  return false;
}

// ─── Decorative Trees ─────────────────────────────────────────────────────────
function setupTrees() {
  // Three variants for visual variety
  const treeVariants = [
    (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 28" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,2 2,14 22,14" fill="#2a7a2a" stroke="#164a16" stroke-width="0.8"/>
      <polygon points="12,8 3,20 21,20" fill="#369936" stroke="#164a16" stroke-width="0.8"/>
      <polygon points="12,13 4,24 20,24" fill="#3aaa3a" stroke="#164a16" stroke-width="0.8"/>
      <rect x="10.5" y="23" width="3" height="5" fill="#7a3e10"/>
    </svg>`,
    (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 28" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,1 4,13 20,13" fill="#1e6b1e" stroke="#0f3a0f" stroke-width="0.8"/>
      <polygon points="12,7 3,19 21,19" fill="#2d8a2d" stroke="#0f3a0f" stroke-width="0.8"/>
      <polygon points="12,13 4,25 20,25" fill="#349934" stroke="#0f3a0f" stroke-width="0.8"/>
      <rect x="11" y="24" width="2.5" height="4" fill="#8B4513"/>
      <circle cx="12" cy="1" r="1.5" fill="#f5d87a" opacity="0.6"/>
    </svg>`,
    (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 28" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,3 3,15 21,15" fill="#338833" stroke="#1a4a1a" stroke-width="0.8"/>
      <polygon points="12,9 2,22 22,22" fill="#44aa44" stroke="#1a4a1a" stroke-width="0.8"/>
      <rect x="10.5" y="21" width="3" height="6" fill="#6b3510"/>
    </svg>`,
  ];

  ['treesTop','treesBottom'].forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = Array.from({length:10}, (_, i) => treeVariants[i % 3](22)).join('');
  });
  ['treesLeft','treesRight'].forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = Array.from({length:10}, (_, i) => treeVariants[i % 3](22)).join('');
  });
}

// ─── Coordinates ──────────────────────────────────────────────────────────────
function setupCoords() {
  const files = document.getElementById('coordsFile');
  const ranks = document.getElementById('coordsRank');
  files.innerHTML = '';
  ranks.innerHTML = '';
  'abcdefgh'.split('').forEach(f => {
    const d = document.createElement('div');
    d.className = 'coord';
    d.textContent = f;
    files.appendChild(d);
  });
  for (let i = 8; i >= 1; i--) {
    const d = document.createElement('div');
    d.className = 'coord';
    d.textContent = i;
    ranks.appendChild(d);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
newGame();
