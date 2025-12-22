import api from '@/plugins/axios';

export const LeaveService = {
    // For employees
    async applyForLeave(leaveData) {
        const response = await api.post('/users/leave', leaveData);
        return response.data;
    },

    async getMyLeaveHistory() {
        const response = await api.get('/users/leave/history');
        return response.data;
    },

    async cancelMyLeave(leaveId) {
        return api.post(`/users/leave/${leaveId}/cancel`);
    },

    // For managers/admins
    async getAllPendingLeaves() {
        const response = await api.get('/leaves/pending');
        return response.data;
    },

    async getLeaveById(leaveId) {
        const response = await api.get(`/leaves/${leaveId}`);
        return response.data;
    },

    async updateLeaveStatus(leaveId, statusData) {
        const response = await api.put(`/leaves/${leaveId}/status`, statusData);
        return response.data;
    },

    async getDepartmentLeaves(departmentId) {
        const response = await api.get(`/leaves/department/${departmentId}`);
        return response.data;
    },

    // Statistics
    async getLeaveStatistics() {
        // This endpoint would need to be created on backend
        const response = await api.get('/leaves/statistics');
        return response.data;
    },

    async getTeamLeaves() {
        // This endpoint would need to be created on backend
        const response = await api.get('/leaves/team');
        return response.data;
    }
};
