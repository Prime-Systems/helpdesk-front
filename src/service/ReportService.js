import axios from '@/plugins/axios';

/**
 * Service for generating and managing reports via the Reports Module API
 * Base Path: /api/v1/reports
 */
export const ReportService = {
    // ============ Report Generation ============

    /**
     * Generate employee performance report
     * @param {Object} params - GenerateReportRequest
     * @param {number} params.employeeId - Employee ID
     * @param {string} params.startDate - Start date (YYYY-MM-DD)
     * @param {string} params.endDate - End date (YYYY-MM-DD)
     * @param {Array<string>} params.metrics - Metrics to include
     * @returns {Promise<ReportDto>}
     */
    async generateEmployeeReport(params) {
        const response = await axios.post('/reports/employee-performance', {
            type: 'EMPLOYEE_PERFORMANCE',
            employeeId: params.employeeId,
            startDate: params.startDate,
            endDate: params.endDate,
            metrics: params.metrics || ['ticketsResolved', 'resolutionTime', 'satisfaction', 'firstResponse']
        });
        return response.data;
    },

    /**
     * Generate department performance report
     * @param {Object} params - GenerateReportRequest
     * @param {number} params.departmentId - Department ID
     * @param {string} params.startDate - Start date (YYYY-MM-DD)
     * @param {string} params.endDate - End date (YYYY-MM-DD)
     * @param {Array<string>} params.metrics - Metrics to include
     * @returns {Promise<ReportDto>}
     */
    async generateDepartmentReport(params) {
        const response = await axios.post('/reports/department-performance', {
            type: 'DEPARTMENT_PERFORMANCE',
            departmentId: params.departmentId,
            startDate: params.startDate,
            endDate: params.endDate,
            metrics: params.metrics || ['ticketsResolved', 'resolutionTime', 'satisfaction', 'volume']
        });
        return response.data;
    },

    /**
     * Generate ticket analytics report
     * @param {Object} params - GenerateReportRequest
     * @param {string} params.startDate - Start date (YYYY-MM-DD)
     * @param {string} params.endDate - End date (YYYY-MM-DD)
     * @param {number} params.departmentId - Department ID (optional)
     * @returns {Promise<ReportDto>}
     */
    async generateTicketAnalyticsReport(params) {
        const response = await axios.post('/reports/ticket-analytics', {
            type: 'TICKET_ANALYTICS',
            startDate: params.startDate,
            endDate: params.endDate,
            departmentId: params.departmentId
        });
        return response.data;
    },

    // ============ Report Management ============

    /**
     * Get all generated reports (paginated)
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.size - Page size
     * @param {string} params.type - Filter by report type (optional)
     * @returns {Promise<{reports: Array<ReportDto>, totalItems: number}>}
     */
    async getReports(params = {}) {
        const response = await axios.get('/reports', {
            params: {
                page: params.page !== undefined ? params.page : 1,
                size: params.size || 10,
                type: params.type
            }
        });
        return response.data;
    },

    /**
     * Get report by ID
     * @param {number} id - Report ID
     * @returns {Promise<ReportDto>}
     */
    async getReportById(id) {
        const response = await axios.get(`/reports/${id}`);
        return response.data;
    },

    /**
     * Delete report
     * @param {number} id - Report ID
     */
    async deleteReport(id) {
        await axios.delete(`/reports/${id}`);
    },

    /**
     * Download report as PDF
     * @param {number} id - Report ID
     * @returns {Promise<Blob>}
     */
    async downloadReport(id) {
        const response = await axios.get(`/reports/${id}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // ============ Scheduled Reports ============

    /**
     * Schedule automatic report
     * @param {Object} scheduleData - ScheduleReportRequest
     * @returns {Promise<ScheduledReportDto>}
     */
    async scheduleReport(scheduleData) {
        const response = await axios.post('/reports/schedule', scheduleData);
        return response.data;
    },

    /**
     * Get scheduled reports
     * @returns {Promise<Array<ScheduledReportDto>>}
     */
    async getScheduledReports() {
        const response = await axios.get('/reports/schedules');
        return response.data;
    },

    /**
     * Delete scheduled report
     * @param {number} id - Schedule ID
     */
    async deleteScheduledReport(id) {
        await axios.delete(`/reports/schedules/${id}`);
    },

    /**
     * Update scheduled report status (activate/deactivate)
     * @param {number} id - Schedule ID
     * @param {boolean} active - Active status
     * @returns {Promise<ScheduledReportDto>}
     */
    async updateScheduleStatus(id, active) {
        const response = await axios.patch(`/reports/schedules/${id}/status`, null, {
            params: { active }
        });
        return response.data;
    }
};
