import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import '@/assets/tailwind.css';
import { auth, can, role } from './directives/auth';

const app = createApp(App);
const pinia = createPinia();

app.directive('can', can);
app.directive('role', role);
app.directive('auth', auth);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(pinia);

if (import.meta.env.PROD) {
    // Disable console logs
    console.log = function () {};
    console.warn = function () {};
    console.info = function () {};

    // Disable Vue Devtools
    app.config.devtools = false;

    // Disable Context Menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Disable Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (
            e.code === 'F12' ||
            (e.ctrlKey && e.shiftKey && ['KeyI', 'KeyJ', 'KeyC'].includes(e.code)) ||
            (e.ctrlKey && e.code === 'KeyU')
        ) {
            e.preventDefault();
        }
    });
}

app.mount('#app');
