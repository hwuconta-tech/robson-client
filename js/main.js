/**
 * Robson Client Showcase - Main Interactive Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollReveal();
  initAudioFeedback();
  initThemeSystem();
  initMinecraftScreen3D();
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
      threshold: 0.15
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if no observer
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
    // Continue silently if audio context is blocked
  }
}

function initAudioFeedback() {
  document.addEventListener('click', (e) => {
    const interactiveTarget = e.target.closest('button, .nav-links a, .mc-chatbar-btn, .theme-btn, .gallery-item, .mc-slot');
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
   4. THEME SYSTEM (TRANSFORMA A IDENTIDADE INTEIRA DO SITE)
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

  // Atualiza botões do seletor
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setTheme === theme);
  });

  // Atualiza telemetria no jogo
  const telemetryTheme = document.getElementById('telemetry-theme');
  if (telemetryTheme) {
    telemetryTheme.textContent = theme.toUpperCase();
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
   5. MINECRAFT SCREEN 3D TILT (HERO REAL)
   ========================================================== */
function initMinecraftScreen3D() {
  const wrap = document.querySelector('.mc-game-viewport-wrap');
  const screen = document.getElementById('hero-game-screen');
  if (!wrap || !screen) return;

  wrap.addEventListener('mousemove', (e) => {
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotY = x * 18;
    const rotX = -y * 18;

    screen.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  wrap.addEventListener('mouseleave', () => {
    screen.style.transform = 'rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
  });
}

/* ==========================================================
   6. CLIENT FRAME CONTROLS & IFRAME SYNC
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
        showToast('Decorações do menu in-game alternadas.');
      }
    });
  }

  // Ouvinte de mensagens do client
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
   7. INTERACTIVE HUD STUDIO LAB
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

      if (scoreboard) { scoreboard.style.left = 'auto'; scoreboard.style.right = '20px'; scoreboard.style.top = '40px'; scoreboard.style.transform = 'none'; scoreboard.style.opacity = '1'; }
      if (chat) { chat.style.left = '20px'; chat.style.top = 'auto'; chat.style.bottom = '20px'; chat.style.transform = 'none'; chat.style.opacity = '1'; }
      if (fps) { fps.style.left = '20px'; fps.style.top = '20px'; fps.style.transform = 'none'; fps.style.opacity = '1'; }
      if (boss) { boss.style.left = 'calc(50% - 130px)'; boss.style.top = '15px'; boss.style.transform = 'none'; boss.style.opacity = '1'; }

      showToast('Posições padrão do HUD restauradas!');
    });
  }
}

/* ==========================================================
   8. CHAT 100% MINECRAFT COM GOOGLE TRANSLATE REAL
   ========================================================== */
function initChatTranslatorLab() {
  const input = document.getElementById('chat-sim-input');
  const sendBtn = document.getElementById('chat-sim-send');
  const messagesBox = document.getElementById('chat-sim-messages');
  const transIndicator = document.getElementById('chat-sim-trans-preview');
  if (!input || !messagesBox) return;

  let debounceTimer = null;

  async function fetchRealGoogleTranslation(text) {
    if (!text.trim()) return '';
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        let detected = data[2] || 'auto';
        if (detected === 'pt') {
          const enUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=en&dt=t&q=${encodeURIComponent(text)}`;
          const enRes = await fetch(enUrl);
          const enData = await enRes.json();
          return { text: enData[0][0][0], lang: 'EN' };
        }
        return { text: data[0][0][0], lang: 'PT' };
      }
    } catch (err) {
      console.warn('Google Translate API fallback:', err);
    }
    return { text: text, lang: 'Auto' };
  }

  input.addEventListener('input', () => {
    const text = input.value.trim();
    if (!text) {
      transIndicator.textContent = 'Digite algo em português ou inglês para testar a tradução via Google...';
      return;
    }

    clearTimeout(debounceTimer);
    transIndicator.innerHTML = `Robson Translator 🌐: <em>Traduzindo ao vivo via Google...</em>`;

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

    const translationResult = await fetchRealGoogleTranslation(text);
    const translatedText = translationResult ? translationResult.text : text;

    // Linha Minecraft autêntica
    const msgEl = document.createElement('div');
    msgEl.className = 'mc-chat-line';
    msgEl.innerHTML = `
      <span class="mc-c-rank">&lt;Você&gt;</span>
      <span class="mc-c-white">${escapeHtml(text)}</span>
      <span class="mc-c-trans">🌐 Traduzido: "${escapeHtml(translatedText)}"</span>
    `;
    messagesBox.appendChild(msgEl);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    input.value = '';
    transIndicator.textContent = 'Digite algo em português ou inglês para testar a tradução via Google...';

    // Resposta de jogador simulada
    setTimeout(async () => {
      const replies = [
        'Hey Caio, thanks for the trade!',
        'Can anyone help me build a mob trap?',
        'Mining diamonds at Y: -58 right now!',
        'GG everyone, see you in the nether!'
      ];
      const randomEng = replies[Math.floor(Math.random() * replies.length)];
      const botTrans = await fetchRealGoogleTranslation(randomEng);

      const botMsg = document.createElement('div');
      botMsg.className = 'mc-chat-line';
      botMsg.innerHTML = `
        <span class="mc-c-player">&lt;Steve_US&gt;</span>
        <span class="mc-c-white">${escapeHtml(randomEng)}</span>
        <span class="mc-c-trans">🌐 Traduzido: "${escapeHtml(botTrans.text)}"</span>
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
   9. GALLERY LIGHTBOX
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
   10. DISCORD CLIPBOARD & TOAST
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
   11. SCROLL NAV ACTIVE OBSERVER
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
