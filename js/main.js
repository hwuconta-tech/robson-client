/**
 * Robson Client Showcase - Main Interactive Engine
 * 100% Minecraft 1.21.1 HUD & Chat Fidelity + Rich Theme Decorations
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollReveal();
  initAudioFeedback();
  initThemeSystem();
  initMinecraftScreen3D();
  initHeroInteractiveMinecraftScreen();
  initClientFrameSync();
  initHudStudioLab();
  initChatTranslatorLab();
  initGalleryLightbox();
  initDiscordCopy();
  initScrollNav();
});

/* ==========================================================
   1. LENIS SMOOTH SCROLL (O SCROLL MACIO QUE AS COISAS VÊM JUNTO)
   ========================================================== */
let lenis = null;

function initSmoothScroll() {
  if (typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.05
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (e) {
      console.warn('Lenis fallback to native scroll:', e);
    }
  }
}

/* ==========================================================
   2. SCROLL REVEAL (ANIMAÇÕES QUE SE MONTAM CONFORME ROLA)
   ========================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.12
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }
}

/* ==========================================================
   3. AUDIO FEEDBACK SYSTEM (Web Audio API sintetizada)
   ========================================================== */
let audioCtx = null;
let soundEnabled = true;

function playUiSound(type = 'click') {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'theme') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'message') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'damage') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.14);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'xp') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.14);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    }
  } catch (e) {
    // Continue silently if audio context is blocked
  }
}

function initAudioFeedback() {
  document.addEventListener('click', (e) => {
    const interactiveTarget = e.target.closest(
      'button, .nav-links a, .robson-pill-btn, .theme-btn, .gallery-item, .mc-hotbar-slot-btn, .browser-theme-stamp'
    );
    if (interactiveTarget) {
      if (interactiveTarget.classList.contains('theme-btn') || interactiveTarget.classList.contains('browser-theme-stamp')) {
        playUiSound('theme');
      } else {
        playUiSound('click');
      }
    }
  });
}

/* ==========================================================
   4. THEME SYSTEM (DECORAÇÕES DE CRISTAL, GEODO E MINA NO NAVEGADOR)
   ========================================================== */
const THEMES = ['diamante', 'ametista', 'esmeralda'];
const THEME_META = {
  diamante: {
    label: 'Tema: Diamante',
    subtitle: 'CORTE DIAMANTE',
    toast: '💎 Tema Diamante ativado — Cristais lapidados e picareta de diamante aplicados!'
  },
  ametista: {
    label: 'Tema: Ametista',
    subtitle: 'GEODO AMETISTA',
    toast: '🔮 Tema Ametista ativado — Geodos profundos e cristais violeta aplicados!'
  },
  esmeralda: {
    label: 'Tema: Esmeralda',
    subtitle: 'MINA ESMERALDA',
    toast: '🟢 Tema Esmeralda ativado — Lanternas de mina, trilhos e vagão de esmeralda aplicados!'
  }
};
let currentTheme = 'diamante';

function initThemeSystem() {
  const themeButtons = document.querySelectorAll('[data-set-theme]');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTheme = btn.dataset.setTheme;
      setSiteTheme(targetTheme, true, true);
    });
  });

  const cycleStamp = document.getElementById('browser-theme-cycle');
  if (cycleStamp) {
    cycleStamp.addEventListener('click', () => {
      const nextIndex = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
      setSiteTheme(THEMES[nextIndex], true, true);
    });
  }
}

function setSiteTheme(theme, syncWithIframe = true, notifyUser = false) {
  if (!THEMES.includes(theme)) return;
  currentTheme = theme;
  document.body.dataset.siteTheme = theme;

  // Atualiza botões do seletor
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setTheme === theme);
  });

  // Atualiza textos do selo flutuante e navbar
  const meta = THEME_META[theme];
  const stampName = document.getElementById('stamp-theme-name');
  const stampCaption = document.getElementById('stamp-theme-caption');
  const navSubtitle = document.getElementById('nav-theme-subtitle');

  if (stampName && meta) stampName.textContent = meta.label;
  if (stampCaption && meta) stampCaption.textContent = meta.subtitle;
  if (navSubtitle && meta) navSubtitle.textContent = meta.subtitle;

  if (notifyUser && meta) {
    showToast(meta.toast);
  }

  // Sincroniza com o menu do client embutido no iframe
  if (syncWithIframe) {
    const iframe = document.getElementById('client-iframe');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage({ type: 'SET_THEME', theme }, '*');
      } catch (e) {
        console.warn('Iframe sync notice:', e);
      }
    }
  }
}

