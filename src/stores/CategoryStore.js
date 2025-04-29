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
                this.categories = response.data;
            } catch (error) {
                this.error = error.message;
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
    }
});
