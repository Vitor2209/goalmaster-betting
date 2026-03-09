/**
 * GoalMaster - Bet Slip Module
 * Handles bet slip functionality
 */

const BetSlip = {
  // Bet slip items
  items: [],

  // Default bet amount
  defaultAmount: 100,

  /**
   * Initialize bet slip
   */
  init() {
    // Load from localStorage if available
    const saved = localStorage.getItem('goalmaster_betslip');
    if (saved) {
      this.items = JSON.parse(saved);
    }
    this.render();

    // Listen for bet added events
    window.addEventListener('betAdded', (e) => {
      this.addBet(e.detail);
    });
  },

  /**
   * Add a bet to the slip
   */
  addBet(bet) {
    // Check if bet already exists
    const existingIndex = this.items.findIndex(
      b => b.matchId === bet.matchId && b.type === bet.type
    );

    if (existingIndex >= 0) {
      // Remove if clicking same selection
      this.items.splice(existingIndex, 1);
      Toast.show('Bet removed from slip', 'warning');
    } else {
      // Remove any existing bet for this match (only one selection per match)
      this.items = this.items.filter(b => b.matchId !== bet.matchId);
      
      // Add new bet
      this.items.push({
        ...bet,
        amount: this.defaultAmount
      });
      Toast.show('Bet added to slip', 'success');
    }

    this.save();
    this.render();
    this.updateMatchCardSelections();
  },

  /**
   * Remove a bet from the slip
   */
  removeBet(matchId) {
    this.items = this.items.filter(b => b.matchId !== matchId);
    this.save();
    this.render();
    this.updateMatchCardSelections();
    Toast.show('Bet removed', 'warning');
  },

  /**
   * Clear all bets
   */
  clearAll() {
    this.items = [];
    this.save();
    this.render();
    this.updateMatchCardSelections();
  },

  /**
   * Update bet amount
   */
  updateAmount(matchId, amount) {
    const bet = this.items.find(b => b.matchId === matchId);
    if (bet) {
      bet.amount = Math.max(0, parseInt(amount) || 0);
      this.save();
      this.render();
    }
  },

  /**
   * Calculate total stake
   */
  getTotalStake() {
    return this.items.reduce((sum, bet) => sum + bet.amount, 0);
  },

  /**
   * Calculate potential winnings
   */
  getPotentialWinnings() {
    return this.items.reduce((sum, bet) => sum + (bet.amount * bet.odds), 0);
  },

  /**
   * Save to localStorage
   */
  save() {
    localStorage.setItem('goalmaster_betslip', JSON.stringify(this.items));
  },

  /**
   * Place all bets
   */
  async placeBets() {
    if (this.items.length === 0) {
      Toast.show('No bets to place', 'error');
      return;
    }

    if (!Auth.isLoggedIn()) {
      Toast.show('Please login to place bets', 'error');
      window.location.href = '/login.html';
      return;
    }

    const user = Auth.getCurrentUser();
    const totalStake = this.getTotalStake();

    if (user.balance < totalStake) {
      Toast.show('Insufficient coins', 'error');
      return;
    }

    try {
      // Place each bet
      for (const bet of this.items) {
        await API.placeBet({
          matchId: bet.matchId,
          matchName: bet.matchName,
          selection: bet.selection,
          type: bet.type,
          odds: bet.odds,
          amount: bet.amount
        });
      }

      Toast.show(`Bets placed successfully! -${totalStake} coins`, 'success');
      this.clearAll();
      
      // Refresh UI
      Auth.updateHeaderUI();
    } catch (error) {
      Toast.show(error.message || 'Failed to place bets', 'error');
    }
  },

  /**
   * Update match card selections to reflect bet slip state
   */
  updateMatchCardSelections() {
    // Clear all selections first
    document.querySelectorAll('.odds-btn.selected, .match-odd-btn.selected').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Add selected class to buttons in bet slip
    this.items.forEach(bet => {
      const selector = `[data-match-id="${bet.matchId}"][data-bet-type="${bet.type}"]`;
      const btn = document.querySelector(selector);
      if (btn) {
        btn.classList.add('selected');
      }
    });
  },

  /**
   * Check if a bet is in the slip
   */
  hasBet(matchId, type) {
    return this.items.some(b => b.matchId === matchId && b.type === type);
  },

  /**
   * Render bet slip UI
   */
  render() {
    const container = document.querySelector('[data-testid="betslip-content"]');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="betslip-empty" data-testid="betslip-empty">
          <div class="betslip-empty-icon">🎫</div>
          <p>Your bet slip is empty</p>
          <p class="text-muted" style="font-size: 0.875rem; margin-top: 8px;">
            Click on odds to add selections
          </p>
        </div>
      `;
      return;
    }

    const user = Auth.getCurrentUser();
    const totalStake = this.getTotalStake();
    const potentialWin = this.getPotentialWinnings();
    const hasEnoughCoins = user && user.balance >= totalStake;

    let html = `
      <div class="betslip-bets" data-testid="betslip-bets">
        ${this.items.map(bet => `
          <div class="betslip-item" data-testid="betslip-item-${bet.matchId}">
            <div class="betslip-item-header">
              <div>
                <div class="betslip-item-match">${bet.matchName}</div>
                <div class="betslip-item-selection">${bet.selection}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="betslip-item-odds">${bet.odds.toFixed(2)}</span>
                <button class="betslip-remove" data-testid="remove-bet-${bet.matchId}" onclick="BetSlip.removeBet('${bet.matchId}')">✕</button>
              </div>
            </div>
            <div class="betslip-amount-section">
              <label class="betslip-label">Bet Amount</label>
              <div class="betslip-amount-input">
                <input 
                  type="number" 
                  value="${bet.amount}" 
                  min="0"
                  data-testid="bet-amount-${bet.matchId}"
                  onchange="BetSlip.updateAmount('${bet.matchId}', this.value)"
                  oninput="BetSlip.updateAmount('${bet.matchId}', this.value)"
                >
                <span>coins</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="betslip-summary" data-testid="betslip-summary">
        <div class="betslip-summary-row">
          <span class="betslip-summary-label">Total Stake</span>
          <span class="betslip-summary-value">${totalStake.toLocaleString()} coins</span>
        </div>
        <div class="betslip-summary-row">
          <span class="betslip-summary-label">Potential Win</span>
          <span class="betslip-summary-value highlight">${potentialWin.toFixed(0).toLocaleString()} coins</span>
        </div>
      </div>

      <button 
        class="betslip-submit" 
        data-testid="place-bet-btn"
        onclick="BetSlip.placeBets()"
        ${!hasEnoughCoins ? 'disabled' : ''}
      >
        ${!user ? 'Login to Place Bet' : !hasEnoughCoins ? 'Insufficient Coins' : 'Place Bet'}
      </button>
    `;

    container.innerHTML = html;
  }
};

// Make BetSlip available globally
window.BetSlip = BetSlip;


