<script setup>
import { CategoryService } from '@/service/CategoryService';
import { TicketService } from '@/service/TicketService';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeMount, ref } from 'vue';

const toast = useToast();
const loading = ref(true);
const submitting = ref(false);
const submitSuccess = ref(false);
const ticketNumber = ref(null);
const showSuccessDialog = ref(false);
const showTrackingDialog = ref(false);

// Form data matching your backend TicketDto structure
const formData = ref({
    title: '',
    description: '',
    categoryId: null,
    tags: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    priority: 'MEDIUM', // Will be set based on category
    status: 'OPEN'
});

const categories = ref([]);
const selectedCategory = ref(null);
const attachment = ref(null);
const fileInputRef = ref(null);

// Tracking state
const trackingToken = ref('');
const trackingInput = ref('');
const ticketDetails = ref(null);
const trackingLoading = ref(false);
const showTrackingForm = ref(true);
const comments = ref([]);
const newComment = ref('');
const addingComment = ref(false);
const loadingComments = ref(false);

const errors = ref({});

onBeforeMount(async () => {
    try {
        loading.value = true;
        const data = await CategoryService.getCategories();

        // Filter and map categories exactly as in ticket management
        categories.value = data
            .filter((cat) => cat.status === 'ACTIVE')
            .map((cat) => ({
                label: cat.name,
                value: cat.id,
                name: cat.name,
                data: cat,
                id: cat.id
            }));

        console.log('Loaded categories:', categories.value);
    } catch (error) {
        console.error('Error fetching categories:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load categories. Please refresh the page.',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
});

const selectedCategoryDetails = computed(() => {
    if (!selectedCategory.value) return null;
    return categories.value.find((cat) => cat.value === selectedCategory.value)?.data;
});

// Update priority and due date based on selected category
const onCategoryChange = () => {
    if (selectedCategory.value) {
        const category = categories.value.find((c) => c.value === selectedCategory.value);
        if (category?.data) {
            // Set priority based on category default
            if (category.data.defaultPriority) {
                formData.value.priority = category.data.defaultPriority;
            }
        }
    }
    clearError('categoryId');
};

const validateForm = () => {
    const newErrors = {};

    if (!formData.value.title?.trim()) {
        newErrors.title = 'Please provide a title for your request';
    }

    if (!formData.value.description?.trim()) {
        newErrors.description = 'Please describe your issue';
    }

    if (!selectedCategory.value) {
        newErrors.categoryId = 'Please select a category';
    }

    if (!formData.value.contactName?.trim()) {
        newErrors.contactName = 'Please provide your name';
    }

    if (!formData.value.contactEmail?.trim()) {
        newErrors.contactEmail = 'Please provide your email';
    } else if (!/\S+@\S+\.\S+/.test(formData.value.contactEmail)) {
        newErrors.contactEmail = 'Please provide a valid email address';
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Please fill in all required fields',
            life: 3000
        });
        return;
    }

    submitting.value = true;

    try {
        // Prepare ticket data matching your backend structure
        const ticketData = {
            title: formData.value.title.trim(),
            description: formData.value.description.trim(),
            categoryId: selectedCategory.value,
            tags: formData.value.tags?.trim() || '',
            priority: formData.value.priority,
            status: 'OPEN',
            isCustomerTicket: true,
            customerName: formData.value.contactName.trim(),
            customerEmail: formData.value.contactEmail.trim(),
            customerPhone: formData.value.contactPhone?.trim() || '',
            ticketSource: 'CUSTOMER_PORTAL'
        };

        // Append contact information to description
        const contactInfo = `\n\n--- Customer Contact Information ---\nName: ${formData.value.contactName}\nEmail: ${formData.value.contactEmail}`;
        if (formData.value.contactPhone?.trim()) {
            ticketData.description += `${contactInfo}\nPhone: ${formData.value.contactPhone}`;
        } else {
            ticketData.description += contactInfo;
        }

        console.log('Submitting ticket:', ticketData);

        // Call the API
        const response = await TicketService.createCustomerTicket(ticketData);

        console.log('Ticket created:', response);

        if (response) {
            ticketNumber.value = response.id;
            trackingToken.value = response.publicTrackingToken;
            submitSuccess.value = true;
            showSuccessDialog.value = true;

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Your ticket has been submitted successfully',
                life: 5000
            });
        }
    } catch (error) {
        console.error('Error submitting ticket:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to submit ticket. Please try again.';
        toast.add({
            severity: 'error',
            summary: 'Submission Failed',
            detail: errorMessage,
            life: 5000
        });
    } finally {
        submitting.value = false;
    }
};

