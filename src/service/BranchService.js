import axios from '@/plugins/axios';

export const BranchService = {
    async getBranches() {
        try {
            console.log('Making request to get branches');
            const response = await axios.get('/branch');

            // Ensure consistent format
            const branches = response.data.map((branch) => {
                return {
                    ...branch,
                    branchManager: branch.branchManagerId ? { id: branch.branchManagerId } : null
                };
            });

            return branches;
        } catch (error) {
            console.error('Error fetching branches:', error);
            throw error;
        }
    },

    async getBranchById(id) {
        try {
            const response = await axios.get(`/branch/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching branch ${id}:`, error);
            throw error;
        }
    },

    async createBranch(branch) {
        try {
            const request = {
                name: branch.name,
                address: branch.address,
                contactEmail: branch.contactEmail,
                branchManagerId: branch.branchManagerId,
                status: branch.status || 'ACTIVE'
            };
            const response = await axios.post('/branch', request);
            return response.data;
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error;
        }
    },

    async updateBranch(id, branch) {
        try {
            const request = {
                name: branch.name,
                address: branch.address,
                contactEmail: branch.contactEmail,
                branchManagerId: branch.branchManagerId,
                status: branch.status
            };
            const response = await axios.put(`/branch/${id}`, request);
            return response.data;
        } catch (error) {
            console.error(`Error updating branch ${id}:`, error);
            throw error;
        }
    },

    async deleteBranch(id) {
        try {
            const response = await axios.delete(`/branch/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting branch ${id}:`, error);
            throw error;
        }
    }
};
