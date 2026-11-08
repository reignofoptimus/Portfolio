/* ------------------------------------------------------------------------------------------------
 * DotTiles by Louis Studios — Vanilla JS Port
 * A grid of black glass metric tiles with dot-matrix numerals.
 * ---------------------------------------------------------------------------------------------- */

(function () {
  'use strict';

  const TW = 206;
  const TH = 204;
  const GAP = 12; // gap between tiles
  const PAD = 19.5;
  const TRACK_X0 = 19.5;
  const TRACK_X1 = 187.5;
  const TRACK_W = TRACK_X1 - TRACK_X0;
  const VIS_Y = 164.2;
  const PITCH = 7.35;
  const DOT_R = 3.08;
  const VAL_X = 22.5;
  const VAL_Y = 89.1;
  const VAL_MAX_W = 140;

  const STEP_BASE = 168.2;
  const STEP_MAX = 12;
  const RISE_SHAPE = [
    [0, 0.108, 1 / 6],
    [0.108, 0.385, 2 / 6],
    [0.385, 0.752, 3 / 6],
    [0.752, 1, 4 / 6],
  ];

  const COUNT_MS = 1500;
  const DRAW_MS = 1400;
  const OUT_MS = 700;
  const POP_IN_MS = 210;
  const POP_OUT_MS = 150;

  const u = (n) => `calc(${(n / TW).toFixed(5)} * 100cqw)`;

  // --- Dot Font (5x7 and symbols) ---
  const GLYPHS = {
    '0': ['.XXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
    '1': ['..X..', '.XX..', 'X.X..', '..X..', '..X..', '..X..', 'XXXXX'],
    '2': ['.XXX.', 'X...X', '....X', '..XX.', '.X...', 'X....', 'XXXXX'],
    '3': ['XXXXX', '....X', '...X.', '..XX.', '....X', 'X...X', '.XXX.'],
    '4': ['...X', '..XX', '.X.X', 'X..X', 'XXXX', '...X', '...X'],
    '5': ['XXXXX', 'X....', 'X.XX.', 'XX..X', '....X', 'X...X', '.XXX.'],
    '6': ['..XX.', '.X...', 'X....', 'X.XX.', 'XX..X', 'X...X', '.XXX.'],
    '7': ['XXXXX', '....X', '...X.', '...X.', '..X..', '.X...', '.X...'],
    '8': ['.XXX.', 'X...X', 'X...X', '.XXX.', 'X...X', 'X...X', '.XXX.'],
    '9': ['.XXX.', 'X...X', 'X..XX', '.XX.X', '....X', '...X.', '.XX..'],
    ':': ['.', '.', 'X', '.', 'X', '.', '.'],
    '.': ['.', '.', '.', '.', '.', '.', 'X'],
    '-': ['...', '...', '...', 'XXX', '...', '...', '...'],
    '+': ['..X..', '..X..', 'XXXXX', '..X..', '..X..', '.....', '.....'],
    '/': ['....X', '...X.', '..X..', '.X...', 'X....', '.....', '.....'],
    '&': ['.XX..', 'X..X.', '..X..', 'X..X.', '.XX.X', '.....', '.....'],
    'A': ['.XXX.', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
    'B': ['XXXX.', 'X...X', 'XXXX.', 'X...X', 'XXXX.', '.....', '.....'],
    'C': ['.XXXX', 'X....', 'X....', 'X....', '.XXXX', '.....', '.....'],
    'D': ['XXXX.', 'X...X', 'X...X', 'X...X', 'XXXX.', '.....', '.....'],
    'E': ['XXXXX', 'X....', 'XXXX.', 'X....', 'XXXXX', '.....', '.....'],
    'F': ['XXXXX', 'X....', 'XXXX.', 'X....', 'X....', '.....', '.....'],
    'G': ['.XXXX', 'X....', 'X.XXX', 'X...X', '.XXX.', '.....', '.....'],
    'H': ['X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', '.....', '.....'],
    'I': ['XXXXX', '..X..', '..X..', '..X..', 'XXXXX', '.....', '.....'],
    'J': ['....X', '....X', '....X', 'X...X', '.XXX.', '.....', '.....'],
    'K': ['X...X', 'X..X.', 'XXX..', 'X..X.', 'X...X', '.....', '.....'],
    'L': ['X....', 'X....', 'X....', 'X....', 'XXXXX', '.....', '.....'],
    'M': ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X', '.....', '.....'],
    'N': ['X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X', '.....', '.....'],
    'O': ['.XXX.', 'X...X', 'X...X', 'X...X', '.XXX.', '.....', '.....'],
    'P': ['XXXX.', 'X...X', 'XXXX.', 'X....', 'X....', '.....', '.....'],
    'Q': ['.XXX.', 'X...X', 'X...X', 'X..XX', '.XX.X', '.....', '.....'],
    'R': ['XXXX.', 'X...X', 'XXXX.', 'X..X.', 'X...X', '.....', '.....'],
    'S': ['.XXXX', 'X....', '.XXX.', '....X', 'XXXX.', '.....', '.....'],
    'T': ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', '..X..'],
    'U': ['X...X', 'X...X', 'X...X', 'X...X', '.XXX.', '.....', '.....'],
    'V': ['X...X', 'X...X', 'X...X', '.X.X.', '..X..', '.....', '.....'],
    'W': ['X...X', 'X...X', 'X.X.X', 'XX.XX', 'X...X', '.....', '.....'],
    'X': ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X', '.....', '.....'],
    'Y': ['X...X', '.X.X.', '..X..', '..X..', '..X..', '.....', '.....'],
    'Z': ['XXXXX', '...X.', '..X..', '.X...', 'XXXXX', '.....', '.....'],
    ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  };

  function layoutText(s) {
    const raw = String(s).toUpperCase();
    const lines = raw.includes('\n')
      ? raw.split('\n')
      : (raw.length > 8 && raw.includes(' & ')
          ? raw.split(' & ').map((part, i) => i === 0 ? part + ' &' : part)
          : (raw.length > 8 && raw.includes(' AND ')
              ? raw.split(' AND ').map((part, i) => i === 0 ? part + ' AND' : part)
              : [raw]));
    const on = new Set();
    let maxCols = 1;
    const rowOffset = 7;
    lines.forEach((line, lineIdx) => {
      let x = 0;
      let first = true;
      for (const ch of line) {
        const g = GLYPHS[ch] || GLYPHS[' '];
        if (!first) x += 1;
        first = false;
        const w = g[0].length;
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < w; c++) {
            if (g[r] && g[r][c] === 'X') {
              const actualRow = lineIdx * rowOffset + r;
              on.add(actualRow * 64 + x + c);
            }
          }
        }
        x += w;
      }
      if (x > maxCols) maxCols = x;
    });
    const totalRows = lines.length <= 1 ? 7 : (lines.length * rowOffset - (rowOffset - 5));
    return { cols: Math.max(1, maxCols), rows: totalRows, on };
  }

  function parseValue(v) {
    const text = String(v).trim();
    const t = /^(\d+):(\d{2})$/.exec(text);
    if (t) return { kind: 'time', n: +t[1] * 60 + +t[2], text };
    if (/^-?\d+(\.\d+)?$/.test(text)) {
      return { kind: 'num', n: +text, dec: (text.split('.')[1] || '').length, text };
    }
    return { kind: 'text', text };
  }

  function formatValue(p, n) {
    if (p.kind === 'time') {
      const m = Math.max(0, Math.round(n));
      return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
    }
    if (p.kind === 'num') return n.toFixed(p.dec);
    return p.text;
  }

  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
  const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const easeOutBack = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
  const easeInQuad = (x) => x * x;

  function hash(a, b) {
    let h = (a * 374761393 + b * 668265263) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  const ICON_SIZE = {
    heart: 14, moon: 12.8, clock: 12.5, pulse: 13.2,
    bolt: 12.6, battery: 14, spark: 13, drop: 12.5, flame: 12.5
  };
  const ICON_DY = { heart: 1.2, moon: -0.6, pulse: -0.4, bolt: -0.4, battery: 0.6, clock: -1.6 };
  const ICON_DX = { moon: 1.3 };

  function renderIconSvg(name) {
    switch (name) {
      case 'heart':
        return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" style="display:block;overflow:visible"><path fill="currentColor" d="M12 21.2C9.4 19.1 1.8 14 1.8 8.3 1.8 5.1 4.2 2.8 7 2.8c2.1 0 3.8 1.1 5 2.9 1.2-1.8 2.9-2.9 5-2.9 2.8 0 5.2 2.3 5.2 5.5 0 5.7-7.6 10.8-10.2 12.9Z"/></svg>`;
      case 'moon':
        return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" style="display:block;overflow:visible"><path fill="currentColor" d="M12.7 2.23A9.8 9.8 0 1 0 21.8 11.71 6.6 6.6 0 0 1 12.7 2.23Z"/></svg>`;
      case 'clock':
        return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" style="display:block;overflow:visible"><circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M11.6 6.2v6.4l3.4 2.6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case 'pulse':
        return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" style="display:block;overflow:visible"><path d="M0.8 12.4h4.4l1.7-6.6 2.9 13 2.6-10.4 1.6 5 1.5-2.4h2.6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"/><circle cx="20.9" cy="11.6" r="2.3" fill="currentColor"/></svg>`;
      case 'bolt':
        return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" style="display:block;overflow:visible"><path fill="currentColor" d="M15.2 1 4.6 13.6h6.2L8.9 23 19.6 10.2h-6.3L15.2 1Z"/></svg>`;
      case 'battery':
        return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" style="display:block;overflow:visible"><path fill="currentColor" fill-rule="evenodd" d="M7.2 5.4h9.6a5.2 5.2 0 0 1 5.2 5.2v2.8a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 13.4v-2.8a5.2 5.2 0 0 1 5.2-5.2Zm-.6 3.5a1 1 0 0 0-1 1v4.2a1 1 0 0 0 1 1h3.6a1 1 0 0 0 1-1V9.9a1 1 0 0 0-1-1H6.6Z"/></svg>`;
      case 'spark':
        return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" style="display:block;overflow:visible"><path fill="currentColor" d="M12 1.2c.9 5.9 4.9 9.9 10.8 10.8-5.9.9-9.9 4.9-10.8 10.8C11.1 16.9 7.1 12.9 1.2 12 7.1 11.1 11.1 7.1 12 1.2Z"/></svg>`;
      case 'drop':
        return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" style="display:block;overflow:visible"><path fill="currentColor" d="M12 1.8s7.2 8 7.2 13a7.2 7.2 0 0 1-14.4 0c0-5 7.2-13 7.2-13Z"/></svg>`;
      case 'flame':
        return `<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" style="display:block;overflow:visible"><path fill="currentColor" d="M12.6 1.4c.6 3.8 6.6 6.6 6.6 12.4a7.2 7.2 0 0 1-14.4 0c0-3.2 1.8-5.2 3.6-6.6 0 2.2.8 3.6 2.2 4.2.2-4.2 1.6-7.2 2-10Z"/></svg>`;
      default:
        return '';
    }
  }

  function slotX(i, slots) {
    return TRACK_X0 + (slots <= 1 ? 0 : (i * TRACK_W) / (slots - 1));
  }

  function stepSegments(v) {
    if (v.type === 'steps') {
      const from = v.from ?? 0;
      const to = v.to ?? 1;
      const n = Math.max(1, v.data.length);
      const w = (to - from) / n;
      return v.data.map((d, i) => [
        TRACK_X0 + (from + i * w) * TRACK_W,
        TRACK_X0 + (from + (i + 1) * w) * TRACK_W,
        clamp01(d)
      ]);
    }
    if (v.type === 'rise') {
      const end = clamp01(v.value);
      return RISE_SHAPE.map(([a, b, l]) => [
        TRACK_X0 + a * end * TRACK_W,
        TRACK_X0 + b * end * TRACK_W,
        l
      ]);
    }
    return [];
  }

  function stepPath(segs, draw) {
    if (!segs.length) return '';
    const x0 = segs[0][0];
    const span = segs[segs.length - 1][1] - x0 || 1;
    let d = `M${x0.toFixed(2)} ${STEP_BASE}`;
    for (const [a, b, l] of segs) {
      const f = (a + b) / 2 - x0;
      const k = easeOutCubic(clamp01((draw * 1.45 - (f / span) * 0.95) / 0.5));
      const y = (STEP_BASE - l * STEP_MAX * k).toFixed(2);
      d += `L${a.toFixed(2)} ${y}L${b.toFixed(2)} ${y}`;
    }
    return d + `L${segs[segs.length - 1][1].toFixed(2)} ${STEP_BASE}Z`;
  }

  function updateVisual(v, r, draw, markerX) {
    const slots = v && v.slots ? v.slots : 15;
    let k = 0;
    if (v.type !== 'slider') {
      for (let i = 0; i < slots; i++) {
        if (v.type === 'dots' && v.data[i] != null) continue;
        const el = r.lines[k++];
        if (el) el.setAttribute('opacity', (0.15 * clamp01(draw * 2.2 - (i / slots) * 1.2)).toFixed(3));
      }
    }
    if (v.type === 'slider') {
      const n = r.ticks.length;
      const mode = v.mode || 'glow';
      const mx = TRACK_X0 + markerX * TRACK_W;
      for (let i = 0; i < n; i++) {
        const el = r.ticks[i];
        if (!el) continue;
        const x = TRACK_X0 + (i * TRACK_W) / (n - 1);
        const reveal = clamp01((draw * 1.5 - (i / n) * 1.0) / 0.4);
        const d = Math.abs(x - mx) - 4.5;
        let o;
        if (d < 1.4) o = 0;
        else if (mode === 'fill') o = x < mx ? 0.94 : 0.24;
        else o = Math.max(0.24, 0.84 - 0.021 * d);
        el.setAttribute('opacity', (o * reveal).toFixed(3));
      }
      if (r.marker) {
        r.marker.setAttribute('x', (mx - 4.5).toFixed(2));
        r.marker.setAttribute('opacity', clamp01(draw * 4).toFixed(3));
      }
      return;
    }
    if (v.type === 'steps' || v.type === 'rise') {
      if (r.path) r.path.setAttribute('d', stepPath(stepSegments(v), draw));
      return;
    }
    if (v.type === 'dots') {
      const n = v.data.length;
      v.data.forEach((d, i) => {
        const el = r.dots[i];
        if (!el || d == null) return;
        const p = clamp01((draw * 1.6 - (i / Math.max(1, n)) * 1.0) / 0.45);
        const rad = (1 + 2.75 * clamp01(d)) * (p <= 0 ? 0 : easeOutBack(p));
        el.setAttribute('r', Math.max(0, rad).toFixed(3));
      });
      return;
    }
    if (v.type === 'blocks') {
      v.data.forEach((b, i) => {
        const el = r.blocks[i];
        if (!el) return;
        const p = easeOutCubic(clamp01((draw * 1.5 - clamp01(b[0]) * 1.0) / 0.45));
        el.setAttribute('width', Math.max(0, (clamp01(b[1]) - clamp01(b[0])) * TRACK_W * p).toFixed(2));
      });
    }
  }

  function createTile(props, index, uid) {
    const {
      title,
      subtitle,
      value,
      unit,
      icon,
      visual,
      jitter = 0,
      dotColor,
      tileColor,
      animate = true,
      delay = 0,
      replayEvery,
    } = props;

    const hasValue = value != null && value !== '';

    const tile = document.createElement('div');
    tile.className = 'lsdt-tile';
    tile.setAttribute('role', 'group');
    tile.setAttribute('data-hover', '');
    if (dotColor) tile.style.setProperty('--dt-ink', dotColor);
    if (tileColor) tile.style.setProperty('--dt-tile', tileColor);

    // Glass layer
    const glass = document.createElement('div');
    glass.className = 'lsdt-glass';
    tile.appendChild(glass);

    // Face layer
    const face = document.createElement('div');
    face.className = 'lsdt-face';

    const h3 = document.createElement('h3');
    h3.className = 'lsdt-title';
    h3.textContent = title;
    face.appendChild(h3);

    if (subtitle) {
      const sub = document.createElement('div');
      sub.className = 'lsdt-sub';
      sub.textContent = subtitle;
      face.appendChild(sub);
    }

    if (!hasValue) {
      tile.classList.add('lsdt-tile-text-only');
      tile.appendChild(face);
      return tile;
    }

    const parsed = parseValue(value);
    const layout = layoutText(parsed.text);
    let targetCols = layout.cols;
    let targetRows = layout.rows;
    if (parsed.kind !== 'text' && jitter > 0) {
      const step = parsed.kind === 'num' ? jitter * Math.pow(10, -parsed.dec) : jitter;
      targetCols = Math.max(targetCols, layoutText(formatValue(parsed, parsed.n + step)).cols);
    }
    const cols = Math.max(1, targetCols);
    const rows = Math.max(7, targetRows);
    const maxW = rows > 7 ? 160 : VAL_MAX_W;
    const maxH = rows > 7 ? 96 : 60;
    const scale = Math.min(1, maxW / (cols * PITCH), maxH / (rows * PITCH));
    const centerY = rows > 7 ? 100 : VAL_Y;

    const sr = document.createElement('span');
    sr.className = 'lsdt-sr';
    sr.textContent = `${parsed.text}${unit ? ' ' + unit : ''}`;
    face.appendChild(sr);

    // Dot Matrix SVG
    const svgNS = 'http://www.w3.org/2000/svg';
    const dotSvg = document.createElementNS(svgNS, 'svg');
    dotSvg.setAttribute('aria-hidden', 'true');
    dotSvg.setAttribute('viewBox', `0 0 ${cols} ${rows}`);
    dotSvg.style.position = 'absolute';
    dotSvg.style.left = u(VAL_X - (PITCH * scale) / 2);
    dotSvg.style.top = u(centerY - (rows * PITCH * scale) / 2);
    dotSvg.style.width = u(cols * PITCH * scale);
    dotSvg.style.height = u(rows * PITCH * scale);
    dotSvg.style.overflow = 'visible';
    dotSvg.style.display = 'block';
    dotSvg.style.color = 'var(--dt-ink)';

    const dotEls = [];
    const totalDots = cols * rows;
    for (let i = 0; i < totalDots; i++) {
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', ((i % cols) + 0.5).toString());
      c.setAttribute('cy', (Math.floor(i / cols) + 0.5).toString());
      c.setAttribute('r', '0');
      c.setAttribute('fill', 'currentColor');
      dotSvg.appendChild(c);
      dotEls.push(c);
    }
    face.appendChild(dotSvg);

    // Icon slot
    if (icon && ICON_SIZE[icon]) {
      const size = ICON_SIZE[icon];
      const cy = 96.8 + (ICON_DY[icon] || 0);
      const iconSpan = document.createElement('span');
      iconSpan.setAttribute('aria-hidden', 'true');
      iconSpan.style.position = 'absolute';
      iconSpan.style.left = u(176.5 + (ICON_DX[icon] || 0) - size / 2);
      iconSpan.style.top = u(cy - size / 2);
      iconSpan.style.width = u(size);
      iconSpan.style.height = u(size);
      iconSpan.style.color = 'var(--dt-ink)';
      iconSpan.style.display = 'block';
      iconSpan.innerHTML = renderIconSvg(icon);
      face.appendChild(iconSpan);
    }

    // Unit slot
    if (unit) {
      const unitSpan = document.createElement('span');
      unitSpan.className = 'lsdt-unit';
      unitSpan.setAttribute('aria-hidden', 'true');
      const numEnd = VAL_X + (cols * PITCH * scale);
      unitSpan.style.left = u(numEnd + 7);
      if (unit === '+') {
        unitSpan.classList.add('lsdt-unit-plus');
        unitSpan.style.top = u(66);
      } else {
        unitSpan.classList.add('lsdt-unit-slash');
        unitSpan.style.top = u(88);
      }
      unitSpan.textContent = unit;
      face.appendChild(unitSpan);
    }

    // Visual section
    const visRefs = { ticks: [], marker: null, path: null, dots: [], blocks: [], lines: [] };
    if (visual) {
      const visWrap = document.createElement('div');
      visWrap.style.color = 'var(--dt-ink)';

      const visSvg = document.createElementNS(svgNS, 'svg');
      visSvg.setAttribute('aria-hidden', 'true');
      visSvg.setAttribute('viewBox', `0 140 ${TW} 36`);
      visSvg.style.position = 'absolute';
      visSvg.style.left = '0';
      visSvg.style.top = u(140);
      visSvg.style.width = '100%';
      visSvg.style.height = u(36);
      visSvg.style.overflow = 'visible';
      visSvg.style.display = 'block';

      const defs = document.createElementNS(svgNS, 'defs');
      const grad = document.createElementNS(svgNS, 'linearGradient');
      const gid = `${uid}g`;
      grad.setAttribute('id', gid);
      grad.setAttribute('x1', '0');
      grad.setAttribute('y1', '0');
      grad.setAttribute('x2', '0');
      grad.setAttribute('y2', '1');
      grad.innerHTML = `<stop offset="0" stop-color="currentColor" stop-opacity="0"/><stop offset="0.5" stop-color="currentColor" stop-opacity="1"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/>`;
      defs.appendChild(grad);
      visSvg.appendChild(defs);

      const slots = visual.slots || 15;
      if (visual.type !== 'slider') {
        for (let i = 0; i < slots; i++) {
          if (visual.type === 'dots' && visual.data[i] != null) continue;
          const rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('x', (slotX(i, slots) - 0.55).toString());
          rect.setAttribute('y', (VIS_Y - 9.5).toString());
          rect.setAttribute('width', '1.1');
          rect.setAttribute('height', '19');
          rect.setAttribute('fill', `url(#${gid})`);
          rect.setAttribute('opacity', '0');
          visSvg.appendChild(rect);
          visRefs.lines.push(rect);
        }
      }

      if (visual.type === 'slider') {
        const tickCount = Math.max(2, Math.round(visual.ticks || 44));
        for (let i = 0; i < tickCount; i++) {
          const rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('x', (TRACK_X0 + (i * TRACK_W) / (tickCount - 1) - 0.62).toFixed(2));
          rect.setAttribute('y', (VIS_Y - 4.5).toString());
          rect.setAttribute('width', '1.24');
          rect.setAttribute('height', '9');
          rect.setAttribute('fill', 'currentColor');
          rect.setAttribute('opacity', '0');
          visSvg.appendChild(rect);
          visRefs.ticks.push(rect);
        }
        const marker = document.createElementNS(svgNS, 'rect');
        marker.setAttribute('x', (TRACK_X0 - 4.5).toFixed(2));
        marker.setAttribute('y', (VIS_Y - 6.8).toString());
        marker.setAttribute('width', '9');
        marker.setAttribute('height', '13.6');
        marker.setAttribute('rx', '0.6');
        marker.setAttribute('fill', 'currentColor');
        marker.setAttribute('opacity', '0');
        visSvg.appendChild(marker);
        visRefs.marker = marker;
      }

      if (visual.type === 'steps' || visual.type === 'rise') {
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('fill', 'currentColor');
        path.setAttribute('d', '');
        visSvg.appendChild(path);
        visRefs.path = path;
      }

      if (visual.type === 'dots') {
        visual.data.forEach((d, i) => {
          if (d == null) return;
          const c = document.createElementNS(svgNS, 'circle');
          c.setAttribute('cx', slotX(i, slots).toString());
          c.setAttribute('cy', VIS_Y.toString());
          c.setAttribute('r', '0');
          c.setAttribute('fill', 'currentColor');
          visSvg.appendChild(c);
          visRefs.dots[i] = c;
        });
      }

      if (visual.type === 'blocks') {
        visual.data.forEach((b, i) => {
          const rect = document.createElementNS(svgNS, 'rect');
          rect.setAttribute('x', (TRACK_X0 + clamp01(b[0]) * TRACK_W).toFixed(2));
          rect.setAttribute('y', (VIS_Y - 4.5).toString());
          rect.setAttribute('width', '0');
          rect.setAttribute('height', '9');
          rect.setAttribute('fill', 'currentColor');
          visSvg.appendChild(rect);
          visRefs.blocks.push(rect);
        });
      }

      visWrap.appendChild(visSvg);
      face.appendChild(visWrap);

      if (visual.labels) {
        const l0 = document.createElement('span');
        l0.className = 'lsdt-lab';
        l0.style.left = u(PAD - 1.0);
        l0.textContent = visual.labels[0];
        face.appendChild(l0);

        const l1 = document.createElement('span');
        l1.className = 'lsdt-lab';
        l1.style.right = u(PAD - 1.0);
        l1.textContent = visual.labels[1];
        face.appendChild(l1);
      }
    }

    tile.appendChild(face);

    // Title fit logic
    function fitTitle() {
      h3.style.setProperty('--fit', '1');
      const avail = tile.clientWidth * ((TW - PAD * 2 + 6) / TW);
      const w = h3.scrollWidth;
      if (w > avail && w > 0) {
        h3.style.setProperty('--fit', String(Math.max(0.6, avail / w)));
      }
    }
    setTimeout(fitTitle, 20);

    // Engine: rAF animation
    const R = DOT_R / PITCH;
    const N = totalDots;
    const cur = new Float32Array(N);
    const from = new Float32Array(N);
    const to = new Float32Array(N);
    const t0 = new Float32Array(N);
    let shown = '';
    let markerX = 0;
    let lastDraw = -1;
    let lastMarker = -1;
    let lastNow = performance.now();
    let raf = 0;
    let visible = true;
    const replay = replayEvery && replayEvery >= 4000 ? replayEvery : 0;

    const cellIndex = (key) => {
      const r = Math.floor(key / 64);
      const c = key % 64;
      return c < cols && r < rows ? r * cols + c : -1;
    };

    const retarget = (s, now, instant) => {
      shown = s;
      const { on } = layoutText(s);
      const want = new Uint8Array(N);
      on.forEach((key) => {
        const idx = cellIndex(key);
        if (idx >= 0) want[idx] = 1;
      });
      for (let i = 0; i < N; i++) {
        const target = want[i] ? 1 : 0;
        if (to[i] === target) continue;
        const r = Math.floor(i / cols);
        const c = i % cols;
        from[i] = cur[i];
        to[i] = target;
        t0[i] = instant ? -1e9 : now + c * 6 + r * 9 + hash(i, index) * 26;
      }
    };

    const writeDots = (now) => {
      let busy = false;
      for (let i = 0; i < N; i++) {
        if (cur[i] === to[i] && t0[i] < now) continue;
        const dur = to[i] > from[i] ? POP_IN_MS : POP_OUT_MS;
        const p = clamp01((now - t0[i]) / dur);
        const e = to[i] > from[i] ? easeOutBack(p) : easeInQuad(p);
        const v = p >= 1 ? to[i] : from[i] + (to[i] - from[i]) * e;
        if (p < 1) busy = true;
        if (v !== cur[i] || p >= 1) {
          cur[i] = v;
          if (dotEls[i]) dotEls[i].setAttribute('r', Math.max(0, v * R).toFixed(4));
        }
      }
      return busy;
    };

    const targetString = (phase, cycleOn) => {
      const blank = ' '.repeat(parsed.text.length);
      if (cycleOn) return blank;
      if (parsed.kind === 'text') return parsed.text;
      if (phase < COUNT_MS) {
        const steps = Math.max(6, Math.round(COUNT_MS / 105));
        const q = Math.floor((phase / COUNT_MS) * steps) / steps;
        const unitStep = parsed.kind === 'num' ? Math.pow(10, -parsed.dec) : 1;
        const n = Math.round((parsed.n * easeOutCubic(q)) / unitStep) * unitStep;
        return formatValue(parsed, n).padStart(parsed.text.length, ' ');
      }
      if (jitter > 0) {
        const period = 2600 + ((index * 733) % 1500);
        const k = Math.floor((phase - COUNT_MS - 900) / period);
        if (k >= 0) {
          const span = Math.round(jitter);
          const off = Math.floor(hash(index + 17, k) * (span * 2 + 1)) - span;
          const unitStep = parsed.kind === 'num' ? Math.pow(10, -parsed.dec) : 1;
          return formatValue(parsed, parsed.n + off * unitStep);
        }
      }
      return parsed.text;
    };

    const start = performance.now() + delay;

    const frame = (nowArg) => {
      raf = 0;
      const now = typeof nowArg === 'number' ? nowArg : performance.now();
      const dt = Math.min(100, Math.max(0, now - lastNow));
      lastNow = now;
      const t = now - start;
      let phase = t;
      let out = false;
      let draw = 0;
      if (t >= 0 && replay) {
        phase = t % replay;
        out = phase > replay - OUT_MS;
      }
      if (t < 0) draw = 0;
      else if (out) draw = 1 - easeInOutCubic(clamp01((phase - (replay - OUT_MS)) / (OUT_MS * 0.85)));
      else draw = clamp01(phase / DRAW_MS);

      const s = t < 0 ? ' '.repeat(parsed.text.length) : targetString(phase, out);
      if (s !== shown) retarget(s, now, false);
      const busy = writeDots(now);

      if (visual) {
        let target = 0;
        if (visual.type === 'slider') {
          const intro = out ? 0 : easeInOutCubic(clamp01((phase - 120) / 1150));
          target = t < 0 ? 0 : clamp01(visual.value) * (out ? draw : intro);
          const introRunning = !out && phase < 1300;
          if (introRunning || out) markerX = target;
          else markerX += (target - markerX) * (1 - Math.exp(-dt / 110));
          if (Math.abs(target - markerX) < 0.0005) markerX = target;
        }
        if (draw !== lastDraw || markerX !== lastMarker) {
          updateVisual(visual, visRefs, draw, markerX);
          lastDraw = draw;
          lastMarker = markerX;
        }
      }

      const settled = t > COUNT_MS + DRAW_MS && !busy && !replay && !(jitter > 0) && !(visual && visual.type === 'slider' && markerX !== clamp01(visual.value));
      if (visible && !settled) {
        raf = requestAnimationFrame(frame);
      }
    };

    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };

    if (typeof window !== 'undefined' && window.IntersectionObserver) {
      const io = new window.IntersectionObserver((entries) => {
        visible = entries[entries.length - 1].isIntersecting && document.visibilityState !== 'hidden';
        if (visible) kick();
      });
      io.observe(tile);
    }

    document.addEventListener('visibilitychange', () => {
      visible = document.visibilityState !== 'hidden';
      if (visible) kick();
    });

    frame(performance.now());
    return tile;
  }

  // --- Public Mount Function ---
  window.mountDotTiles = function (containerSelector, customTiles) {
    const container = typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;

    if (!container || container.querySelector('.metric-card')) return;

    const defaultTiles = [
      {
        title: "B.Tech",
        value: "CS & DESIGN",
      },
      {
        title: "Projects",
        value: 3,
        unit: "+",
      },
      {
        title: "Leadership",
        value: 5,
        unit: "+",
      },
      {
        title: "CGPA",
        value: "7.8",
        unit: "/10",
      },
    ];

    const tilesData = customTiles || defaultTiles;
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'lsdt-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    grid.style.gap = '14px';

    tilesData.forEach((tileData, i) => {
      const tileEl = createTile(tileData, i, `dt_${i}_`);
      grid.appendChild(tileEl);
    });

    container.appendChild(grid);
  };
})();
