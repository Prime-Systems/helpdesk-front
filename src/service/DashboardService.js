import axios from '@/plugins/axios';

/**
 * Service for dashboard statistics via the Dashboard Module API
 * Base Path: /api/v1/dashboard
 */
export const DashboardService = {
    /**
     * Get dashboard statistics
     * @param {Object} params - Query parameters
     * @param {string} params.period - Time period (today|week|month|quarter)
     * @param {string} params.comparison - Comparison period (previous_period|last_year)
     * @returns {Promise<DashboardStatsDto>}
     */
    async getStats(params = {}) {
        const response = await axios.get('/dashboard/stats', {
            params: {
                period: params.period || 'week',
                comparison: params.comparison || 'previous_period'
            }
        });
        return response.data;
    },

    /**
     * Get trend data for charts
     * @param {Object} params - Query parameters
     * @param {string} params.period - Time period (week|month|quarter|year)
     * @returns {Promise<DashboardTrendsDto>}
     */
    async getTrends(params = {}) {
        const response = await axios.get('/dashboard/trends', {
            params: {
                period: params.period || 'month'
            }
        });
        return response.data;
    },

    /**
     * Get top performing agents
     * @param {Object} params - Query parameters
     * @param {number} params.limit - Number of results (default 5)
     * @param {string} params.period - Time period (week|month|quarter)
     * @returns {Promise<Array<TopPerformerDto>>}
     */
    async getTopPerformers(params = {}) {
        const response = await axios.get('/dashboard/top-performers', {
            params: {
                limit: params.limit || 5,
                period: params.period || 'month'
            }
        });
        return response.data;
    },

    /**
     * Get recent activity feed
     * @param {Object} params - Query parameters
     * @param {number} params.limit - Number of results (default 10)
     * @returns {Promise<Array<ActivityDto>>}
     */
    async getActivity(params = {}) {
        const response = await axios.get('/dashboard/activity', {
            params: {
                limit: params.limit || 10
            }
        });
        return response.data;
    }
};
