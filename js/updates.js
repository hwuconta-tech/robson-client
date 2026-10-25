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
   2. VOTAÇÃO DE LANÇAMENTO NA COMUNIDADE
   ========================================================== */
const POLL_KEY = 'robson_community_poll_v2';
const POLL_NAMES = {
  sim: 'Sim, lança publicamente!',
  talvez: 'Talvez, com mais melhorias primeiro',
  nao: 'Não, mantém pessoal'
};

function initCommunityPoll() {
  const pollContainer = document.querySelector('[data-poll]');
  if (!pollContainer) return;

  const buttons = Array.from(pollContainer.querySelectorAll('[data-vote]'));
  const feedbackText = document.getElementById('vote-feedback-text');
  const feedbackIcon = document.getElementById('vote-feedback-icon');
  const adminPanel = document.getElementById('admin-stats-panel');
  const btnToggleAdmin = document.getElementById('btn-toggle-admin');
  const adminTotal = document.getElementById('admin-total-votes');

  let state = loadPollState();

  // Verifica se a URL tem ?admin=1 para exibir o painel do administrador direto
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === '1' && adminPanel) {
    adminPanel.style.display = 'block';
  }

  // Alternador do painel admin
  if (btnToggleAdmin && adminPanel) {
    btnToggleAdmin.addEventListener('click', () => {
      const isVisible = adminPanel.style.display === 'block';
      adminPanel.style.display = isVisible ? 'none' : 'block';
    });
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
        if (fill) fill.style.width = `${pct}%`;
        if (strong) strong.textContent = `${pct}% (${count})`;
      });
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const vote = btn.dataset.vote;
      if (!POLL_NAMES[vote]) return;

      // Se já votou antes, subtrai o anterior
      if (state.vote && state.counts[state.vote]) {
        state.counts[state.vote] = Math.max(0, state.counts[state.vote] - 1);
      }

      state.vote = vote;
      state.counts[vote] = (state.counts[vote] || 0) + 1;

      savePollState(state);
      render();
    });
  });

  render();
}

function loadPollState() {
  const fallback = { vote: null, counts: { sim: 12, talvez: 3, nao: 1 } };
  try {
    const raw = localStorage.getItem(POLL_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    return {
      vote: POLL_NAMES[parsed.vote] ? parsed.vote : null,
      counts: {
        sim: Number(parsed.counts && parsed.counts.sim) || 12,
        talvez: Number(parsed.counts && parsed.counts.talvez) || 3,
        nao: Number(parsed.counts && parsed.counts.nao) || 1
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
    // ignorar falha em storage restrito
  }
}
