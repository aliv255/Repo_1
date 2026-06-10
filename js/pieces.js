/* ── FF Chess v2 — pieces.js ── */
/* SVG piece renderers + FF photo data + theme config */

// ─── FF Character Photo Paths ───────────────────────────────────────────────
const FF_IMGS = {
  // FF7 (White / Player 1)
  cloud:   'imgs/cloud.png',
  tifa:    'imgs/tifa.png',
  aerith:  'imgs/aerith.png',
  barret:  'imgs/barret.png',
  redxiii: 'imgs/redxiii.png',
  // FF8 (Black / Player 2)
  squall:  'imgs/squall.png',
  rinoa:   'imgs/rinoa.jpg',
  quistis: 'imgs/quistis.png',
  zell:    'imgs/zell.jpg',
  irvine:  'imgs/irvine.jpg',
};

// ─── Theme Configuration ─────────────────────────────────────────────────────
const THEMES = {
  ff: {
    white: {
      K: { name:'Cloud',   img: FF_IMGS.cloud,   badge:'K' },
      Q: { name:'Tifa',    img: FF_IMGS.tifa,    badge:'Q' },
      B: { name:'Aerith',  img: FF_IMGS.aerith,  badge:'B' },
      R: { name:'Barret',  img: FF_IMGS.barret,  badge:'R' },
      N: { name:'Red XIII',img: FF_IMGS.redxiii, badge:'N' },
      P: { name:'SOLDIER', img: null,            badge:'P' },
    },
    black: {
      K: { name:'Squall',  img: FF_IMGS.squall,  badge:'K' },
      Q: { name:'Rinoa',   img: FF_IMGS.rinoa,   badge:'Q' },
      B: { name:'Quistis', img: FF_IMGS.quistis, badge:'B' },
      R: { name:'Zell',    img: FF_IMGS.zell,    badge:'R' },
      N: { name:'Irvine',  img: FF_IMGS.irvine,  badge:'N' },
      P: { name:'SeeD',    img: null,            badge:'P' },
    },
    label: { white: 'FF7 (Cloud)', black: 'FF8 (Squall)' },
  },
  monster: {
    white: {
      K: { name:'Bahamut',   img: null, badge:'K' },
      Q: { name:'Shiva',     img: null, badge:'Q' },
      B: { name:'Ifrit',     img: null, badge:'B' },
      R: { name:'Iron Giant',img: null, badge:'R' },
      N: { name:'Chocobo',   img: null, badge:'N' },
      P: { name:'Moogle',    img: null, badge:'P' },
    },
    black: {
      K: { name:'Neo Bahamut',img: null, badge:'K' },
      Q: { name:'Ultimecia', img: null, badge:'Q' },
      B: { name:'Diablos',   img: null, badge:'B' },
      R: { name:'Golem',     img: null, badge:'R' },
      N: { name:'Behemoth',  img: null, badge:'N' },
      P: { name:'Dark Moogle',img: null, badge:'P' },
    },
    label: { white: 'Light (Bahamut)', black: 'Dark (Neo Bahamut)' },
  },
};

