import axios from '@/plugins/axios';

export const AuthService = {
    async login(email, password) {
        const response = await axios.post('/auth/login', { email, password });
        return response.data;
    },

    async register(userData) {
        const response = await axios.post('/auth/register', userData);
        return response.data;
    },

    async logout(token) {
        try {
            await axios.post('/auth/logout', { token });
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    async verifyToken(token) {
        try {
            const response = await axios.post(`/auth/reauthenticate?token=${token}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    async refreshToken(refreshToken) {
        const response = await axios.post('/auth/refresh', { refreshToken });
        return response.data;
    },

    async forgotPassword(email) {
        const response = await axios.post('/auth/forgot-password', { email });
        return response.data;
    },

    async resetPassword(token, newPassword) {
        const response = await axios.post('/auth/reset-password', {
            token,
            newPassword
        });
        return response.data;
    },

    /**
     * Change user password (requires authentication)
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise} Response with new tokens
     */
    async changePassword(currentPassword, newPassword) {
        const response = await axios.post('/auth/change-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    },

    async updateProfile(profileData) {
        const response = await axios.put('/auth/profile', profileData);
        return response.data;
    },

    async enable2FA() {
        const response = await axios.post('/auth/2fa/enable');
        return response.data;
    },

    async verify2FA(code) {
        const response = await axios.post('/auth/2fa/verify', { code });
        return response.data;
    },

    async disable2FA(code) {
        const response = await axios.post('/auth/2fa/disable', { code });
        return response.data;
    }
};