/* ==========================================================
   5. MINECRAFT SCREEN 3D TILT (SUAVE E SEM ATRAPALHAR O DRAG)
   ========================================================== */
function initMinecraftScreen3D() {
  const wrap = document.querySelector('.mc-game-viewport-wrap');
  const screen = document.getElementById('hero-game-screen');
  if (!wrap || !screen) return;

  let isDraggingHud = false;
  screen.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.robson-hud-draggable')) {
      isDraggingHud = true;
      screen.style.transform = 'rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
    }
  });
  window.addEventListener('pointerup', () => {
    isDraggingHud = false;
  });

  wrap.addEventListener('mousemove', (e) => {
    if (isDraggingHud) return;
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotY = x * 7;
    const rotX = -y * 7;

    screen.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;
  });

  wrap.addEventListener('mouseleave', () => {
    screen.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}

/* ==========================================================
   6. HERO IN-GAME MINECRAFT SCREEN (HOTBAR 1-9, DANO, XP, HUD DRAG)
   ========================================================== */
function initHeroInteractiveMinecraftScreen() {
  const screen = document.getElementById('hero-game-screen');
  const selector = document.getElementById('hero-hotbar-selector');
  const slotBtns = document.querySelectorAll('#hero-hotbar .mc-hotbar-slot-btn');
  const tooltip = document.getElementById('hero-item-tooltip');
  const tooltipName = document.getElementById('hero-tooltip-name');
  const tooltipLore = document.getElementById('hero-tooltip-lore');

  let currentSlot = 0;
  let tooltipFadeTimer = null;

  function selectHotbarSlot(slotIndex, announce = true) {
    if (!selector || !slotBtns.length) return;
    currentSlot = ((slotIndex % 9) + 9) % 9;
    selector.style.left = `${currentSlot * 40 - 2}px`;

    const targetBtn = slotBtns[currentSlot];
    if (targetBtn && tooltipName && tooltipLore) {
      tooltipName.textContent = targetBtn.dataset.itemName || 'Item';
      tooltipLore.textContent = targetBtn.dataset.itemLore || '';
      if (tooltip) {
        tooltip.style.opacity = '1';
        clearTimeout(tooltipFadeTimer);
        tooltipFadeTimer = setTimeout(() => {
          tooltip.style.opacity = '0.88';
        }, 1800);
      }
      if (announce) {
        playUiSound('click');
      }
    }
  }

  slotBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      selectHotbarSlot(idx, true);
    });
  });

  // Teclas 1 a 9 do teclado trocam o slot da hotbar quando não estiver digitando em um input
  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea') return;
    if (e.key >= '1' && e.key <= '9') {
      selectHotbarSlot(parseInt(e.key, 10) - 1, true);
    }
  });

  const nextSlotBtn = document.getElementById('hero-btn-next-slot');
  if (nextSlotBtn) {
    nextSlotBtn.addEventListener('click', () => {
      selectHotbarSlot(currentSlot + 1, true);
    });
  }

  // Simular Dano & Regeneração nos 10 Corações em Linha Única
  const damageBtn = document.getElementById('hero-btn-damage');
  const damageOverlay = document.getElementById('hero-damage-overlay');
  const heartsBar = document.getElementById('hero-hearts-bar');
  let isRegenerating = false;

  if (damageBtn && heartsBar) {
    damageBtn.addEventListener('click', () => {
      if (isRegenerating) return;
      isRegenerating = true;
      playUiSound('damage');

      const hearts = heartsBar.querySelectorAll('img');
      if (damageOverlay) {
        damageOverlay.classList.add('active');
        setTimeout(() => damageOverlay.classList.remove('active'), 320);
      }

      // Pisca os últimos 4 corações com textura oficial heart-blink.png
      for (let i = 6; i < 10; i++) {
        if (hearts[i]) hearts[i].src = 'assets/mc/heart-blink.png';
      }

      setTimeout(() => {
        if (hearts[6]) hearts[6].src = 'assets/mc/heart-half.png';
        for (let i = 7; i < 10; i++) {
          if (hearts[i]) hearts[i].src = 'assets/mc/heart-empty.png';
        }
      }, 220);

      // Regenera meio coração por vez até ficar 10/10
      const regenSteps = [
        { delay: 750, index: 6, src: 'assets/mc/heart-full.png' },
        { delay: 1100, index: 7, src: 'assets/mc/heart-half.png' },
        { delay: 1400, index: 7, src: 'assets/mc/heart-full.png' },
        { delay: 1700, index: 8, src: 'assets/mc/heart-half.png' },
        { delay: 2000, index: 8, src: 'assets/mc/heart-full.png' },
        { delay: 2300, index: 9, src: 'assets/mc/heart-half.png' },
        { delay: 2600, index: 9, src: 'assets/mc/heart-full.png', done: true }
      ];

      regenSteps.forEach(step => {
        setTimeout(() => {
          if (hearts[step.index]) hearts[step.index].src = step.src;
          if (step.done) isRegenerating = false;
        }, step.delay);
      });
    });
  }

  // Botão +1 Nível de XP
  const xpBtn = document.getElementById('hero-btn-xp');
  const xpLevelEl = document.getElementById('hero-xp-level');
  const xpFillEl = document.getElementById('hero-xp-fill');
  let xpProgress = 72;

  if (xpBtn && xpLevelEl && xpFillEl) {
    xpBtn.addEventListener('click', () => {
      playUiSound('xp');
      xpProgress += 28;
      if (xpProgress >= 100) {
        xpProgress = 25;
      }
      xpFillEl.style.width = `${xpProgress}%`;
      const currentLvl = parseInt(xpLevelEl.textContent, 10) || 17;
      xpLevelEl.textContent = String(currentLvl + 1);
    });
  }

  // Arrastar elementos do HUD diretamente na tela do jogo no Hero
  if (screen) {
    const draggables = screen.querySelectorAll('.robson-hud-draggable');

    draggables.forEach(widget => {
      // Posições iniciais baseadas nos atributos data-default-*
      if (widget.dataset.defaultTop) widget.style.top = widget.dataset.defaultTop;
      if (widget.dataset.defaultLeft) widget.style.left = widget.dataset.defaultLeft;
      if (widget.dataset.defaultRight) widget.style.right = widget.dataset.defaultRight;

      widget.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const screenRect = screen.getBoundingClientRect();
        const widgetRect = widget.getBoundingClientRect();
        const offsetX = e.clientX - widgetRect.left;
        const offsetY = e.clientY - widgetRect.top;

        widget.setPointerCapture(e.pointerId);

        function onMove(ev) {
          let newLeft = ev.clientX - screenRect.left - offsetX;
          let newTop = ev.clientY - screenRect.top - offsetY;

          newLeft = Math.max(6, Math.min(screen.clientWidth - widget.offsetWidth - 6, newLeft));
          newTop = Math.max(6, Math.min(screen.clientHeight - widget.offsetHeight - 6, newTop));

          widget.style.left = `${newLeft}px`;
          widget.style.top = `${newTop}px`;
          widget.style.right = 'auto';
        }

        function onUp() {
          widget.removeEventListener('pointermove', onMove);
          widget.removeEventListener('pointerup', onUp);
        }

        widget.addEventListener('pointermove', onMove);
        widget.addEventListener('pointerup', onUp);
      });
    });

    // Botão Restaurar Posições do HUD no Hero
    const resetHudBtn = document.getElementById('hero-btn-reset-hud');
    if (resetHudBtn) {
      resetHudBtn.addEventListener('click', () => {
        draggables.forEach(widget => {
          widget.style.top = widget.dataset.defaultTop || 'auto';
          widget.style.left = widget.dataset.defaultLeft || 'auto';
          widget.style.right = widget.dataset.defaultRight || 'auto';
        });
        showToast('Posições dos widgets do HUD restauradas na tela do jogo!');
      });
    }
  }

  // Oscilador sutil de FPS (142–146 FPS) e timer de poção
  const fpsEl = document.getElementById('hero-fps-num');
  const potionEl = document.getElementById('hero-potion-timer');
  let potionSeconds = 60;

  setInterval(() => {
    if (fpsEl) {
      const jitter = 142 + Math.floor(Math.random() * 5);
      fpsEl.textContent = String(jitter);
    }
    if (potionEl) {
      potionSeconds = potionSeconds <= 1 ? 60 : potionSeconds - 1;
      const mins = Math.floor(potionSeconds / 60);
      const secs = String(potionSeconds % 60).padStart(2, '0');
      potionEl.textContent = `${mins}:${secs}`;
    }
  }, 1000);
}

