import axios from '@/plugins/axios';

/**
 * Service for managing departments via the Department Module API
 * Base Path: /api/v1/departments
 */
export const DepartmentService = {
    /**
     * Get all departments
     * @returns {Promise<Array<DepartmentDto>>}
     */
    async getDepartments() {
        const response = await axios.get('/departments');
        // Ensure consistent format with defaults
        return response.data.map((dept) => ({
            ...dept,
            teamMembers: dept.teamMembers || [],
            departmentManager: dept.departmentManager || { id: null }
        }));
    },

    /**
     * Get department by ID
     * @param {number} id - Department ID
     * @returns {Promise<DepartmentDto>}
     */
    async getDepartmentById(id) {
        const response = await axios.get(`/departments/${id}`);
        return response.data;
    },

    /**
     * Create a new department
     * @param {Object} department - DepartmentDto
     * @returns {Promise<DepartmentDto>}
     */
    async createDepartment(department) {
        const response = await axios.post('/departments', department);
        return response.data;
    },

    /**
     * Update an existing department
     * @param {number} id - Department ID
     * @param {Object} department - DepartmentDto
     * @returns {Promise<DepartmentDto>}
     */
    async updateDepartment(id, department) {
        const response = await axios.put(`/departments/${id}`, department);
        return response.data;
    },

    /**
     * Delete a department
     * @param {number} id - Department ID
     */
    async deleteDepartment(id) {
        const response = await axios.delete(`/departments/${id}`);
        return response.data;
    }
};
