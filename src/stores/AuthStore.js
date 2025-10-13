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
        refreshTokenExpiresAt: null,
    }),

    actions: {
        async initialize() {
            if (this.initialized) return;

            try {
                // Check for tokens in cookies first (more secure)
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
                        // Token is valid, verify with backend
                        const user = await AuthService.verifyToken(token);
                        if (user) {
                            this.setAuth(user, token, refreshToken);
                        } else {
                            this.clearAuth();
                        }
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
                const { user, token, refreshToken } = await AuthService.login(email, password);
                this.rememberMe = rememberMe;
                this.setAuth(user, token, refreshToken);
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
                const { user, token, refreshToken } = await AuthService.register(userData);
                this.setAuth(user, token, refreshToken);
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
                const { token, refreshToken, user } = await AuthService.refreshToken(this.refreshToken);
                this.setAuth(user, token, refreshToken);
                return true;
            } catch (error) {
                console.error('Token refresh failed:', error);
                this.clearAuth();
                return false;
            }
        },

        async forgotPassword(email) {
            this.loading = true;
            this.error = null;
            try {
                await AuthService.forgotPassword(email);
                return true;
            } catch (err) {
                this.handleAuthError(err);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async resetPassword(token, newPassword) {
            this.loading = true;
            this.error = null;
            try {
                await AuthService.resetPassword(token, newPassword);
                return true;
            } catch (err) {
                this.handleAuthError(err);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async changePassword(currentPassword, newPassword) {
            this.loading = true;
            this.error = null;
            try {
                await AuthService.changePassword(currentPassword, newPassword);
                return true;
            } catch (err) {
                this.handleAuthError(err);
                return false;
            } finally {
                this.loading = false;
            }
        },

        async updateProfile(profileData) {
            this.loading = true;
            this.error = null;
            try {
                const updatedUser = await AuthService.updateProfile(profileData);
                this.user = { ...this.user, ...updatedUser };
                return true;
            } catch (err) {
                this.handleAuthError(err);
                return false;
            } finally {
                this.loading = false;
            }
        },

        setAuth(user, token, refreshToken = null) {
            this.user = user;
            this.token = token;
            this.refreshToken = refreshToken;

            // Decode tokens to get expiration times
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log('Decoded token:', decodedToken);
                this.user = decodedToken;
                this.tokenExpiresAt = decodedToken.exp * 1000; // Convert to milliseconds
            }

            if (refreshToken) {
                const decodedRefreshToken = jwtDecode(refreshToken);
                this.refreshTokenExpiresAt = decodedRefreshToken.exp * 1000;
            }

            // Store tokens based on remember me preference
            this.storeTokens(token, refreshToken);

            // Set default authorization header
            this.setAuthHeader(token);
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

        // Token management helpers
        isTokenExpired(token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                return decoded.exp < currentTime;
            } catch {
                return true;
            }
        },

        getStoredToken() {
            // Try cookies first, then localStorage
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
                // Store in localStorage for persistence
                localStorage.setItem('token', token);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
            } else {
                // Store in session storage or cookies
                this.setCookie('token', token, this.tokenExpiresAt);
                if (refreshToken) {
                    this.setCookie('refreshToken', refreshToken, this.refreshTokenExpiresAt);
                }
            }
        },

        clearStoredTokens() {
            // Clear from all storage locations
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

            // Add Secure flag in production
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

            // Handle specific error codes
            if (err.response?.status === 401) {
                this.clearAuth();
            }
        },

        clearError() {
            this.error = null;
        }
    },

    getters: {
        isAuthenticated: (state) => !!state.token,
        isLoading: (state) => state.loading,
        hasError: (state) => !!state.error,
        userRole: (state) => state.userRole || null,
        userName: (state) => state.userName || null,
        userEmail: (state) => state.userEmail || null,
        userId: (state) => state.userId || null,
        currentError: (state) => state.error,
        hasRole: (state) => (role) => state.userRole === role,
        hasPermission: (state) => (permission) => state.user?.permissions?.includes(permission) || false,
        tokenExpiration: (state) => (state.tokenExpiresAt ? new Date(state.tokenExpiresAt) : null),
        isTokenExpiring: (state) => {
            if (!state.tokenExpiresAt) return false;
            const timeUntilExpiry = state.tokenExpiresAt - Date.now();
            return timeUntilExpiry < 5 * 60 * 1000; // Less than 5 minutes
        }
    }
});
