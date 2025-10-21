import { EmployeeService } from '@/service/EmployeeService';
import { defineStore } from 'pinia';

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        employees: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchEmployees() {
            this.loading = true;
            this.error = null;

            try {
                const response = await EmployeeService.getEmployees();
                this.employees = response;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async addEmployee(employeeData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await EmployeeService.addEmployee(employeeData);
                this.employees.push(response);
                return response;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateEmployee(employeeData) {
            this.loading = true;
            this.error = null;

            try {
                const response = await EmployeeService.updateEmployee(employeeData);
                const index = this.employees.findIndex((e) => e.id === employeeData.id);
                if (index !== -1) {
                    this.employees[index] = response;
                }
                return response;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteEmployee(id) {
            this.loading = true;
            this.error = null;

            try {
                await EmployeeService.deleteEmployee(id);
                this.employees = this.employees.filter((e) => e.id !== id);
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        }
    },

    getters: {
        getEmployees: (state) => state.employees,
        isLoading: (state) => state.loading,
        getError: (state) => state.error,
        getEmployeeById: (state) => (id) => {
            return state.employees.find((employee) => employee.id === id);
        },
        getEmployeeCount: (state) => {
            return state.employees.length;
        }
    }
});
