import axios from '@/plugins/axios';

export const AuthService = {
    /**
     * Authenticate user and get tokens
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<{message: string, token: string, refreshToken: string}>}
     */
    async login(email, password) {
        const response = await axios.post('/auth/login', { email, password });
        return response.data;
    },

    /**
     * Register a new admin user
     * @param {Object} userData - AdminSignUpDto
     * @returns {Promise<SignUpResponse>}
     */
    async signup(userData) {
        const response = await axios.post('/auth/signup', userData);
        return response.data;
    },

    /**
     * Logout user
     * @param {string} token - JWT token
     */
    async logout(token) {
        try {
            await axios.post(`/auth/logout?token=${encodeURIComponent(token)}`);
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    /**
     * Verify/reauthenticate token with backend
     * @param {string} token - JWT token
     * @returns {Promise<string|null>} New token or null
     */
    async verifyToken(token) {
        try {
            const response = await axios.post(`/auth/reauthenticate?token=${encodeURIComponent(token)}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    /**
     * Refresh access token using refresh token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<string>} New access token
     */
    async refreshToken(refreshToken) {
        const response = await axios.post(`/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`);
        return response.data;
    },

    /**
     * Request password reset email
     * @param {string} email - User email
     */
    async forgotPassword(email) {
        const response = await axios.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
        return response.data;
    },

    /**
     * Change user password (requires authentication)
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password (min 8 chars)
     * @returns {Promise<{message: string, token: string, refreshToken: string}>}
     */
    async changePassword(currentPassword, newPassword) {
        const response = await axios.post('/auth/change-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    }
};
