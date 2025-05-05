import { useAuthStore } from '@/stores/AuthStore';

export const authGuard = async (to, from, next) => {
    const authStore = useAuthStore();

    // Initialize auth if not already done
    if (!authStore.initialized) {
        await authStore.initialize();
    }

    if (!authStore.isAuthenticated) {
        // Save the intended route
        sessionStorage.setItem('redirectPath', to.fullPath);
        next({ name: 'login' });
    } else {
        next();
    }
};

export const guestGuard = async (to, from, next) => {
    const authStore = useAuthStore();

    // Initialize auth if not already done
    if (!authStore.initialized) {
        await authStore.initialize();
    }

    if (authStore.isAuthenticated) {
        next({ name: 'dashboard' });
    } else {
        next();
    }
};

export const roleGuard = (requiredRoles) => {
    return async (to, from, next) => {
        const authStore = useAuthStore();

        // Initialize auth if not already done
        if (!authStore.initialized) {
            await authStore.initialize();
        }

        if (!authStore.isAuthenticated) {
            sessionStorage.setItem('redirectPath', to.fullPath);
            next({ name: 'login' });
            return;
        }

        // Check if user has required role
        const hasRequiredRole = requiredRoles.some((role) => authStore.hasRole(role));

        if (!hasRequiredRole) {
            next({ name: 'forbidden' });
        } else {
            next();
        }
    };
};

export const permissionGuard = (requiredPermissions) => {
    return async (to, from, next) => {
        const authStore = useAuthStore();

        // Initialize auth if not already done
        if (!authStore.initialized) {
            await authStore.initialize();
        }

        if (!authStore.isAuthenticated) {
            sessionStorage.setItem('redirectPath', to.fullPath);
            next({ name: 'login' });
            return;
        }

        // Check if user has required permissions
        const hasRequiredPermission = requiredPermissions.every((permission) => authStore.hasPermission(permission));

        if (!hasRequiredPermission) {
            next({ name: 'forbidden' });
        } else {
            next();
        }
    };
};
