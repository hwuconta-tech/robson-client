/**
 * Robson Client Showcase - Main Interactive Engine
 * 100% Minecraft 1.21.1 HUD & Chat Fidelity + Clean Theme Decorations
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollReveal();
  initAudioFeedback();
  initThemeSystem();
  initMinecraftScreen3D();
  initHeroHotbar();
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
    }
  } catch (e) {
    // Continue silently if audio context is blocked
  }
}

function initAudioFeedback() {
  document.addEventListener('click', (e) => {
    const interactiveTarget = e.target.closest('button, .nav-links a, .mc-chatbar-btn, .theme-btn, .gallery-item, .mc-hotbar-slot, .mc-pill-action');
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
const THEME_NAMES = {
  diamante: 'CORTE DIAMANTE',
  ametista: 'GEODO AMETISTA',
  esmeralda: 'MINA ESMERALDA'
};
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

  // Atualiza subtítulo do tema na navbar
  const navThemeLabel = document.getElementById('nav-active-theme');
  if (navThemeLabel && THEME_NAMES[theme]) {
    navThemeLabel.textContent = THEME_NAMES[theme];
  }

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

    const rotY = x * 14;
    const rotX = -y * 14;

    screen.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  wrap.addEventListener('mouseleave', () => {
    screen.style.transform = 'rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
  });
}

/* ==========================================================
   6. HERO HOTBAR INTERATIVA (CLIQUE & TECLAS 1-9)
   ========================================================== */
function initHeroHotbar() {
  const slots = document.querySelectorAll('.mc-hotbar-slot');
  const tooltipName = document.getElementById('hero-tooltip-name');
  const tooltipStats = document.getElementById('hero-tooltip-stats');

  function selectSlot(index) {
    if (!slots[index]) return;
    slots.forEach(s => s.classList.remove('active'));
    slots[index].classList.add('active');

    const name = slots[index].dataset.name || 'Item';
    const stats = slots[index].dataset.stats || '';

    if (tooltipName) tooltipName.textContent = name;
    if (tooltipStats) tooltipStats.textContent = stats;
  }

  slots.forEach((slot, idx) => {
    slot.addEventListener('click', () => {
      selectSlot(idx);
      playUiSound('click');
    });
  });

  // Suporte a teclas 1 a 9 no teclado
  window.addEventListener('keydown', (e) => {
    // Ignora se estiver digitando em um campo de texto
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= 9) {
      selectSlot(num - 1);
      playUiSound('click');
    }
  });
}

/* ==========================================================
   7. CLIENT FRAME CONTROLS & IFRAME SYNC
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

      if (scoreboard) { scoreboard.style.left = 'auto'; scoreboard.style.right = '20px'; scoreboard.style.top = '40px'; scoreboard.style.transform = 'none'; scoreboard.style.opacity = '1'; }
      if (chat) { chat.style.left = '20px'; chat.style.top = 'auto'; chat.style.bottom = '20px'; chat.style.transform = 'none'; chat.style.opacity = '1'; }
      if (fps) { fps.style.left = '20px'; fps.style.top = '20px'; fps.style.transform = 'none'; fps.style.opacity = '1'; }
      if (boss) { boss.style.left = 'calc(50% - 130px)'; boss.style.top = '15px'; boss.style.transform = 'none'; boss.style.opacity = '1'; }

      showToast('Posições padrão do HUD restauradas!');
    });
  }
}

/* ==========================================================
   9. CHAT 100% MINECRAFT COM GOOGLE TRANSLATE REAL & COPIAR
   ========================================================== */
