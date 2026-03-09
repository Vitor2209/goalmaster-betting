/**
 * GoalMaster - Authentication Module
 * Handles user login, registration, and session management
 * Simulates JWT-based authentication using localStorage
 */

const Auth = {
  // Storage keys
  TOKEN_KEY: 'goalmaster_token',
  USER_KEY: 'goalmaster_user',

  /**
   * Generate a simulated JWT token
   */
  _generateToken(userId) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: userId,
      iat: Date.now(),
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    }));
    const signature = btoa('simulated_signature_' + userId);
    return `${header}.${payload}.${signature}`;
  },

  /**
   * Validate token (simulated)
   */
  _validateToken(token) {
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  },

  /**
   * Register a new user
   */
  async register(username, email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if username or email already exists
    const existingUsers = JSON.parse(localStorage.getItem('goalmaster_users') || '[]');
    
    if (existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already taken');
    }
    
    if (existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    // Create new user
    const newUser = {
      id: 'user_' + Date.now(),
      username,
      email,
      password: btoa(password), // Simple encoding (not secure, just for demo)
      balance: 1000, // Starting coins
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    };

    // Save user
    existingUsers.push(newUser);
    localStorage.setItem('goalmaster_users', JSON.stringify(existingUsers));

    // Generate token and log user in
    const token = this._generateToken(newUser.id);
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(userWithoutPassword));

    return { user: userWithoutPassword, token };
  },

  /**
   * Login user
   */
  async login(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user
    const users = JSON.parse(localStorage.getItem('goalmaster_users') || '[]');
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === btoa(password)
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this._generateToken(user.id);
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(userWithoutPassword));

    return { user: userWithoutPassword, token };
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('goalmaster_bets');
    window.location.href = '/login.html';
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return this._validateToken(token);
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    if (!this.isLoggedIn()) return null;
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Get auth token
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  /**
   * Update user data
   */
  updateUser(userData) {
    // Update in localStorage
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    
    // Update in users list
    const users = JSON.parse(localStorage.getItem('goalmaster_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userData.id);
    if (userIndex >= 0) {
      const password = users[userIndex].password;
      users[userIndex] = { ...userData, password };
      localStorage.setItem('goalmaster_users', JSON.stringify(users));
    }

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('userUpdated', { detail: userData }));
  },

  /**
   * Initialize auth state
   * Call this on page load
   */
  init() {
    // Check token validity
    if (!this.isLoggedIn()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }

    // Update header UI
    this.updateHeaderUI();

    // Listen for user updates
    window.addEventListener('userUpdated', () => {
      this.updateHeaderUI();
    });
  },

  /**
   * Update header with user info
   */
  updateHeaderUI() {
    const user = this.getCurrentUser();
    const coinAmountEl = document.querySelector('[data-testid="coin-amount"]');
    const userAvatarEl = document.querySelector('[data-testid="user-avatar"]');
    const authBtnEl = document.querySelector('[data-testid="auth-btn"]');

    if (user) {
      if (coinAmountEl) {
        coinAmountEl.textContent = user.balance.toLocaleString();
      }
      if (userAvatarEl) {
        userAvatarEl.src = user.avatar;
        userAvatarEl.style.display = 'block';
      }
      if (authBtnEl) {
        authBtnEl.textContent = 'Logout';
        authBtnEl.onclick = () => Auth.logout();
      }
    } else {
      if (coinAmountEl) {
        coinAmountEl.textContent = '0';
      }
      if (userAvatarEl) {
        userAvatarEl.style.display = 'none';
      }
      if (authBtnEl) {
        authBtnEl.textContent = 'Login';
        authBtnEl.onclick = () => window.location.href = '/login.html';
      }
    }
  },

  /**
   * Require authentication
   * Redirects to login if not logged in
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }
    return true;
  }
};

// Make Auth available globally
window.Auth = Auth;
