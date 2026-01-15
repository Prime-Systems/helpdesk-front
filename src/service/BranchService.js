import axios from '@/plugins/axios';

/**
 * Service for managing branches via the Branch Module API
 * Base Path: /api/v1/branch
 */
export const BranchService = {
    /**
     * Get all branches
     * @returns {Promise<Array<BranchResponse>>}
     */
    async getBranches() {
        const response = await axios.get('/branch');
        return response.data;
    },

    /**
     * Get branch by ID
     * @param {number} branchId - Branch ID
     * @returns {Promise<BranchResponse>}
     */
    async getBranchById(branchId) {
        const response = await axios.get(`/branch/${branchId}`);
        return response.data;
    },

    /**
     * Create a new branch
     * @param {Object} branchData - CreateBranchRequest
     * @returns {Promise<BranchResponse>}
     */
    async createBranch(branchData) {
        const response = await axios.post('/branch', branchData);
        return response.data;
    },

    /**
     * Update an existing branch
     * @param {number} branchId - Branch ID
     * @param {Object} branchData - UpdateBranchRequest
     * @returns {Promise<BranchResponse>}
     */
    async updateBranch(branchId, branchData) {
        const response = await axios.put(`/branch/${branchId}`, branchData);
        return response.data;
    },

    /**
     * Delete a branch
     * @param {number} branchId - Branch ID
     */
    async deleteBranch(branchId) {
        await axios.delete(`/branch/${branchId}`);
    }
};
