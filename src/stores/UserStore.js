import { UserService } from '@/service/UserService';
import { defineStore } from 'pinia';
import { useAuthStore } from './AuthStore';

export const useUserStore = defineStore('user', {
    state: () => ({
        profile: null,
        performanceStats: null,
        leaveHistory: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchProfile() {
            this.loading = true;
            this.error = null;

            try {
                const response = await UserService.getCurrentProfile();
                this.profile = response;
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to load profile';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateProfile(profileData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await UserService.updateProfile(profileData);
                this.profile = response;
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to update profile';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async uploadProfilePicture(file) {
            this.loading = true;
            this.error = null;

            try {
                const response = await UserService.uploadProfilePicture(file);
                if (this.profile) {
                    this.profile.profilePictureUrl = response.data?.profilePictureUrl || response.profilePictureUrl;
                }
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to upload picture';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async changePassword(passwordData) {
            this.loading = true;
            this.error = null;

            try {
                await UserService.changePassword(passwordData);
                // Update auth store if needed
                const authStore = useAuthStore();
                authStore.setRequirePasswordChange(false);
            } catch (error) {
                this.error = error.message || 'Failed to change password';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchPerformanceStats() {
            this.loading = true;
            this.error = null;

            try {
                const response = await UserService.getPerformanceStats();
                this.performanceStats = response;
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to load performance stats';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchLeaveHistory() {
            this.loading = true;
            this.error = null;

            try {
                const response = await UserService.getLeaveHistory();
                this.leaveHistory = response;
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to load leave history';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async applyForLeave(leaveData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await UserService.applyForLeave(leaveData);
                // Add to leave history
                this.leaveHistory.unshift(response);
                return response;
            } catch (error) {
                this.error = error.message || 'Failed to apply for leave';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async cancelLeave(leaveId) {
            this.loading = true;
            this.error = null;

            try {
                await UserService.cancelLeave(leaveId);
                // Update leave status in history
                const index = this.leaveHistory.findIndex((leave) => leave.id === leaveId);
                if (index !== -1) {
                    this.leaveHistory[index].status = 'CANCELLED';
                    this.leaveHistory[index].statusDisplay = 'Cancelled';
                }
            } catch (error) {
                this.error = error.message || 'Failed to cancel leave';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        clearError() {
            this.error = null;
        }
    },

    getters: {
        getProfile: (state) => state.profile,
        getPerformanceStats: (state) => state.performanceStats,
        getLeaveHistory: (state) => state.leaveHistory,
        getPendingLeaves: (state) => state.leaveHistory.filter((leave) => leave.status === 'PENDING' || leave.status === 'IN_REVIEW'),
        getApprovedLeaves: (state) => state.leaveHistory.filter((leave) => leave.status === 'APPROVED'),
        isLoading: (state) => state.loading,
        getError: (state) => state.error,
        getFullName: (state) => {
            if (!state.profile) return '';
            return `${state.profile.firstName} ${state.profile.lastName}`.trim();
        },
        getEmployeeId: (state) => state.profile?.employeeId || '',
        getDepartmentName: (state) => state.profile?.departmentName || '',
        getProfilePicture: (state) => state.profile?.profilePictureUrl || null
    }
});
