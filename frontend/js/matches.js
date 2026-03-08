/**
 * GoalMaster – Matches Renderer
 * Renders match cards, hero section, and handles odd selection.
 */

const Matches = {
  allMatches: [],

  /** Load and render all matches */
  async init() {
    this.allMatches = await GmAPI.getMatches();
    this.renderFeatured();
    this.renderMatchCards();
  },

  /** Render the featured hero match */
  renderFeatured() {
    const featured = this.allMatches.find(m => m.featured) || this.allMatches[0];
    if (!featured) return;

    const container = document.getElementById('heroContent');
    if (!container) return;

    container.innerHTML = `
      <span class="hero-tag">⚡ Featured Match</span>
      <h2 class="hero-title">${featured.league} Action!</h2>
      <p class="hero-subtitle">${featured.home} vs ${featured.away} — Who will win?</p>

      <div class="hero-matchup">
        <div class="hero-team">
          <div class="team-crest">${featured.homeShort}</div>
          <span class="team-name">${featured.home}</span>
        </div>

        <div class="hero-odds">
          <button class="odd-btn" data-match="${featured.id}" data-pick="home" data-odd="${featured.odds.home}" data-label="${featured.home} to Win" data-match-label="${featured.home} vs ${featured.away}">
            <span class="odd-label">1</span>
            <span class="odd-value">${featured.odds.home.toFixed(2)}</span>
          </button>
          <button class="odd-btn" data-match="${featured.id}" data-pick="draw" data-odd="${featured.odds.draw}" data-label="Draw" data-match-label="${featured.home} vs ${featured.away}">
            <span class="odd-label">X</span>
            <span class="odd-value">${featured.odds.draw.toFixed(2)}</span>
          </button>
          <button class="odd-btn" data-match="${featured.id}" data-pick="away" data-odd="${featured.odds.away}" data-label="${featured.away} to Win" data-match-label="${featured.home} vs ${featured.away}">
            <span class="odd-label">2</span>
            <span class="odd-value">${featured.odds.away.toFixed(2)}</span>
          </button>
        </div>

        <div class="hero-team">
          <div class="team-crest">${featured.awayShort}</div>
          <span class="team-name">${featured.away}</span>
        </div>
      </div>

      <div class="hero-cta">
        <button class="btn-primary" onclick="document.getElementById('betslipPanel').scrollIntoView({behavior:'smooth'})">
          ⚽ Place Your Bet
        </button>
      </div>
    `;

    this.bindOddButtons(container);
  },

  /** Render the match card grid */
  renderMatchCards(filter = 'all') {
    const container = document.getElementById('matchesGrid');
    if (!container) return;

    let matches = this.allMatches.filter(m => !m.featured);
    if (filter === 'live') matches = matches.filter(m => m.live);
    if (filter === 'upcoming') matches = matches.filter(m => !m.live);

    container.innerHTML = matches.map(match => `
      <div class="match-card">
        <div class="match-card-header">
          <span class="match-league">${match.league}</span>
          <span class="match-time ${match.live ? 'live' : ''}">${match.live ? 'LIVE' : match.time}</span>
        </div>
        <div class="match-teams">
          <div class="match-team">
            <div class="match-team-crest">${match.homeShort}</div>
            <span class="match-team-name">${match.home}</span>
          </div>
          <span class="match-vs">vs</span>
          <div class="match-team away">
            <div class="match-team-crest">${match.awayShort}</div>
            <span class="match-team-name">${match.away}</span>
          </div>
        </div>
        <div class="match-odds">
          <button class="match-odd-btn" data-match="${match.id}" data-pick="home" data-odd="${match.odds.home}" data-label="${match.home} to Win" data-match-label="${match.home} vs ${match.away}">
            <span class="label">1</span>
            <span class="value">${match.odds.home.toFixed(2)}</span>
          </button>
          <button class="match-odd-btn" data-match="${match.id}" data-pick="draw" data-odd="${match.odds.draw}" data-label="Draw" data-match-label="${match.home} vs ${match.away}">
            <span class="label">X</span>
            <span class="value">${match.odds.draw.toFixed(2)}</span>
          </button>
          <button class="match-odd-btn" data-match="${match.id}" data-pick="away" data-odd="${match.odds.away}" data-label="${match.away} to Win" data-match-label="${match.home} vs ${match.away}">
            <span class="label">2</span>
            <span class="value">${match.odds.away.toFixed(2)}</span>
          </button>
        </div>
      </div>
    `).join('');

    this.bindOddButtons(container);
  },

  /** Render full matches page grid */
  async renderFullPage(filter = 'all') {
    this.allMatches = await GmAPI.getMatches();
    const container = document.getElementById('matchesFullGrid');
    if (!container) return;

    let matches = [...this.allMatches];
    if (filter === 'live') matches = matches.filter(m => m.live);
    if (filter === 'upcoming') matches = matches.filter(m => !m.live);

    container.innerHTML = matches.map(match => `
      <div class="match-card">
        <div class="match-card-header">
          <span class="match-league">${match.league}</span>
          <span class="match-time ${match.live ? 'live' : ''}">${match.live ? 'LIVE' : match.time}</span>
        </div>
        <div class="match-teams">
          <div class="match-team">
            <div class="match-team-crest">${match.homeShort}</div>
            <span class="match-team-name">${match.home}</span>
          </div>
          <span class="match-vs">vs</span>
          <div class="match-team away">
            <div class="match-team-crest">${match.awayShort}</div>
            <span class="match-team-name">${match.away}</span>
          </div>
        </div>
        <div class="match-odds">
          <button class="match-odd-btn" data-match="${match.id}" data-pick="home" data-odd="${match.odds.home}" data-label="${match.home} to Win" data-match-label="${match.home} vs ${match.away}">
            <span class="label">1</span>
            <span class="value">${match.odds.home.toFixed(2)}</span>
          </button>
          <button class="match-odd-btn" data-match="${match.id}" data-pick="draw" data-odd="${match.odds.draw}" data-label="Draw" data-match-label="${match.home} vs ${match.away}">
            <span class="label">X</span>
            <span class="value">${match.odds.draw.toFixed(2)}</span>
          </button>
          <button class="match-odd-btn" data-match="${match.id}" data-pick="away" data-odd="${match.odds.away}" data-label="${match.away} to Win" data-match-label="${match.home} vs ${match.away}">
            <span class="label">2</span>
            <span class="value">${match.odds.away.toFixed(2)}</span>
          </button>
        </div>
      </div>
    `).join('');

    this.bindOddButtons(container);
  },

  /** Bind click events on odd buttons inside a container */
  bindOddButtons(container) {
    container.querySelectorAll('.match-odd-btn, .odd-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const matchId = parseInt(btn.dataset.match);
        const odd = parseFloat(btn.dataset.odd);
        const label = btn.dataset.label;
        const matchLabel = btn.dataset.matchLabel;

        // Toggle selection visually for this match
        const selector = `.match-odd-btn[data-match="${matchId}"], .odd-btn[data-match="${matchId}"]`;
        document.querySelectorAll(selector).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Add to bet slip
        BetSlip.addBet(matchId, matchLabel, label, odd);
      });
    });
  },
};