/* ==========================================================
   7. CLIENT FRAME CONTROLS & IFRAME SYNC + DECORATIONS TOGGLE
   ========================================================== */
function initClientFrameSync() {
  const iframe = document.getElementById('client-iframe');
  const screenButtons = document.querySelectorAll('[data-client-screen]');

  screenButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      screenButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const screen = btn.dataset.clientScreen;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'SET_SCREEN', screen }, '*');
      }
    });
  });

  const toggleDecorsBtn = document.getElementById('btn-toggle-decorations');
  if (toggleDecorsBtn) {
    toggleDecorsBtn.addEventListener('click', () => {
      const isOff = document.body.classList.toggle('decorations-off');
      toggleDecorsBtn.querySelector('span').textContent = `Alternar Decorações: ${isOff ? 'OFF' : 'ON'}`;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'TOGGLE_DECORATIONS' }, '*');
      }
      showToast(isOff ? 'Decorações de tema ocultadas.' : 'Decorações de tema ativadas no navegador e no menu!');
    });
  }

  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'ROBSON_CLIENT_SYNC' && e.data.theme) {
      if (e.data.theme !== currentTheme) {
        setSiteTheme(e.data.theme, false, false);
      }
    }
  });
}

/* ==========================================================
   8. INTERACTIVE HUD STUDIO LAB
   ========================================================== */