const handleAnotherRequest = () => {
    showSuccessDialog.value = false;
    resetForm();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetForm = () => {
    formData.value = {
        title: '',
        description: '',
        categoryId: null,
        tags: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        priority: 'MEDIUM',
        status: 'OPEN'
    };
    selectedCategory.value = null;
    attachment.value = null;
    errors.value = {};
    submitSuccess.value = false;
    ticketNumber.value = null;
    trackingToken.value = '';
    showSuccessDialog.value = false;
};

const clearError = (field) => {
    if (errors.value[field]) {
        errors.value[field] = '';
    }
};

// Tracking functions
const trackTicket = async () => {
    if (!trackingInput.value?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Validation',
            detail: 'Please enter a tracking token',
            life: 3000
        });
        return;
    }

    trackingLoading.value = true;
    try {
        const response = await TicketService.trackTicket(trackingInput.value.trim());
        ticketDetails.value = response;
        trackingToken.value = trackingInput.value.trim();
        showTrackingForm.value = false;
        await loadComments();

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Ticket details loaded successfully',
            life: 3000
        });
    } catch (error) {
        console.error('Error tracking ticket:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to load ticket details',
            life: 5000
        });
    } finally {
        trackingLoading.value = false;
    }
};

const loadComments = async () => {
    if (!trackingToken.value) return;

    loadingComments.value = true;
    try {
        const response = await TicketService.getCommentsViaTracking(trackingToken.value);
        comments.value = response;
    } catch (error) {
        console.error('Error loading comments:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load comments',
            life: 3000
        });
    } finally {
        loadingComments.value = false;
    }
};

const addComment = async () => {
    if (!newComment.value?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Validation',
            detail: 'Please enter a comment',
            life: 3000
        });
        return;
    }

    addingComment.value = true;
    try {
        const commentData = {
            comment: newComment.value.trim(),
            authorName: ticketDetails.value?.customerName || formData.value.contactName,
            authorEmail: ticketDetails.value?.customerEmail || formData.value.contactEmail,
            isCustomer: true
        };

        await TicketService.addCommentViaTracking(trackingToken.value, commentData);

        newComment.value = '';
        await loadComments();

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Comment added successfully',
            life: 3000
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to add comment',
            life: 5000
        });
    } finally {
        addingComment.value = false;
    }
};

const openTrackingDialog = () => {
    showTrackingDialog.value = true;
    resetTrackingState();
};

