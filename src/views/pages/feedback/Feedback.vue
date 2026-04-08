<script setup>
import { TicketService } from '@/service/TicketService';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const trackingToken = ref('');
const isValidLink = ref(true);
const loadingStatus = ref(true);
const submitting = ref(false);
const feedbackStatus = ref(null);

const rating = ref(0);
const comments = ref('');
const isAnonymous = ref(false);
const selectedCategories = ref([]);

const categories = [
    { name: 'Speed', value: 'SPEED' },
    { name: 'Helpfulness', value: 'HELPFULNESS' },
    { name: 'Knowledge', value: 'KNOWLEDGE' },
    { name: 'Communication', value: 'COMMUNICATION' }
];

const canSubmitFeedback = computed(() => Boolean(feedbackStatus.value?.eligible) && !feedbackStatus.value?.submitted);
const feedbackAlreadySubmitted = computed(() => Boolean(feedbackStatus.value?.submitted));
const feedbackPendingResolution = computed(() => isValidLink.value && feedbackStatus.value && !feedbackStatus.value.eligible);
const submittedAtLabel = computed(() => {
    if (!feedbackStatus.value?.submittedAt) {
        return '';
    }

    return new Date(feedbackStatus.value.submittedAt).toLocaleString();
});

const applyFeedbackStatus = (status) => {
    feedbackStatus.value = status;

    if (status?.submitted) {
        rating.value = status.rating || 0;
        comments.value = status.comment || '';
        selectedCategories.value = status.categories || [];
        isAnonymous.value = Boolean(status.anonymous);
    } else {
        rating.value = 0;
        comments.value = '';
        selectedCategories.value = [];
        isAnonymous.value = false;
    }
};

const loadFeedbackStatus = async () => {
    if (!trackingToken.value) {
        isValidLink.value = false;
        loadingStatus.value = false;
        return;
    }

    loadingStatus.value = true;
    try {
        const status = await TicketService.getFeedbackStatusByTrackingToken(trackingToken.value);
        isValidLink.value = true;
        applyFeedbackStatus(status);
    } catch (error) {
        console.error('Failed to load feedback status:', error);
        isValidLink.value = false;
    } finally {
        loadingStatus.value = false;
    }
};

onMounted(async () => {
    const token = route.query.token;
    if (!token || typeof token !== 'string') {
        isValidLink.value = false;
        loadingStatus.value = false;
        return;
    }

    trackingToken.value = token;
    await loadFeedbackStatus();
});

const submitFeedback = async () => {
    if (!canSubmitFeedback.value) {
        return;
    }

    if (rating.value === 0) {
        toast.add({ severity: 'warn', summary: 'Rating Required', detail: 'Please provide a star rating.', life: 3000 });
        return;
    }

    submitting.value = true;
    try {
        const feedbackData = {
            rating: rating.value,
            comment: comments.value,
            categories: selectedCategories.value,
            isAnonymous: isAnonymous.value
        };

        const response = await TicketService.submitFeedback(trackingToken.value, feedbackData);
        if (response?.responseCode && response.responseCode !== '000') {
            throw new Error(response.message || 'Failed to submit feedback');
        }

        if (response?.data) {
            applyFeedbackStatus(response.data);
        } else {
            await loadFeedbackStatus();
        }

        toast.add({ severity: 'success', summary: 'Thank You!', detail: 'Your feedback has been submitted.', life: 3000 });
    } catch (error) {
        console.error('Feedback submission failed:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || error.response?.data?.message || 'Failed to submit feedback. Link might be expired.',
            life: 3000
        });
    } finally {
        submitting.value = false;
    }
};

