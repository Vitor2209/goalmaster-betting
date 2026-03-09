/**
 * GoalMaster - API Module
 * Handles all simulated API calls with mock data
 */

const API = {
  // Base URL for API calls (simulated)
  BASE_URL: '/api',

  // Simulated delay for API calls (ms)
  DELAY: 300,

  /**
   * Simulate API delay
   */
  async _delay() {
    return new Promise(resolve => setTimeout(resolve, this.DELAY));
  },

  /**
   * GET /api/matches - Returns list of all matches
   */
  async getMatches() {
    await this._delay();
    return [...MOCK_DATA.matches];
  },

  /**
   * GET /api/matches/live - Returns live matches
   */
  async getLiveMatches() {
    await this._delay();
    return MOCK_DATA.matches.filter(m => m.isLive);
  },

  /**
   * GET /api/matches/upcoming - Returns upcoming matches
   */
  async getUpcomingMatches() {
    await this._delay();
    return MOCK_DATA.matches.filter(m => !m.isLive);
  },

  /**
   * GET /api/matches/:id - Returns single match
   */
  async getMatch(id) {
    await this._delay();
    return MOCK_DATA.matches.find(m => m.id === id) || null;
  },

  /**
   * GET /api/matches/featured - Returns featured match
   */
  async getFeaturedMatch() {
    await this._delay();
    return MOCK_DATA.featuredMatch;
  },

  /**
   * POST /api/bets - Creates a new bet
   */
  async placeBet(betData) {
    await this._delay();
    
    // Check if user is logged in
    const user = Auth.getCurrentUser();
    if (!user) {
      throw new Error('User not logged in');
    }

    // Check if user has enough coins
    if (user.balance < betData.amount) {
      throw new Error('Insufficient coins');
    }

    // Create new bet
    const newBet = {
      id: 'bet_' + Date.now(),
      matchId: betData.matchId,
      matchName: betData.matchName,
      selection: betData.selection,
      odds: betData.odds,
      amount: betData.amount,
      potentialWin: betData.amount * betData.odds,
      status: 'pending',
      placedAt: new Date().toISOString()
    };

    // Update user balance
    user.balance -= betData.amount;
    Auth.updateUser(user);

    // Add bet to history
    const bets = JSON.parse(localStorage.getItem('goalmaster_bets') || '[]');
    bets.unshift(newBet);
    localStorage.setItem('goalmaster_bets', JSON.stringify(bets));

    return newBet;
  },

  /**
   * GET /api/bets/history - Returns user bet history
   */
  async getBetHistory() {
    await this._delay();
    
    const user = Auth.getCurrentUser();
    if (!user) {
      return [];
    }

    const bets = JSON.parse(localStorage.getItem('goalmaster_bets') || '[]');
    return bets;
  },

  /**
   * GET /api/user - Returns logged user info
   */
  async getUser() {
    await this._delay();
    return Auth.getCurrentUser();
  },

  /**
   * GET /api/leaderboard - Returns ranking data
   */
  async getLeaderboard() {
    await this._delay();
    
    // Get current user to potentially include in leaderboard
    const currentUser = Auth.getCurrentUser();
    let leaderboard = [...MOCK_DATA.leaderboard];
    
    // If user is logged in, update their entry or add them
    if (currentUser) {
      const userIndex = leaderboard.findIndex(u => u.username === currentUser.username);
      if (userIndex >= 0) {
        leaderboard[userIndex].coins = currentUser.balance;
      } else {
        leaderboard.push({
          id: currentUser.id,
          username: currentUser.username,
          coins: currentUser.balance,
          avatar: currentUser.avatar
        });
      }
      // Re-sort by coins
      leaderboard.sort((a, b) => b.coins - a.coins);
    }
    
    return leaderboard;
  }
};

/**
 * Mock Data Store
 */
