import { BranchService } from '@/service/BranchService';
import { defineStore } from 'pinia';

export const useBranchStore = defineStore('branch', {
    state: () => ({
        branches: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchBranches() {
            this.loading = true;
            this.error = null;
            try {
                console.log('Fetching branches from API...');
                const data = await BranchService.getBranches();
                this.branches = data;
                console.log('Branches fetched successfully:', this.branches);
                return this.branches;
            } catch (error) {
                console.error('Error fetching branches:', error);
                this.error = error.message || 'Failed to fetch branches';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addBranch(branch) {
            this.loading = true;
            this.error = null;
            try {
                const newBranch = await BranchService.createBranch(branch);
                this.branches.push(newBranch);
                return newBranch;
            } catch (error) {
                console.error('Error creating branch:', error);
                this.error = error.message || 'Failed to create branch';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateBranch(branch) {
            this.loading = true;
            this.error = null;
            try {
                const updatedBranch = await BranchService.updateBranch(branch.id, branch);
                const index = this.branches.findIndex((b) => b.id === branch.id);
                if (index !== -1) {
                    this.branches[index] = updatedBranch;
                }
                return updatedBranch;
            } catch (error) {
                console.error('Error updating branch:', error);
                this.error = error.message || 'Failed to update branch';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteBranch(id) {
            this.loading = true;
            this.error = null;
            try {
                await BranchService.deleteBranch(id);
                this.branches = this.branches.filter((b) => b.id !== id);
                return true;
            } catch (error) {
                console.error('Error deleting branch:', error);
                this.error = error.message || 'Failed to delete branch';
                throw error;
            } finally {
                this.loading = false;
            }
        }
    },

    getters: {
        branchById: (state) => (id) => {
            return state.branches.find((b) => b.id === id) || null;
        },

        branchesByManager: (state) => (managerId) => {
            return state.branches.filter((b) => b.branchManagerId === managerId);
        },

        activeBranches: (state) => {
            return state.branches.filter((b) => b.status === 'ACTIVE');
        },

        getBranchesCount: (state) => {
            return state.branches.length;
        },

        getActiveBranchesCount: (state) => {
            return state.branches.filter((b) => b.status === 'ACTIVE').length;
        }
    }
});
