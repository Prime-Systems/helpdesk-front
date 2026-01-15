import api from '@/plugins/axios';

/**
 * Service for current user profile operations via the User Module API
 * Base Path: /api/v1/users
 */
export const UserService = {
    // ============ Profile Management ============

    /**
     * Get current user's profile
     * @returns {Promise<SignUpResponse>}
     */
    async getCurrentProfile() {
        const response = await api.get('/users/profile');
        return response.data;
    },

    /**
     * Update current user's profile
     * @param {Object} profileData - UserProfileDto
     * @returns {Promise<SignUpResponse>}
     */
    async updateProfile(profileData) {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    },

    /**
     * Upload profile picture for current user
     * @param {File} file - Image file
     * @returns {Promise<SignUpResponse>}
     */
    async uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/users/profile/picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Change current user's password
     * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
     * @returns {Promise<void>}
     */
    async changePassword(passwordData) {
        const response = await api.post('/users/change-password', passwordData);
        return response.data;
    },

    // ============ Performance Stats ============

    /**
     * Get current user's performance statistics
     * @returns {Promise<UserPerformanceStatsDto>}
     */
    async getPerformanceStats() {
        const response = await api.get('/users/profile/performance');
        return response.data;
    },

    // ============ Leave Management ============

    /**
     * Apply for leave (current user)
     * @param {Object} leaveData - CreateLeaveRequestDto
     * @returns {Promise<LeaveRequestDto>}
     */
    async applyForLeave(leaveData) {
        const response = await api.post('/users/leave', leaveData);
        return response.data;
    },

    /**
     * Get current user's leave history
     * @returns {Promise<Array<LeaveRequestDto>>}
     */
    async getLeaveHistory() {
        const response = await api.get('/users/leave/history');
        return response.data;
    },

    /**
     * Cancel a leave request
     * @param {number} leaveId - Leave request ID
     */
    async cancelLeave(leaveId) {
        return api.post(`/users/leave/${leaveId}/cancel`);
    }
};
