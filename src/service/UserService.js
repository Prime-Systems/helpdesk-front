import api from '@/plugins/axios';

export const UserService = {
    // Profile Management
    async getCurrentProfile() {
        const response = await api.get('/users/profile');
        return response.data;
    },

    async updateProfile(profileData) {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    },

    async uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/users/profile/picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    async changePassword(passwordData) {
        return api.post('/users/change-password', passwordData);
    },

    // Performance Stats
    async getPerformanceStats() {
        const response = await api.get('/users/profile/performance');
        return response.data;
    },

    // Leave Management
    async applyForLeave(leaveData) {
        const response = await api.post('/users/leave', leaveData);
        return response.data;
    },

    async getLeaveHistory() {
        const response = await api.get('/users/leave/history');
        return response.data;
    },

    async cancelLeave(leaveId) {
        return api.post(`/users/leave/${leaveId}/cancel`);
    }
};
