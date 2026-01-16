import axios from '@/plugins/axios';

/**
 * Service for bulk user import via the Bulk Import Module API
 * Base Path: /api/v1/users/bulk
 */
export const BulkImportService = {
    /**
     * Import users from Excel/CSV file
     * @param {File} file - Excel (.xlsx) or CSV (.csv) file
     * @param {Object} options - Import options
     * @param {boolean} options.sendWelcomeEmail - Send welcome email to new users (default true)
     * @param {string} options.defaultRole - Default role for imported users (default EMPLOYEE)
     * @param {number} options.defaultDepartmentId - Default department ID (optional)
     * @returns {Promise<BulkImportResponse>}
     */
    async importUsers(file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        if (options.sendWelcomeEmail !== undefined) {
            formData.append('sendWelcomeEmail', options.sendWelcomeEmail);
        }
        if (options.defaultRole) {
            formData.append('defaultRole', options.defaultRole);
        }
        if (options.defaultDepartmentId) {
            formData.append('defaultDepartmentId', options.defaultDepartmentId);
        }

        const response = await axios.post('/users/bulk/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Download import template
     * @param {string} format - Template format (xlsx|csv)
     * @returns {Promise<Blob>}
     */
    async downloadTemplate(format = 'xlsx') {
        const response = await axios.get('/users/bulk/template', {
            params: { format },
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Get import history
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.size - Page size
     * @returns {Promise<{imports: Array<BulkImportResponse>, totalItems: number}>}
     */
    async getImportHistory(params = {}) {
        const response = await axios.get('/users/bulk/imports', {
            params: {
                page: (params.page || 0) + 1,
                size: params.size || 10
            }
        });
        return response.data;
    },

    /**
     * Get import details including row-by-row results
     * @param {number} id - Import ID
     * @returns {Promise<BulkImportDetailDto>}
     */
    async getImportDetails(id) {
        const response = await axios.get(`/users/bulk/imports/${id}`);
        return response.data;
    }
};
