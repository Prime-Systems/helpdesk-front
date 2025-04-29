import { AuthService } from '@/service/AuthService';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        error: null,
        loading: false
    }),

    actions: {
        async login(email, password) {
            this.loading = true;
            this.error = null;
            try {
                const { user, token } = await AuthService.login(email, password);
                this.user = user;
                this.token = token;
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            await AuthService.logout();
            this.user = null;
            this.token = null;
        }
    },

    getters: {
        isAuthenticated: (state) => !!state.token
    }
});
