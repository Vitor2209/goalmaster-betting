/**
 * GoalMaster - Main Module
 * Global initialization and utilities
 */

/**
 * Toast notification system
 */
const Toast = {
  container: null,

  init() {
    // Create toast container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
      const container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('data-testid', 'toast-container');
      document.body.appendChild(container);
    }
    this.container = document.querySelector('.toast-container');
  },

  show(message, type = 'success', duration = 3000) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('data-testid', `toast-${type}`);
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.success}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    this.container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }
};

/**
 * Leaderboard module
 */
const Leaderboard = {
  /**
   * Render mini leaderboard (sidebar)
   */
  async renderMini(containerId = 'leaderboard-mini') {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const leaderboard = await API.getLeaderboard();
      const top4 = leaderboard.slice(0, 4);

      const getRankClass = (index) => {
        if (index === 0) return 'gold';
        if (index === 1) return 'silver';
        if (index === 2) return 'bronze';
        return 'normal';
      };

      container.innerHTML = `
        <div class="leaderboard-mini">
          <div class="leaderboard-mini-header">
            <span class="leaderboard-mini-title">Leaderboard</span>
            <a href="/leaderboard.html" class="section-link" data-testid="view-all-leaderboard">View All →</a>
          </div>
          <div class="leaderboard-mini-list" data-testid="leaderboard-mini-list">
            ${top4.map((user, index) => `
              <div class="leaderboard-mini-item" data-testid="leaderboard-item-${user.id}">
                <span class="leaderboard-rank ${getRankClass(index)}">${index + 1}</span>
                <span class="leaderboard-username">${user.username}</span>
                <span class="leaderboard-coins">${user.coins.toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  },

  /**
   * Render full leaderboard (page)
   */
  async renderFull(containerId = 'leaderboard-full') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';

    try {
      const leaderboard = await API.getLeaderboard();

      const getRankClass = (index) => {
        if (index === 0) return 'gold';
        if (index === 1) return 'silver';
        if (index === 2) return 'bronze';
        return 'normal';
      };

      container.innerHTML = `
        <div class="leaderboard-table" data-testid="leaderboard-table">
          <div class="leaderboard-table-header">
            <span>Rank</span>
            <span>Player</span>
            <span style="text-align: right;">Coins</span>
          </div>
          ${leaderboard.map((user, index) => `
            <div class="leaderboard-table-row" data-testid="leaderboard-row-${user.id}">
              <span class="leaderboard-rank ${getRankClass(index)}">${index + 1}</span>
              <div class="leaderboard-user-info">
                <img src="${user.avatar}" alt="${user.username}" class="leaderboard-avatar" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}'">
                <span class="leaderboard-username">${user.username}</span>
              </div>
              <span class="leaderboard-coins">${user.coins.toLocaleString()} coins</span>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      container.innerHTML = '<div class="error">Failed to load leaderboard</div>';
    }
  }
};

/**
 * Account module
 */
const Account = {
  /**
   * Render account page
   */
  async render(containerId = 'account-content') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Check auth
    if (!Auth.requireAuth()) return;

    const user = Auth.getCurrentUser();
    const betHistory = await API.getBetHistory();

    // Calculate stats
    const totalBets = betHistory.length;
    const wonBets = betHistory.filter(b => b.status === 'won').length;
    const totalWon = betHistory.filter(b => b.status === 'won').reduce((sum, b) => sum + b.potentialWin, 0);

    container.innerHTML = `
      <div class="account-header" data-testid="account-header">
        <img src="${user.avatar}" alt="${user.username}" class="account-avatar" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}'">
        <div class="account-info">
          <h1>${user.username}</h1>
          <div class="account-balance" data-testid="account-balance">
            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="coins" style="width: 24px; height: 24px; filter: brightness(0) saturate(100%) invert(85%) sepia(45%) saturate(1000%) hue-rotate(358deg) brightness(103%) contrast(106%);">
            ${user.balance.toLocaleString()} coins
          </div>
        </div>
      </div>

      <div class="account-stats" data-testid="account-stats">
        <div class="stat-card">
          <div class="stat-value">${totalBets}</div>
          <div class="stat-label">Total Bets</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${wonBets}</div>
          <div class="stat-label">Wins</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalWon.toLocaleString()}</div>
          <div class="stat-label">Coins Won</div>
        </div>
      </div>

      <div class="bet-history" data-testid="bet-history">
        <div class="bet-history-header">
          <h2 class="bet-history-title">Betting History</h2>
        </div>
        <div class="bet-history-list">
          ${betHistory.length === 0 ? `
            <div class="betslip-empty">
              <p>No bets placed yet</p>
              <a href="/index.html" class="btn btn-primary mt-md">Browse Matches</a>
            </div>
          ` : betHistory.map(bet => `
            <div class="bet-history-item" data-testid="bet-history-item-${bet.id}">
              <div class="bet-history-match">
                <div class="bet-history-teams">${bet.matchName}</div>
                <div class="bet-history-selection">${bet.selection} @ ${bet.odds.toFixed(2)}</div>
              </div>
              <div class="bet-history-details">
                <div class="bet-history-amount">${bet.amount} coins</div>
                <span class="bet-history-status ${bet.status}">${bet.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <button class="btn btn-secondary mt-md" data-testid="logout-btn" onclick="Auth.logout()" style="width: 100%;">
        Logout
      </button>
    `;
  }
};

/**
 * Mobile menu toggle
 */
function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  navMenu?.classList.toggle('open');
}

/**
 * Mobile sidebar toggle
 */
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('open');
}

/**
 * Set active nav link based on current page
 */
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath === href || (currentPath === '/' && href === '/index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Global initialization
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize toast system
  Toast.init();
  
  // Initialize auth
  Auth.init();
  
  // Set active nav link
  setActiveNavLink();
  
  // Initialize bet slip if on a page with sidebar
  if (document.querySelector('[data-testid="betslip-content"]')) {
    BetSlip.init();
  }

  console.log('GoalMaster initialized');
});

// Make modules available globally
window.Toast = Toast;
window.Leaderboard = Leaderboard;
window.Account = Account;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleSidebar = toggleSidebar;

