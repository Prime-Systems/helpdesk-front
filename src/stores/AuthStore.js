import { AuthService } from '@/service/AuthService';
import { jwtDecode } from 'jwt-decode';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        refreshToken: null,
        error: null,
        loading: false,
        initialized: false,
        rememberMe: false,
        tokenExpiresAt: null,
        refreshTokenExpiresAt: null
    }),

    actions: {
        async initialize() {
            if (this.initialized) return;

            try {
                const token = this.getStoredToken();
                const refreshToken = this.getStoredRefreshToken();

                if (token) {
                    // Check if token is expired
                    if (this.isTokenExpired(token)) {
                        if (refreshToken && !this.isTokenExpired(refreshToken)) {
                            await this.refreshSession();
                        } else {
                            this.clearAuth();
                        }
                    } else {
                        // Token is valid, set user from token
                        this.setAuthFromToken(token, refreshToken);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                this.clearAuth();
            } finally {
                this.initialized = true;
            }
        },

        async login(email, password, rememberMe = false) {
            this.loading = true;
            this.error = null;
            try {
                const response = await AuthService.login(email, password);
                this.rememberMe = rememberMe;

                // Extract user info from token
                this.setAuthFromToken(response.token, response.refreshToken);
                return true;
            } catch (err) {
                this.handleAuthError(err);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async register(userData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await AuthService.register(userData);
                this.setAuthFromToken(response.token, response.refreshToken);
                return true;
            } catch (err) {
                this.handleAuthError(err);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                if (this.token) {
                    await AuthService.logout(this.token);
                }
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                this.clearAuth();
            }
        },

        async refreshSession() {
            if (!this.refreshToken) {
                this.clearAuth();
                return false;
            }

            try {
                const response = await AuthService.refreshToken(this.refreshToken);
                this.setAuthFromToken(response.token, response.refreshToken);
                return true;
            } catch (error) {
                console.error('Token refresh failed:', error);
                this.clearAuth();
                return false;
            }
        },

        // Method to extract user from token
        setAuthFromToken(token, refreshToken = null) {
            this.token = token;
            this.refreshToken = refreshToken;

            // Decode token to get user information
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log('Decoded token:', decodedToken);

                // Create user object from token claims
                this.user = {
                    id: decodedToken.userId,
                    email: decodedToken.email || decodedToken.sub,
                    role: decodedToken.role,
                    changePassword: decodedToken['change password'] // Handle space in claim name
                    // Add other claims as needed
                };

                // Store expiration time in milliseconds
                this.tokenExpiresAt = decodedToken.exp * 1000;
            }

            if (refreshToken) {
                try {
                    const decodedRefreshToken = jwtDecode(refreshToken);
                    this.refreshTokenExpiresAt = decodedRefreshToken.exp * 1000;
                } catch (error) {
                    console.error('Error decoding refresh token:', error);
                    this.refreshTokenExpiresAt = null;
                }
            }

            // Store tokens based on remember me preference
            this.storeTokens(token, refreshToken);

            // Set default authorization header
            this.setAuthHeader(token);
        },

        setAuth(user, token, refreshToken = null) {
            this.user = user;
            this.setAuthFromToken(token, refreshToken);
        },

        clearAuth() {
            this.user = null;
            this.token = null;
            this.refreshToken = null;
            this.error = null;
            this.tokenExpiresAt = null;
            this.refreshTokenExpiresAt = null;

            // Clear stored tokens
            this.clearStoredTokens();

            // Remove authorization header
            this.removeAuthHeader();
        },

        // Token management helpers - FIXED
        isTokenExpired(token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000; // Current time in seconds
                return decoded.exp < currentTime;
            } catch {
                return true;
            }
        },

        // Auto-refresh token if expiring soon
        async autoRefreshIfNeeded() {
            if (this.token && this.isTokenExpiring) {
                console.log('Token expiring soon, attempting refresh...');
                return await this.refreshSession();
            }
            return true;
        },

        getStoredToken() {
            const cookieToken = this.getCookie('token');
            if (cookieToken) return cookieToken;
            return localStorage.getItem('token');
        },

        getStoredRefreshToken() {
            const cookieRefreshToken = this.getCookie('refreshToken');
            if (cookieRefreshToken) return cookieRefreshToken;
            return localStorage.getItem('refreshToken');
        },

        storeTokens(token, refreshToken) {
            if (this.rememberMe) {
                localStorage.setItem('token', token);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
            } else {
                // Store in sessionStorage for session-only persistence
                sessionStorage.setItem('token', token);
                if (refreshToken) {
                    sessionStorage.setItem('refreshToken', refreshToken);
                }
            }
        },

        clearStoredTokens() {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            this.deleteCookie('token');
            this.deleteCookie('refreshToken');
        },

        // Cookie helpers
        setCookie(name, value, expires) {
            const expiresDate = expires ? new Date(expires) : null;
            const cookieOptions = [`${name}=${value}`, 'path=/', 'SameSite=Strict'];

            if (expiresDate) {
                cookieOptions.push(`expires=${expiresDate.toUTCString()}`);
            }

            if (process.env.NODE_ENV === 'production') {
                cookieOptions.push('Secure');
            }

            document.cookie = cookieOptions.join('; ');
        },

        getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                return parts.pop().split(';').shift();
            }
            return null;
        },

        deleteCookie(name) {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        },

        // Axios header management
        setAuthHeader(token) {
            if (window.axios) {
                window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        },

        removeAuthHeader() {
            if (window.axios) {
                delete window.axios.defaults.headers.common['Authorization'];
            }
        },

        // Error handling
        handleAuthError(err) {
            this.error = err.response?.data?.message || err.message || 'An error occurred';

            if (err.response?.status === 401) {
                this.clearAuth();
            }
        },

        clearError() {
            this.error = null;
        }
    },

    getters: {
        isAuthenticated: (state) => !!state.token && !!state.user,
        isLoading: (state) => state.loading,
        hasError: (state) => !!state.error,
        userRole: (state) => state.user?.role || null,
        userName: (state) => state.user?.name || state.user?.email?.split('@')[0] || null,
        userEmail: (state) => state.user?.email || null,
        userId: (state) => state.user?.id || null,
        currentError: (state) => state.error,
        hasRole: (state) => (role) => state.user?.role === role,
        needsPasswordChange: (state) => state.user?.changePassword === true,

        // Token expiration getters
        tokenExpiration: (state) => {
            return state.tokenExpiresAt ? new Date(state.tokenExpiresAt) : null;
        },

        refreshTokenExpiration: (state) => {
            return state.refreshTokenExpiresAt ? new Date(state.refreshTokenExpiresAt) : null;
        },

        // Check if token is expiring soon (less than 5 minutes)
        isTokenExpiring: (state) => {
            if (!state.tokenExpiresAt) return false;
            const timeUntilExpiry = state.tokenExpiresAt - Date.now();
            return timeUntilExpiry < 5 * 60 * 1000; // Less than 5 minutes
        },

        // Check if refresh token is expiring soon
        isRefreshTokenExpiring: (state) => {
            if (!state.refreshTokenExpiresAt) return false;
            const timeUntilExpiry = state.refreshTokenExpiresAt - Date.now();
            return timeUntilExpiry < 30 * 60 * 1000; // Less than 30 minutes
        },

        // Get time until token expiration in minutes
        minutesUntilTokenExpiry: (state) => {
            if (!state.tokenExpiresAt) return 0;
            const timeUntilExpiry = state.tokenExpiresAt - Date.now();
            return Math.max(0, Math.floor(timeUntilExpiry / (60 * 1000)));
        },

        // Get time until refresh token expiration in minutes
        minutesUntilRefreshTokenExpiry: (state) => {
            if (!state.refreshTokenExpiresAt) return 0;
            const timeUntilExpiry = state.refreshTokenExpiresAt - Date.now();
            return Math.max(0, Math.floor(timeUntilExpiry / (60 * 1000)));
        },

        // Check if token is valid and not expiring soon
        hasValidToken: (state) => {
            return state.token && !state.isTokenExpiring;
        }
    }
});
