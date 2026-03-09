/**
 * GoalMaster - Matches Module
 * Handles rendering and interaction with match cards
 */

const Matches = {
  /**
   * Format kickoff time
   */
  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    if (date.toDateString() === now.toDateString()) {
      return timeStr;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${timeStr}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  },

  /**
   * Handle odds button click
   */
  handleOddsClick(matchId, matchName, selection, type, odds) {
    // Dispatch event for bet slip
    window.dispatchEvent(new CustomEvent('betAdded', {
      detail: {
        matchId,
        matchName,
        selection,
        type,
        odds
      }
    }));
  },

  /**
   * Render featured match (hero banner)
   */
  async renderFeaturedMatch(containerId = 'featured-match') {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const match = await API.getFeaturedMatch();
      
      container.innerHTML = `
        <div class="hero-banner" data-testid="hero-banner">
          <div class="hero-bg" style="background-image: url('https://images.unsplash.com/photo-1730652128205-f5e98e542746?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920')"></div>
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <span class="hero-badge">${match.league}</span>
            <h1 class="hero-title">Premier League Action!</h1>
            <p class="hero-subtitle">${match.homeTeam.name} vs ${match.awayTeam.name} - Who will win?</p>
            
            <div class="featured-match">
              <div class="featured-team">
                <img src="${match.homeTeam.logo}" alt="${match.homeTeam.name}" class="team-logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1152/1152912.png'">
                <span class="team-name">${match.homeTeam.name}</span>
              </div>
              
              <div class="featured-vs">
                <div class="featured-odds">
                  <button 
                    class="odds-btn ${BetSlip.hasBet(match.id, 'home') ? 'selected' : ''}" 
                    data-testid="featured-odds-home"
                    data-match-id="${match.id}"
                    data-bet-type="home"
                    onclick="Matches.handleOddsClick('${match.id}', '${match.homeTeam.name} vs ${match.awayTeam.name}', '${match.homeTeam.name} to Win', 'home', ${match.odds.home})"
                  >
                    <span class="odds-label">1</span>
                    <span class="odds-value">${match.odds.home.toFixed(2)}</span>
                  </button>
                  <button 
                    class="odds-btn ${BetSlip.hasBet(match.id, 'draw') ? 'selected' : ''}" 
                    data-testid="featured-odds-draw"
                    data-match-id="${match.id}"
                    data-bet-type="draw"
                    onclick="Matches.handleOddsClick('${match.id}', '${match.homeTeam.name} vs ${match.awayTeam.name}', 'Draw', 'draw', ${match.odds.draw})"
                  >
                    <span class="odds-label">X</span>
                    <span class="odds-value">${match.odds.draw.toFixed(2)}</span>
                  </button>
                  <button 
                    class="odds-btn ${BetSlip.hasBet(match.id, 'away') ? 'selected' : ''}" 
                    data-testid="featured-odds-away"
                    data-match-id="${match.id}"
                    data-bet-type="away"
                    onclick="Matches.handleOddsClick('${match.id}', '${match.homeTeam.name} vs ${match.awayTeam.name}', '${match.awayTeam.name} to Win', 'away', ${match.odds.away})"
                  >
                    <span class="odds-label">2</span>
                    <span class="odds-value">${match.odds.away.toFixed(2)}</span>
                  </button>
                </div>
              </div>
              
              <div class="featured-team">
                <img src="${match.awayTeam.logo}" alt="${match.awayTeam.name}" class="team-logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1152/1152912.png'">
                <span class="team-name">${match.awayTeam.name}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Failed to load featured match:', error);
      container.innerHTML = '<div class="error">Failed to load featured match</div>';
    }
  },

  /**
   * Render match cards grid
   */
  async renderMatchCards(containerId = 'matches-grid', filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';

    try {
      let matches;
      switch (filter) {
        case 'live':
          matches = await API.getLiveMatches();
          break;
        case 'upcoming':
          matches = await API.getUpcomingMatches();
          break;
        default:
          matches = await API.getMatches();
      }

      if (matches.length === 0) {
        container.innerHTML = `
          <div class="betslip-empty" style="grid-column: 1 / -1;">
            <p>No matches available</p>
          </div>
        `;
        return;
      }

      container.innerHTML = matches.map(match => this.renderMatchCard(match)).join('');
    } catch (error) {
      console.error('Failed to load matches:', error);
      container.innerHTML = '<div class="error" style="grid-column: 1 / -1;">Failed to load matches</div>';
    }
  },

  /**
   * Render a single match card
   */
  renderMatchCard(match) {
    const matchName = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
    
    return `
      <div class="match-card" data-testid="match-card-${match.id}">
        <div class="match-header">
          <span class="match-league">${match.league}</span>
          <span class="match-time ${match.isLive ? 'live' : ''}" data-testid="match-time-${match.id}">
            ${match.isLive ? `<span class="live-indicator"></span> ${match.minute}'` : this.formatTime(match.kickoff)}
          </span>
        </div>
        
        <div class="match-teams">
          <div class="match-team">
            <img src="${match.homeTeam.logo}" alt="${match.homeTeam.name}" class="match-team-logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1152/1152912.png'">
            <span class="match-team-name">${match.homeTeam.name}</span>
          </div>
          <span class="match-vs">${match.isLive && match.score ? `${match.score.home} - ${match.score.away}` : 'vs'}</span>
          <div class="match-team away">
            <img src="${match.awayTeam.logo}" alt="${match.awayTeam.name}" class="match-team-logo" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1152/1152912.png'">
            <span class="match-team-name">${match.awayTeam.name}</span>
          </div>
        </div>
        
        <div class="match-odds">
          <button 
            class="match-odd-btn ${BetSlip.hasBet(match.id, 'home') ? 'selected' : ''}" 
            data-testid="odds-home-${match.id}"
            data-match-id="${match.id}"
            data-bet-type="home"
            onclick="Matches.handleOddsClick('${match.id}', '${matchName}', '${match.homeTeam.name} to Win', 'home', ${match.odds.home})"
          >
            <span class="match-odd-label">1</span>
            <span class="match-odd-value">${match.odds.home.toFixed(2)}</span>
          </button>
          <button 
            class="match-odd-btn ${BetSlip.hasBet(match.id, 'draw') ? 'selected' : ''}" 
            data-testid="odds-draw-${match.id}"
            data-match-id="${match.id}"
            data-bet-type="draw"
            onclick="Matches.handleOddsClick('${match.id}', '${matchName}', 'Draw', 'draw', ${match.odds.draw})"
          >
            <span class="match-odd-label">X</span>
            <span class="match-odd-value">${match.odds.draw.toFixed(2)}</span>
          </button>
          <button 
            class="match-odd-btn ${BetSlip.hasBet(match.id, 'away') ? 'selected' : ''}" 
            data-testid="odds-away-${match.id}"
            data-match-id="${match.id}"
            data-bet-type="away"
            onclick="Matches.handleOddsClick('${match.id}', '${matchName}', '${match.awayTeam.name} to Win', 'away', ${match.odds.away})"
          >
            <span class="match-odd-label">2</span>
            <span class="match-odd-value">${match.odds.away.toFixed(2)}</span>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render large match cards (for matches page)
   */
  async renderMatchList(containerId = 'matches-list', filter = 'all') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';

    try {
      let matches;
      switch (filter) {
        case 'live':
          matches = await API.getLiveMatches();
          break;
        case 'upcoming':
          matches = await API.getUpcomingMatches();
          break;
        default:
          matches = await API.getMatches();
      }

      if (matches.length === 0) {
        container.innerHTML = `
          <div class="betslip-empty">
            <p>No matches available</p>
          </div>
        `;
        return;
      }

      container.innerHTML = matches.map(match => this.renderLargeMatchCard(match)).join('');
    } catch (error) {
      console.error('Failed to load matches:', error);
      container.innerHTML = '<div class="error">Failed to load matches</div>';
    }
  },

  /**
   * Render a large match card
   */
  renderLargeMatchCard(match) {
    const matchName = `${match.homeTeam.name} vs ${match.awayTeam.name}`;
    
    return `
      <div class="match-card-large" data-testid="match-card-large-${match.id}">
        <div class="match-info">
          <div class="match-meta">
            <span class="match-league">${match.league}</span>
            <span class="match-time ${match.isLive ? 'live' : ''}">
              ${match.isLive ? `<span class="live-indicator"></span> Live - ${match.minute}'` : this.formatTime(match.kickoff)}
            </span>
          </div>
          
          <div class="match-teams-large">
            <div class="match-team-large">
              <img src="${match.homeTeam.logo}" alt="${match.homeTeam.name}" class="match-team-logo-large" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1152/1152912.png'">
              <span class="match-team-name-large">${match.homeTeam.name}</span>
            </div>
            <span class="match-vs-large">${match.isLive && match.score ? `${match.score.home} - ${match.score.away}` : 'VS'}</span>
            <div class="match-team-large away">
              <img src="${match.awayTeam.logo}" alt="${match.awayTeam.name}" class="match-team-logo-large" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1152/1152912.png'">
              <span class="match-team-name-large">${match.awayTeam.name}</span>
            </div>
          </div>
        </div>
        
        <div class="match-odds">
          <button 
            class="match-odd-btn ${BetSlip.hasBet(match.id, 'home') ? 'selected' : ''}" 
            data-testid="odds-home-${match.id}"
            data-match-id="${match.id}"
            data-bet-type="home"
            onclick="Matches.handleOddsClick('${match.id}', '${matchName}', '${match.homeTeam.name} to Win', 'home', ${match.odds.home})"
          >
            <span class="match-odd-label">1</span>
            <span class="match-odd-value">${match.odds.home.toFixed(2)}</span>
          </button>
          <button 
            class="match-odd-btn ${BetSlip.hasBet(match.id, 'draw') ? 'selected' : ''}" 
            data-testid="odds-draw-${match.id}"
            data-match-id="${match.id}"
            data-bet-type="draw"
            onclick="Matches.handleOddsClick('${match.id}', '${matchName}', 'Draw', 'draw', ${match.odds.draw})"
          >
            <span class="match-odd-label">X</span>
            <span class="match-odd-value">${match.odds.draw.toFixed(2)}</span>
          </button>
          <button 
            class="match-odd-btn ${BetSlip.hasBet(match.id, 'away') ? 'selected' : ''}" 
            data-testid="odds-away-${match.id}"
            data-match-id="${match.id}"
            data-bet-type="away"
            onclick="Matches.handleOddsClick('${match.id}', '${matchName}', '${match.awayTeam.name} to Win', 'away', ${match.odds.away})"
          >
            <span class="match-odd-label">2</span>
            <span class="match-odd-value">${match.odds.away.toFixed(2)}</span>
          </button>
        </div>
      </div>
    `;
  }
};

// Make Matches available globally
window.Matches = Matches;

