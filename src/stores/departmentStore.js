import { DepartmentService } from '@/service/DepartmentService';
import { defineStore } from 'pinia';

export const useDepartmentStore = defineStore('department', {
    state: () => ({
        departments: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchDepartments() {
            this.loading = true;
            this.error = null;
            try {
                console.log('Fetching departments from API...');
                const data = await DepartmentService.getDepartments();
                this.departments = data;
                console.log('Departments fetched successfully:', this.departments);
                return this.departments;
            } catch (error) {
                console.error('Error fetching departments:', error);
                this.error = error.message || 'Failed to fetch departments';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addDepartment(department) {
            this.loading = true;
            this.error = null;
            try {
                const newDepartment = await DepartmentService.createDepartment(department);
                this.departments.push(newDepartment);
                return newDepartment;
            } catch (error) {
                console.error('Error creating department:', error);
                this.error = error.message || 'Failed to create department';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateDepartment(department) {
            this.loading = true;
            this.error = null;
            try {
                const updatedDepartment = await DepartmentService.updateDepartment(department.id, department);
                const index = this.departments.findIndex((d) => d.id === department.id);
                if (index !== -1) {
                    this.departments[index] = updatedDepartment;
                }
                return updatedDepartment;
            } catch (error) {
                console.error('Error updating department:', error);
                this.error = error.message || 'Failed to update department';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteDepartment(id) {
            this.loading = true;
            this.error = null;
            try {
                await DepartmentService.deleteDepartment(id);
                this.departments = this.departments.filter((d) => d.id !== id);
                return true;
            } catch (error) {
                console.error('Error deleting department:', error);
                this.error = error.message || 'Failed to delete department';
                throw error;
            } finally {
                this.loading = false;
            }
        }
    },

    getters: {
        departmentById: (state) => (id) => {
            return state.departments.find((d) => d.id === id) || null;
        },

        departmentsByManager: (state) => (managerId) => {
            return state.departments.filter((d) => d.departmentManager?.id === managerId);
        },

        activeDepartments: (state) => {
            return state.departments.filter((d) => d.status === 'ACTIVE');
        },

        getDepartmentsWithEmployees: (state) => {
            return state.departments.filter((d) => d.teamMembers?.length > 0);
        },

        getDepartmentsCount: (state) => {
            return state.departments.length;
        },

        getActiveDepartmentsCount: (state) => {
            return state.departments.filter((d) => d.status === 'ACTIVE').length;
        }
    }
});
