import axios from '@/plugins/axios';
import { useAuthStore } from '@/stores/AuthStore';

export const CategoryService = {
    async getCategories() {
        try {
            // Log the token for debugging
            const authStore = useAuthStore();
            console.log('Token:', authStore.token);
            const response = await axios.get('/categories');
            console.log('Categories:', response.data);
            console.log('Status:', response);

            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    async getCategoryById(categoryId) {
        try {
            const response = await axios.get(`/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching category:', error);
            throw error;
        }
    },

    async createCategory(categoryData) {
        try {
            const response = await axios.post('/categories', categoryData);
            return response.data;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },

    async updateCategory(categoryId, categoryData) {
        try {
            const response = await axios.put(`/categories/${categoryId}`, categoryData);
            return response.data;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },
    async deleteCategory(categoryId) {
        try {
            const response = await axios.delete(`/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }
};
