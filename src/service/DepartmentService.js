import axios from '@/plugins/axios';

export const DepartmentService = {
    async getDepartments() {
        try {
            console.log('Making request to get departments');
            const response = await axios.get('/departments');

            // Ensure consistent format
            const departments = response.data.map((dept) => {
                return {
                    ...dept,
                    teamMembers: dept.teamMembers || [],
                    departmentManager: dept.departmentManager || { id: null }
                };
            });

            return departments;
        } catch (error) {
            console.error('Error fetching departments:', error);
            throw error;
        }
    },

    async getDepartmentById(id) {
        try {
            const response = await axios.get(`/departments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching department ${id}:`, error);
            throw error;
        }
    },

    async createDepartment(department) {
        try {
            const response = await axios.post('/departments', department);
            return response.data;
        } catch (error) {
            console.error('Error creating department:', error);
            throw error;
        }
    },

    async updateDepartment(id, department) {
        try {
            const response = await axios.put(`/departments/${id}`, department);
            return response.data;
        } catch (error) {
            console.error(`Error updating department ${id}:`, error);
            throw error;
        }
    },

    async deleteDepartment(id) {
        try {
            const response = await axios.delete(`/departments/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting department ${id}:`, error);
            throw error;
        }
    },

    // Additional helper methods if needed
    async getDepartmentEmployees(departmentId) {
        try {
            const response = await axios.get(`/departments/${departmentId}/employees`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching employees for department ${departmentId}:`, error);
            throw error;
        }
    },

    async addEmployeeToDepartment(departmentId, employeeId) {
        try {
            const response = await axios.post(`/departments/${departmentId}/employees/${employeeId}`);
            return response.data;
        } catch (error) {
            console.error(`Error adding employee ${employeeId} to department ${departmentId}:`, error);
            throw error;
        }
    },

    async removeEmployeeFromDepartment(departmentId, employeeId) {
        try {
            const response = await axios.delete(`/departments/${departmentId}/employees/${employeeId}`);
            return response.data;
        } catch (error) {
            console.error(`Error removing employee ${employeeId} from department ${departmentId}:`, error);
            throw error;
        }
    }
};
