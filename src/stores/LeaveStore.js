import { LeaveService } from '@/service/LeaveService';
import { defineStore } from 'pinia';

export const useLeaveStore = defineStore('leave', {
    state: () => ({
        pendingLeaves: [],
        departmentLeaves: [],
        allLeaves: [],
        selectedLeave: null,
        loading: false,
        error: null,
        statistics: null
    }),

    actions: {
        async fetchPendingLeaves() {
            this.loading = true;
            this.error = null;

            try {
                const response = await LeaveService.getAllPendingLeaves();
                this.pendingLeaves = response;
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to load pending leaves';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchDepartmentLeaves(departmentId) {
            this.loading = true;
            this.error = null;

            try {
                const response = await LeaveService.getDepartmentLeaves(departmentId);
                this.departmentLeaves = response;
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to load department leaves';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchLeaveById(leaveId) {
            this.loading = true;
            this.error = null;

            try {
                const response = await LeaveService.getLeaveById(leaveId);
                this.selectedLeave = response;
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to load leave details';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateLeaveStatus(leaveId, statusData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await LeaveService.updateLeaveStatus(leaveId, statusData);

                // Update in pending leaves
                const pendingIndex = this.pendingLeaves.findIndex((leave) => leave.id === leaveId);
                if (pendingIndex !== -1) {
                    this.pendingLeaves.splice(pendingIndex, 1);
                }

                // Update in department leaves
                const deptIndex = this.departmentLeaves.findIndex((leave) => leave.id === leaveId);
                if (deptIndex !== -1) {
                    this.departmentLeaves[deptIndex] = response;
                }

                return response;
            } catch (error) {
                this.error = error.message || 'Failed to update leave status';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchStatistics() {
            this.loading = true;
            this.error = null;

            try {
                const response = await LeaveService.getLeaveStatistics();
                this.statistics = response;
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to load statistics';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchTeamLeaves() {
            this.loading = true;
            this.error = null;

            try {
                const response = await LeaveService.getTeamLeaves();
                this.allLeaves = response;
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to load team leaves';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        clearSelectedLeave() {
            this.selectedLeave = null;
        },

        clearError() {
            this.error = null;
        }
    },

    getters: {
        getPendingLeaves: (state) => state.pendingLeaves,
        getDepartmentLeaves: (state) => state.departmentLeaves,
        getSelectedLeave: (state) => state.selectedLeave,
        getAllLeaves: (state) => state.allLeaves,
        getStatistics: (state) => state.statistics,
        isLoading: (state) => state.loading,
        getError: (state) => state.error,
        getPendingCount: (state) => state.pendingLeaves.length,
        getDepartmentLeaveCount: (state) => state.departmentLeaves.length
    }
});
