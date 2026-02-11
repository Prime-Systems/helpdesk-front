import axios from '@/plugins/axios';

/**
 * Service for managing categories via the Category Module API
 * Base Path: /api/v1/categories
 */
export const CategoryService = {
    /**
     * Get all categories
     * @returns {Promise<Array<CategoryDto>>}
     */
    async getCategories() {
        const response = await axios.get('/categories');
        return response.data;
    },

    /**
     * Get category by ID
     * @param {number} categoryId - Category ID
     * @returns {Promise<CategoryDto>}
     */
    async getCategoryById(categoryId) {
        const response = await axios.get(`/categories/${categoryId}`);
        return response.data;
    },

    /**
     * Create a new category
     * @param {Object} categoryData - CategoryDto
     * @returns {Promise<CategoryDto>}
     */
    async createCategory(categoryData) {
        const response = await axios.post('/categories', categoryData);
        return response.data;
    },

    /**
     * Update an existing category
     * @param {number} categoryId - Category ID
     * @param {Object} categoryData - CategoryDto
     * @returns {Promise<CategoryDto>}
     */
    async updateCategory(categoryId, categoryData) {
        const response = await axios.put(`/categories/${categoryId}`, categoryData);
        return response.data;
    },

    /**
     * Delete a category
     * @param {number} categoryId - Category ID
     */
    async deleteCategory(categoryId) {
        const response = await axios.delete(`/categories/${categoryId}`);
        return response.data;
    },

    /**
     * Get direct subcategories of a category
     * @param {number} parentId - Parent category ID
     * @returns {Promise<Array<CategoryDto>>}
     */
    async getSubcategories(parentId) {
        const response = await axios.get(`/categories/${parentId}/subcategories`);
        return response.data;
    }
};
