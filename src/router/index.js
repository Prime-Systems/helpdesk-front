import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/AuthStore';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/tickets',
                    name: 'tickets',
                    component: () => import('@/views/pages/tickets/Tickets.vue')
                },
                {
                    path: '/users/employees',
                    name: 'employees',
                    component: () => import('@/views/pages/user_management/Employees.vue')
                },
                {
                    path: '/users/customers',
                    name: 'customers',
                    component: () => import('@/views/pages/user_management/Customers.vue')
                },
                {
                    path: '/kb/faqs',
                    name: 'faqs',
                    component: () => import('@/views/pages/knowledge_base/Faq.vue')
                },
                {
                    path: '/kb/articles',
                    name: 'articles',
                    component: () => import('@/views/pages/knowledge_base/Articles.vue')
                },
                {
                    path: '/performance/employees',
                    name: 'employeePerformance',
                    component: () => import('@/views/pages/performance_reports/EmployeesPerformance.vue')
                },
                {
                    path: '/performance/documents',
                    name: 'documents',
                    component: () => import('@/views/pages/performance_reports/Documents.vue')
                },
                {
                    path: '/settings/automation',
                    name: 'automation',
                    component: () => import('@/views/pages/settings/Automation.vue')
                },
                {
                    path: '/settings/categories',
                    name: 'categories',
                    component: () => import('@/views/pages/settings/Categories.vue')
                },
                {
                    path: '/leaderboard',
                    name: 'leaderboard',
                    component: () => import('@/views/pages/leaderboard/Leaderboard.vue')
                },
                {
                    path: '/leaderboard',
                    name: 'leaderboard',
                    component: () => import('@/views/pages/leaderboard/Leaderboard.vue')
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

function isLoggedIn() {
    //TODO: Implement logic to check if user is logged in using local storage or cookies
    return true;
}

// router.beforeEach((to, from, next) => {
//     if (to.name !== 'login' && !isLoggedIn()) {
//         next({ name: 'login' });
//     } else {
//         next();
//     }
// });

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/auth/login');
    } else {
        next();
    }
});

export default router;
