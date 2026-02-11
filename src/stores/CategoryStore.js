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
                            name: 'IT Support',
                            description: 'All IT-related issues',
                            departmentId: 1,
                            departmentName: 'Information Technology',
                            targetResolutionTime: 24,
                            defaultPriority: 'MEDIUM',
                            tags: 'it,tech,support',
                            status: 'ACTIVE',
                            requiresApproval: false,
                            parentCategoryId: null,
                            parentCategoryName: null,
                            subcategories: [
                                {
                                    id: 2,
                                    name: 'Hardware',
                                    description: 'Hardware-related issues',
                                    departmentId: 1,
                                    departmentName: 'Information Technology',
                                    targetResolutionTime: 48,
                                    defaultPriority: 'LOW',
                                    tags: 'hardware,equipment',
                                    status: 'ACTIVE',
                                    requiresApproval: false,
                                    parentCategoryId: 1,
                                    parentCategoryName: 'IT Support',
                                    subcategories: []
                                },
                                {
                                    id: 3,
                                    name: 'Software',
                                    description: 'Software-related issues',
                                    departmentId: 1,
                                    departmentName: 'Information Technology',
                                    targetResolutionTime: 24,
                                    defaultPriority: 'HIGH',
                                    tags: 'software,applications',
                                    status: 'ACTIVE',
                                    requiresApproval: false,
                                    parentCategoryId: 1,
                                    parentCategoryName: 'IT Support',
                                    subcategories: []
                                }
                            ]
                        },
                        {
                            id: 4,
                            name: 'HR',
                            description: 'Human resources inquiries',
                            departmentId: 2,
                            departmentName: 'Human Resources',
                            targetResolutionTime: 72,
                            defaultPriority: 'LOW',
                            tags: 'hr,people',
                            status: 'ACTIVE',
                            requiresApproval: true,
                            parentCategoryId: null,
                            parentCategoryName: null,
                            subcategories: []
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
                await CategoryService.createCategory(category);
                // Re-fetch the full tree since adding a subcategory changes the tree shape
                await this.fetchCategories();
            } catch (error) {
                this.error = error.message;
                console.error('Error adding category:', error);
            } finally {
                this.loading = false;
            }
        },

        async updateCategory(category) {
            this.loading = true;
            this.error = null;

            try {
                await CategoryService.updateCategory(category.id, category);
                // Re-fetch the full tree to handle parent changes / moves
                await this.fetchCategories();
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
                // Re-fetch the full tree since cascade delete changes the tree
                await this.fetchCategories();
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

        /**
         * Recursively search the category tree to find by ID
         */
        getCategoryById: (state) => (id) => {
            const findInTree = (categories) => {
                for (const cat of categories) {
                    if (cat.id === id) return cat;
                    if (cat.subcategories?.length) {
                        const found = findInTree(cat.subcategories);
                        if (found) return found;
                    }
                }
                return null;
            };
            return findInTree(state.categories);
        },

        /**
         * Get active top-level categories (status === 'ACTIVE')
         */
        getActiveCategories: (state) => {
            return state.categories.filter((category) => category.status === 'ACTIVE');
        },

        /**
         * Get inactive top-level categories
         */
        getInactiveCategories: (state) => {
            return state.categories.filter((category) => category.status !== 'ACTIVE');
        },

        /**
         * Filter top-level categories by department
         */
        getCategoriesByDepartmentId: (state) => (departmentId) => {
            return state.categories.filter((category) => category.departmentId === departmentId);
        },

        /**
         * Flatten the entire category tree into a flat array
         * Useful for search and generic dropdowns
         */
        getAllCategoriesFlat: (state) => {
            const result = [];
            const flatten = (categories) => {
                for (const cat of categories) {
                    result.push(cat);
                    if (cat.subcategories?.length) {
                        flatten(cat.subcategories);
                    }
                }
            };
            flatten(state.categories);
            return result;
        }
    }
});