function initHudStudioLab() {
  const canvas = document.getElementById('hud-interactive-canvas');
  if (!canvas) return;

  const items = canvas.querySelectorAll('.hud-drag-item');
  let activeItem = canvas.querySelector('.hud-drag-item.selected') || items[0];

  function selectItem(item) {
    items.forEach(el => el.classList.remove('selected'));
    item.classList.add('selected');
    activeItem = item;

    const selectedName = document.getElementById('hud-selected-name');
    if (selectedName) {
      selectedName.textContent = item.dataset.name || 'Elemento';
    }

    const opacitySlider = document.getElementById('hud-slider-opacity');
    if (opacitySlider) {
      const currentOpacity = Math.round((parseFloat(item.style.opacity) || 1) * 100);
      opacitySlider.value = currentOpacity;
      document.getElementById('hud-val-opacity').textContent = `${currentOpacity}%`;
    }
  }

  items.forEach(item => {
    item.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      selectItem(item);

      const canvasRect = canvas.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const offsetX = e.clientX - itemRect.left;
      const offsetY = e.clientY - itemRect.top;

      item.setPointerCapture(e.pointerId);

      function onPointerMove(ev) {
        let newLeft = ev.clientX - canvasRect.left - offsetX;
        let newTop = ev.clientY - canvasRect.top - offsetY;

        newLeft = Math.max(8, Math.min(canvas.clientWidth - item.offsetWidth - 8, newLeft));
        newTop = Math.max(8, Math.min(canvas.clientHeight - item.offsetHeight - 8, newTop));

        item.style.left = `${newLeft}px`;
        item.style.top = `${newTop}px`;
        item.style.right = 'auto';
        item.style.bottom = 'auto';
      }

      function onPointerUp() {
        item.removeEventListener('pointermove', onPointerMove);
        item.removeEventListener('pointerup', onPointerUp);
      }

      item.addEventListener('pointermove', onPointerMove);
      item.addEventListener('pointerup', onPointerUp);
    });
  });

  const opacitySlider = document.getElementById('hud-slider-opacity');
  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      if (!activeItem) return;
      const val = e.target.value;
      activeItem.style.opacity = val / 100;
      document.getElementById('hud-val-opacity').textContent = `${val}%`;
    });
  }

  const scaleSlider = document.getElementById('hud-slider-scale');
  if (scaleSlider) {
    scaleSlider.addEventListener('input', (e) => {
      if (!activeItem) return;
      const val = e.target.value;
      activeItem.style.transform = `scale(${val})`;
      document.getElementById('hud-val-scale').textContent = `${val}x`;
    });
  }

  const gridToggle = document.getElementById('hud-toggle-grid');
  if (gridToggle) {
    gridToggle.addEventListener('change', (e) => {
      const grid = canvas.querySelector('.hud-canvas-grid-lines');
      if (grid) grid.style.opacity = e.target.checked ? '1' : '0';
    });
  }

  const resetBtn = document.getElementById('hud-reset-positions');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const scoreboard = document.getElementById('hud-drag-scoreboard');
      const chat = document.getElementById('hud-drag-chat');
      const fps = document.getElementById('hud-drag-fps');
      const boss = document.getElementById('hud-drag-boss');

      if (scoreboard) { scoreboard.style.left = 'auto'; scoreboard.style.right = '18px'; scoreboard.style.top = '50px'; scoreboard.style.transform = 'none'; scoreboard.style.opacity = '1'; }
      if (chat) { chat.style.left = '18px'; chat.style.top = 'auto'; chat.style.bottom = '18px'; chat.style.transform = 'none'; chat.style.opacity = '1'; }
      if (fps) { fps.style.left = '16px'; fps.style.top = '16px'; fps.style.transform = 'none'; fps.style.opacity = '1'; }
      if (boss) { boss.style.left = 'calc(50% - 130px)'; boss.style.top = '14px'; boss.style.transform = 'none'; boss.style.opacity = '1'; }

      showToast('Posições padrão do HUD Studio restauradas!');
    });
  }
}

