import api from '@/plugins/axios';

/**
 * Service for managing leave requests
 * User leave endpoints: /api/v1/users/leave
 * Admin leave endpoints: /api/v1/leaves
 */
export const LeaveService = {
    // ============ User Leave Endpoints (/users/leave) ============

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
    async getMyLeaveHistory() {
        const response = await api.get('/users/leave/history');
        return response.data;
    },

    /**
     * Cancel current user's leave request
     * @param {number} leaveId - Leave request ID
     */
    async cancelMyLeave(leaveId) {
        return api.post(`/users/leave/${leaveId}/cancel`);
    },

    // ============ Admin Leave Endpoints (/leaves) ============

    /**
     * Get all pending leave requests (managers/admins)
     * @returns {Promise<Array<LeaveRequestDto>>}
     */
    async getAllPendingLeaves() {
        const response = await api.get('/leaves/pending');
        return response.data;
    },

    /**
     * Get leave request by ID
     * @param {number} leaveId - Leave ID
     * @returns {Promise<LeaveRequestDto>}
     */
    async getLeaveById(leaveId) {
        const response = await api.get(`/leaves/${leaveId}`);
        return response.data;
    },

    /**
     * Update leave request status (approve/reject)
     * @param {number} leaveId - Leave ID
     * @param {Object} statusData - UpdateLeaveStatusDto {status, comments}
     * @returns {Promise<LeaveRequestDto>}
     */
    async updateLeaveStatus(leaveId, statusData) {
        const response = await api.put(`/leaves/${leaveId}/status`, statusData);
        return response.data;
    },

    /**
     * Get all leaves for a department
     * @param {number} departmentId - Department ID
     * @returns {Promise<Array<LeaveRequestDto>>}
     */
    async getDepartmentLeaves(departmentId) {
        const response = await api.get(`/leaves/department/${departmentId}`);
        return response.data;
    }
};
