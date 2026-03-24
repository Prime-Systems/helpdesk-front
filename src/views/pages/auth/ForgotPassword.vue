<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { AuthService } from '@/service/AuthService';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();

const email = ref('');
const isLoading = ref(false);
const submitted = ref(false);

const handleForgotPassword = async () => {
    if (!email.value || isLoading.value) return;

    isLoading.value = true;

    try {
        await AuthService.forgotPassword(email.value);
        submitted.value = true;
        toast.add({
            severity: 'success',
            summary: 'Email Sent',
            detail: 'If an account exists with that email, you will receive password reset instructions.',
            life: 5000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to process your request. Please try again.',
            life: 5000
        });
    } finally {
        isLoading.value = false;
    }
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
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
                            <b style="color: var(--primary-color)">Forgot</b> Password?
                        </div>
                        <span class="text-muted-color font-medium">Enter your email to receive reset instructions</span>
                    </div>

                    <!-- Success State -->
                    <div v-if="submitted">
                        <Message severity="success" :closable="false" class="mb-6">
                            <div class="flex flex-col gap-2">
                                <span class="font-medium">Check your email</span>
                                <span class="text-sm">If an account exists with <strong>{{ email }}</strong>, you will receive password reset instructions shortly.</span>
                            </div>
                        </Message>
                        <router-link to="/auth/login">
                            <Button label="Back to Login" icon="pi pi-arrow-left" class="w-full" outlined />
                        </router-link>
                    </div>

                    <!-- Form State -->
                    <div v-else>
                        <label for="forgotEmail" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText
                            id="forgotEmail"
                            type="email"
                            placeholder="Enter your email address"
                            class="w-full md:w-[30rem] mb-8"
                            v-model="email"
                            :disabled="isLoading"
                            @keyup.enter="handleForgotPassword"
                        />

                        <Toast />
                        <Button
                            label="Send Reset Link"
                            icon="pi pi-envelope"
                            class="w-full mb-4"
                            @click="handleForgotPassword"
                            :loading="isLoading"
                            :disabled="isLoading || !email"
                        />

                        <router-link to="/auth/login" class="flex items-center justify-center gap-2 font-medium no-underline cursor-pointer text-primary mt-4">
                            <i class="pi pi-arrow-left text-sm"></i>
                            Back to Login
                        </router-link>
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
