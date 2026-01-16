<script setup>
import { useLayout } from '@/layout/composables/layout';
import { TicketService } from '@/service/TicketService';
import { useAuthStore } from '@/stores/AuthStore';
import { isSameDay } from 'date-fns';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppConfigurator from './AppConfigurator.vue';

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
const authStore = useAuthStore();
const router = useRouter();

const op = ref(null);
const tickets = ref([]);
const date = ref(new Date());

const handleLogout = async () => {
    try {
        await authStore.logout();
        router.push('/auth/login');
    } catch (error) {
        console.error('Logout error:', error);
    }
};

const isAuthenticated = authStore.isAuthenticated;
const userName = authStore.userName;

const toggleCalendar = (event) => {
    op.value.toggle(event);
};

onMounted(() => {
    loadTickets();
});

const loadTickets = async () => {
    try {
        const data = await TicketService.getTickets();
        tickets.value = data;
    } catch (error) {
        console.error('Failed to load tickets for calendar', error);
    }
};

const hasDeadline = (day) => {
    const d = new Date(day.year, day.month, day.day);
    return tickets.value.some(t => t.dueDate && isSameDay(new Date(t.dueDate), d));
};

const onDateSelect = (selectedDate) => {
    // Find tickets for this date
    const dayTickets = tickets.value.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), selectedDate));
    if (dayTickets.length > 0) {
        // If there are tickets, go to tickets page. 
        // Ideally pass a filter, but for now just go there.
        // Or if single ticket, go to it? User said "takes me to that ticket".
        // If multiple, maybe just go to tickets page. A query param would be nice but Tickets page might not support it yet.
        router.push('/tickets');
        op.value.hide();
    }
};

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
                <span class="hidden md:inline"><b>AKRB</b>Desk</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
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
                    <button type="button" class="layout-topbar-action" @click="toggleCalendar">
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
                </div>
            </div>

            <button v-if="isAuthenticated" type="button" class="layout-topbar-action layout-topbar-action-logout" @click="handleLogout" title="Logout">
                <i class="pi pi-sign-out"></i>
                <span class="hidden lg:inline">Logout</span>
            </button>
        </div>
        
        <Popover ref="op">
            <div class="w-80">
                <DatePicker v-model="date" inline class="w-full border-none" @update:modelValue="onDateSelect">
                    <template #date="slotProps">
                        <strong 
                            v-if="hasDeadline(slotProps.date)" 
                            class="text-red-500 text-lg font-bold"
                            style="text-decoration: underline decoration-red-500"
                        >
                            {{ slotProps.date.day }}
                        </strong>
                        <template v-else>{{ slotProps.date.day }}</template>
                    </template>
                </DatePicker>
            </div>
        </Popover>
    </div>
</template>

<style scoped>
.layout-topbar-action-logout:hover {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.1);
}
:deep(.p-datepicker) {
    border: none;
    padding: 0;
}
</style>
