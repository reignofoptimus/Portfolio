/**
 * Nimbus UI · Liquid Accordion ("Spillway")
 * Vanilla JS implementation with WebGL Waterline fluid physics
 * Ported for Portfolio 2.0
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LiquidAccordion = factory();
    root.mountLiquidAccordion = root.LiquidAccordion.mount;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PAD = 14;
  const R = 20;

  const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

  const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uCard;
uniform vec4 uBox[2];uniform float uBoxR[2];uniform vec4 uSat[4];uniform vec4 uRip[6];uniform vec3 uMouse;uniform vec3 uFront;
uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;
for(int i=0;i<2;i++){vec4 B=uBox[i];if(B.z>.5){vec2 q=p;
if(i==int(uFront.z)){float f=exp(-pow(q.y-uFront.x,2.)/260.);q.y+=f*uFront.y*(sin(q.x*.075+uTime*6.)+.5*sin(q.x*.19-uTime*4.3));}
d=smin(d,sdRB(q-B.xy,B.zw,uBoxR[i]),13.);}}
for(int i=0;i<4;i++){vec4 S=uSat[i];if(S.z>.5){d=smin(d,length(p-S.xy)-S.z,13.);}}
return d;}
float cardD(vec2 p){vec2 h=uCard.zw*.5;return sdRB(p-uCard.xy-h,h,28.);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1400.);
w+=uAmb*(sin(p.x*.04+p.y*.02+uTime*1.1)*.45+sin(p.x*.11-uTime*.8+p.y*.13)*.25);return w;}
float H(vec2 p){float dc=cardD(p);return lens(dc,18.)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,9.,-dc);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
float dp=cardD(p);if(dp>16.){gl_FragColor=vec4(0.);return;}
float dd=dropD(p);
float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
vec3 V=vec3(0.,0.,1.);
float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
float fres=clamp((1.-n.z)*4.,0.,1.);
vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+p.y*.0015+uTime*.035));
float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
vec3 c=vec3(0.,.14,.36)*sh;float a=sh;
float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
float th=lens(dd,11.);
float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
vec3 tint=mix(vec3(.80,.95,1.),vec3(.55,.82,1.),uDark);
float rim=dm*(1.-smoothstep(0.,8.,-dd));
float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
float body=.5+.5*clamp(-n.y*3.,-1.,1.);
float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
float la=rim*.22;vec3 lc=mix(vec3(0.,.42,.78),vec3(.1,.55,.95),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
c=dc+c*(1.-da);a=da+a*(1.-da);
gl_FragColor=vec4(c,a);
}`;

  const box = () => ({ x: 0, y: 0, w: 0, h: 0, vx: 0, vy: 0, vw: 0, vh: 0 });

  function makeState() {
    return {
      a: box(),
      b: box(),
      lead: 0,
      lagUntil: 0,
      sats: [],
      rips: [],
      mouse: { x: 0, y: 0, s: 0, on: false },
      open: null,
      lastIdx: 0,
      moving: false,
      split: false,
      ready: false,
      w: 0,
      h: 0,
      ch: 0,
      visible: true,
      reduce: false,
      raf: 0,
      last: 0,
      time: 0,
      glc: null,
    };
  }

  function initGL(canvas) {
    let gl = null;
    try {
      gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false }) ||
           canvas.getContext('experimental-webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    } catch (e) {
      return null;
    }
    if (!gl) return null;

    const sh = (type, src) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('Shader compile error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    const p = gl.createProgram();
    if (!vs || !fs || !p) return null;

    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(p));
      return null;
    }

    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(p, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {};
    const uniformNames = [
      'uRes', 'uDpr', 'uTime', 'uCard', 'uBox', 'uBoxR',
      'uSat', 'uRip', 'uMouse', 'uFront', 'uDark', 'uAmb'
    ];
    for (const n of uniformNames) {
      u[n] = gl.getUniformLocation(p, n);
    }

    return { gl, u };
  }

  function createAudioHelper() {
    let audioCtx = null;
    return function plip() {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!audioCtx) audioCtx = new AC();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const t = audioCtx.currentTime;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(420 + Math.random() * 80, t);
        o.frequency.exponentialRampToValueAtTime(1500, t + 0.07);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g).connect(audioCtx.destination);
        o.start(t);
        o.stop(t + 0.18);
      } catch (err) {
        // audio optional
      }
    };
  }

  function mount(container, options) {
    options = options || {};
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;

    const config = Object.assign({
      items: null,
      defaultOpen: 0,
      collapsible: true,
      tone: 'auto',
      sound: true,
      headingLevel: 3,
    }, options);

    function getTone() {
      if (config.tone !== 'auto') return config.tone;
      if (typeof document !== 'undefined') {
        return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      }
      return 'dark';
    }

    // Collect items: either from config.items or parse existing DOM
    let items = config.items;
    if (!items || !items.length) {
      items = [];
      const itemEls = el.querySelectorAll('.accordion-item');
      itemEls.forEach((it, i) => {
        const headerContent = it.querySelector('.accordion-header-content');
        const body = it.querySelector('.accordion-body');
        items.push({
          id: 'item-' + i,
          question: headerContent ? headerContent.innerHTML : (it.querySelector('.accordion-title')?.textContent || 'Item ' + (i + 1)),
          answer: body ? body.innerHTML : '',
        });
      });
    }

    if (!items.length) return null;

    // Build DOM structure
    el.innerHTML = '';
    el.classList.add('nimbus-faq');
    el.setAttribute('data-tone', getTone());
    el.setAttribute('data-gl', 'on');

    const glassSpan = document.createElement('span');
    glassSpan.className = 'nf-glass';
    glassSpan.setAttribute('aria-hidden', 'true');
    el.appendChild(glassSpan);

    const canvas = document.createElement('canvas');
    canvas.className = 'nf-water';
    canvas.setAttribute('aria-hidden', 'true');
    el.appendChild(canvas);

    const poolFallback = document.createElement('span');
    poolFallback.className = 'nf-pool';
    poolFallback.setAttribute('aria-hidden', 'true');
    el.appendChild(poolFallback);

    const itemEls = [];
    const btnEls = [];
    const iconEls = [];

    const uid = 'nf-' + Math.random().toString(36).slice(2, 9);
    const H = 'h' + config.headingLevel;

    items.forEach((it, i) => {
      const baseId = uid + '-' + (it.id || i);
      const itemDiv = document.createElement('div');
      itemDiv.className = 'nf-item';
      itemDiv.setAttribute('data-open', 'false');

      const hEl = document.createElement(H);
      hEl.className = 'nf-h';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = baseId + '-q';
      btn.className = 'nf-q';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', baseId + '-a');

      const qt = document.createElement('div');
      qt.className = 'nf-qt';
      qt.innerHTML = it.question;

      const ico = document.createElement('span');
      ico.className = 'nf-ico';
      ico.setAttribute('aria-hidden', 'true');

      btn.appendChild(qt);
      btn.appendChild(ico);
      hEl.appendChild(btn);
      itemDiv.appendChild(hEl);

      const panel = document.createElement('div');
      panel.className = 'nf-panel';
      panel.id = baseId + '-a';
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', baseId + '-q');

      const inner = document.createElement('div');
      inner.className = 'nf-inner';

      const aContent = document.createElement('div');
      aContent.className = 'nf-a';
      aContent.innerHTML = it.answer;

      inner.appendChild(aContent);
      panel.appendChild(inner);
      itemDiv.appendChild(panel);

      el.appendChild(itemDiv);

      itemEls.push(itemDiv);
      btnEls.push(btn);
      iconEls.push(ico);
    });

    const st = makeState();
    st.reduce = !!(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    st.glc = initGL(canvas);
    if (!st.glc) el.setAttribute('data-gl', 'off');

    const playPlip = config.sound ? createAudioHelper() : () => {};

    function getTarget() {
      if (st.open !== null) {
        const targetEl = itemEls[st.open];
        if (!targetEl) return null;
        return {
          x: PAD + st.w / 2,
          y: PAD + targetEl.offsetTop + targetEl.offsetHeight / 2,
          w: st.w / 2 - 8,
          h: Math.max(4, targetEl.offsetHeight / 2 - 1)
        };
      }
      const ic = iconEls[st.lastIdx];
      if (!ic) return null;
      const r = el.getBoundingClientRect();
      const b = ic.getBoundingClientRect();
      return {
        x: PAD + b.left - r.left + b.width / 2,
        y: PAD + b.top - r.top + b.height / 2,
        w: 0,
        h: 0
      };
    }

    function draw() {
      const head = st.lead === 0 ? st.a : st.b;
      const tail = st.lead === 0 ? st.b : st.a;
      const gap = Math.abs(head.y - tail.y) - (head.h + tail.h);
      const thin = Math.max(0, Math.min(1, (gap + 80) / 70));

      const shape = (B, k) => {
        const w = B.w * (1 - k * thin);
        const h = B.h;
        const r = Math.max(0, Math.min(R + (Math.min(w, h) - R) * thin, w, h));
        return { w, h, r };
      };

      const hs = shape(head, 0.22);
      const ts = shape(tail, 0.5);

      if (st.glc) {
        const { gl: c, u } = st.glc;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

        c.viewport(0, 0, c.drawingBufferWidth, c.drawingBufferHeight);
        c.uniform2f(u.uRes, st.w + PAD * 2, st.ch);
        c.uniform1f(u.uDpr, dpr);
        c.uniform1f(u.uTime, st.time);
        c.uniform4f(u.uCard, PAD, PAD, st.w, st.h);

        const on = (B) => B.w > 1 && B.h > 1;
        c.uniform4fv(u.uBox, new Float32Array([
          head.x, head.y, on(hs) ? hs.w : 0, hs.h,
          tail.x, tail.y, on(ts) ? ts.w : 0, ts.h,
        ]));
        c.uniform1fv(u.uBoxR, new Float32Array([hs.r, ts.r]));

        const sats = new Float32Array(16);
        st.sats.slice(0, 4).forEach((d, i) => sats.set([d.x, d.y, d.r, 0], i * 4));
        c.uniform4fv(u.uSat, sats);

        const rips = new Float32Array(24);
        st.rips.slice(-6).forEach((p, i) => rips.set([p.x, p.y, p.age, p.amp], i * 4));
        c.uniform4fv(u.uRip, rips);

        c.uniform3f(u.uMouse, st.mouse.x, st.mouse.y, st.mouse.s);
        c.uniform3f(u.uFront, head.y + head.h, st.reduce ? 0 : Math.min(Math.abs(head.vh) * 0.012, 4.5), 0);
        c.uniform1f(u.uDark, getTone() === 'dark' ? 1 : 0);
        c.uniform1f(u.uAmb, st.reduce ? 0 : 1);

        c.clearColor(0, 0, 0, 0);
        c.clear(c.COLOR_BUFFER_BIT);
        c.drawArrays(c.TRIANGLES, 0, 3);
      } else if (poolFallback) {
        const T = getTarget();
        if (st.open !== null && T) {
          poolFallback.style.opacity = '1';
          poolFallback.style.height = `${T.h * 2}px`;
          poolFallback.style.transform = `translateY(${T.y - T.h - PAD}px)`;
        } else {
          poolFallback.style.opacity = '0';
        }
      }
    }

    function step(dt, now) {
      st.time += dt;
      const T = getTarget();
      let still = true;

      if (T) {
        const bodies = [st.a, st.b];
        if (st.reduce) {
          for (const B of bodies) Object.assign(B, T, { vx: 0, vy: 0, vw: 0, vh: 0 });
          st.sats = [];
        } else {
          bodies.forEach((B, i) => {
            const lead = i === st.lead;
            const k = lead ? 210 : 60;
            const c = lead ? 25 : 13;
            const f = !lead && now < st.lagUntil ? 0.04 : 1;
            const kh = lead ? 260 : 90;

            B.vx += (k * (T.x - B.x) - c * B.vx) * dt * f;
            B.vy += (k * (T.y - B.y) - c * B.vy) * dt * f;
            B.vw += (k * (T.w - B.w) - c * B.vw) * dt * f;
            B.vh += (kh * (T.h - B.h) - (lead ? 22 : 14) * B.vh) * dt * f;

            B.x += B.vx * dt;
            B.y += B.vy * dt;
            B.w += B.vw * dt;
            B.h += B.vh * dt;
            B.w = Math.max(0, B.w);
            B.h = Math.max(0, B.h);

            if (
              Math.abs(T.y - B.y) > 0.3 ||
              Math.abs(T.h - B.h) > 0.3 ||
              Math.abs(T.w - B.w) > 0.3 ||
              Math.abs(B.vy) + Math.abs(B.vh) > 3
            ) {
              still = false;
            }
          });

          // pinch off droplets on long jumps
          const head = bodies[st.lead];
          const tail = bodies[1 - st.lead];
          const gap = Math.abs(head.y - tail.y) - (head.h + tail.h);

          if (!st.split && st.moving && gap > 4 && st.open !== null) {
            st.split = true;
            const top = Math.min(head.y, tail.y) + (head.y < tail.y ? head.h : tail.h);
            [0.25, 0.55, 0.85].forEach((t, j) => {
              st.sats.push({
                x: head.x + (Math.random() - 0.5) * st.w * 0.35,
                y: top + gap * t,
                vx: (Math.random() - 0.5) * 80,
                vy: (head.vy + tail.vy) * 0.4,
                r: 9 - j * 1.5 + Math.random() * 2,
                k: 60 + Math.random() * 80,
              });
            });
          }

          st.sats = st.sats.filter((d) => {
            d.vx += (25 * (head.x - d.x) - 6 * d.vx) * dt;
            d.vy += (d.k * (head.y - d.y) - 9 * d.vy) * dt;
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            if (Math.abs(head.y - d.y) < head.h * 0.85 || head.h < 6) d.r -= dt * 30;
            return d.r > 0.6;
          });

          if (st.sats.length) still = false;
        }

        if (st.moving && still) {
          st.moving = false;
          if (!st.reduce && st.open !== null) {
            st.rips.push({ x: T.x, y: T.y - T.h + 22, age: 0, amp: st.split ? 1.1 : 0.6 });
          }
        }
      }

      st.rips.forEach((p) => (p.age += dt));
      st.rips = st.rips.filter((p) => p.age < 2.4);
      st.mouse.s += ((st.mouse.on ? 1 : 0) - st.mouse.s) * Math.min(1, dt * 7);
    }

    function loop() {
      if (st.raf) return;
      st.last = performance.now();

      const tick = (now) => {
        const dt = Math.min((now - st.last) / 1000, 1 / 30);
        st.last = now;
        step(dt, now);
        draw();

        const busy = st.moving || st.rips.length || st.sats.length || st.mouse.s > 0.01;
        if (st.visible && (!st.reduce || busy)) {
          st.raf = requestAnimationFrame(tick);
        } else {
          st.raf = 0;
        }
      };

      st.raf = requestAnimationFrame(tick);
    }

    function resize() {
      st.w = el.offsetWidth;
      st.h = el.offsetHeight;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        const W = st.w + PAD * 2;
        const Hc = Math.ceil((st.h + PAD * 2) / 96) * 96;
        if (Hc !== st.ch || canvas.width !== Math.round(W * dpr)) {
          st.ch = Hc;
          canvas.width = Math.round(W * dpr);
          canvas.height = Math.round(Hc * dpr);
          canvas.style.width = `${W}px`;
          canvas.style.height = `${Hc}px`;
        }
      }

      if (!st.ready) {
        const T = getTarget();
        if (T) {
          Object.assign(st.a, T);
          Object.assign(st.b, T);
          st.ready = true;
        }
      }
      loop();
    }

    function setOpen(index, userAction) {
      const current = st.open;
      const next = current === index ? (config.collapsible ? null : index) : index;
      if (next === current && st.ready) return;

      if (userAction && next !== null) {
        playPlip();
        const ic = iconEls[index];
        if (ic) {
          ic.removeAttribute('data-fx');
          void ic.offsetWidth;
          ic.setAttribute('data-fx', 'drip');
        }
      }

      const from = current;
      st.open = next;

      // Update DOM states
      itemEls.forEach((itemDiv, idx) => {
        const isOpen = idx === next;
        itemDiv.setAttribute('data-open', isOpen ? 'true' : 'false');
        btnEls[idx].setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      if (next !== null) {
        st.lastIdx = next;
        if (from === null) {
          const ic = iconEls[next];
          if (ic) {
            const r = el.getBoundingClientRect();
            const b = ic.getBoundingClientRect();
            const x = PAD + b.left - r.left + b.width / 2;
            const y = PAD + b.top - r.top + b.height / 2;
            for (const B of [st.a, st.b]) {
              Object.assign(B, { x, y, w: 0, h: 0, vx: 0, vy: 0, vw: 0, vh: 0 });
            }
          }
        }
      }

      const T = getTarget();
      if (T) {
        st.lead = Math.abs(T.y - st.a.y) <= Math.abs(T.y - st.b.y) ? 0 : 1;
      }
      st.lagUntil = performance.now() + (from === null || next === null ? 0 : 120);
      st.moving = true;
      st.split = false;
      loop();
    }

    // Bind item clicks & keyboard navigation
    btnEls.forEach((btn, i) => {
      btn.addEventListener('click', () => setOpen(i, true));

      btn.addEventListener('keydown', (e) => {
        const n = items.length;
        let j = -1;
        if (e.key === 'ArrowDown') j = (i + 1) % n;
        else if (e.key === 'ArrowUp') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = n - 1;
        if (j >= 0) {
          e.preventDefault();
          btnEls[j].focus();
        }
      });
    });

    // Pointer events on container for interactive water wakes & ripples
    const getLocal = (cx, cy) => {
      const r = el.getBoundingClientRect();
      return { x: cx - r.left + PAD, y: cy - r.top + PAD };
    };

    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const p = getLocal(e.clientX, e.clientY);
      st.mouse.x = p.x;
      st.mouse.y = p.y;
      st.mouse.s = 1;
      st.mouse.on = true;
      loop();
    });

    el.addEventListener('pointerleave', () => {
      st.mouse.on = false;
      loop();
    });

    el.addEventListener('pointerdown', (e) => {
      if (st.reduce) return;
      const p = getLocal(e.clientX, e.clientY);
      st.rips.push({ x: p.x, y: p.y, age: 0, amp: 0.7 });
      loop();
    });

    // Observers
    let io = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => {
        st.visible = entry.isIntersecting;
        if (st.visible) loop();
      });
      io.observe(el);
    }

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => resize());
      ro.observe(el);
    }

    // Theme mutation observer
    let to = null;
    if (typeof MutationObserver !== 'undefined') {
      to = new MutationObserver(() => {
        el.setAttribute('data-tone', getTone());
        loop();
      });
      to.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    const onVis = () => {
      st.visible = document.visibilityState === 'visible';
      if (st.visible) loop();
    };
    document.addEventListener('visibilitychange', onVis);

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      st.glc = null;
      el.setAttribute('data-gl', 'off');
    });

    // Initial state
    if (config.defaultOpen !== null && config.defaultOpen !== undefined) {
      setOpen(config.defaultOpen, false);
    }
    resize();

    return {
      setOpen,
      resize,
      destroy() {
        cancelAnimationFrame(st.raf);
        if (io) io.disconnect();
        if (ro) ro.disconnect();
        if (to) to.disconnect();
        document.removeEventListener('visibilitychange', onVis);
      }
    };
  }

  return { mount };
});