function initChatTranslatorLab() {
  const input = document.getElementById('chat-sim-input');
  const sendBtn = document.getElementById('chat-sim-send');
  const messagesBox = document.getElementById('chat-sim-messages');
  const transIndicator = document.getElementById('chat-sim-trans-preview');
  const btnTr = document.getElementById('chat-btn-tr');
  const btnAt = document.getElementById('chat-btn-autotext');
  const btnSym = document.getElementById('chat-btn-symbols');
  const popoverAt = document.getElementById('chat-popover-autotext');
  const popoverSym = document.getElementById('chat-popover-symbols');

  if (!input || !messagesBox) return;

  let debounceTimer = null;

  async function fetchRealGoogleTranslation(text) {
    if (!text.trim()) return null;
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
          return { text: enData[0][0][0], lang: 'PT→EN' };
        }
        return { text: data[0][0][0], lang: 'EN→PT' };
      }
    } catch (err) {
      console.warn('Google Translate API fallback:', err);
    }
    return { text: text, lang: 'Auto' };
  }

  // Preview ao vivo enquanto digita
  input.addEventListener('input', () => {
    const text = input.value.trim();
    if (!text) {
      if (transIndicator) transIndicator.textContent = '🌐 Google Translate Pronto: digite uma mensagem para ver a tradução...';
      return;
    }

    clearTimeout(debounceTimer);
    if (transIndicator) transIndicator.innerHTML = `Robson Translator 🌐: <em>Traduzindo ao vivo via Google...</em>`;

    debounceTimer = setTimeout(async () => {
      const res = await fetchRealGoogleTranslation(text);
      if (res && res.text && transIndicator) {
        transIndicator.innerHTML = `Robson Translator 🌐 <strong>[${res.lang}]</strong>: "${escapeHtml(res.text)}"`;
      }
    }, 350);
  });

  // Botão [TR] Traduzir texto do input in-place
  if (btnTr) {
    btnTr.addEventListener('click', async () => {
      const text = input.value.trim();
      if (!text) return;
      btnTr.textContent = '...';
      const res = await fetchRealGoogleTranslation(text);
      if (res && res.text) {
        input.value = res.text;
        if (transIndicator) transIndicator.innerHTML = `Robson Translator 🌐 <strong>[Traduzido]</strong>: "${escapeHtml(res.text)}"`;
      }
      btnTr.textContent = '[TR] Traduzir';
    });
  }

  // Popover AutoTexts
  if (btnAt && popoverAt) {
    btnAt.addEventListener('click', () => {
      popoverAt.classList.toggle('open');
      if (popoverSym) popoverSym.classList.remove('open');
    });
  }

  // Popover Símbolos
  if (btnSym && popoverSym) {
    btnSym.addEventListener('click', () => {
      popoverSym.classList.toggle('open');
      if (popoverAt) popoverAt.classList.remove('open');
    });
  }

  // Inserção a partir dos popovers
  document.addEventListener('click', (e) => {
    const atBtn = e.target.closest('[data-autotext]');
    if (atBtn) {
      input.value = atBtn.dataset.autotext;
      if (popoverAt) popoverAt.classList.remove('open');
      input.focus();
      input.dispatchEvent(new Event('input'));
      return;
    }

    const symBtn = e.target.closest('[data-symbol]');
    if (symBtn) {
      input.value += symBtn.dataset.symbol + ' ';
      if (popoverSym) popoverSym.classList.remove('open');
      input.focus();
      input.dispatchEvent(new Event('input'));
      return;
    }

    // Fechar popover ao clicar fora
    if (!e.target.closest('#chat-btn-autotext') && !e.target.closest('#chat-popover-autotext') && popoverAt) {
      popoverAt.classList.remove('open');
    }
    if (!e.target.closest('#chat-btn-symbols') && !e.target.closest('#chat-popover-symbols') && popoverSym) {
      popoverSym.classList.remove('open');
    }
  });

  // Delegação do botão Copiar em cada linha de mensagem
  messagesBox.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.mc-chat-copy-btn');
    if (!copyBtn) return;

    const textToCopy = copyBtn.dataset.copy || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copiado';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, 1500);
      });
    }
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    playUiSound('message');

    const translationResult = await fetchRealGoogleTranslation(text);
    const translatedText = translationResult ? translationResult.text : text;
    const langTag = translationResult ? translationResult.lang : 'PT';

    // Linha Minecraft autêntica com botão copiar
    const msgEl = document.createElement('div');
    msgEl.className = 'mc-chat-row';
    msgEl.innerHTML = `
      <span class="mc-chat-msg">
        <span class="mc-c-yellow">&lt;Kayoba15_&gt;</span>
        <span class="mc-c-white">${escapeHtml(text)}</span>
        <span class="mc-trans-tag">🌐 ${escapeHtml(langTag)}: "${escapeHtml(translatedText)}"</span>
      </span>
      <button class="mc-chat-copy-btn" data-copy="<Kayoba15_> ${escapeHtml(text)}">Copiar</button>
    `;
    messagesBox.appendChild(msgEl);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    input.value = '';
    if (transIndicator) transIndicator.textContent = '🌐 Google Translate Pronto: digite uma mensagem para ver a tradução...';

    // Resposta de jogador simulada
    setTimeout(async () => {
      const replies = [
        'Hey Kayoba, thanks for the trade!',
        'Can anyone help me build a mob trap?',
        'Mining diamonds at Y: -58 right now!',
        'GG everyone, see you in the nether!'
      ];
      const randomEng = replies[Math.floor(Math.random() * replies.length)];
      const botTrans = await fetchRealGoogleTranslation(randomEng);

      const botMsg = document.createElement('div');
      botMsg.className = 'mc-chat-row';
      botMsg.innerHTML = `
        <span class="mc-chat-msg">
          <span class="mc-c-player">&lt;Steve_US&gt;</span>
          <span class="mc-c-white">${escapeHtml(randomEng)}</span>
          <span class="mc-trans-tag">🌐 EN→PT: "${escapeHtml(botTrans ? botTrans.text : randomEng)}"</span>
        </span>
        <button class="mc-chat-copy-btn" data-copy="<Steve_US> ${escapeHtml(randomEng)}">Copiar</button>
      `;
      messagesBox.appendChild(botMsg);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 1200);
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

  document.querySelectorAll('[data-gallery-src]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.gallerySrc;
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
  let toast = document.getElementById('robson-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'robson-toast';
    toast.style.cssText = 'position:fixed; bottom:24px; right:24px; background:#1e293b; color:#fff; padding:10px 18px; border-radius:8px; border:1px solid #38bdf8; box-shadow:0 10px 25px rgba(0,0,0,0.5); z-index:9999; font-size:13px; font-weight:600; opacity:0; transition:opacity 0.3s ease; pointer-events:none;';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
  }, 2800);
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
