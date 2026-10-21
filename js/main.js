/**
 * Robson Client Showcase - Main Interactive Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initAudioFeedback();
  initThemeSystem();
  initHologram3D();
  initClientFrameSync();
  initHudStudioLab();
  initChatTranslatorLab();
  initGalleryLightbox();
  initDiscordCopy();
  initScrollNav();
});

/* ==========================================================
   0. AUDIO FEEDBACK SYSTEM (Web Audio API sintetizada, leve e tátil)
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
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.06); // A5
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) {
    // Silently continue if audio context is blocked
  }
}

function initAudioFeedback() {
  document.addEventListener('click', (e) => {
    const interactiveTarget = e.target.closest('button, .nav-links a, .chat-action-btn, .theme-btn, .gallery-item');
    if (interactiveTarget) {
      if (interactiveTarget.classList.contains('theme-btn')) {
        playUiSound('theme');
      } else {
        playUiSound('click');
      }
    }
  });
}

/* ==========================================================
   1. THEME SYSTEM
   ========================================================== */
const THEMES = ['diamante', 'ametista', 'esmeralda'];
let currentTheme = 'diamante';

function initThemeSystem() {
  const themeButtons = document.querySelectorAll('[data-set-theme]');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTheme = btn.dataset.setTheme;
      setSiteTheme(targetTheme, true);
    });
  });
}

function setSiteTheme(theme, syncWithIframe = true) {
  if (!THEMES.includes(theme)) return;
  currentTheme = theme;
  document.body.dataset.siteTheme = theme;

  // Update theme pill buttons
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setTheme === theme);
  });

  // Update hologram telemetry display
  const telemetryTheme = document.getElementById('telemetry-theme');
  if (telemetryTheme) {
    telemetryTheme.textContent = theme.toUpperCase();
  }

  // Update theme SVGs if displayed
  const themeIcon = document.getElementById('hologram-theme-svg');
  if (themeIcon) {
    themeIcon.src = `assets/${theme}.svg`;
  }

  // Sync with embedded in-game client iframe
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
   2. 3D HOLOGRAM PARALLAX
   ========================================================== */
function initHologram3D() {
  const stage = document.querySelector('.hologram-stage');
  const card = document.querySelector('.hologram-card');
  if (!stage || !card) return;

  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotY = x * 22;
    const rotX = -y * 22;

    card.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  stage.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
  });
}

/* ==========================================================
   3. CLIENT FRAME CONTROLS & IFRAME SYNC
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
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'TOGGLE_DECORATIONS' }, '*');
        showToast('Decorações do menu alternadas.');
      }
    });
  }

  // Listen to messages from the embedded client
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'ROBSON_CLIENT_SYNC' && e.data.theme) {
      if (e.data.theme !== currentTheme) {
        setSiteTheme(e.data.theme, false);
      }
    }
  });
}

/* ==========================================================
   4. INTERACTIVE HUD STUDIO LAB
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

    // Sync sliders
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

        // Keep inside canvas bounds
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

  // Controls
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

      if (scoreboard) { scoreboard.style.left = 'auto'; scoreboard.style.right = '20px'; scoreboard.style.top = '40px'; scoreboard.style.transform = 'none'; scoreboard.style.opacity = '1'; }
      if (chat) { chat.style.left = '20px'; chat.style.top = 'auto'; chat.style.bottom = '20px'; chat.style.transform = 'none'; chat.style.opacity = '1'; }
      if (fps) { fps.style.left = '20px'; fps.style.top = '20px'; fps.style.transform = 'none'; fps.style.opacity = '1'; }
      if (boss) { boss.style.left = 'calc(50% - 130px)'; boss.style.top = '15px'; boss.style.transform = 'none'; boss.style.opacity = '1'; }

      showToast('Posições padrão do HUD restauradas!');
    });
  }
}

/* ==========================================================
   5. CHAT & TRANSLATOR SIMULATOR (COM GOOGLE TRANSLATE REAL)
   ========================================================== */
