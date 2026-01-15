import axios from '@/plugins/axios';

/**
 * Service for managing leaderboard data via the Leaderboard Module API
 * Base Path: /api/v1/leaderboard
 */
export const LeaderboardService = {
    /**
     * Get leaderboard rankings
     * @param {Object} params - Query parameters
     * @param {string} params.metric - Metric to rank by (resolution_time|satisfaction|volume|first_response)
     * @param {string} params.period - Time period (today|week|month|quarter|year)
     * @param {number} params.departmentId - Filter by department (optional)
     * @param {number} params.limit - Number of results (default 10)
     * @returns {Promise<LeaderboardResponse>}
     */
    async getLeaderboard(params = {}) {
        const response = await axios.get('/leaderboard', {
            params: {
                metric: params.metric || 'resolution_time',
                period: params.period || 'month',
                departmentId: params.departmentId,
                limit: params.limit || 10
            }
        });
        return response.data;
    },

    /**
     * Get available metrics for ranking
     * @returns {Promise<Array<MetricDto>>}
     */
    async getMetrics() {
        const response = await axios.get('/leaderboard/metrics');
        return response.data;
    },

    /**
     * Get detailed agent performance
     * @param {number} userId - User ID
     * @param {string} period - Time period (optional)
     * @returns {Promise<AgentDetailedPerformanceDto>}
     */
    async getAgentPerformance(userId, period = 'month') {
        const response = await axios.get(`/leaderboard/agent/${userId}`, {
            params: { period }
        });
        return response.data;
    }
};