const resetTrackingState = () => {
    trackingInput.value = '';
    ticketDetails.value = null;
    comments.value = [];
    showTrackingForm.value = true;
    newComment.value = '';
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getStatusSeverity = (status) => {
    if (!status) return 'info';
    switch (status.toLowerCase()) {
        case 'open':
            return 'info';
        case 'in_progress':
            return 'warning';
        case 'resolved':
            return 'success';
        case 'closed':
            return 'secondary';
        case 'cancelled':
            return 'danger';
        default:
            return 'info';
    }
};

const getPrioritySeverity = (priority) => {
    if (!priority) return 'info';
    switch (priority.toLowerCase()) {
        case 'low':
            return 'info';
        case 'medium':
            return 'success';
        case 'high':
            return 'warning';
        case 'urgent':
            return 'danger';
        default:
            return 'info';
    }
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
    const tags = category.data?.tags?.toLowerCase() || '';
    if (tags.includes('hardware') || tags.includes('technical')) return '🖥️';
    if (tags.includes('transaction') || tags.includes('payment')) return '💳';
    if (tags.includes('document') || tags.includes('form')) return '📄';
    if (tags.includes('login') || tags.includes('access')) return '🔐';
    if (tags.includes('account')) return '👤';
    if (tags.includes('billing')) return '💰';
    return '❓';
};

const copyTicketNumber = async () => {
    try {
        await navigator.clipboard.writeText(`#${ticketNumber.value}`);
        toast.add({
            severity: 'success',
            summary: 'Copied!',
            detail: 'Ticket number copied to clipboard',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to copy ticket number',
            life: 3000
        });
    }
};

const copyTrackingToken = async () => {
    try {
        await navigator.clipboard.writeText(trackingToken.value);
        toast.add({
            severity: 'success',
            summary: 'Copied!',
            detail: 'Tracking token copied to clipboard',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to copy tracking token',
            life: 3000
        });
    }
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-surface-0 to-purple-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 py-8 px-4">
        <!-- Header with tracking button -->
        <div class="max-w-4xl mx-auto mb-6 flex justify-between items-center">
            <div></div>
            <!-- Spacer -->
            <Button label="Track Existing Ticket" icon="pi pi-search" severity="secondary" outlined @click="openTrackingDialog" class="tracking-button" />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center min-h-screen">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <!-- Form State -->
        <div v-else class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                    <i class="pi pi-send text-white text-3xl"></i>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold text-surface-900 dark:text-surface-0 mb-3">How Can We Help?</h1>
                <p class="text-surface-600 dark:text-surface-400 text-lg">Submit your request and our team will get back to you shortly</p>
            </div>

            <!-- Form -->
            <div class="card bg-surface-0 dark:bg-surface-900 rounded-3xl shadow-2xl p-6 md:p-10 border-0">
                <!-- Category Selection -->
                <div class="mb-8">
                    <label class="block text-surface-900 dark:text-surface-0 font-semibold mb-4 text-lg">
                        What do you need help with?
                        <span class="text-red-500">*</span>
                    </label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div
                            v-for="category in categories"
                            :key="category.value"
                            @click="
                                selectedCategory = category.value;
                                onCategoryChange();
                            "
                            :class="[
                                'p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                                selectedCategory === category.value ? 'border-primary bg-primary-50 dark:bg-primary-900/20 shadow-md' : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 hover:shadow-md'
                            ]"
                        >
                            <div class="text-3xl mb-2">
                                {{ getCategoryIcon(category) }}
                            </div>
                            <div class="font-semibold text-surface-900 dark:text-surface-0 mb-1">
                                {{ category.label }}
                            </div>
                            <div class="text-xs text-surface-500 dark:text-surface-400 line-clamp-2">
                                {{ category.data?.description || 'Support category' }}
                            </div>
                            <div class="text-xs text-surface-400 dark:text-surface-500 mt-2 flex items-center justify-between">
                                <span>{{ category.data?.departmentName || 'Support' }}</span>
                                <Tag v-if="category.data?.defaultPriority" :value="category.data.defaultPriority" :severity="getPrioritySeverity(category.data.defaultPriority)" size="small" />
                            </div>
                        </div>
                    </div>
                    <small v-if="errors.categoryId" class="text-red-500 flex items-center gap-2 mt-2">
                        <i class="pi pi-exclamation-circle"></i>
                        {{ errors.categoryId }}
                    </small>
                </div>

                <!-- Category Info Badge -->
                <div v-if="selectedCategoryDetails" class="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                    <div class="flex items-start gap-3">
                        <i class="pi pi-info-circle text-primary text-xl mt-0.5"></i>
                        <div class="flex-1">
                            <p class="font-semibold text-surface-900 dark:text-surface-0 mb-1">{{ selectedCategoryDetails.departmentName || 'Support Team' }} will handle your request</p>
                            <div class="flex flex-wrap gap-2 items-center text-sm text-surface-600 dark:text-surface-400">
                                <span>Target resolution: {{ selectedCategoryDetails.targetResolutionTime || 24 }} hours</span>
                                <span>•</span>
                                <span>Priority: {{ formData.priority }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Title -->
                <div class="mb-6">
                    <label for="title" class="block text-surface-900 dark:text-surface-0 font-semibold mb-2">
                        Brief Summary
                        <span class="text-red-500">*</span>
                    </label>
                    <InputText id="title" v-model="formData.title" placeholder="e.g., Unable to complete payment" class="w-full" :class="{ 'p-invalid': errors.title }" @input="clearError('title')" />
                    <small v-if="errors.title" class="text-red-500 flex items-center gap-2 mt-2">
                        <i class="pi pi-exclamation-circle"></i>
                        {{ errors.title }}
                    </small>
                </div>

                <!-- Description -->
                <div class="mb-6">
                    <label for="description" class="block text-surface-900 dark:text-surface-0 font-semibold mb-2">
                        Detailed Description
                        <span class="text-red-500">*</span>
                    </label>
                    <Textarea
                        id="description"
                        v-model="formData.description"
                        placeholder="Please provide as much detail as possible about your issue..."
                        rows="5"
                        class="w-full"
                        :class="{ 'p-invalid': errors.description }"
                        @input="clearError('description')"
                    />
                    <small v-if="errors.description" class="text-red-500 flex items-center gap-2 mt-2">
                        <i class="pi pi-exclamation-circle"></i>
                        {{ errors.description }}
                    </small>
                </div>

                <!-- Contact Information -->
                <div class="bg-surface-50 dark:bg-surface-800 rounded-2xl p-6 mb-8">
                    <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-4">Contact Information</h3>
                    <p class="text-sm text-surface-600 dark:text-surface-400 mb-6">We'll use this information to keep you updated</p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="contactName" class="block text-surface-700 dark:text-surface-300 font-medium mb-2 text-sm">
                                Your Name
                                <span class="text-red-500">*</span>
                            </label>
                            <InputText id="contactName" v-model="formData.contactName" placeholder="John Doe" class="w-full" :class="{ 'p-invalid': errors.contactName }" @input="clearError('contactName')" />
                            <small v-if="errors.contactName" class="text-red-500 flex items-center gap-2 mt-2">
                                <i class="pi pi-exclamation-circle"></i>
                                {{ errors.contactName }}
                            </small>
                        </div>

                        <div>
                            <label for="contactPhone" class="block text-surface-700 dark:text-surface-300 font-medium mb-2 text-sm"> Phone Number </label>
                            <InputText id="contactPhone" v-model="formData.contactPhone" placeholder="+1 (555) 000-0000" class="w-full" />
                        </div>
                    </div>

                    <div class="mt-4">
                        <label for="contactEmail" class="block text-surface-700 dark:text-surface-300 font-medium mb-2 text-sm">
                            Email Address
                            <span class="text-red-500">*</span>
                        </label>
                        <InputText id="contactEmail" v-model="formData.contactEmail" type="email" placeholder="john.doe@example.com" class="w-full" :class="{ 'p-invalid': errors.contactEmail }" @input="clearError('contactEmail')" />
                        <small v-if="errors.contactEmail" class="text-red-500 flex items-center gap-2 mt-2">
                            <i class="pi pi-exclamation-circle"></i>
                            {{ errors.contactEmail }}
                        </small>
                    </div>
                </div>

                <!-- Tags (Optional) -->
                <div class="mb-8">
                    <label for="tags" class="block text-surface-900 dark:text-surface-0 font-semibold mb-2"> Keywords (Optional) </label>
                    <InputText id="tags" v-model="formData.tags" placeholder="e.g., urgent, payment, mobile" class="w-full" />
                    <small class="text-surface-500 dark:text-surface-400 text-sm mt-2 block"> Separate multiple keywords with commas </small>
                </div>

                <!-- Submit Button -->
                <Button label="Submit Request" icon="pi pi-send" @click="handleSubmit" :loading="submitting" :disabled="submitting" class="w-full" size="large" />

                <p class="text-center text-sm text-surface-500 dark:text-surface-400 mt-4">By submitting, you agree to our terms of service and privacy policy</p>
            </div>

            <!-- Footer -->
            <div class="text-center mt-8 text-surface-600 dark:text-surface-400">
                <p class="text-sm">
                    Need immediate assistance? Reach us on
                    <span class="font-semibold text-primary">0244111222</span>
                </p>
            </div>
        </div>
    </div>

    <!-- Success Dialog -->
    <Dialog v-model:visible="showSuccessDialog" modal :style="{ width: '600px', maxWidth: '90vw' }" :closable="true">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <i class="pi pi-check text-green-600 dark:text-green-300"></i>
                </div>
                <span class="text-xl font-bold">Request Submitted Successfully!</span>
            </div>
        </template>

        <div class="space-y-6">
            <!-- Ticket Info Card -->
            <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5">
                <div class="text-center mb-4">
                    <div class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">#{{ ticketNumber }}</div>
                    <p class="text-sm text-surface-600 dark:text-surface-400">Ticket Number</p>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="text-center">
                        <div class="text-xs text-surface-500 dark:text-surface-400 mb-1">Status</div>
                        <Tag :value="ticketDetails?.status || 'OPEN'" :severity="getStatusSeverity(ticketDetails?.status || 'OPEN')" rounded />
                    </div>
                    <div class="text-center">
                        <div class="text-xs text-surface-500 dark:text-surface-400 mb-1">Priority</div>
                        <Tag :value="ticketDetails?.priority || 'MEDIUM'" :severity="getPrioritySeverity(ticketDetails?.priority || 'MEDIUM')" rounded />
                    </div>
                </div>
            </div>

            <!-- Important Information -->
            <div class="space-y-4">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="pi pi-key text-blue-600 dark:text-blue-300"></i>
                    </div>
                    <div class="flex-1">
                        <p class="font-medium text-surface-900 dark:text-surface-0">Your Tracking Token</p>
                        <div class="flex items-center gap-2 mt-1">
                            <code class="bg-surface-100 dark:bg-surface-800 px-3 py-1 rounded text-sm font-mono flex-1">{{ trackingToken }}</code>
                            <Button icon="pi pi-copy" size="small" @click="copyTrackingToken" text rounded />
                        </div>
                        <p class="text-xs text-surface-500 dark:text-surface-400 mt-2">Save this token to track your ticket status and add comments</p>
                    </div>
                </div>

                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="pi pi-envelope text-green-600 dark:text-green-300"></i>
                    </div>
                    <div>
                        <p class="font-medium text-surface-900 dark:text-surface-0">Email Updates</p>
                        <p class="text-sm text-surface-600 dark:text-surface-400">
                            A confirmation has been sent to <span class="font-semibold">{{ formData.contactEmail }}</span
                            >. All updates will be emailed to you.
                        </p>
                    </div>
                </div>

                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="pi pi-clock text-amber-600 dark:text-amber-300"></i>
                    </div>
                    <div>
                        <p class="font-medium text-surface-900 dark:text-surface-0">Response Time</p>
                        <p class="text-sm text-surface-600 dark:text-surface-400">Our team typically responds within 24-48 hours. You'll receive email notifications for all updates.</p>
                    </div>
                </div>
            </div>

            <!-- Next Steps -->
            <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4">
                <p class="font-medium text-surface-900 dark:text-surface-0 mb-3">What you can do now:</p>
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-green-500"></i>
                        <span class="text-sm">Save your ticket number and tracking token</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-green-500"></i>
                        <span class="text-sm">Track your ticket status anytime using the "Track Existing Ticket" button</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-check-circle text-green-500"></i>
                        <span class="text-sm">Add comments or provide more information via the tracking page</span>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex gap-2 justify-between w-full">
                <Button
                    label="Track This Ticket"
                    icon="pi pi-search"
                    @click="
                        showSuccessDialog = false;
                        showTrackingDialog = true;
                        trackingInput = trackingToken;
                    "
                    severity="secondary"
                />
                <div class="flex gap-2">
                    <Button label="Copy Details" icon="pi pi-copy" @click="copyTicketNumber" severity="secondary" outlined />
                    <Button label="Submit Another" icon="pi pi-plus" @click="handleAnotherRequest" />
                </div>
            </div>
        </template>
    </Dialog>

    <!-- Tracking Dialog -->
    <Dialog v-model:visible="showTrackingDialog" modal :style="{ width: '800px', maxWidth: '90vw' }" :closable="true" @hide="resetTrackingState">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <i class="pi pi-search text-blue-600 dark:text-blue-300"></i>
                </div>
                <span class="text-xl font-bold">Track Your Ticket</span>
            </div>
        </template>

        <!-- Tracking Form -->
        <div v-if="showTrackingForm" class="space-y-4">
            <div class="text-center">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-ticket text-blue-600 dark:text-blue-300 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">Enter Your Tracking Token</h3>
                <p class="text-surface-600 dark:text-surface-400 text-sm mb-6">Use the tracking token you received when submitting your ticket</p>
            </div>

            <div class="space-y-3">
                <label class="block text-surface-700 dark:text-surface-300 font-medium">Tracking Token</label>
                <InputText v-model="trackingInput" placeholder="Enter your tracking token here" class="w-full" autofocus />
                <small class="text-surface-500 dark:text-surface-400 text-sm block"> You can find this in your confirmation email or success dialog </small>
            </div>

            <Button label="Track Ticket" icon="pi pi-search" @click="trackTicket" :loading="trackingLoading" class="w-full" />
        </div>

        <!-- Ticket Details -->
        <div v-else class="space-y-6">
            <!-- Ticket Header -->
            <div class="bg-gradient-to-br from-surface-50 to-blue-50 dark:from-surface-800 dark:to-blue-900/20 rounded-xl p-5">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-1">#{{ ticketDetails?.id }}</h3>
                        <p class="text-surface-600 dark:text-surface-400">{{ ticketDetails?.title }}</p>
                    </div>
                    <div class="flex gap-2">
                        <Tag :value="ticketDetails?.status" :severity="getStatusSeverity(ticketDetails?.status)" />
                        <Tag :value="ticketDetails?.priority" :severity="getPrioritySeverity(ticketDetails?.priority)" />
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                        <p class="text-xs text-surface-500 dark:text-surface-400 mb-1">Category</p>
                        <p class="font-medium">{{ ticketDetails?.categoryName }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-surface-500 dark:text-surface-400 mb-1">Created</p>
                        <p class="font-medium">{{ formatDate(ticketDetails?.createdAt) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-surface-500 dark:text-surface-400 mb-1">Due Date</p>
                        <p class="font-medium">{{ formatDate(ticketDetails?.dueDate) }}</p>
                    </div>
                    <div>
                        <p class="text-xs text-surface-500 dark:text-surface-400 mb-1">Assigned To</p>
                        <p class="font-medium">{{ ticketDetails?.assignedUserName || 'Unassigned' }}</p>
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div>
                <h4 class="font-semibold text-surface-900 dark:text-surface-0 mb-2">Description</h4>
                <div class="bg-surface-50 dark:bg-surface-800 rounded-lg p-4 whitespace-pre-wrap text-sm">
                    {{ ticketDetails?.description }}
                </div>
            </div>

            <!-- Comments Section -->
            <div>
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-semibold text-surface-900 dark:text-surface-0">Comments ({{ comments.length }})</h4>
                    <Button label="Refresh" icon="pi pi-refresh" size="small" text @click="loadComments" :loading="loadingComments" />
                </div>

                <!-- Comments List -->
                <div v-if="comments.length > 0" class="space-y-4 max-h-96 overflow-y-auto pr-2">
                    <div
                        v-for="comment in comments"
                        :key="comment.id"
                        :class="['p-4 rounded-lg border', comment.isCustomer ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-surface-50 dark:bg-surface-800 border-surface-200 dark:border-surface-700']"
                    >
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="font-semibold">{{ comment.authorName || 'User' }}</span>
                                <span v-if="comment.customer" class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded ml-2"> Customer </span>
                                <span v-else class="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded ml-2"> Support Agent </span>
                            </div>
                            <span class="text-xs text-surface-500">{{ formatDate(comment.timestamp) }}</span>
                        </div>
                        <p class="text-sm whitespace-pre-wrap">{{ comment.comment }}</p>
                    </div>
                </div>
                <div v-else class="text-center py-8 text-surface-500 dark:text-surface-400">
                    <i class="pi pi-comment text-3xl mb-2 opacity-50"></i>
                    <p>No comments yet</p>
                </div>

                <!-- Add Comment -->
                <div class="mt-6">
                    <h5 class="font-medium text-surface-900 dark:text-surface-0 mb-3">Add a Comment</h5>
                    <div class="space-y-3">
                        <Textarea v-model="newComment" placeholder="Add additional information or ask a question..." rows="3" class="w-full" />
                        <div class="flex justify-between items-center">
                            <small class="text-surface-500 dark:text-surface-400"> Your comment will be visible to support agents </small>
                            <Button label="Add Comment" icon="pi pi-send" @click="addComment" :loading="addingComment" :disabled="!newComment.trim()" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex gap-2 justify-between w-full">
                <Button v-if="!showTrackingForm" label="Back to Tracking" icon="pi pi-arrow-left" @click="showTrackingForm = true" severity="secondary" outlined />
                <div class="flex gap-2">
                    <Button label="Close" @click="showTrackingDialog = false" severity="secondary" outlined />
                    <Button v-if="!showTrackingForm" label="Copy Token" icon="pi pi-copy" @click="copyTrackingToken" severity="secondary" />
                </div>
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.card {
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-2px);
}

/* Smooth transitions for theme switching */
* {
    transition:
        background-color 0.2s,
        border-color 0.2s,
        color 0.2s;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Custom scrollbar for comments */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
}

.dark ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
}

.dark ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
}
</style>
