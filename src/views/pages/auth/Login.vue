<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { useAuthStore } from '@/stores/AuthStore';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const email = ref('');
const password = ref('');
const checked = ref(false);
const isLoading = ref(false);

const handleLogin = async () => {
    console.log('Login clicked');
    isLoading.value = true;
    authStore.clearError();

    const success = await authStore.login(email.value, password.value, checked.value);

    if (success) {
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Login successful',
            life: 3000
        });

        // Check if user needs to change password
        if (authStore.needsPasswordChange) {
            // Router guard will automatically redirect to change password
            router.push('/');
        } else {
            // Check for saved redirect path
            const redirectPath = sessionStorage.getItem('redirectPath');
            if (redirectPath) {
                sessionStorage.removeItem('redirectPath');
                router.push(redirectPath);
            } else {
                router.push('/');
            }
        }
    } else {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: authStore.currentError || 'Login failed',
            life: 5000
        });
    }

    isLoading.value = false;
};
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-8 w-16 shrink-0 mx-auto">
                            <circle cx="24" cy="24" r="20" stroke="var(--primary-color)" stroke-width="2.5" stroke-dasharray="4 2" opacity="0.3" />
                            <path d="M14 22C14 16.4772 18.4772 12 24 12C29.5228 12 34 16.4772 34 22" stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round" />
                            <rect x="10" y="22" width="6" height="10" rx="3" fill="var(--primary-color)" />
                            <rect x="32" y="22" width="6" height="10" rx="3" fill="var(--primary-color)" />
                            <path d="M34 30C34 33.3137 31.3137 36 28 36H26" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round" />
                            <circle cx="24" cy="36" r="2" fill="var(--primary-color)" />
                        </svg>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to <b style="color: var(--primary-color)">AKRB</b>Desk!</div>
                        <span class="text-muted-color font-medium">Sign in to continue</span>
                    </div>

                    <div>
                        <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8" v-model="email" :disabled="isLoading" @keyup.enter="handleLogin" />

                        <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false" :disabled="isLoading" @keyup.enter="handleLogin" />

                        <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                            <div class="flex items-center">
                                <Checkbox v-model="checked" id="rememberme1" binary class="mr-2" :disabled="isLoading" />
                                <label for="rememberme1">Remember me</label>
                            </div>
                            <router-link to="/auth/forgot-password" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary"> Forgot password? </router-link>
                        </div>

                        <Toast />
                        <Button label="Sign In" icon="pi pi-sign-in" class="w-full" @click="handleLogin" :loading="isLoading" :disabled="isLoading || !email || !password" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