function initChatTranslatorLab() {
  const input = document.getElementById('chat-sim-input');
  const sendBtn = document.getElementById('chat-sim-send');
  const messagesBox = document.getElementById('chat-sim-messages');
  const transIndicator = document.getElementById('chat-sim-trans-preview');
  if (!input || !messagesBox) return;

  let debounceTimer = null;

  // Chamada assíncrona à API pública do Google Translate
  async function fetchRealGoogleTranslation(text) {
    if (!text.trim()) return '';
    try {
      // Endpoint público do Google Translate (gtx)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        let detected = data[2] || 'auto';
        // Se já era português, traduz para inglês para demonstrar bidirecional
        if (detected === 'pt') {
          const enUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(text)}`;
          const enRes = await fetch(enUrl);
          const enData = await enRes.json();
          return { text: enData[0][0][0], lang: 'EN (Inglês)' };
        }
        return { text: data[0][0][0], lang: 'PT (Português)' };
      }
    } catch (err) {
      console.warn('Google Translate API fallback:', err);
    }
    return { text: text, lang: 'Auto' };
  }

  input.addEventListener('input', () => {
    const text = input.value.trim();
    if (!text) {
      transIndicator.textContent = 'Digite algo em português ou inglês para pré-visualizar...';
      return;
    }

    clearTimeout(debounceTimer);
    transIndicator.innerHTML = `Robson Translator 🌐: <em>Traduzindo via Google...</em>`;

    debounceTimer = setTimeout(async () => {
      const res = await fetchRealGoogleTranslation(text);
      if (res && res.text) {
        transIndicator.innerHTML = `Robson Translator 🌐 <strong>[${res.lang}]</strong>: "${escapeHtml(res.text)}"`;
      }
    }, 350);
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    playUiSound('message');

    // Tradução real
    const translationResult = await fetchRealGoogleTranslation(text);
    const translatedText = translationResult ? translationResult.text : text;

    // Append user message
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-msg';
    msgEl.innerHTML = `
      <span class="tag-player">Você:</span>
      <span>${escapeHtml(text)}</span>
      <span class="text-trans">🌐 ${escapeHtml(translatedText)}</span>
    `;
    messagesBox.appendChild(msgEl);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    input.value = '';
    transIndicator.textContent = 'Digite algo em português ou inglês para pré-visualizar...';

    // Simulate in-game player response
    setTimeout(async () => {
      const replies = [
        'Hey there, nice to meet you!',
        'Can anyone help me build a mob trap?',
        'Mining diamonds at Y: -58 right now!',
        'Good luck everyone, have fun!'
      ];
      const randomEng = replies[Math.floor(Math.random() * replies.length)];
      const botTrans = await fetchRealGoogleTranslation(randomEng);

      const botMsg = document.createElement('div');
      botMsg.className = 'chat-msg';
      botMsg.innerHTML = `
        <span class="tag-rank">[GringoPlayer]:</span>
        <span>${escapeHtml(randomEng)}</span>
        <span class="text-trans">🌐 Traduzido: "${escapeHtml(botTrans.text)}"</span>
      `;
      messagesBox.appendChild(botMsg);
      messagesBox.scrollTop = messagesBox.scrollHeight;
      playUiSound('message');
    }, 1200);
  }

  sendBtn?.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // AutoTexts Popover
  const btnAutoText = document.getElementById('chat-btn-autotext');
  const popAutoText = document.getElementById('chat-popover-autotext');
  if (btnAutoText && popAutoText) {
    btnAutoText.addEventListener('click', (e) => {
      e.stopPropagation();
      popSymbols?.classList.remove('open');
      popAutoText.classList.toggle('open');
    });

    popAutoText.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.autotext;
        popAutoText.classList.remove('open');
        input.dispatchEvent(new Event('input'));
        input.focus();
      });
    });
  }

  // Symbols Popover
  const btnSymbols = document.getElementById('chat-btn-symbols');
  const popSymbols = document.getElementById('chat-popover-symbols');
  if (btnSymbols && popSymbols) {
    btnSymbols.addEventListener('click', (e) => {
      e.stopPropagation();
      popAutoText?.classList.remove('open');
      popSymbols.classList.toggle('open');
    });

    popSymbols.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value += btn.textContent;
        popSymbols.classList.remove('open');
        input.dispatchEvent(new Event('input'));
        input.focus();
      });
    });
  }

  // Close popovers on click outside
  document.addEventListener('click', () => {
    popAutoText?.classList.remove('open');
    popSymbols?.classList.remove('open');
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

/* ==========================================================
   6. CPS TESTER (BENTO CARD MINI-GAME)
   ========================================================== */
function initCpsTester() {
  const btn = document.getElementById('cps-click-target');
  const cpsDisplay = document.getElementById('cps-live-value');
  const countDisplay = document.getElementById('cps-click-count');
  const timeDisplay = document.getElementById('cps-time-left');
  if (!btn) return;

  let clicks = 0;
  let timer = null;
  let timeLeft = 5;
  let running = false;

  btn.addEventListener('click', () => {
    if (!running) {
      running = true;
      clicks = 0;
      timeLeft = 5;
      timeDisplay.textContent = '5.0s';
      btn.textContent = 'CLIQUE O MAIS RÁPIDO POSSÍVEL!';

      const startTime = performance.now();
      timer = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const remaining = Math.max(0, 5 - elapsed);
        timeDisplay.textContent = `${remaining.toFixed(1)}s`;

        const currentCps = clicks / Math.max(0.1, elapsed);
        cpsDisplay.textContent = currentCps.toFixed(1);

        if (remaining <= 0) {
          clearInterval(timer);
          running = false;
          const finalCps = (clicks / 5).toFixed(1);
          cpsDisplay.textContent = finalCps;
          btn.textContent = `FINALIZADO: ${finalCps} CPS! Clique para tentar de novo.`;
          showToast(`Seu teste atingiu ${finalCps} CPS!`);
        }
      }, 100);
    }

    clicks++;
    countDisplay.textContent = clicks;
  });
}

/* ==========================================================
   7. GALLERY LIGHTBOX
   ========================================================== */
function initGalleryLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  if (!modal || !modalImg) return;

  document.querySelectorAll('[data-gallery-src]').forEach(item => {
    item.addEventListener('click', () => {
      modalImg.src = item.dataset.gallerySrc;
      modal.classList.add('open');
    });
  });

  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

/* ==========================================================
   8. DISCORD CLIPBOARD & TOAST
   ========================================================== */
function initDiscordCopy() {
  const discordBtns = document.querySelectorAll('[data-discord-copy]');
  discordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const discordTag = btn.dataset.discordCopy || 'caio';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(discordTag).then(() => {
          showToast(`Discord tag "${discordTag}" copiada para a área de transferência!`);
        }).catch(() => {
          showToast(`Discord: ${discordTag}`);
        });
      } else {
        showToast(`Discord: ${discordTag}`);
      }
    });
  });
}

function showToast(message) {
  let toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.className = 'site-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span style="color:var(--primary)">✦</span> ${message}`;
  toast.classList.add('show');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================
   9. SCROLL NAV ACTIVE OBSERVER
   ========================================================== */
function initScrollNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 160;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
}
