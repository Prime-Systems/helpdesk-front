<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { AuthService } from '@/service/AuthService';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const token = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const resetSuccess = ref(false);
const invalidToken = ref(false);

onMounted(() => {
    token.value = route.query.token || '';
    if (!token.value) {
        invalidToken.value = true;
    }
});

const passwordStrength = computed(() => {
    const password = newPassword.value;
    if (password.length === 0) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
        { strength: 0, label: 'Very Weak', color: 'danger' },
        { strength: 1, label: 'Weak', color: 'danger' },
        { strength: 2, label: 'Fair', color: 'warn' },
        { strength: 3, label: 'Good', color: 'info' },
        { strength: 4, label: 'Strong', color: 'success' },
        { strength: 5, label: 'Very Strong', color: 'success' }
    ];

    return levels[strength];
});

const passwordsMatch = computed(() => {
    if (confirmPassword.value.length === 0) return true;
    return newPassword.value === confirmPassword.value;
});

const canSubmit = computed(() => {
    return newPassword.value.length >= 8 && passwordsMatch.value && !isLoading.value && token.value;
});

const handleResetPassword = async () => {
    if (!canSubmit.value) return;

    isLoading.value = true;

    try {
        await AuthService.resetPassword(token.value, newPassword.value);
        resetSuccess.value = true;
        toast.add({
            severity: 'success',
            summary: 'Password Reset Successful',
            detail: 'Your password has been changed. You can now login with your new password.',
            life: 5000
        });
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
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
                            <b style="color: var(--primary-color)">Reset</b> Password
                        </div>
                        <span class="text-muted-color font-medium">Enter your new password below</span>
                    </div>

                    <!-- Invalid Token State -->
                    <div v-if="invalidToken">
                        <Message severity="error" :closable="false" class="mb-6">
                            <div class="flex flex-col gap-2">
                                <span class="font-medium">Invalid Reset Link</span>
                                <span class="text-sm">This password reset link is invalid or has expired. Please request a new one.</span>
                            </div>
                        </Message>
                        <router-link to="/auth/forgot-password">
                            <Button label="Request New Reset Link" icon="pi pi-refresh" class="w-full mb-4" />
                        </router-link>
                        <router-link to="/auth/login">
                            <Button label="Back to Login" icon="pi pi-arrow-left" class="w-full" outlined />
                        </router-link>
                    </div>

                    <!-- Success State -->
                    <div v-else-if="resetSuccess">
                        <Message severity="success" :closable="false" class="mb-6">
                            <div class="flex flex-col gap-2">
                                <span class="font-medium">Password Reset Successful</span>
                                <span class="text-sm">Your password has been changed successfully. You can now login with your new password.</span>
                            </div>
                        </Message>
                        <router-link to="/auth/login">
                            <Button label="Go to Login" icon="pi pi-sign-in" class="w-full" />
                        </router-link>
                    </div>

                    <!-- Reset Form -->
                    <div v-else>
                        <label for="newPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">New Password</label>
                        <Password
                            id="newPassword"
                            v-model="newPassword"
                            placeholder="New Password (min. 8 characters)"
                            :toggleMask="true"
                            class="mb-2"
                            fluid
                            :feedback="true"
                            :disabled="isLoading"
                            @keyup.enter="handleResetPassword"
                        >
                            <template #footer>
                                <Divider />
                                <p class="mt-2 mb-2 text-sm">Suggestions:</p>
                                <ul class="pl-4 mb-0 mt-0 text-sm" style="line-height: 1.5">
                                    <li>At least 8 characters</li>
                                    <li>Mix of uppercase and lowercase letters</li>
                                    <li>Include numbers</li>
                                    <li>Include special characters</li>
                                </ul>
                            </template>
                        </Password>

                        <!-- Password Strength Indicator -->
                        <div v-if="newPassword.length > 0" class="mb-6">
                            <small class="block mb-2" :class="`text-${passwordStrength.color}`">
                                Password Strength: {{ passwordStrength.label }}
                            </small>
                        </div>

                        <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Confirm New Password</label>
                        <Password
                            id="confirmPassword"
                            v-model="confirmPassword"
                            placeholder="Confirm New Password"
                            :toggleMask="true"
                            class="mb-2"
                            fluid
                            :feedback="false"
                            :invalid="!passwordsMatch"
                            :disabled="isLoading"
                            @keyup.enter="handleResetPassword"
                        />

                        <!-- Password Match Indicator -->
                        <div v-if="confirmPassword.length > 0" class="mb-6">
                            <small v-if="!passwordsMatch" class="text-red-500">Passwords do not match</small>
                            <small v-else class="text-green-500">Passwords match</small>
                        </div>

                        <Toast />
                        <Button
                            label="Reset Password"
                            icon="pi pi-check"
                            class="w-full mb-4"
                            @click="handleResetPassword"
                            :loading="isLoading"
                            :disabled="!canSubmit"
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
