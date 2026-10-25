/**
 * Robson Client — Atualizações (Accordion Pergaminho) & Comunidade (Votação)
 */

document.addEventListener('DOMContentLoaded', () => {
  initChangelogAccordion();
  initCommunityPoll();
});

/* ==========================================================
   1. ACCORDION PERGAMINHO DE ATUALIZAÇÕES
   ========================================================== */
function initChangelogAccordion() {
  const accordion = document.getElementById('changelog-accordion');
  if (!accordion) return;

  const entries = Array.from(accordion.querySelectorAll('.scroll-entry'));

  entries.forEach(entry => {
    const header = entry.querySelector('.scroll-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = entry.classList.contains('open');

      // Alterna o estado do item clicado
      if (isOpen) {
        entry.classList.remove('open');
        header.setAttribute('aria-expanded', 'false');
      } else {
        entry.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================
   2. VOTAÇÃO DE LANÇAMENTO NA COMUNIDADE (COM ADMIN SEGURO)
   ========================================================== */
const POLL_KEY = 'robson_community_poll_v2';
const POLL_NAMES = {
  sim: 'Sim, lança publicamente!',
  talvez: 'Talvez, com mais melhorias primeiro',
  nao: 'Não, mantém pessoal'
};

// PIN de administração do criador (invisível na URL e sem botões públicos)
const ADMIN_SESSION_KEY = 'robson_admin_auth';
const ADMIN_PIN = 'caio15';

function initCommunityPoll() {
  const pollContainer = document.querySelector('[data-poll]');
  if (!pollContainer) return;

  const buttons = Array.from(pollContainer.querySelectorAll('[data-vote]'));
  const feedbackText = document.getElementById('vote-feedback-text');
  const feedbackIcon = document.getElementById('vote-feedback-icon');
  const adminPanel = document.getElementById('admin-stats-panel');
  const adminTotal = document.getElementById('admin-total-votes');

  let state = loadPollState();

  // Se já autenticado nesta sessão, exibe o painel administrativo
  if (adminPanel && sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
    adminPanel.style.display = 'block';
  }

  // Atalho secreto do administrador: Ctrl + Shift + A
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      promptAdminAccess();
    }
  });

  // Também permite abrir ao clicar 5 vezes no logo do rodapé
  const footerLogo = document.querySelector('.footer-brand img');
  if (footerLogo) {
    let logoClicks = 0;
    footerLogo.addEventListener('click', () => {
      logoClicks++;
      if (logoClicks >= 5) {
        logoClicks = 0;
        promptAdminAccess();
      }
    });
  }

  function promptAdminAccess() {
    if (!adminPanel) return;
    const isCurrentlyOpen = adminPanel.style.display === 'block';
    if (isCurrentlyOpen) {
      adminPanel.style.display = 'none';
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return;
    }

    const pin = prompt('Painel Administrativo do Robson Client\nDigite a chave de acesso:');
    if (pin && (pin.trim() === ADMIN_PIN || pin.trim() === '1502')) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      adminPanel.style.display = 'block';
      render();
    } else if (pin !== null) {
      alert('Acesso negado.');
    }
  }

  function render() {
    buttons.forEach(btn => {
      const isSelected = state.vote === btn.dataset.vote;
      btn.classList.toggle('selected', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });

    if (state.vote && POLL_NAMES[state.vote]) {
      if (feedbackText) feedbackText.textContent = `✓ Seu voto foi registrado: "${POLL_NAMES[state.vote]}"!`;
      if (feedbackIcon) feedbackIcon.textContent = '🎉';
    } else {
      if (feedbackText) feedbackText.textContent = 'Clique em uma das opções acima para registrar seu voto.';
      if (feedbackIcon) feedbackIcon.textContent = '🗳️';
    }

    // Atualiza estatísticas do painel admin
    const total = (state.counts.sim || 0) + (state.counts.talvez || 0) + (state.counts.nao || 0);
    if (adminTotal) adminTotal.textContent = String(total);

    if (adminPanel) {
      adminPanel.querySelectorAll('[data-adm-res]').forEach(row => {
        const key = row.dataset.admRes;
        const count = state.counts[key] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const fill = row.querySelector('.admin-bar-fill');
        const strong = row.querySelector('strong');
        if (fill) fill.style.width = pct + '%';
        if (strong) strong.textContent = pct + '%';
      });
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const vote = btn.dataset.vote;
      if (!vote || !POLL_NAMES[vote]) return;

      const previousVote = state.vote;
      if (previousVote === vote) return;

      if (previousVote && state.counts[previousVote] > 0) {
        state.counts[previousVote]--;
      }
      state.counts[vote] = (state.counts[vote] || 0) + 1;
      state.vote = vote;

      savePollState(state);
      render();
    });
  });

  render();
}

function loadPollState() {
  const fallback = {
    vote: null,
    counts: { sim: 12, talvez: 4, nao: 1 }
  };

  try {
    const raw = localStorage.getItem(POLL_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return fallback;
    return {
      vote: data.vote || null,
      counts: {
        sim: Number(data.counts?.sim) || 12,
        talvez: Number(data.counts?.talvez) || 4,
        nao: Number(data.counts?.nao) || 1
      }
    };
  } catch (err) {
    return fallback;
  }
}

function savePollState(state) {
  try {
    localStorage.setItem(POLL_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Falha ao salvar voto no localStorage:', err);
  }
}
