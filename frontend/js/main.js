/**
 * GoalMaster – Main Application
 * Global initialization and shared utilities.
 */

/* ---------- Toast Utility ---------- */
const Toast = {
  show(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
};

/* ---------- Main Init ---------- */
const Main = {
  async init() {
    this.bindNavbar();
    await this.loadUser();
  },

  /** Setup responsive nav toggle */
  bindNavbar() {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('navMenu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => menu.classList.toggle('open'));
    }

    // Mark active nav link
    const path = window.location.pathname;
    document.querySelectorAll('.navbar-menu a').forEach(link => {
      if (path.includes(link.getAttribute('href'))) {
        link.classList.add('active');
      }
    });
  },

  /** Load user info into navbar */
  async loadUser() {
    const user = await GmAPI.getUser();
    if (!user) return;

    const coinEl = document.getElementById('coinAmount');
    if (coinEl) coinEl.textContent = user.coins.toLocaleString();

    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.textContent = (user.username || 'P').charAt(0).toUpperCase();
  },
};

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  Main.init();
});
