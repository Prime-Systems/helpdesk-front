import axios from '@/plugins/axios';

export const EmployeeService = {
    async getEmployees() {
        const response = await axios.get('/users');
        return response.data;
    },

    async addEmployee(employee) {
        const response = await axios.post('/users', employee);
        return response.data;
    },

    async updateEmployee(employee) {
        console.log('EmployeeService - Updating employee:', employee.id);
        const response = await axios.put(`/users/${employee.id}`, employee);
        return response.data;
    },

    async deleteEmployee(id) {
        await axios.delete(`/users/${id}`);
    },

    async activateOrDeactivateEmployee(id, isActive) {
        const response = await axios.patch(`/users/${id}/status?isActive=${isActive}`);
        return response.data;
    },

    async getEmployeesInDepartment(departmentId) {
        const response = await axios.get(`/users/department/${departmentId}`);
        return response.data;
    },

    async getEmployeeById(id) {
        const response = await axios.get(`/users/${id}`);
        return response.data;
    }
};