const MOCK_DATA = {
  // Featured match for hero banner
  featuredMatch: {
    id: 'match_featured',
    league: 'Premier League',
    homeTeam: {
      name: 'Arsenal',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/180px-Arsenal_FC.svg.png'
    },
    awayTeam: {
      name: 'Chelsea',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/180px-Chelsea_FC.svg.png'
    },
    kickoff: '2026-01-15T20:00:00Z',
    isLive: false,
    odds: {
      home: 2.30,
      draw: 2.80,
      away: 2.60
    }
  },

  // All matches
  matches: [
    {
      id: 'match_1',
      league: 'Premier League',
      homeTeam: {
        name: 'Liverpool',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/180px-Liverpool_FC.svg.png'
      },
      awayTeam: {
        name: 'Man City',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/180px-Manchester_City_FC_badge.svg.png'
      },
      kickoff: '2026-01-15T17:30:00Z',
      isLive: true,
      minute: 65,
      score: { home: 2, away: 1 },
      odds: {
        home: 2.75,
        draw: 3.60,
        away: 2.40
      }
    },
    {
      id: 'match_2',
      league: 'La Liga',
      homeTeam: {
        name: 'Real Madrid',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/180px-Real_Madrid_CF.svg.png'
      },
      awayTeam: {
        name: 'Barcelona',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/180px-FC_Barcelona_%28crest%29.svg.png'
      },
      kickoff: '2026-01-15T20:00:00Z',
      isLive: false,
      odds: {
        home: 2.50,
        draw: 3.50,
        away: 2.70
      }
    },
    {
      id: 'match_3',
      league: 'Serie A',
      homeTeam: {
        name: 'Juventus',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/180px-Juventus_FC_2017_icon_%28black%29.svg.png'
      },
      awayTeam: {
        name: 'AC Milan',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/180px-Logo_of_AC_Milan.svg.png'
      },
      kickoff: '2026-01-15T21:30:00Z',
      isLive: false,
      odds: {
        home: 2.20,
        draw: 3.30,
        away: 3.10
      }
    },
    {
      id: 'match_4',
      league: 'Bundesliga',
      homeTeam: {
        name: 'Bayern Munich',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/180px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png'
      },
      awayTeam: {
        name: 'Dortmund',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/180px-Borussia_Dortmund_logo.svg.png'
      },
      kickoff: '2026-01-16T18:30:00Z',
      isLive: false,
      odds: {
        home: 1.85,
        draw: 3.80,
        away: 3.90
      }
    },
    {
      id: 'match_5',
      league: 'Ligue 1',
      homeTeam: {
        name: 'PSG',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/180px-Paris_Saint-Germain_F.C..svg.png'
      },
      awayTeam: {
        name: 'Marseille',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/180px-Olympique_Marseille_logo.svg.png'
      },
      kickoff: '2026-01-16T20:45:00Z',
      isLive: false,
      odds: {
        home: 1.65,
        draw: 4.00,
        away: 5.00
      }
    },
    {
      id: 'match_6',
      league: 'Premier League',
      homeTeam: {
        name: 'Tottenham',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/180px-Tottenham_Hotspur.svg.png'
      },
      awayTeam: {
        name: 'Man United',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/180px-Manchester_United_FC_crest.svg.png'
      },
      kickoff: '2026-01-17T15:00:00Z',
      isLive: false,
      odds: {
        home: 2.60,
        draw: 3.40,
        away: 2.55
      }
    }
  ],

  // Leaderboard data
  leaderboard: [
    {
      id: 'user_1',
      username: 'JoãoBet',
      coins: 4350,
      avatar: 'https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?w=100&h=100&fit=crop'
    },
    {
      id: 'user_2',
      username: 'AnaScore',
      coins: 3800,
      avatar: 'https://images.unsplash.com/photo-1607639106901-28314a0a622e?w=100&h=100&fit=crop'
    },
    {
      id: 'user_3',
      username: 'RickGol',
      coins: 3250,
      avatar: 'https://images.unsplash.com/photo-1657771072153-878f8b0ce74a?w=100&h=100&fit=crop'
    },
    {
      id: 'user_4',
      username: 'LuizaPicks',
      coins: 2900,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    {
      id: 'user_5',
      username: 'PedroWins',
      coins: 2650,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop'
    },
    {
      id: 'user_6',
      username: 'MariaGoals',
      coins: 2400,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    {
      id: 'user_7',
      username: 'CarlosAce',
      coins: 2150,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    },
    {
      id: 'user_8',
      username: 'SofiaKick',
      coins: 1980,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    },
    {
      id: 'user_9',
      username: 'BrunoNet',
      coins: 1820,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    {
      id: 'user_10',
      username: 'JuliaStar',
      coins: 1650,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
    }
  ]
};

// Make API available globally
window.API = API;
window.MOCK_DATA = MOCK_DATA;

