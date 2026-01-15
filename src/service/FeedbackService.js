import axios from '@/plugins/axios';

/**
 * Service for managing feedback and ratings via the Feedback Module API
 * Base Path: /api/v1/feedback
 * 
 * Note: Ticket-specific feedback endpoint POST /api/v1/tickets/{ticketId}/feedback 
 * already exists in TicketService
 */
export const FeedbackService = {
    /**
     * Get all feedback (admin, paginated)
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.size - Page size
     * @param {number} params.rating - Filter by rating (1-5, optional)
     * @param {number} params.userId - Filter by agent (optional)
     * @returns {Promise<{feedback: Array<FeedbackDto>, totalItems: number}>}
     */
    async getAllFeedback(params = {}) {
        const response = await axios.get('/feedback', {
            params: {
                page: params.page || 0,
                size: params.size || 20,
                rating: params.rating,
                userId: params.userId
            }
        });
        return response.data;
    },

    /**
     * Get feedback statistics
     * @param {Object} params - Query parameters
     * @param {string} params.period - Time period (week|month|quarter|year)
     * @param {number} params.userId - Filter by agent (optional)
     * @param {number} params.departmentId - Filter by department (optional)
     * @returns {Promise<FeedbackStatsDto>}
     */
    async getStats(params = {}) {
        const response = await axios.get('/feedback/stats', {
            params: {
                period: params.period || 'month',
                userId: params.userId,
                departmentId: params.departmentId
            }
        });
        return response.data;
    },

    /**
     * Get feedback for a specific user/agent
     * @param {number} userId - User ID
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.size - Page size
     * @returns {Promise<{feedback: Array<FeedbackDto>, totalItems: number}>}
     */
    async getFeedbackByUser(userId, params = {}) {
        const response = await axios.get(`/feedback/user/${userId}`, {
            params: {
                page: params.page || 0,
                size: params.size || 10
            }
        });
        return response.data;
    },

    /**
     * Get feedback for a specific department
     * @param {number} departmentId - Department ID
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.size - Page size
     * @returns {Promise<{feedback: Array<FeedbackDto>, totalItems: number}>}
     */
    async getFeedbackByDepartment(departmentId, params = {}) {
        const response = await axios.get(`/feedback/department/${departmentId}`, {
            params: {
                page: params.page || 0,
                size: params.size || 10
            }
        });
        return response.data;
    }
};
