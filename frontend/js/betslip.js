/**
 * GoalMaster – Bet Slip Module
 * Manages bet selections, amounts, and placement.
 */

const BetSlip = {
  items: [],
  amount: 100,

  /** Initialize bet slip */
  init() {
    this.loadFromStorage();
    this.render();
    this.bindEvents();
  },

  /** Bind global bet slip events */
  bindEvents() {
    // Amount input
    const amountInput = document.getElementById('betAmount');
    if (amountInput) {
      amountInput.addEventListener('input', (e) => {
        this.amount = parseInt(e.target.value) || 0;
        this.updateSummary();
      });
    }

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.amount = parseInt(btn.dataset.amount);
        const input = document.getElementById('betAmount');
        if (input) input.value = this.amount;
        this.updateSummary();
      });
    });

    // Place bet button
    const placeBtn = document.getElementById('placeBetBtn');
    if (placeBtn) {
      placeBtn.addEventListener('click', () => this.placeBet());
    }
  },

  /** Add a bet to the slip */
  addBet(matchId, matchLabel, pickName, odds) {
    // Remove existing bet for the same match
    this.items = this.items.filter(b => b.matchId !== matchId);

    this.items.push({ matchId, matchLabel, pickName, odds });
    this.saveToStorage();
    this.render();
    Toast.show(`Added: ${pickName}`, 'success');
  },

  /** Remove a bet from the slip */
  removeBet(matchId) {
    this.items = this.items.filter(b => b.matchId !== matchId);
    this.saveToStorage();
    this.render();
    // Deselect the odd buttons for that match
    document.querySelectorAll(`.match-odd-btn[data-match="${matchId}"], .odd-btn[data-match="${matchId}"]`).forEach(btn => {
      btn.classList.remove('selected');
    });
  },

  /** Calculate total odds */
  getTotalOdds() {
    if (this.items.length === 0) return 0;
    return this.items.reduce((acc, b) => acc * b.odds, 1);
  },

  /** Calculate potential win */
  getPotentialWin() {
    return (this.amount * this.getTotalOdds()).toFixed(0);
  },

  /** Place the bet via API */
  async placeBet() {
    if (this.items.length === 0) {
      Toast.show('Add a bet first!', 'error');
      return;
    }
    if (this.amount <= 0) {
      Toast.show('Enter a valid amount!', 'error');
      return;
    }

    const betData = {
      selections: this.items.map(b => ({
        matchId: b.matchId,
        pick: b.pickName,
        odds: b.odds,
      })),
      amount: this.amount,
      potentialWin: parseFloat(this.getPotentialWin()),
    };

    try {
      const result = await GmAPI.placeBet(betData);
      Toast.show('Bet placed successfully! 🎉', 'success');
      this.items = [];
      this.saveToStorage();
      this.render();

      // Update coin balance (mock)
      const user = await GmAPI.getUser();
      const coinEl = document.getElementById('coinAmount');
      if (coinEl && user) {
        const newBalance = user.coins - this.amount;
        coinEl.textContent = newBalance > 0 ? newBalance.toLocaleString() : user.coins.toLocaleString();
      }

      // Deselect all odd buttons
      document.querySelectorAll('.match-odd-btn.selected, .odd-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
      });
    } catch (err) {
      Toast.show('Failed to place bet.', 'error');
    }
  },

  /** Render the bet slip UI */
  render() {
    const container = document.getElementById('betslipItems');
    const summary = document.getElementById('betslipSummary');
    const emptyState = document.getElementById('betslipEmpty');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (summary) summary.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (summary) summary.style.display = 'block';

    container.innerHTML = this.items.map(bet => `
      <div class="betslip-item" data-match="${bet.matchId}">
        <div class="betslip-item-header">
          <span class="betslip-item-match">${bet.matchLabel}</span>
          <button class="betslip-item-remove" data-match="${bet.matchId}" title="Remove">✕</button>
        </div>
        <div class="betslip-item-pick">
          <span class="pick-name">${bet.pickName}</span>
          <span class="pick-odd">${bet.odds.toFixed(2)}</span>
        </div>
      </div>
    `).join('');

    // Bind remove buttons
    container.querySelectorAll('.betslip-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this.removeBet(parseInt(btn.dataset.match));
      });
    });

    this.updateSummary();
  },

  /** Update the summary section */
  updateSummary() {
    const totalOddsEl = document.getElementById('totalOdds');
    const potentialWinEl = document.getElementById('potentialWin');
    const totalBetEl = document.getElementById('totalBet');

    if (totalOddsEl) totalOddsEl.textContent = this.getTotalOdds().toFixed(2);
    if (potentialWinEl) potentialWinEl.textContent = `${this.getPotentialWin()} Coins`;
    if (totalBetEl) totalBetEl.textContent = `${this.amount} Coins`;
  },

  /** Persist to localStorage */
  saveToStorage() {
    localStorage.setItem('gm_betslip', JSON.stringify(this.items));
  },

  /** Load from localStorage */
  loadFromStorage() {
    try {
      const saved = JSON.parse(localStorage.getItem('gm_betslip'));
      if (Array.isArray(saved)) this.items = saved;
    } catch (e) { /* ignore */ }
  },
};