const goHome = () => {
    router.push('/reportissue');
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-950 p-4">
        <div class="card w-full max-w-xl shadow-xl rounded-xl">
            <div class="text-center mb-6">
                <i class="pi pi-star-fill text-primary text-4xl mb-2"></i>
                <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Ticket Resolution Feedback</h1>
                <p class="text-surface-600 dark:text-surface-400 mt-2">We value your opinion and use it to improve support quality.</p>
            </div>

            <div v-if="loadingStatus" class="flex flex-col items-center justify-center py-10 gap-4">
                <ProgressSpinner style="width: 44px; height: 44px" strokeWidth="4" />
                <p class="text-surface-600 dark:text-surface-400">Loading feedback details...</p>
            </div>

            <div v-else-if="!isValidLink" class="text-center py-8">
                <i class="pi pi-times-circle text-red-500 text-5xl mb-4"></i>
                <h2 class="text-xl font-semibold mb-2">Invalid or Expired Link</h2>
                <p class="text-surface-600 dark:text-surface-400 mb-6">This feedback link is invalid or no longer available.</p>
                <Button label="Back to Support Portal" @click="goHome" severity="secondary" />
            </div>

            <div v-else-if="feedbackPendingResolution" class="text-center py-8">
                <i class="pi pi-clock text-amber-500 text-5xl mb-4"></i>
                <h2 class="text-xl font-semibold mb-2">Feedback Opens After Resolution</h2>
                <p class="text-surface-600 dark:text-surface-400 mb-2">{{ feedbackStatus?.ticketTitle }}</p>
                <p class="text-surface-600 dark:text-surface-400 mb-6">
                    This ticket is currently <strong>{{ feedbackStatus?.ticketStatus }}</strong>. You can rate your experience after it is resolved or closed.
                </p>
                <Button label="Back to Support Portal" @click="goHome" severity="secondary" />
            </div>

            <div v-else-if="feedbackAlreadySubmitted" class="text-center py-8">
                <i class="pi pi-check-circle text-green-500 text-5xl mb-4"></i>
                <h2 class="text-xl font-semibold mb-2">Feedback Received</h2>
                <p class="text-surface-600 dark:text-surface-400 mb-4">Thank you for rating <strong>{{ feedbackStatus?.ticketTitle }}</strong>.</p>
                <div class="flex flex-col items-center gap-3 mb-4">
                    <Rating :modelValue="feedbackStatus?.rating || 0" readonly :cancel="false" />
                    <p v-if="submittedAtLabel" class="text-sm text-surface-500 dark:text-surface-400">Submitted {{ submittedAtLabel }}</p>
                </div>
                <p v-if="feedbackStatus?.comment" class="text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 rounded-lg p-4 mb-6 text-left">
                    {{ feedbackStatus.comment }}
                </p>
                <Button label="Back to Support Portal" @click="goHome" />
            </div>

            <div v-else class="flex flex-col gap-6">
                <div class="rounded-xl bg-surface-100 dark:bg-surface-800 p-4">
                    <p class="text-sm text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1">Ticket</p>
                    <p class="font-semibold text-surface-900 dark:text-surface-0">{{ feedbackStatus?.ticketTitle }}</p>
                    <p v-if="feedbackStatus?.assignedUserName" class="text-sm text-surface-600 dark:text-surface-400 mt-1">Handled by {{ feedbackStatus.assignedUserName }}</p>
                </div>

                <div class="flex flex-col items-center gap-2">
                    <label class="font-medium text-lg">How would you rate your experience?</label>
                    <Rating v-model="rating" :cancel="false" size="large" class="!gap-2" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-medium">What went well? (Optional)</label>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="cat in categories" :key="cat.value" class="field-checkbox">
                            <Checkbox v-model="selectedCategories" :inputId="cat.value" :name="cat.name" :value="cat.value" />
                            <label :for="cat.value" class="ml-2">{{ cat.name }}</label>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="comments" class="font-medium">Additional Comments</label>
                    <Textarea id="comments" v-model="comments" rows="4" placeholder="Tell us more about your experience..." class="w-full" />
                </div>

                <div class="flex items-center gap-2">
                    <Checkbox v-model="isAnonymous" binary inputId="anonymous" />
                    <label for="anonymous" class="cursor-pointer">Submit anonymously</label>
                </div>

                <div class="flex justify-end pt-2">
                    <Button label="Submit Feedback" icon="pi pi-send" :loading="submitting" @click="submitFeedback" class="w-full" />
                </div>
            </div>
        </div>
    </div>
</template>
