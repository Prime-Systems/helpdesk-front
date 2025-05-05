import { useAuthStore } from '@/stores/AuthStore';

// v-can directive for permission-based visibility
export const can = {
    mounted(el, binding) {
        const authStore = useAuthStore();

        if (!binding.value) {
            console.warn('v-can directive requires a value');
            return;
        }

        const permissions = Array.isArray(binding.value) ? binding.value : [binding.value];
        const hasPermission = permissions.every((permission) => authStore.hasPermission(permission));

        if (!hasPermission) {
            el.style.display = 'none';
            // Optionally remove the element from DOM
            // el.parentNode?.removeChild(el);
        }
    },
    updated(el, binding) {
        const authStore = useAuthStore();

        if (!binding.value) return;

        const permissions = Array.isArray(binding.value) ? binding.value : [binding.value];
        const hasPermission = permissions.every((permission) => authStore.hasPermission(permission));

        el.style.display = hasPermission ? '' : 'none';
    }
};

// v-role directive for role-based visibility
export const role = {
    mounted(el, binding) {
        const authStore = useAuthStore();

        if (!binding.value) {
            console.warn('v-role directive requires a value');
            return;
        }

        const roles = Array.isArray(binding.value) ? binding.value : [binding.value];
        const hasRole = roles.some((role) => authStore.hasRole(role));

        if (!hasRole) {
            el.style.display = 'none';
        }
    },
    updated(el, binding) {
        const authStore = useAuthStore();

        if (!binding.value) return;

        const roles = Array.isArray(binding.value) ? binding.value : [binding.value];
        const hasRole = roles.some((role) => authStore.hasRole(role));

        el.style.display = hasRole ? '' : 'none';
    }
};

// v-auth directive for authenticated-only visibility
export const auth = {
    mounted(el, binding) {
        const authStore = useAuthStore();
        const shouldShow = binding.value === false ? !authStore.isAuthenticated : authStore.isAuthenticated;

        if (!shouldShow) {
            el.style.display = 'none';
        }
    },
    updated(el, binding) {
        const authStore = useAuthStore();
        const shouldShow = binding.value === false ? !authStore.isAuthenticated : authStore.isAuthenticated;

        el.style.display = shouldShow ? '' : 'none';
    }
};
