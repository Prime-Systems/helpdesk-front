import axios from '@/plugins/axios';
import { useAuthStore } from '@/stores/AuthStore';

export const BranchService = {
    async getBranches() {
        try {
            const authStore = useAuthStore();
            console.log('Token:', authStore.token);

            const response = await axios.get('/branch');
            console.log('Branches:', response.data);

            return response.data;
        } catch (error) {
            console.error('Error fetching branches:', error);
            throw error;
        }
    },

    async getBranchById(branchId) {
        try {
            const response = await axios.get(`/branch/${branchId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching branch:', error);
            throw error;
        }
    },

    async createBranch(branchData) {
        try {
            const response = await axios.post('/branch', branchData);
            return response.data;
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error;
        }
    },

    async updateBranch(branchId, branchData) {
        try {
            const response = await axios.put(`/branch/${branchId}`, branchData);
            return response.data;
        } catch (error) {
            console.error('Error updating branch:', error);
            throw error;
        }
    },

    async deleteBranch(branchId) {
        try {
            await axios.delete(`/api/v1/branch/${branchId}`);
        } catch (error) {
            console.error('Error deleting branch:', error);
            throw error;
        }
    }
};
