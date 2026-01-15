<script setup>
import { TicketService } from '@/service/TicketService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const trackingToken = ref('');
const isValidLink = ref(true);
const loading = ref(false);
const submitted = ref(false);

// Form Data
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

onMounted(() => {
    const token = route.query.token;
    if (!token) {
        isValidLink.value = false;
    } else {
        trackingToken.value = token;
    }
});

const submitFeedback = async () => {
    if (rating.value === 0) {
        toast.add({ severity: 'warn', summary: 'Rating Required', detail: 'Please provide a star rating.', life: 3000 });
        return;
    }

    loading.value = true;
    try {
        const feedbackData = {
            rating: rating.value,
            comment: comments.value,
            categories: selectedCategories.value,
            isAnonymous: isAnonymous.value
        };

        await TicketService.submitFeedback(trackingToken.value, feedbackData);
        submitted.value = true;
        toast.add({ severity: 'success', summary: 'Thank You!', detail: 'Your feedback has been submitted.', life: 3000 });
    } catch (error) {
        console.error('Feedback submission failed:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit feedback. Link might be expired.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const goHome = () => {
    router.push('/');
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-950 p-4">
        <div class="card w-full max-w-lg shadow-xl rounded-xl">
            <!-- Header -->
            <div class="text-center mb-6">
                <i class="pi pi-star-fill text-primary text-4xl mb-2"></i>
                <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Ticket Resolution Feedback</h1>
                <p class="text-surface-600 dark:text-surface-400 mt-2">We value your opinion.</p>
            </div>

            <!-- Error State -->
            <div v-if="!isValidLink" class="text-center py-8">
                <i class="pi pi-times-circle text-red-500 text-5xl mb-4"></i>
                <h2 class="text-xl font-semibold mb-2">Invalid or Expired Link</h2>
                <p class="text-surface-600 dark:text-surface-400 mb-6">This feedback link is invalid or has already been used.</p>
                <Button label="Go to Home" @click="goHome" severity="secondary" />
            </div>

            <!-- Success State -->
            <div v-else-if="submitted" class="text-center py-8">
                <i class="pi pi-check-circle text-green-500 text-5xl mb-4"></i>
                <h2 class="text-xl font-semibold mb-2">Thank You!</h2>
                <p class="text-surface-600 dark:text-surface-400 mb-6">Your feedback helps us improve our service.</p>
                <Button label="Go to Dashboard" @click="goHome" />
            </div>

            <!-- Feedback Form -->
            <div v-else class="flex flex-col gap-6">
                <!-- Rating -->
                <div class="flex flex-col items-center gap-2">
                    <label class="font-medium text-lg">How would you rate your experience?</label>
                    <Rating v-model="rating" :cancel="false" size="large" class="!gap-2" />
                </div>

                <!-- Categories -->
                <div class="flex flex-col gap-2">
                    <label class="font-medium">What went well? (Optional)</label>
                    <div class="flex flex-wrap gap-2">
                        <div v-for="cat in categories" :key="cat.value" class="field-checkbox">
                             <Checkbox v-model="selectedCategories" :inputId="cat.value" :name="cat.name" :value="cat.value" />
                             <label :for="cat.value" class="ml-2">{{ cat.name }}</label>
                        </div>
                    </div>
                </div>

                <!-- Comments -->
                <div class="flex flex-col gap-2">
                    <label for="comments" class="font-medium">Additional Comments</label>
                    <Textarea id="comments" v-model="comments" rows="4" placeholder="Tell us more about your experience..." class="w-full" />
                </div>

                <!-- Anonymous -->
                <div class="flex items-center gap-2">
                    <Checkbox v-model="isAnonymous" binary inputId="anonymous" />
                    <label for="anonymous" class="cursor-pointer">Submit anonymously</label>
                </div>

                <!-- Submit Button -->
                <div class="flex justify-end pt-2">
                    <Button label="Submit Feedback" icon="pi pi-send" :loading="loading" @click="submitFeedback" class="w-full" />
                </div>
            </div>
        </div>
    </div>
</template>
