/* ============================================================
   PORTFOLIO — Main Script v3
   Native Canvas 2D particles, hidden nav, accordions, email modal
   NO external dependencies
   ============================================================ */

(function () {
  'use strict';

  const htmlEl = document.documentElement;

  // ——————————————————————————————————————————————
  // 1. HALFTONE FLOW WEBGL BACKGROUND (Verified Nexus Unified Flow)
  // ——————————————————————————————————————————————

  function initFlowField() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    let gl = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance'
      }) || canvas.getContext('experimental-webgl');
    } catch (e) {
      gl = null;
    }

    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    // Vertex Shader
    const vsSource = `
      attribute vec2 aVertexPosition;
      void main() {
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
      }
    `;

    // Fragment Shader (Halftone Flow with Luxury Burgundy Palette)
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      mat2 rot(float a) {
        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;

        vec2 flow_uv = p;
        float time = u_time * 0.35;
        
        for (float i = 1.0; i < 4.0; i++) {
          flow_uv *= rot(time * 0.08);
          flow_uv.x += sin(flow_uv.y * 2.0 * i + time) * 0.5;
          flow_uv.y += cos(flow_uv.x * 1.5 * i - time * 0.8) * 0.5;
        }

        float intensity = sin(flow_uv.x * 2.0 + flow_uv.y * 3.0) * 0.5 + 0.5;

        // Halftone dot-matrix grid calculation (Nexus Halftone Flow verified source)
        float gridSize = 6.5; 
        vec2 grid_uv = gl_FragCoord.xy / gridSize;
        vec2 cell_uv = fract(grid_uv) - 0.5;
        
        float dist = length(cell_uv);
        float radius = intensity * 0.44; 
        float dot_mask = smoothstep(radius, radius - 0.12, dist);

        // --- HAUTE BURGUNDY VELVET ---
        // Deep obsidian-noir wine base (#080204)
        vec3 dark_bg = vec3(0.031, 0.008, 0.016);
        // Rich Bordeaux burgundy wine (#7d0f2b)
        vec3 dark_wine = vec3(0.49, 0.06, 0.17);
        // Radiant ruby-rose highlight (#d93863)
        vec3 dark_ruby = vec3(0.85, 0.22, 0.39);
        
        vec3 dark_fluid = mix(dark_bg, dark_wine, smoothstep(0.18, 0.62, intensity));
        dark_fluid = mix(dark_fluid, dark_ruby, smoothstep(0.68, 1.0, intensity));
        
        vec3 final_color = mix(dark_bg, dark_fluid, dot_mask);
        final_color += dark_fluid * 0.16;

        gl_FragColor = vec4(final_color, 1.0);
      }
    `;

    function compileShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positions = new Float32Array([
      -1.0,  1.0,
       1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');


    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const displayWidth = Math.floor(width * dpr);
      const displayHeight = Math.floor(height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    let startTime = performance.now();
    let animId = null;
    let isVisible = true;
    let lastElapsed = 0;

    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible && !animId) {
        startTime = performance.now() - (lastElapsed * 1000.0);
        animId = requestAnimationFrame(render);
      }
    });

    function render(now) {
      if (!isVisible) {
        animId = null;
        return;
      }


      const elapsed = (now - startTime) / 1000.0;
      lastElapsed = elapsed;

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsed);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    // Handle WebGL context loss gracefully
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (animId) cancelAnimationFrame(animId);
      animId = null;
    }, false);

    canvas.addEventListener('webglcontextrestored', () => {
      initFlowField();
    }, false);
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
  // 5. NAV — Hidden on landing page, reveals on scroll
  // ——————————————————————————————————————————————

  function initNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    function updateNav() {
      const scrolled = window.scrollY > 80;
      if (scrolled) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
        const fluidNav = document.getElementById('fluid-nav');
        if (fluidNav) fluidNav.classList.remove('is-open');
      }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
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