/* ==========================================================
   9. CHAT 100% FIEL AO MINECRAFT + ROBSON CHAT BAR + GOOGLE TRANSLATE
   ========================================================== */
function initChatTranslatorLab() {
  const input = document.getElementById('chat-sim-input');
  const sendBtn = document.getElementById('chat-sim-send');
  const messagesBox = document.getElementById('chat-sim-messages');
  const transIndicator = document.getElementById('chat-sim-trans-preview');
  const modalAutoTexts = document.getElementById('modal-autotexts');
  const modalSymbols = document.getElementById('modal-symbols');

  if (!input || !messagesBox) return;

  let debounceTimer = null;

  async function fetchRealGoogleTranslation(text) {
    if (!text.trim()) return { text: '', lang: 'Auto' };
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const detected = data[2] || 'auto';
        if (detected === 'pt') {
          const enUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(text)}`;
          const enRes = await fetch(enUrl);
          const enData = await enRes.json();
          const fullEn = enData[0].map(part => part[0]).join('');
          return { text: fullEn, lang: 'PT→EN' };
        }
        const fullPt = data[0].map(part => part[0]).join('');
        return { text: fullPt, lang: 'EN→PT' };
      }
    } catch (err) {
      console.warn('Google Translate API fallback:', err);
    }
    return { text, lang: 'PT↔EN' };
  }

  function appendClientNotice(noticeText) {
    const entry = document.createElement('div');
    entry.className = 'mc-chat-entry';
    entry.innerHTML = `
      <div><span class="mc-c-gray">Robson Client ·</span> <span class="mc-c-white">${escapeHtml(noticeText)}</span></div>
      <button class="mc-copy-chip" data-copy-text="Robson Client · ${escapeHtml(noticeText)}">Copiar</button>
    `;
    messagesBox.appendChild(entry);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  // Delegação para todos os chips "Copiar" nas linhas do chat (igual a ChatCopyButtons.java)
  messagesBox.addEventListener('click', (e) => {
    const copyChip = e.target.closest('.mc-copy-chip');
    if (!copyChip) return;
    const textToCopy = copyChip.dataset.copyText || copyChip.parentElement.innerText.replace(/Copiar$/, '').trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    appendClientNotice('Mensagem copiada.');
    showToast(`📋 Copiado do chat: "${textToCopy}"`);
  });

  // Preview ao vivo enquanto digita na barra vanilla
  input.addEventListener('input', () => {
    const text = input.value.trim();
    if (!text) {
      if (transIndicator) transIndicator.textContent = '🌐 Google Translate Pronto';
      return;
    }

    clearTimeout(debounceTimer);
    if (transIndicator) transIndicator.textContent = '🌐 Traduzindo...';

    debounceTimer = setTimeout(async () => {
      const res = await fetchRealGoogleTranslation(text);
      if (res && res.text && transIndicator) {
        transIndicator.textContent = `🌐 [${res.lang}]: "${res.text}"`;
      }
    }, 300);
  });

  // Botão TR da Robson Chat Bar: traduz o texto dentro do próprio campo de input (idêntico a ChatTranslatorModule.translateFieldText)
  const btnTr = document.getElementById('chat-btn-tr');
  if (btnTr) {
    btnTr.addEventListener('click', async () => {
      const currentVal = input.value.trim();
      if (!currentVal) {
        input.value = 'Alguém quer trocar diamantes no spawn?';
      }
      const sourceText = input.value.trim();
      if (transIndicator) transIndicator.textContent = '🌐 Traduzindo na barra...';
      const res = await fetchRealGoogleTranslation(sourceText);
      if (res && res.text) {
        input.value = res.text;
        input.focus();
        if (transIndicator) transIndicator.textContent = `🌐 Traduzido (${res.lang})`;
        appendClientNotice(`Texto traduzido na barra (${res.lang}).`);
      }
    });
  }

  // Botões AT (AutoTexts) e + (Símbolos) da Robson Chat Bar
  const btnAutoText = document.getElementById('chat-btn-autotext');
  const btnSymbols = document.getElementById('chat-btn-symbols');

  function closeAllChatModals() {
    if (modalAutoTexts) modalAutoTexts.classList.remove('open');
    if (modalSymbols) modalSymbols.classList.remove('open');
  }

  if (btnAutoText && modalAutoTexts) {
    btnAutoText.addEventListener('click', () => {
      const wasOpen = modalAutoTexts.classList.contains('open');
      closeAllChatModals();
      if (!wasOpen) modalAutoTexts.classList.add('open');
    });
  }

  if (btnSymbols && modalSymbols) {
    btnSymbols.addEventListener('click', () => {
      const wasOpen = modalSymbols.classList.contains('open');
      closeAllChatModals();
      if (!wasOpen) modalSymbols.classList.add('open');
    });
  }

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeAllChatModals());
  });

  // Interações dentro do modal "Robson · Seis AutoTexts"
  if (modalAutoTexts) {
    modalAutoTexts.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.robson-at-fav');
      if (favBtn) {
        favBtn.textContent = favBtn.textContent.trim() === '*' ? '-' : '*';
        return;
      }

      const actionBtn = e.target.closest('[data-at-action]');
      if (!actionBtn) return;

      const row = actionBtn.closest('.robson-autotext-row');
      const rowInput = row ? row.querySelector('.robson-at-input') : null;
      const value = rowInput ? rowInput.value.trim() : '';
      if (!value) return;

      if (actionBtn.dataset.atAction === 'insert') {
        input.value = value;
        closeAllChatModals();
        input.focus();
        input.dispatchEvent(new Event('input'));
      } else if (actionBtn.dataset.atAction === 'send') {
        input.value = value;
        closeAllChatModals();
        sendMessage();
      }
    });
  }

  // Interações dentro do modal "Robson · Símbolos e emojis"
  if (modalSymbols) {
    modalSymbols.addEventListener('click', (e) => {
      const symBtn = e.target.closest('[data-insert-symbol]');
      if (!symBtn) return;
      const symbol = symBtn.dataset.insertSymbol;
      input.value = `${input.value}${symbol} `;
      closeAllChatModals();
      input.focus();
      input.dispatchEvent(new Event('input'));
    });
  }

  // Botões Buscar (🔍), Filtros (F) e Configurar (...) da Robson Chat Bar
  const btnSearch = document.getElementById('chat-btn-search');
  const btnFilters = document.getElementById('chat-btn-filters');
  const btnMore = document.getElementById('chat-btn-more');

  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      btnSearch.classList.toggle('active');
      appendClientNotice('Busca rápida no histórico do chat ativada.');
    });
  }

  if (btnFilters) {
    btnFilters.addEventListener('click', () => {
      const active = btnFilters.classList.toggle('active');
      appendClientNotice(active ? 'Filtros locais e anti-spam ativados.' : 'Filtros locais pausados.');
    });
  }

  if (btnMore) {
    btnMore.addEventListener('click', () => {
      appendClientNotice('Posicionamento livre da Robson Chat Bar pronto.');
    });
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    playUiSound('message');

    const translationResult = await fetchRealGoogleTranslation(text);
    const translatedText = translationResult && translationResult.text ? translationResult.text : text;
    const langTag = translationResult && translationResult.lang ? translationResult.lang : 'PT↔EN';

    const msgEl = document.createElement('div');
    msgEl.className = 'mc-chat-entry';
    msgEl.innerHTML = `
      <div>
        <span class="mc-c-yellow">&lt;Kayoba15_&gt;</span>
        <span class="mc-c-white">${escapeHtml(text)}</span>
        <span class="mc-translated-tag" title="Tradução Google: ${escapeHtml(translatedText)}">${escapeHtml(langTag)}: ${escapeHtml(translatedText)}</span>
      </div>
      <button class="mc-copy-chip" data-copy-text="<Kayoba15_> ${escapeHtml(text)}">Copiar</button>
    `;
    messagesBox.appendChild(msgEl);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    input.value = '';
    if (transIndicator) transIndicator.textContent = '🌐 Google Translate Pronto';

    // Resposta simulada de jogador gringo traduzida automaticamente pelo Robson Client
    setTimeout(async () => {
      const replies = [
        'Hey Kayoba, I can trade 32 diamonds at spawn!',
        'Does anyone have Fortune III book for sale?',
        'Mining in the diamond quarry right now, join up!',
        'GG everyone, the Robson translator works super fast!'
      ];
      const randomEng = replies[Math.floor(Math.random() * replies.length)];
      const botTrans = await fetchRealGoogleTranslation(randomEng);

      const botMsg = document.createElement('div');
      botMsg.className = 'mc-chat-entry';
      botMsg.innerHTML = `
        <div>
          <span class="mc-c-aqua">&lt;Steve_US&gt;</span>
          <span class="mc-c-white">${escapeHtml(botTrans.text || randomEng)}</span>
          <span class="mc-translated-tag" title="Original: ${escapeHtml(randomEng)}">EN→PT</span>
        </div>
        <button class="mc-copy-chip" data-copy-text="<Steve_US> ${escapeHtml(botTrans.text || randomEng)}">Copiar</button>
      `;
      messagesBox.appendChild(botMsg);
      messagesBox.scrollTop = messagesBox.scrollHeight;
      playUiSound('message');
    }, 1100);
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

/* ==========================================================
   10. GALLERY LIGHTBOX
   ========================================================== */
function initGalleryLightbox() {
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  if (!lightbox || !lightboxImg) return;

  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.lightbox;
      lightboxImg.src = src;
      lightbox.classList.add('open');
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

/* ==========================================================
   11. DISCORD COPY & TOAST NOTIFICATION
   ========================================================== */
function initDiscordCopy() {
  document.querySelectorAll('[data-discord-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const discordHandle = btn.dataset.discordCopy || 'caio';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(discordHandle).catch(() => {});
      }
      showToast(`Discord copiado: "${discordHandle}"! Adicione no Discord.`);
    });
  });
}

let toastTimeout = null;
function showToast(message) {
  const toast = document.getElementById('robson-toast');
  const toastMsg = document.getElementById('robson-toast-msg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================
   12. SCROLL SPY FOR NAVBAR
   ========================================================== */
function initScrollNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.scrollY;

    sections.forEach(sec => {
      const top = sec.offsetTop - 160;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = sec.getAttribute('id');
      }
    });

    if (current) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    }
  }, { passive: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
