import EmployeeService from '@/services/EmployeeService.js';
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
                this.employees = response.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async addEmployee(employee) {
            this.loading = true;
            this.error = null;

            try {
                const response = await EmployeeService.addEmployee(employee);
                this.employees.push(response.data);
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async updateEmployee(employee) {
            this.loading = true;
            this.error = null;

            try {
                const response = await EmployeeService.updateEmployee(employee);
                const index = this.employees.findIndex((e) => e.id === employee.id);
                if (index !== -1) {
                    this.employees[index] = response.data;
                }
            } catch (error) {
                this.error = error.message;
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
    }
});
