/* ============================================================
   PORTFOLIO — Main Script v3
   Native Canvas 2D particles, hidden nav, accordions, email modal
   NO external dependencies
   ============================================================ */

(function () {
  'use strict';

  const htmlEl = document.documentElement;

  // ——————————————————————————————————————————————
  // 1. FLOW FIELD WITH PARTICLE TRAILS (Verified Authored Source)
  // ——————————————————————————————————————————————

  // Simplex Noise (compact implementation based on Stefan Gustavson)
  const SimplexNoise = (function() {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const F3 = 1 / 3;
    const G3 = 1 / 6;

    const grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];

    function SimplexNoise(seed) {
      this.perm = new Uint8Array(512);
      this.permMod12 = new Uint8Array(512);
      const p = new Uint8Array(256);
      seed = seed || Math.random() * 65536;
      for (let i = 0; i < 256; i++) p[i] = i;
      for (let i = 255; i > 0; i--) {
        seed = (seed * 16807 + 0) % 2147483647;
        const j = seed % (i + 1);
        const tmp = p[i];
        p[i] = p[j];
        p[j] = tmp;
      }
      for (let i = 0; i < 512; i++) {
        this.perm[i] = p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
      }
    }

    SimplexNoise.prototype.noise2D = function(xin, yin) {
      const perm = this.perm, permMod12 = this.permMod12;
      let n0, n1, n2;
      const s = (xin + yin) * F2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const t = (i + j) * G2;
      const X0 = i - t, Y0 = j - t;
      const x0 = xin - X0, y0 = yin - Y0;
      let i1, j1;
      if (x0 > y0) { i1 = 1; j1 = 0; }
      else { i1 = 0; j1 = 1; }
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
      const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255;
      let t0 = 0.5 - x0*x0 - y0*y0;
      if (t0 < 0) n0 = 0;
      else { t0 *= t0; const gi = permMod12[ii + perm[jj]]; n0 = t0 * t0 * (grad3[gi][0]*x0 + grad3[gi][1]*y0); }
      let t1 = 0.5 - x1*x1 - y1*y1;
      if (t1 < 0) n1 = 0;
      else { t1 *= t1; const gi = permMod12[ii + i1 + perm[jj + j1]]; n1 = t1 * t1 * (grad3[gi][0]*x1 + grad3[gi][1]*y1); }
      let t2 = 0.5 - x2*x2 - y2*y2;
      if (t2 < 0) n2 = 0;
      else { t2 *= t2; const gi = permMod12[ii + 1 + perm[jj + 1]]; n2 = t2 * t2 * (grad3[gi][0]*x2 + grad3[gi][1]*y2); }
      return 70 * (n0 + n1 + n2);
    };

    SimplexNoise.prototype.noise3D = function(xin, yin, zin) {
      const perm = this.perm, permMod12 = this.permMod12;
      let n0, n1, n2, n3;
      const s = (xin + yin + zin) * F3;
      const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
      const t = (i + j + k) * G3;
      const X0 = i - t, Y0 = j - t, Z0 = k - t;
      const x0 = xin - X0, y0 = yin - Y0, z0 = zin - Z0;
      let i1, j1, k1, i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; }
        else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; }
        else { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; }
      } else {
        if (y0 < z0) { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; }
        else if (x0 < z0) { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; }
        else { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; }
      }
      const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2*G3, y2 = y0 - j2 + 2*G3, z2 = z0 - k2 + 2*G3;
      const x3 = x0 - 1 + 3*G3, y3 = y0 - 1 + 3*G3, z3 = z0 - 1 + 3*G3;
      const ii = i & 255, jj = j & 255, kk = k & 255;
      let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
      if (t0 < 0) n0 = 0;
      else { t0 *= t0; const gi = permMod12[ii+perm[jj+perm[kk]]]; n0 = t0*t0*(grad3[gi][0]*x0+grad3[gi][1]*y0+grad3[gi][2]*z0); }
      let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
      if (t1 < 0) n1 = 0;
      else { t1 *= t1; const gi = permMod12[ii+i1+perm[jj+j1+perm[kk+k1]]]; n1 = t1*t1*(grad3[gi][0]*x1+grad3[gi][1]*y1+grad3[gi][2]*z1); }
      let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
      if (t2 < 0) n2 = 0;
      else { t2 *= t2; const gi = permMod12[ii+i2+perm[jj+j2+perm[kk+k2]]]; n2 = t2*t2*(grad3[gi][0]*x2+grad3[gi][1]*y2+grad3[gi][2]*z2); }
      let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
      if (t3 < 0) n3 = 0;
      else { t3 *= t3; const gi = permMod12[ii+1+perm[jj+1+perm[kk+1]]]; n3 = t3*t3*(grad3[gi][0]*x3+grad3[gi][1]*y3+grad3[gi][2]*z3); }
      return 32 * (n0 + n1 + n2 + n3);
    };

    return SimplexNoise;
  })();

  function initFlowField() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const noise = new SimplexNoise(42);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W, H;

    function isDarkMode() {
      return htmlEl.getAttribute('data-theme') !== 'light';
    }

    function getBgColor() {
      return isDarkMode() ? '#030704' : '#f6f9f7';
    }

    function getFadeFill() {
      return isDarkMode() ? 'rgba(3, 7, 4, 0.036)' : 'rgba(246, 249, 247, 0.045)';
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Fill with current theme background on resize to avoid flash
      ctx.fillStyle = getBgColor();
      ctx.fillRect(0, 0, W, H);
    }

    window.addEventListener('resize', resize);
    resize();

    // Mouse / pointer tracking
    const mouse = { x: -9999, y: -9999, active: false };
    window.addEventListener('mousemove', function(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });
    window.addEventListener('mouseleave', function() {
      mouse.active = false;
    });
    window.addEventListener('touchmove', function(e) {
      if (e.touches && e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    }, { passive: true });
    window.addEventListener('touchend', function() {
      mouse.active = false;
    });

    // Color space conversion utilities
    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
          case g: h = ((b - r) / d + 2) * 60; break;
          case b: h = ((r - g) / d + 4) * 60; break;
        }
      }
      return [h, s, l];
    }

    function hslToRgb(h, s, l) {
      h = ((h % 360) + 360) % 360;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;
      if (h < 60) { r = c; g = x; }
      else if (h < 120) { r = x; g = c; }
      else if (h < 180) { g = c; b = x; }
      else if (h < 240) { g = x; b = c; }
      else if (h < 300) { r = x; b = c; }
      else { r = c; b = x; }
      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
      };
    }

    // Bespoke Haute Luxury Dark Green & Royal Emerald Palette
    const basePalette = [
      { r: 2,  g: 30,  b: 18  }, // deep velvet cypress black-green
      { r: 4,  g: 50,  b: 30  }, // imperial dark forest
      { r: 6,  g: 74,  b: 46  }, // deep british racing green
      { r: 10, g: 104, b: 64  }, // rich dark emerald jade
      { r: 16, g: 148, b: 92  }, // radiant royal emerald
      { r: 34, g: 198, b: 124 }, // luminous emerald crest
      { r: 76, g: 226, b: 156 }  // silk mint filament highlight
    ];

    // Fixed dark green hue — locked in bespoke emerald/forest spectrum
    let SAT_MULT = 1.6;

    // Precompute HSL with luxury saturation
    const basePaletteHSL = basePalette.map(c => {
      const [h, s, l] = rgbToHsl(c.r, c.g, c.b);
      return { h, s: Math.min(1.0, s * SAT_MULT), l };
    });

    const palette = basePalette.map(() => ({ r: 0, g: 0, b: 0 }));

    function updatePalette(hueShift) {
      const dark = isDarkMode();
      for (let i = 0; i < basePaletteHSL.length; i++) {
        const entry = basePaletteHSL[i];
        // In dark mode: entry.l is calibrated for luminous silk filaments against deep obsidian velvet
        const targetL = dark ? Math.max(0.24, Math.min(0.68, entry.l)) : Math.max(0.22, Math.min(0.38, entry.l * 0.52));
        const targetS = dark ? Math.min(1.0, entry.s * 1.05) : Math.min(1.0, entry.s * 1.25);
        const rgb = hslToRgb(entry.h + hueShift, targetS, targetL);
        palette[i].r = rgb.r;
        palette[i].g = rgb.g;
        palette[i].b = rgb.b;
      }
    }

    // Initialize locked into dark green (0 hue shift)
    updatePalette(0);

    function lerpColor(a, b, t) {
      return {
        r: a.r + (b.r - a.r) * t,
        g: a.g + (b.g - a.g) * t,
        b: a.b + (b.b - a.b) * t
      };
    }

    function getColor(noiseVal) {
      // Map noise [-1,1] to palette index
      const t = (noiseVal + 1) * 0.5; // 0..1
      const idx = t * (palette.length - 1);
      const i = Math.floor(idx);
      const f = idx - i;
      const a = palette[Math.min(i, palette.length - 1)];
      const b = palette[Math.min(i + 1, palette.length - 1)];
      return lerpColor(a, b, f);
    }

    // Particles
    const PARTICLE_COUNT = 2500;
    let NOISE_SCALE = 0.0025;
    let SPEED = 1.0;
    const MOUSE_RADIUS = 150;
    const MOUSE_FORCE = 2.5;

    const particles = [];

    function createParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        speed: 0.4 + Math.random() * 1.0,
        alpha: 0.15 + Math.random() * 0.55,
        size: 0.5 + Math.random() * 1.5
      };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }

    // Animation
    let time = 0;

    function draw() {
      // Fade previous frame with theme-calibrated overlay — creates trailing effect
      ctx.fillStyle = getFadeFill();
      ctx.fillRect(0, 0, W, H);

      time += 0.0008;

      // Fixed Dark Green Hue — subtle micro-undulation for organic silk breathing without color shifting
      const greenBreathing = Math.sin(time * 0.6) * 1.5;
      updatePalette(greenBreathing);

      const dark = isDarkMode();
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];

        // Sample noise field at particle position with time evolution
        const nx = p.x * NOISE_SCALE;
        const ny = p.y * NOISE_SCALE;
        const angle = noise.noise3D(nx, ny, time) * Math.PI * 2;

        // Secondary noise for color variation
        const colorNoise = noise.noise3D(nx * 1.5 + 100, ny * 1.5 + 100, time * 0.5);

        // Velocity from flow field
        let vx = Math.cos(angle) * p.speed * SPEED;
        let vy = Math.sin(angle) * p.speed * SPEED;

        // Mouse interaction — gentle push away
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
            vx += (dx / dist) * force;
            vy += (dy / dist) * force;
          }
        }

        // Store previous position for line drawing
        const px = p.x;
        const py = p.y;

        // Update position
        p.x += vx;
        p.y += vy;

        // Draw particle trail segment
        const color = getColor(colorNoise);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(p.x, p.y);
        const alpha = dark ? p.alpha : Math.min(0.92, p.alpha * 1.35);
        ctx.strokeStyle = 'rgba(' + Math.round(color.r) + ',' + Math.round(color.g) + ',' + Math.round(color.b) + ',' + alpha + ')';
        ctx.lineWidth = dark ? p.size : p.size * 1.1;
        ctx.stroke();

        // Respawn if offscreen
        if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
        }
      }

      requestAnimationFrame(draw);
    }

    // Initial fill with theme-aware background
    ctx.fillStyle = getBgColor();
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);

    // Immediate reaction to theme toggle
    window.addEventListener('themechange', function(e) {
      if (e.detail && e.detail.theme) {
        ctx.fillStyle = getBgColor();
        ctx.fillRect(0, 0, W, H);
        updatePalette(0);
      }
    });

    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'param') {
        switch (e.data.name) {
          case 'SPEED': SPEED = e.data.value; break;
          case 'NOISE_SCALE': NOISE_SCALE = e.data.value; break;
          case 'HUE_SPEED': HUE_SPEED = e.data.value; break;
          case 'SATURATION':
            SAT_MULT = e.data.value;
            for (let i = 0; i < basePalette.length; i++) {
              const [h, s, l] = rgbToHsl(basePalette[i].r, basePalette[i].g, basePalette[i].b);
              basePaletteHSL[i] = { h, s: Math.min(1.0, s * SAT_MULT), l };
            }
            updatePalette(currentHue);
            break;
        }
      }
    });

    console.log('Flow field background initialized');
  }

  // ——————————————————————————————————————————————
  // 2. APPLE-STYLE LIQUID GLASS THEME SWITCH (Native Spring Physics)
  // ——————————————————————————————————————————————

  function initAppleSwitch() {
    const switchBtn = document.getElementById('theme-toggle');
    if (!switchBtn) return;

    const glowEl = switchBtn.querySelector('.apple-switch-glow');
    const trackOnEl = switchBtn.querySelector('.apple-switch-track-on');
    const liquidEl = switchBtn.querySelector('.apple-switch-liquid');
    const thumbEl = switchBtn.querySelector('.apple-switch-thumb');

    // Metrics matching AppleSwitch React component
    const metrics = {
      trackX: 60,
      trackY: 30,
      thumbX: 30,
      thumbY: 22,
      padding: 4,
    };

    const thumbTravel = metrics.trackX - metrics.thumbX - metrics.padding * 2; // 22px

    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);
    let isChecked = savedTheme === 'dark';

    // State variables for physics
    let targetX = isChecked ? thumbTravel : 0;
    let currentX = targetX;
    let velX = 0;

    let targetGrab = 0;
    let currentGrab = 0;
    let velGrab = 0;

    // Spring constants matching React component:
    // thumbSpring: { stiffness: 700, damping: 48, mass: 0.55 }
    const kThumb = 700;
    const dThumb = 48;
    const mThumb = 0.55;

    // grabSpring: { stiffness: 500, damping: 25 }
    const kGrab = 500;
    const dGrab = 25;
    const mGrab = 1.0;

    let isDragging = false;
    let activePointerId = null;
    let dragStartX = 0;
    let dragStartThumbX = 0;
    let suppressNextClick = false;
    let isAnimating = false;

    function updateVisuals() {
      const extraWidth = currentGrab * (metrics.padding * 4.5);
      const extraHeight = currentGrab * (metrics.padding * 2.3);

      const w = metrics.thumbX + extraWidth;
      const h = metrics.thumbY + extraHeight;
      const offsetLeft = metrics.padding + currentX - extraWidth / 2;

      if (thumbEl) {
        thumbEl.style.width = w + 'px';
        thumbEl.style.height = h + 'px';
        thumbEl.style.transform = `translate3d(${offsetLeft}px, -50%, 0)`;
        thumbEl.style.opacity = String(1 - currentGrab * 0.35);
      }

      if (liquidEl) {
        const liquidScale = 0.82 + currentGrab * 0.26;
        liquidEl.style.width = w + 'px';
        liquidEl.style.height = h + 'px';
        liquidEl.style.transform = `translate3d(${offsetLeft}px, -50%, 0) scale(${liquidScale})`;
        liquidEl.style.opacity = String(currentGrab * 0.76);
      }

      const progress = Math.max(0, Math.min(1, currentX / thumbTravel));
      if (trackOnEl) {
        trackOnEl.style.opacity = String(progress);
      }

      if (glowEl) {
        glowEl.style.opacity = String(progress * 0.22);
        glowEl.style.transform = `scale(${0.85 + progress * 0.15})`;
      }
    }

    function tickSprings(dt) {
      const fThumb = -kThumb * (currentX - targetX) - dThumb * velX;
      const aThumb = fThumb / mThumb;
      velX += aThumb * dt;
      currentX += velX * dt;

      const fGrab = -kGrab * (currentGrab - targetGrab) - dGrab * velGrab;
      const aGrab = fGrab / mGrab;
      velGrab += aGrab * dt;
      currentGrab += velGrab * dt;

      currentGrab = Math.max(0, Math.min(1, currentGrab));

      const settledThumb = Math.abs(currentX - targetX) < 0.1 && Math.abs(velX) < 0.1;
      const settledGrab = Math.abs(currentGrab - targetGrab) < 0.005 && Math.abs(velGrab) < 0.005;

      if (settledThumb && settledGrab && !isDragging) {
        currentX = targetX;
        velX = 0;
        currentGrab = targetGrab;
        velGrab = 0;
        updateVisuals();
        isAnimating = false;
        return;
      }

      updateVisuals();
      requestAnimationFrame(loop);
    }

    let lastTime = performance.now();
    function loop(now) {
      if (!isAnimating) return;
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;
      tickSprings(dt);
    }

    function startAnimation() {
      if (!isAnimating) {
        isAnimating = true;
        lastTime = performance.now();
        requestAnimationFrame(loop);
      }
    }

    function setChecked(next, animate = true) {
      isChecked = next;
      const newTheme = isChecked ? 'dark' : 'light';
      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('portfolio-theme', newTheme);
      switchBtn.setAttribute('aria-checked', String(isChecked));

      targetX = isChecked ? thumbTravel : 0;
      if (animate) {
        startAnimation();
      } else {
        currentX = targetX;
        velX = 0;
        updateVisuals();
      }

      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
    }

    switchBtn.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      switchBtn.setPointerCapture(e.pointerId);
      activePointerId = e.pointerId;
      targetGrab = 1;
      dragStartX = e.clientX;
      dragStartThumbX = currentX;
      targetX = dragStartThumbX;
      isDragging = false;
      startAnimation();
    });

    switchBtn.addEventListener('pointermove', (e) => {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      const deltaX = e.clientX - dragStartX;
      if (Math.abs(deltaX) > 3) {
        isDragging = true;
      }
      if (!isDragging) return;
      e.preventDefault();
      const nextX = Math.max(0, Math.min(thumbTravel, dragStartThumbX + deltaX));
      targetX = nextX;
      currentX = nextX;
      velX = 0;
      startAnimation();
    });

    switchBtn.addEventListener('pointerup', (e) => {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      if (switchBtn.hasPointerCapture(e.pointerId)) {
        switchBtn.releasePointerCapture(e.pointerId);
      }
      activePointerId = null;
      targetGrab = 0;

      if (isDragging) {
        isDragging = false;
        suppressNextClick = true;
        setChecked(currentX >= thumbTravel / 2);
      }
      startAnimation();
    });

    switchBtn.addEventListener('pointercancel', () => {
      activePointerId = null;
      isDragging = false;
      targetGrab = 0;
      targetX = isChecked ? thumbTravel : 0;
      startAnimation();
    });

    switchBtn.addEventListener('click', (e) => {
      if (suppressNextClick) {
        suppressNextClick = false;
        e.preventDefault();
        return;
      }
      setChecked(!isChecked);
    });

    window.addEventListener('pointerup', () => {
      if (activePointerId !== null) {
        activePointerId = null;
        targetGrab = 0;
        if (isDragging) {
          isDragging = false;
          suppressNextClick = true;
          setChecked(currentX >= thumbTravel / 2);
        }
        startAnimation();
      }
    });

    // Initial state setup
    currentX = isChecked ? thumbTravel : 0;
    targetX = currentX;
    switchBtn.setAttribute('aria-checked', String(isChecked));
    updateVisuals();
  }

  // ——————————————————————————————————————————————
  // 3. HERO ANIMATION
  // ——————————————————————————————————————————————

  function animateHero() {
    const name = document.querySelector('.hero-name');

    if (name) {
      setTimeout(() => {
        name.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
        name.style.opacity = '1';
        name.style.transform = 'translateY(0)';
      }, 300);
    }
  }

  // ——————————————————————————————————————————————
  // 4. SCROLL REVEAL (Intersection Observer)
  // ——————————————————————————————————————————————

  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  // ——————————————————————————————————————————————
  // 5. HIDDEN NAV — Reveals on scroll past hero or mouse near top
  // ——————————————————————————————————————————————

  function initNav() {
    const nav = document.getElementById('main-nav');
    const hero = document.getElementById('hero');
    let navVisible = false;
    let mouseNearTop = false;

    function updateNav() {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      const scrolledPastHero = window.scrollY > heroBottom - 100;

      if (scrolledPastHero || mouseNearTop) {
        if (!navVisible) {
          nav.classList.add('nav-visible');
          navVisible = true;
        }
      } else {
        if (navVisible && !mouseNearTop) {
          nav.classList.remove('nav-visible');
          navVisible = false;
        }
      }
    }

    window.addEventListener('scroll', updateNav);

    document.addEventListener('mousemove', (e) => {
      mouseNearTop = e.clientY < 60;
      updateNav();
    });

    updateNav();
  }

  // ——————————————————————————————————————————————
  // 6. SMOOTH SCROLL (LENIS INTEGRATED)
  // ——————————————————————————————————————————————

  function initSmoothScroll() {
    // Dedicated scroll-to-top for the logo
    const logo = document.querySelector('.nav-logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.lenis) {
          window.lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        const fluidNav = document.getElementById('fluid-nav');
        if (fluidNav) fluidNav.classList.remove('is-open');
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        // Close fluid menu if open
        const fluidNav = document.getElementById('fluid-nav');
        if (fluidNav) fluidNav.classList.remove('is-open');

        // Scroll to top for hero or logo
        if (href === '#hero' || anchor.classList.contains('nav-logo')) {
          e.preventDefault();
          if (window.lenis) {
            window.lenis.scrollTo(0, { duration: 1.2 });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          return;
        }

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navHeight = 70;
          if (window.lenis) {
            window.lenis.scrollTo(target, { offset: -navHeight, duration: 1.2 });
          } else {
            const targetPosition = target.offsetTop - navHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
          }
        }
      });
    });
  }

  // ——————————————————————————————————————————————
  // 7. FLUID NAVIGATION MENU (Left to Toggle)
  // ——————————————————————————————————————————————

  function initFluidMenu() {
    const fluidNav = document.getElementById('fluid-nav');
    const trigger = document.getElementById('fluid-menu-btn');
    const dropdown = document.getElementById('fluid-menu-dropdown');
    if (!fluidNav || !trigger || !dropdown) return;

    function openMenu() {
      fluidNav.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      fluidNav.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
      if (fluidNav.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    // Close when clicking an item inside dropdown
    dropdown.querySelectorAll('.fluid-menu-item').forEach((item) => {
      item.addEventListener('click', () => {
        closeMenu();
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (fluidNav.classList.contains('is-open') && !fluidNav.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && fluidNav.classList.contains('is-open')) {
        closeMenu();
        trigger.focus();
      }
    });

    // Close menu when user scrolls
    window.addEventListener('scroll', () => {
      if (fluidNav.classList.contains('is-open')) {
        closeMenu();
      }
    }, { passive: true });
  }

  function initMobileNav() {
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // ——————————————————————————————————————————————
  // 8. ACCORDIONS — Education & Experience
  // ——————————————————————————————————————————————

  function initAccordions() {
    const items = document.querySelectorAll('.accordion-item');

    items.forEach((item) => {
      const header = item.querySelector('.accordion-header');
      if (!header) return;

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close sibling items in the same list
        const parent = item.closest('.accordion-list');
        if (parent) {
          parent.querySelectorAll('.accordion-item').forEach((sibling) => {
            if (sibling !== item) {
              sibling.classList.remove('active');
              const sibHeader = sibling.querySelector('.accordion-header');
              if (sibHeader) sibHeader.setAttribute('aria-expanded', 'false');
              const sibBody = sibling.querySelector('.accordion-body');
              if (sibBody) sibBody.style.maxHeight = null;
            }
          });
        }

        // Toggle current item
        if (!isActive) {
          item.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
          const body = item.querySelector('.accordion-body');
          if (body) {
            body.style.maxHeight = body.scrollHeight + 'px';
          }
        } else {
          item.classList.remove('active');
          header.setAttribute('aria-expanded', 'false');
          const body = item.querySelector('.accordion-body');
          if (body) {
            body.style.maxHeight = null;
          }
        }
      });
    });
  }

  // ——————————————————————————————————————————————
  // 9. EMAIL MODAL
  // ——————————————————————————————————————————————

  function initEmailModal() {
    const btn = document.getElementById('email-btn');
    const modal = document.getElementById('email-modal');
    const closeBtn = document.getElementById('email-modal-close');
    const copyBtn = document.getElementById('email-copy');
    const emailAddress = document.getElementById('email-address');

    function openModal() {
      modal.classList.add('active');
      window.lenis?.stop();
    }

    function closeModal() {
      modal.classList.remove('active');
      window.lenis?.start();
    }

    btn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(emailAddress.textContent).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy to clipboard';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  // ——————————————————————————————————————————————
  // 10. LENIS SMOOTH INERTIA SCROLLING
  // ——————————————————————————————————————————————

  let lenisInstance = null;

  function initLenis() {
    if (typeof Lenis === 'undefined') return;

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    window.lenis = lenisInstance;

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenisInstance.on('scroll', (e) => {
      scrollY = e.scroll;
    });

    console.log('Lenis smooth inertia scrolling initialized');
  }

  // ——————————————————————————————————————————————
  // ——————————————————————————————————————————————
  // 11. ABOUT METRIC CARDS — Standard Font Bento Counter
  // ——————————————————————————————————————————————

  function initMetricCards() {
    const statsContainer = document.getElementById('about-stats');
    if (!statsContainer) return;

    const numberElements = statsContainer.querySelectorAll('.metric-number');
    if (!numberElements.length) return;

    let animated = false;

    function runCounters() {
      if (animated) return;
      animated = true;

      numberElements.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const duration = 1200; // ms
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutCubic
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = target * ease;

          el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current);

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
          }
        }

        requestAnimationFrame(update);
      });
    }

    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounters();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      observer.observe(statsContainer);
    } else {
      runCounters();
    }
  }

  // ——————————————————————————————————————————————
  // 12. EVENT LISTENERS
  // ——————————————————————————————————————————————

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  // ——————————————————————————————————————————————
  // INIT
  // ——————————————————————————————————————————————

  document.addEventListener('DOMContentLoaded', () => {
    initAppleSwitch();
    initLenis();
    initFlowField();
    initFluidMenu();
    initMetricCards();
    animateHero();
    initScrollReveal();
    initNav();
    initSmoothScroll();
    initMobileNav();
    initAccordions();
    initEmailModal();
  });
})();