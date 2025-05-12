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
                const response = await DepartmentService.getDepartments();
                this.departments = response;
            } catch (error) {
                this.error = error.message;

                console.error('Error fetching departments:', error);

                if (import.meta.env.DEV) {
                    //Dummy data for development
                    this.departments = [
                        {
                            id: 1,
                            name: 'IT Support',
                            description: 'Technical support and infrastructure management',
                            managerId: 1,
                            isActive: true,
                            email: 'it-support@company.com',
                            employees: [
                                { id: 1, name: 'John Smith', email: 'john.smith@company.com', role: 'IT Manager' },
                                { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'IT Specialist' }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Customer Service',
                            description: 'Customer inquiries and account support',
                            managerId: 3,
                            isActive: true,
                            email: 'customer-service@company.com',
                            employees: [
                                { id: 3, name: 'Michael Brown', email: 'michael.brown@company.com', role: 'CS Manager' },
                                { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com', role: 'CS Representative' }
                            ]
                        },
                        {
                            id: 3,
                            name: 'Operations',
                            description: 'Back-office operations and processing',
                            managerId: 5,
                            isActive: true,
                            email: 'operations@company.com',
                            employees: [
                                { id: 5, name: 'Robert Wilson', email: 'robert.wilson@company.com', role: 'Operations Director' },
                                { id: 6, name: 'Jennifer Lee', email: 'jennifer.lee@company.com', role: 'Operations Specialist' }
                            ]
                        }
                    ];
                }
            } finally {
                this.loading = false;
            }
        },

        async addDepartment(department) {
            this.loading = true;
            this.error = null;

            try {
                const response = await DepartmentService.createDepartment(department);
                this.departments.push(response);
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async updateDepartment(department) {
            this.loading = true;
            this.error = null;

            try {
                const response = await DepartmentService.updateDepartment(department);
                const index = this.departments.findIndex((d) => d.id === department.id);
                if (index !== -1) {
                    this.departments[index] = response.data;
                }
            } catch (error) {
                this.error = error.message;
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
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        }
    },

    getters: {
        getDepartments: (state) => state.departments,
        getLoading: (state) => state.loading,
        getError: (state) => state.error
    }
});