// ─── SVG Piece Builders ───────────────────────────────────────────────────────
function svgWrap(content, color) {
  const c = color === 'white' ? '#f0e6c8' : '#2a1a4a';
  const stroke = color === 'white' ? '#8a6520' : '#bb66ff';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
    </defs>
    <g fill="${c}" stroke="${stroke}" stroke-width="2" filter="url(#glow)">${content}</g>
  </svg>`;
}

// King — crown
function kingSVG(color) {
  const c = color === 'white' ? '#f5d87a' : '#bb66ff';
  return svgWrap(`
    <polygon points="50,10 40,35 20,20 30,50 70,50 80,20 60,35" fill="${c}" stroke-width="1.5"/>
    <rect x="25" y="50" width="50" height="12" rx="3"/>
    <rect x="20" y="62" width="60" height="14" rx="4"/>
    <circle cx="50" cy="10" r="5" fill="${c}"/>
    <circle cx="20" cy="20" r="4" fill="${c}"/>
    <circle cx="80" cy="20" r="4" fill="${c}"/>
  `, color);
}

// Queen — gem crown
function queenSVG(color) {
  const c = color === 'white' ? '#f5d87a' : '#ff88cc';
  return svgWrap(`
    <polygon points="50,8 44,32 28,18 32,42 68,42 72,18 56,32" fill="${c}" stroke-width="1.5"/>
    <ellipse cx="50" cy="48" rx="22" ry="7"/>
    <rect x="28" y="55" width="44" height="11" rx="3"/>
    <rect x="23" y="66" width="54" height="13" rx="4"/>
    <circle cx="50" cy="8" r="5" fill="${c}"/>
    <circle cx="28" cy="18" r="4" fill="${c}"/>
    <circle cx="72" cy="18" r="4" fill="${c}"/>
  `, color);
}

// Bishop — pointed hat
function bishopSVG(color) {
  return svgWrap(`
    <ellipse cx="50" cy="28" rx="14" ry="20"/>
    <polygon points="50,8 42,28 58,28"/>
    <ellipse cx="50" cy="50" rx="20" ry="7"/>
    <rect x="30" y="57" width="40" height="11" rx="3"/>
    <rect x="25" y="68" width="50" height="12" rx="4"/>
    <line x1="50" y1="8" x2="50" y2="52" stroke-width="1.5"/>
  `, color);
}

// Rook — castle tower
function rookSVG(color) {
  return svgWrap(`
    <rect x="28" y="18" width="44" height="52" rx="3"/>
    <rect x="24" y="14" width="14" height="14" rx="2"/>
    <rect x="43" y="14" width="14" height="14" rx="2"/>
    <rect x="62" y="14" width="14" height="14" rx="2"/>
    <rect x="22" y="70" width="56" height="12" rx="4"/>
    <rect x="38" y="42" width="10" height="16" rx="2" fill-opacity="0.3"/>
  `, color);
}

// Knight — horse head
function knightSVG(color) {
  return svgWrap(`
    <path d="M35,75 Q30,55 38,42 Q32,35 34,22 Q42,15 52,20 Q62,18 65,28
             Q68,38 62,45 Q58,50 60,60 L55,75 Z"/>
    <circle cx="46" cy="28" r="4" fill-opacity="0.6"/>
    <path d="M34,22 Q28,28 30,38 Q32,44 38,42" fill="none" stroke-width="2.5"/>
    <rect x="32" y="75" width="36" height="10" rx="4"/>
  `, color);
}

// Pawn — soldier
function pawnSVG(color) {
  return svgWrap(`
    <circle cx="50" cy="28" r="14"/>
    <path d="M38,42 Q33,55 35,65 L65,65 Q67,55 62,42 Z"/>
    <rect x="30" y="65" width="40" height="12" rx="4"/>
    <line x1="50" y1="42" x2="50" y2="65" stroke-width="1.5"/>
  `, color);
}

// ─── Piece SVG Dispatcher ────────────────────────────────────────────────────
function getPieceSVG(type, color) {
  switch(type) {
    case 'K': return kingSVG(color);
    case 'Q': return queenSVG(color);
    case 'B': return bishopSVG(color);
    case 'R': return rookSVG(color);
    case 'N': return knightSVG(color);
    case 'P': return pawnSVG(color);
  }
}

// ─── Render Piece Element ────────────────────────────────────────────────────
function renderPieceEl(type, color, theme) {
  const themeData = THEMES[theme][color][type];

  // Photo piece (FF theme with real image)
  if (theme === 'ff' && themeData.img) {
    const wrap = document.createElement('div');
    wrap.className = `piece-photo-wrap ${color}`;
    const img = document.createElement('img');
    img.src = themeData.img;
    img.alt = themeData.name;
    img.draggable = false;
    // fallback to SVG if image fails
    img.onerror = () => {
      wrap.className = 'piece';
      wrap.innerHTML = getPieceSVG(type, color);
    };
    const badge = document.createElement('span');
    badge.className = 'piece-type-badge';
    badge.textContent = themeData.badge;
    wrap.appendChild(img);
    wrap.appendChild(badge);
    return wrap;
  }

  // SVG piece
  const div = document.createElement('div');
  div.className = 'piece';
  div.innerHTML = getPieceSVG(type, color);
  return div;
}

// ─── Legend Builder ──────────────────────────────────────────────────────────
function buildLegend(theme, container) {
  container.innerHTML = '';
  ['white','black'].forEach(color => {
    const side = document.createElement('div');
    side.className = 'legend-side';
    const title = document.createElement('div');
    title.className = 'legend-title';
    title.textContent = THEMES[theme].label[color].toUpperCase();
    side.appendChild(title);
    ['K','Q','B','R','N','P'].forEach(type => {
      const row = document.createElement('div');
      row.className = 'legend-row';
      const iconWrap = document.createElement('div');
      iconWrap.className = 'legend-icon';
      iconWrap.appendChild(renderPieceEl(type, color, theme));
      const label = document.createElement('span');
      label.textContent = THEMES[theme][color][type].name;
      row.appendChild(iconWrap);
      row.appendChild(label);
      side.appendChild(row);
    });
    container.appendChild(side);
  });
}
