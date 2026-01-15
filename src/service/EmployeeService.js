import axios from '@/plugins/axios';

/**
 * Service for managing employee/user operations via the User Module API
 * Base Path: /api/v1/users
 */
export const EmployeeService = {
    /**
     * Get all users/employees
     * @returns {Promise<Array<SignUpResponse>>}
     */
    async getEmployees() {
        const response = await axios.get('/users');
        return response.data;
    },

    /**
     * Create a new user/employee
     * @param {Object} employee - UserDto
     * @returns {Promise<SignUpResponse>}
     */
    async addEmployee(employee) {
        const response = await axios.post('/users', employee);
        return response.data;
    },

    /**
     * Update an existing user/employee
     * @param {Object} employee - UserDto with id
     * @returns {Promise<SignUpResponse>}
     */
    async updateEmployee(employee) {
        const response = await axios.put(`/users/${employee.id}`, employee);
        return response.data;
    },

    /**
     * Delete a user/employee
     * @param {number} id - User ID
     */
    async deleteEmployee(id) {
        await axios.delete(`/users/${id}`);
    },

    /**
     * Activate or deactivate a user/employee
     * @param {number} id - User ID
     * @param {boolean} isActive - Active status
     */
    async activateOrDeactivateEmployee(id, isActive) {
        const response = await axios.patch(`/users/${id}/status?isActive=${isActive}`);
        return response.data;
    },

    /**
     * Get all employees in a specific department
     * @param {number} departmentId - Department ID
     * @returns {Promise<Array<SignUpResponse>>}
     */
    async getEmployeesInDepartment(departmentId) {
        const response = await axios.get(`/users/department/${departmentId}`);
        return response.data;
    },

    /**
     * Get employee by ID
     * @param {number} id - User ID
     * @returns {Promise<SignUpResponse>}
     */
    async getEmployeeById(id) {
        const response = await axios.get(`/users/${id}`);
        return response.data;
    }
};
