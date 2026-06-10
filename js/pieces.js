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

// Per-character face crop positions (object-position CSS value)
const FACE_POS = {
  cloud:   'center 8%',
  tifa:    'center 5%',
  aerith:  'center 5%',
  barret:  'center 10%',
  redxiii: 'center 15%',
  squall:  'center 8%',
  rinoa:   'center 8%',
  quistis: 'center 5%',
  zell:    'center 10%',
  irvine:  'center 8%',
};

// ─── Theme Configuration ─────────────────────────────────────────────────────
const THEMES = {
  ff: {
    white: {
      K: { name:'Cloud Strife',       img: FF_IMGS.cloud,   badge:'K', faceKey:'cloud'   },
      Q: { name:'Tifa Lockhart',      img: FF_IMGS.tifa,    badge:'Q', faceKey:'tifa'    },
      B: { name:'Aerith Gainsborough',img: FF_IMGS.aerith,  badge:'B', faceKey:'aerith'  },
      R: { name:'Barret Wallace',     img: FF_IMGS.barret,  badge:'R', faceKey:'barret'  },
      N: { name:'Red XIII',           img: FF_IMGS.redxiii, badge:'N', faceKey:'redxiii' },
      P: { name:'SOLDIER',            img: null,            badge:'P', faceKey:null      },
    },
    black: {
      K: { name:'Squall Leonhart',    img: FF_IMGS.squall,  badge:'K', faceKey:'squall'  },
      Q: { name:'Rinoa Heartilly',    img: FF_IMGS.rinoa,   badge:'Q', faceKey:'rinoa'   },
      B: { name:'Quistis Trepe',      img: FF_IMGS.quistis, badge:'B', faceKey:'quistis' },
      R: { name:'Zell Dincht',        img: FF_IMGS.zell,    badge:'R', faceKey:'zell'    },
      N: { name:'Irvine Kinneas',     img: FF_IMGS.irvine,  badge:'N', faceKey:'irvine'  },
      P: { name:'SeeD Cadet',         img: null,            badge:'P', faceKey:null      },
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

// Pawn — white=SOLDIER helmet, black=SeeD uniform
function pawnSVG(color) {
  if (color === 'white') {
    // SOLDIER — angular helmet (FF7 aesthetic)
    return svgWrap(`
      <polygon points="50,10 35,20 32,38 40,42 60,42 68,38 65,20" />
      <rect x="38" y="28" width="24" height="8" rx="2" fill-opacity="0.4"/>
      <path d="M38,42 Q32,56 34,66 L66,66 Q68,56 62,42 Z"/>
      <rect x="29" y="66" width="42" height="12" rx="4"/>
    `, color);
  } else {
    // SeeD — round helmet with visor (FF8 aesthetic)
    return svgWrap(`
      <circle cx="50" cy="26" r="16"/>
      <rect x="36" y="24" width="28" height="8" rx="3" fill-opacity="0.35"/>
      <path d="M37,42 Q31,56 33,66 L67,66 Q69,56 63,42 Z"/>
      <rect x="28" y="66" width="44" height="12" rx="4"/>
      <line x1="36" y1="16" x2="64" y2="16" stroke-width="2.5" stroke-linecap="round"/>
    `, color);
  }
}

// ─── Monster SVG Pieces ──────────────────────────────────────────────────────

function svgMonster(content, color) {
  const base = color === 'white' ? '#a8d8f0' : '#3a0a5a';
  const stroke = color === 'white' ? '#2266aa' : '#cc44ff';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <radialGradient id="mg${color}" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stop-color="${color==='white'?'#d0f0ff':'#6a0aaa'}"/>
        <stop offset="100%" stop-color="${base}"/>
      </radialGradient>
      <filter id="mgl"><feGaussianBlur stdDeviation="1.5" result="b"/>
        <feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    </defs>
    <g fill="url(#mg${color})" stroke="${stroke}" stroke-width="1.8" filter="url(#mgl)">${content}</g>
  </svg>`;
}

// King white = Bahamut (dragon head + wings)
function bahamutSVG(color) {
  const wing = color === 'white'
    ? 'M50,30 Q20,10 10,30 Q20,38 38,35' // left wing
    : 'M50,30 Q80,10 90,30 Q80,38 62,35'; // right wing (Neo Bahamut mirror)
  const c = color === 'white' ? '#88ccff' : '#ee88ff';
  return svgMonster(`
    <!-- Wings -->
    <path d="M50,30 Q20,8 8,28 Q20,40 40,34" fill="${c}" opacity="0.8"/>
    <path d="M50,30 Q80,8 92,28 Q80,40 60,34" fill="${c}" opacity="0.8"/>
    <!-- Body -->
    <ellipse cx="50" cy="52" rx="18" ry="24"/>
    <!-- Head -->
    <ellipse cx="50" cy="28" rx="12" ry="14"/>
    <!-- Horns -->
    <polygon points="44,14 40,2 48,16" fill="${c}"/>
    <polygon points="56,14 60,2 52,16" fill="${c}"/>
    <!-- Eyes -->
    <circle cx="45" cy="26" r="3" fill="${c}" stroke-width="1"/>
    <circle cx="55" cy="26" r="3" fill="${c}" stroke-width="1"/>
    <!-- Base -->
    <rect x="32" y="74" width="36" height="10" rx="5"/>
  `, color);
}

// Queen white = Shiva (icy elegant), black = Ultimecia (dark sorceress)
function shivaSVG(color) {
  const c = color === 'white' ? '#aaeeff' : '#dd88ff';
  const accent = color === 'white' ? '#66ccff' : '#aa00ff';
  return svgMonster(`
    <!-- Robe/body -->
    <path d="M32,42 Q28,65 30,76 L70,76 Q72,65 68,42 Z"/>
    <!-- Torso -->
    <ellipse cx="50" cy="36" rx="14" ry="10"/>
    <!-- Head -->
    <circle cx="50" cy="22" r="12"/>
    <!-- Ice crown / dark tiara -->
    <polygon points="50,8 44,18 38,10 44,22 56,22 62,10 56,18" fill="${c}" stroke-width="1"/>
    <!-- Crystal shards / horns -->
    <polygon points="38,10 33,2 42,12" fill="${accent}"/>
    <polygon points="62,10 67,2 58,12" fill="${accent}"/>
    <!-- Eyes -->
    <ellipse cx="45" cy="21" rx="3" ry="2.5" fill="${c}"/>
    <ellipse cx="55" cy="21" rx="3" ry="2.5" fill="${c}"/>
    <!-- Base -->
    <rect x="28" y="76" width="44" height="11" rx="5"/>
  `, color);
}

// Bishop white = Ifrit (fire horns), black = Diablos (bat wings)
function ifritSVG(color) {
  const c = color === 'white' ? '#ffaa44' : '#aa44cc';
  return svgMonster(`
    <!-- Body -->
    <path d="M34,44 Q28,62 30,74 L70,74 Q72,62 66,44 Z"/>
    <!-- Chest -->
    <ellipse cx="50" cy="38" rx="16" ry="12"/>
    <!-- Head -->
    <circle cx="50" cy="23" r="13"/>
    ${color === 'white' ? `
    <!-- Ifrit horns (fire curved) -->
    <path d="M38,14 Q30,2 36,8" fill="${c}" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M62,14 Q70,2 64,8" fill="${c}" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M44,12 Q40,4 44,8" fill="${c}" stroke-width="1"/>
    <path d="M56,12 Q60,4 56,8" fill="${c}" stroke-width="1"/>
    ` : `
    <!-- Diablos bat wings -->
    <path d="M36,30 Q15,15 12,28 Q20,40 36,36" fill="${c}" opacity="0.7"/>
    <path d="M64,30 Q85,15 88,28 Q80,40 64,36" fill="${c}" opacity="0.7"/>
    `}
    <!-- Eyes glow -->
    <circle cx="44" cy="22" r="3.5" fill="${c}"/>
    <circle cx="56" cy="22" r="3.5" fill="${c}"/>
    <!-- Base -->
    <rect x="28" y="74" width="44" height="12" rx="5"/>
  `, color);
}

// Rook white = Iron Giant (armored), black = Golem (stone)
function ironGiantSVG(color) {
  const c = color === 'white' ? '#ccddee' : '#887766';
  return svgMonster(`
    <!-- Legs -->
    <rect x="33" y="66" width="14" height="18" rx="3"/>
    <rect x="53" y="66" width="14" height="18" rx="3"/>
    <!-- Body armor -->
    <rect x="28" y="38" width="44" height="32" rx="4"/>
    <!-- Shoulder pads -->
    <rect x="18" y="38" width="16" height="10" rx="3" fill="${c}" opacity="0.8"/>
    <rect x="66" y="38" width="16" height="10" rx="3" fill="${c}" opacity="0.8"/>
    <!-- Head/helmet -->
    <rect x="34" y="16" width="32" height="26" rx="5"/>
    <!-- Visor slit -->
    <rect x="38" y="28" width="24" height="6" rx="2" fill-opacity="0.25"/>
    <!-- Rivets -->
    <circle cx="36" cy="22" r="2.5" fill="${c}"/>
    <circle cx="64" cy="22" r="2.5" fill="${c}"/>
    <!-- Base -->
    <rect x="26" y="82" width="48" height="10" rx="4"/>
  `, color);
}

// Knight white = Chocobo (bird), black = Behemoth (beast)
function chocoboSVG(color) {
  if (color === 'white') {
    return svgMonster(`
      <!-- Chocobo body -->
      <ellipse cx="50" cy="58" rx="20" ry="24"/>
      <!-- Neck -->
      <path d="M42,36 Q38,20 44,10 Q56,8 58,18 Q58,30 56,38"/>
      <!-- Head -->
      <ellipse cx="51" cy="14" rx="10" ry="10"/>
      <!-- Beak -->
      <polygon points="44,14 36,12 44,18" fill="#ffcc00" stroke="#cc8800" stroke-width="1"/>
      <!-- Crest feathers -->
      <path d="M50,4 Q44,0 46,6" fill="#ffdd44" stroke-width="1"/>
      <path d="M54,5 Q52,0 52,7" fill="#ffdd44" stroke-width="1"/>
      <!-- Eye -->
      <circle cx="47" cy="13" r="3" fill="#ffee00" stroke-width="1"/>
      <circle cx="47" cy="13" r="1.5" fill="#333" stroke-width="0"/>
      <!-- Wing hint -->
      <path d="M32,48 Q24,44 26,54 Q32,56 36,52" fill-opacity="0.6"/>
      <!-- Legs -->
      <line x1="42" y1="78" x2="38" y2="92" stroke-width="4" stroke-linecap="round"/>
      <line x1="58" y1="78" x2="62" y2="92" stroke-width="4" stroke-linecap="round"/>
    `, color);
  } else {
    // Behemoth — large horned beast
    return svgMonster(`
      <!-- Body -->
      <ellipse cx="50" cy="58" rx="26" ry="22"/>
      <!-- Head -->
      <ellipse cx="50" cy="30" rx="18" ry="16"/>
      <!-- Curved horns -->
      <path d="M34,20 Q20,4 30,14" fill="none" stroke-width="5" stroke-linecap="round"/>
      <path d="M66,20 Q80,4 70,14" fill="none" stroke-width="5" stroke-linecap="round"/>
      <!-- Mane -->
      <path d="M32,36 Q30,50 34,60" fill-opacity="0.4" stroke-width="3"/>
      <!-- Eyes -->
      <circle cx="42" cy="28" r="4" fill="#ff4444" stroke-width="1"/>
      <circle cx="58" cy="28" r="4" fill="#ff4444" stroke-width="1"/>
      <!-- Claws -->
      <line x1="38" y1="78" x2="32" y2="90" stroke-width="4" stroke-linecap="round"/>
      <line x1="50" y1="80" x2="50" y2="92" stroke-width="4" stroke-linecap="round"/>
      <line x1="62" y1="78" x2="68" y2="90" stroke-width="4" stroke-linecap="round"/>
    `, color);
  }
}

// Pawn white = Moogle (pompom), black = Dark Moogle
function moogleSVG(color) {
  const pompom = color === 'white' ? '#ff6688' : '#aa00cc';
  const c = color === 'white' ? '#ffffff' : '#553366';
  return svgMonster(`
    <!-- Pompom stem -->
    <line x1="50" y1="10" x2="50" y2="20" stroke-width="2.5" stroke="${pompom}"/>
    <!-- Pompom -->
    <circle cx="50" cy="8" r="6" fill="${pompom}" stroke="${pompom}"/>
    <!-- Head -->
    <circle cx="50" cy="30" r="14" fill="${c}" stroke-width="1.8"/>
    <!-- Ears -->
    <ellipse cx="35" cy="22" rx="6" ry="10" fill="${c}" stroke-width="1.5"/>
    <ellipse cx="65" cy="22" rx="6" ry="10" fill="${c}" stroke-width="1.5"/>
    <!-- Eyes (beady) -->
    <circle cx="44" cy="30" r="3" fill="#222" stroke-width="0"/>
    <circle cx="56" cy="30" r="3" fill="#222" stroke-width="0"/>
    <!-- Nose (red dot) -->
    <circle cx="50" cy="36" r="2.5" fill="#ff4444" stroke-width="0"/>
    <!-- Wings -->
    <path d="M36,46 Q22,40 24,52 Q32,56 38,50" fill="${c}" opacity="0.7" stroke-width="1.5"/>
    <path d="M64,46 Q78,40 76,52 Q68,56 62,50" fill="${c}" opacity="0.7" stroke-width="1.5"/>
    <!-- Body -->
    <ellipse cx="50" cy="62" rx="16" ry="18"/>
    <!-- Base -->
    <rect x="30" y="78" width="40" height="11" rx="5"/>
  `, color);
}

// ─── Piece SVG Dispatcher ────────────────────────────────────────────────────
function getPieceSVG(type, color, theme) {
  if (theme === 'monster') {
    switch(type) {
      case 'K': return bahamutSVG(color);
      case 'Q': return shivaSVG(color);
      case 'B': return ifritSVG(color);
      case 'R': return ironGiantSVG(color);
      case 'N': return chocoboSVG(color);
      case 'P': return moogleSVG(color);
    }
  }
  // Default FF / generic SVG
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
    wrap.dataset.name = themeData.name;  // for tooltip

    const img = document.createElement('img');
    img.src = themeData.img;
    img.alt = themeData.name;
    img.draggable = false;
    // Per-character face crop
    if (themeData.faceKey && FACE_POS[themeData.faceKey]) {
      img.style.objectPosition = FACE_POS[themeData.faceKey];
    }
    // Fallback to SVG if image fails to load
    img.onerror = () => {
      wrap.className = 'piece';
      wrap.innerHTML = getPieceSVG(type, color, theme);
    };

    const badge = document.createElement('span');
    badge.className = 'piece-type-badge';
    badge.textContent = themeData.badge;

    wrap.appendChild(img);
    wrap.appendChild(badge);
    return wrap;
  }

  // SVG piece (monster theme or FF pawn/fallback)
  const div = document.createElement('div');
  div.className = 'piece';
  div.title = themeData.name; // tooltip for SVG pieces too
  div.innerHTML = getPieceSVG(type, color, theme);
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
