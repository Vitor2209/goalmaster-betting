/**
 * GoalMaster – API Layer
 * Handles all fetch requests to the backend.
 * Falls back to mock data when the API is unavailable.
 */

const API_BASE = 'http://localhost:5000/api';

const GmAPI = {
  /** Get auth headers */
  _headers() {
    const token = localStorage.getItem('gm_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  /** Generic fetch wrapper with mock fallback */
  async _request(url, options = {}) {
    try {
      const res = await fetch(url, { ...options, headers: this._headers() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`API unavailable (${url}), using mock data.`, err.message);
      return null; // caller uses mock
    }
  },

  /** GET /api/matches */
  async getMatches() {
    const data = await this._request(`${API_BASE}/matches`);
    return data || MockData.matches;
  },

  /** GET /api/matches/live */
  async getLiveMatches() {
    const data = await this._request(`${API_BASE}/matches/live`);
    return data || MockData.matches.filter(m => m.live);
  },

  /** POST /api/bets */
  async placeBet(betData) {
    const data = await this._request(`${API_BASE}/bets`, {
      method: 'POST',
      body: JSON.stringify(betData),
    });
    return data || { success: true, message: 'Bet placed (mock)' };
  },

  /** GET /api/bets/history */
  async getBetHistory() {
    const data = await this._request(`${API_BASE}/bets/history`);
    return data || MockData.betHistory;
  },

  /** GET /api/user */
  async getUser() {
    const data = await this._request(`${API_BASE}/user`);
    return data || MockData.user;
  },

  /** GET /api/leaderboard */
  async getLeaderboard() {
    const data = await this._request(`${API_BASE}/leaderboard`);
    return data || MockData.leaderboard;
  },
};

/* ---- Mock Data (used when API is offline) ---- */
const MockData = {
  user: {
    username: 'Player1',
    coins: 1250,
    totalBets: 47,
    wins: 22,
    winRate: 47,
  },

  matches: [
    {
      id: 1,
      league: 'Premier League',
      home: 'Arsenal',
      homeShort: 'ARS',
      away: 'Chelsea',
      awayShort: 'CHE',
      time: '20:00',
      live: false,
      featured: true,
      odds: { home: 2.30, draw: 2.80, away: 2.60 },
    },
    {
      id: 2,
      league: 'Premier League',
      home: 'Liverpool',
      homeShort: 'LIV',
      away: 'Man City',
      awayShort: 'MCI',
      time: 'LIVE',
      live: true,
      featured: false,
      odds: { home: 2.75, draw: 3.60, away: 2.40 },
    },
    {
      id: 3,
      league: 'La Liga',
      home: 'Real Madrid',
      homeShort: 'RMA',
      away: 'Barcelona',
      awayShort: 'BAR',
      time: '20:00',
      live: false,
      featured: false,
      odds: { home: 2.50, draw: 3.50, away: 2.70 },
    },
    {
      id: 4,
      league: 'Serie A',
      home: 'Juventus',
      homeShort: 'JUV',
      away: 'AC Milan',
      awayShort: 'ACM',
      time: '21:30',
      live: false,
      featured: false,
      odds: { home: 2.10, draw: 3.20, away: 3.40 },
    },
    {
      id: 5,
      league: 'Bundesliga',
      home: 'Bayern Munich',
      homeShort: 'BAY',
      away: 'Dortmund',
      awayShort: 'BVB',
      time: '18:30',
      live: false,
      featured: false,
      odds: { home: 1.85, draw: 3.80, away: 3.90 },
    },
    {
      id: 6,
      league: 'Ligue 1',
      home: 'PSG',
      homeShort: 'PSG',
      away: 'Marseille',
      awayShort: 'OLM',
      time: '21:00',
      live: true,
      featured: false,
      odds: { home: 1.60, draw: 4.00, away: 4.50 },
    },
  ],

  leaderboard: [
    { rank: 1, username: 'JoãoBet', coins: 4350 },
    { rank: 2, username: 'AnaScore', coins: 3800 },
    { rank: 3, username: 'RickGol', coins: 3250 },
    { rank: 4, username: 'LuizaPicks', coins: 2900 },
    { rank: 5, username: 'CarlosBets', coins: 2650 },
    { rank: 6, username: 'MariaWin', coins: 2400 },
    { rank: 7, username: 'PedroPalpite', coins: 2100 },
    { rank: 8, username: 'SofiaKick', coins: 1950 },
  ],

  betHistory: [
    { match: 'Arsenal vs Chelsea', pick: 'Chelsea to Win', odds: 2.60, amount: 200, result: 'pending', payout: 0 },
    { match: 'Liverpool vs Man City', pick: 'Draw', odds: 3.60, amount: 100, result: 'win', payout: 360 },
    { match: 'Real Madrid vs Barcelona', pick: 'Real Madrid', odds: 2.50, amount: 150, result: 'loss', payout: 0 },
    { match: 'Bayern vs Dortmund', pick: 'Bayern', odds: 1.85, amount: 300, result: 'win', payout: 555 },
  ],
};
