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
        const metricMap = {
            resolution: 'RESOLUTION_TIME',
            resolution_time: 'RESOLUTION_TIME',
            volume: 'VOLUME',
            firstResponse: 'FIRST_RESPONSE',
            first_response: 'FIRST_RESPONSE',
            satisfaction: 'SATISFACTION'
        };

        const periodMap = {
            today: 'TODAY',
            week: 'WEEK',
            month: 'MONTH',
            quarter: 'QUARTER',
            year: 'YEAR',
            all: 'ALL'
        };

        const response = await axios.get('/leaderboard', {
            params: {
                metric: metricMap[params.metric] || params.metric || 'VOLUME',
                period: periodMap[params.period] || params.period || 'MONTH',
                departmentId: params.departmentId,
                branchId: params.branchId,
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
        const periodMap = {
            today: 'TODAY',
            week: 'WEEK',
            month: 'MONTH',
            quarter: 'QUARTER',
            year: 'YEAR',
            all: 'ALL'
        };
        const response = await axios.get(`/leaderboard/agent/${userId}`, {
            params: { period: periodMap[period] || period || 'MONTH' }
        });
        return response.data;
    }
};
