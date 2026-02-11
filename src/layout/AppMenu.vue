<script setup>
import { useAuthStore } from '@/stores/AuthStore';
import { computed, onMounted } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

onMounted(() => {
    console.log('AppMenu mounted. Auth initialized:', authStore.initialized);
    console.log('Current User Role:', authStore.user?.role);
});

const model = computed(() => {
    try {
        const user = authStore.user;
        const role = user?.role;
        const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

        console.log('AppMenu computing model. Role:', role, 'IsAdmin:', isAdmin);

        const menuItems = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
            },
            {
                label: 'Ticket Management',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Tickets',
                        icon: 'pi pi-fw pi-ticket',
                        to: '/tickets'
                    }
                ]
            },
            {
                label: 'User Management',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Employees',
                        icon: 'pi pi-fw pi-id-card',
                        to: '/users/employees',
                        visible: isAdmin
                    },
                    {
                        label: 'Leave Management',
                        icon: 'pi pi-fw pi-calendar-times',
                        to: '/users/leave',
                        visible: isAdmin
                    },
                    {
                        label: 'Bulk Import',
                        icon: 'pi pi-fw pi-upload',
                        to: '/users/bulk-import',
                        visible: isAdmin
                    }
                ].filter(item => item.visible !== false)
            },
            {
                label: 'Performance Reports',
                icon: 'pi pi-fw pi-chart-bar',
                visible: isAdmin,
                items: [
                    {
                        label: 'Employees',
                        icon: 'pi pi-fw pi-id-card',
                        to: '/performance/employees'
                    },
                    {
                        label: 'Documents',
                        icon: 'pi pi-fw pi-file',
                        to: '/performance/documents',
                        visible: false
                    }
                ]
            },
            {
                label: 'Knowledge Base',
                icon: 'pi pi-fw pi-book',
                items: [
                    {
                        label: 'Articles',
                        icon: 'pi pi-fw pi-book',
                        to: '/kb/articles'
                    },
                    {
                        label: 'FAQs',
                        icon: 'pi pi-fw pi-question-circle',
                        to: '/kb/faqs'
                    }
                ]
            },
            {
                label: 'Settings',
                icon: 'pi pi-fw pi-cog',
                visible: isAdmin,
                items: [
                    {
                        label: 'Automation',
                        icon: 'pi pi-fw pi-verified',
                        to: '/settings/automation',
                        visible: false
                    },
                    {
                        label: 'Categories',
                        icon: 'pi pi-fw pi-box',
                        to: '/settings/categories'
                    }
                ]
            },
            {
                label: 'Leaderboard',
                icon: 'pi pi-fw pi-crown',
                items: [
                    {
                        label: 'Leaderboard',
                        icon: 'pi pi-fw pi-bolt',
                        to: '/leaderboard'
                    }
                ]
            },
            {
                label: 'Customer Portal',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Report Issue',
                        icon: 'pi pi-fw pi-external-link',
                        to: '/reportissue'
                    }
                ]
            }
        ];

        return menuItems.filter(item => item.visible !== false);
    } catch (error) {
        console.error('Error computing menu model:', error);
        return [];
    }
});
</script>


<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
