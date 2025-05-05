import { useAuthStore } from '@/stores/AuthStore';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

export function useAuth() {
    const authStore = useAuthStore();
    const router = useRouter();

    // Computed properties
    const user = computed(() => authStore.user);
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const isLoading = computed(() => authStore.isLoading);
    const error = computed(() => authStore.error);
    const userRole = computed(() => authStore.userRole);
    const userName = computed(() => authStore.userName);
    const userEmail = computed(() => authStore.userEmail);

    // Methods
    const login = async (email, password, rememberMe = false) => {
        const success = await authStore.login(email, password, rememberMe);
        if (success) {
            // Check for redirect path
            const redirectPath = sessionStorage.getItem('redirectPath');
            sessionStorage.removeItem('redirectPath');
            router.push(redirectPath || { name: 'dashboard' }).catch((err) => console.error('Router push error:', err));
        }
        return success;
    };

    const register = async (userData) => {
        const success = await authStore.register(userData);
        if (success) {
            router.push({ name: 'dashboard' }).catch((err) => console.error('Router push error:', err));
        }
        return success;
    };

    const logout = async () => {
        await authStore.logout();
        router.push('/auth/login');
    };

    const updateProfile = async (profileData) => {
        return await authStore.updateProfile(profileData);
    };

    const forgotPassword = async (email) => {
        return await authStore.forgotPassword(email);
    };

    const resetPassword = async (token, newPassword) => {
        const success = await authStore.resetPassword(token, newPassword);
        if (success) {
            router.push('/auth/login');
        }
        return success;
    };

    const changePassword = async (currentPassword, newPassword) => {
        return await authStore.changePassword(currentPassword, newPassword);
    };

    const hasRole = (role) => {
        return authStore.hasRole(role);
    };

    const hasPermission = (permission) => {
        return authStore.hasPermission(permission);
    };

    const clearError = () => {
        authStore.clearError();
    };

    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        error,
        userRole,
        userName,
        userEmail,

        // Methods
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        changePassword,
        hasRole,
        hasPermission,
        clearError
    };
}
