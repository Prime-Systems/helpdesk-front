import { CategoryService } from '@/service/CategoryService';
import { defineStore } from 'pinia';

export const useCategoryStore = defineStore('category', {
    state: () => ({
        categories: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchCategories() {
            this.loading = true;
            this.error = null;

            try {
                const response = await CategoryService.getCategories();
                console.log('Categoriesyyyyyyyyyyyyyyyyyyy:', response);
                console.log(response.data);
                this.categories = response;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching categories:', error);
                this.error = error.message || 'Failed to fetch categories';

                // For debugging during development, set mock data if API fails
                if (import.meta.env.DEV) {
                    console.warn('Using mock data in development');
                    this.categories = [
                        {
                            id: 1,
                            name: 'Test Issues',
                            description: 'Problems with physical equipment',
                            departmentId: 1,
                            departmentName: 'IT Support',
                            maxResolutionTime: 48,
                            priority: 'MEDIUM',
                            isActive: true,
                            requiresApproval: false,
                            tags: ['hardware', 'equipment']
                        },
                        {
                            id: 2,
                            name: 'Test Issues',
                            description: 'Problems with applications or operating systems',
                            departmentId: 1,
                            departmentName: 'IT Support',
                            maxResolutionTime: 24,
                            priority: 'HIGH',
                            isActive: true,
                            requiresApproval: false,
                            tags: ['software', 'applications']
                        },
                        {
                            id: 3,
                            name: 'Test Inquiries',
                            description: 'Questions about billing or payments',
                            departmentId: 2,
                            departmentName: 'Customer Service',
                            maxResolutionTime: 72,
                            priority: 'LOW',
                            isActive: true,
                            requiresApproval: true,
                            tags: ['billing', 'payments']
                        }
                    ];
                }
            } finally {
                this.loading = false;
            }
        },

        async addCategory(category) {
            this.loading = true;
            this.error = null;

            try {
                const response = await CategoryService.addCategory(category);
                this.categories.push(response.data);
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async updateCategory(category) {
            this.loading = true;
            this.error = null;

            try {
                const response = await CategoryService.updateCategory(category);
                const index = this.categories.findIndex((c) => c.id === category.id);
                if (index !== -1) {
                    this.categories[index] = response.data;
                }
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async deleteCategory(id) {
            this.loading = true;
            this.error = null;

            try {
                await CategoryService.deleteCategory(id);
                const index = this.categories.findIndex((c) => c.id === id);
                if (index !== -1) {
                    this.categories.splice(index, 1);
                }
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        }
    },

    getters: {
        getCategories: (state) => state.categories,
        getLoading: (state) => state.loading,
        getError: (state) => state.error,
        getCategoryById: (state) => (id) => {
            return state.categories.find((category) => category.id === id);
        },
        getActiveCategories: (state) => {
            return state.categories.filter((category) => category.isActive);
        },
        getInactiveCategories: (state) => {
            return state.categories.filter((category) => !category.isActive);
        },
        getCategoriesByDepartmentId: (state) => (departmentId) => {
            return state.categories.filter((category) => category.departmentId === departmentId);
        }
    }
});
