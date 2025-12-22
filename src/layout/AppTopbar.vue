<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/AuthStore'; // Import your auth store
import { useRouter } from 'vue-router'; // Import router for navigation
import AppConfigurator from './AppConfigurator.vue';

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
const authStore = useAuthStore();
const router = useRouter();

// Logout function
const handleLogout = async () => {
    try {
        await authStore.logout();
        // Redirect to login page after logout
        router.push('/auth/login');
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Check if user is authenticated (optional, for conditional rendering)
const isAuthenticated = authStore.isAuthenticated;
const userName = authStore.userName; // Or userEmail, depending on what you have
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container mr-2">
            <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="20" stroke="var(--primary-color)" stroke-width="2.5" stroke-dasharray="4 2" opacity="0.3" />

                    <path d="M14 22C14 16.4772 18.4772 12 24 12C29.5228 12 34 16.4772 34 22" stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round" />

                    <rect x="10" y="22" width="6" height="10" rx="3" fill="var(--primary-color)" />
                    <rect x="32" y="22" width="6" height="10" rx="3" fill="var(--primary-color)" />

                    <path d="M34 30C34 33.3137 31.3137 36 28 36H26" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round" />
                    <circle cx="24" cy="36" r="2" fill="var(--primary-color)" />
                </svg>

                <!-- Do not show on smaller screens -->
                <span class="hidden md:inline"><b>AKRB</b>Desk</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <!-- User Info Section On small screens show in dropdown menu -->
            <div class="layout-user-info hidden lg:flex items-center mr-3" v-if="isAuthenticated">
                <i class="pi pi-user text-surface-500"></i>
                <span class="">Welcome, {{ userName || 'User' }}</span>
            </div>
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                    <button type="button" class="layout-topbar-action" @click="router.push('/profile')">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                    <!-- Logout in dropdown menu -->
                    <!-- <button v-if="isAuthenticated" type="button" class="layout-topbar-action text-red-500 hover:text-red-600" @click="handleLogout">
                        <i class="pi pi-sign-out"></i>
                        <span>Logout</span>
                    </button> -->
                </div>
            </div>

            <!-- Logout Button -->
            <button v-if="isAuthenticated" type="button" class="layout-topbar-action layout-topbar-action-logout" @click="handleLogout" title="Logout">
                <i class="pi pi-sign-out"></i>
                <span class="hidden lg:inline">Logout</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
/* Optional: Add some custom styling for the logout button */
.layout-topbar-action-logout:hover {
    color: #ef4444; /* red-500 */
    background-color: rgba(239, 68, 68, 0.1);
}
</style>
