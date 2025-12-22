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
    },

    async updateEmployeeProfile(id, profileData) {
        const response = await api.put(`/users/${id}/profile`, profileData);
        return response.data;
    },

    async getEmployeePerformance(id) {
        const response = await api.get(`/users/${id}/performance`);
        return response.data;
    },

    async uploadEmployeeProfilePicture(id, file) {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/users/${id}/profile/picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};
