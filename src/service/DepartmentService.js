import axios from '@/plugins/axios';

export const DepartmentService = {
    async getDepartments() {
        try {
            const response = await axios.get('/departments');
            return response.data;
        } catch (error) {
            console.error('Error fetching departments:', error);
            throw error;
        }
    },

    async getDepartmentById(departmentId) {
        try {
            const response = await axios.get(`/departments/${departmentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching department:', error);
            throw error;
        }
    },

    async createDepartment(departmentData) {
        try {
            const response = await axios.post('/departments', departmentData);
            return response.data;
        } catch (error) {
            console.error('Error creating department:', error);
            throw error;
        }
    },
    async updateDepartment(departmentId, departmentData) {
        try {
            const response = await axios.put(`/departments/${departmentId}`, departmentData);
            return response.data;
        } catch (error) {
            console.error('Error updating department:', error);
            throw error;
        }
    },

    async deleteDepartment(departmentId) {
        try {
            const response = await axios.delete(`/departments/${departmentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting department:', error);
            throw error;
        }
    }
};

// export const DepartmentService = {
//     getData() {
//         return [
//             {
//                 id: 'd1',
//                 name: 'IT',
//                 description: 'Handles all IT-related issues.',
//                 manager_id: 'm1',
//                 is_active: true,
//                 email: 'it@example.com',
//                 phone: '123-456-7890',
//                 created_at: '2024-08-01T10:00:00',
//                 updated_at: '2024-08-01T10:00:00'
//             },
//             {
//                 id: 'd2',
//                 name: 'HR',
//                 description: 'Manages human resources and employee relations.',
//                 manager_id: 'm2',
//                 is_active: true,
//                 email: 'hr@example.com',
//                 phone: '123-456-7891',
//                 created_at: '2024-08-01T10:00:00',
//                 updated_at: '2024-08-01T10:00:00'
//             },
//             {
//                 id: 'd3',
//                 name: 'Finance',
//                 description: 'Responsible for financial planning and analysis.',
//                 manager_id: 'm3',
//                 is_active: true,
//                 email: 'finance@example.com',
//                 phone: '123-456-7892',
//                 created_at: '2024-08-01T10:00:00',
//                 updated_at: '2024-08-01T10:00:00'
//             }
//         ];
//     },

//     getDepartments() {
//         return Promise.resolve(this.getData());
//     }
// };
