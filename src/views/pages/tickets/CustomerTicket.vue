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

// Form data matching your ticket structure
const formData = ref({
    title: '',
    description: '',
    categoryId: null,
    tags: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
});

const categories = ref([]);
const selectedCategory = ref(null);
const attachment = ref(null);
const fileInputRef = ref(null);

const errors = ref({});

onBeforeMount(async () => {
    try {
        const data = await CategoryService.getCategories();
        categories.value = data
            .filter((cat) => cat.status === 'ACTIVE')
            .map((cat) => ({
                label: cat.name,
                value: cat.id,
                data: cat
            }));
        loading.value = false;
    } catch (error) {
        console.error('Error fetching categories:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load categories',
            life: 3000
        });
    }
});

const selectedCategoryDetails = computed(() => {
    if (!selectedCategory.value) return null;
    return categories.value.find((cat) => cat.value === selectedCategory.value)?.data;
});

const handleFileSelect = (event) => {
    const file = event.files?.[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'File size must be less than 10MB',
                life: 3000
            });
            return;
        }
        attachment.value = file;
        errors.value.attachment = '';
    }
};

const removeAttachment = () => {
    attachment.value = null;
    if (fileInputRef.value) {
        fileInputRef.value.clear();
    }
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
        // Prepare ticket data
        const ticketData = {
            title: formData.value.title,
            description: formData.value.description,
            categoryId: selectedCategory.value,
            tags: formData.value.tags || '',
            createdById: 1, // For customer portal, you might need a special "customer" user or handle this differently
            // Add contact info as tags or in description since your backend might not have these fields
            contactInfo: {
                name: formData.value.contactName,
                email: formData.value.contactEmail,
                phone: formData.value.contactPhone
            }
        };

        // Add contact info to description
        ticketData.description = `${formData.value.description}\n\n--- Customer Contact Info ---\nName: ${formData.value.contactName}\nEmail: ${formData.value.contactEmail}${formData.value.contactPhone ? `\nPhone: ${formData.value.contactPhone}` : ''}`;

        const response = await TicketService.createTicket(ticketData, attachment.value);

        if (response) {
            ticketNumber.value = response.id;
            submitSuccess.value = true;

            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Your ticket has been submitted successfully',
                life: 5000
            });

            // Reset form after 5 seconds
            setTimeout(() => {
                resetForm();
            }, 5000);
        }
    } catch (error) {
        console.error('Error submitting ticket:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to submit ticket. Please try again.',
            life: 5000
        });
    } finally {
        submitting.value = false;
    }
};

const resetForm = () => {
    formData.value = {
        title: '',
        description: '',
        categoryId: null,
        tags: '',
        contactName: '',
        contactEmail: '',
        contactPhone: ''
    };
    selectedCategory.value = null;
    attachment.value = null;
    errors.value = {};
    submitSuccess.value = false;
    ticketNumber.value = null;
};

const clearError = (field) => {
    if (errors.value[field]) {
        errors.value[field] = '';
    }
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-surface-0 to-purple-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950 py-8 px-4">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center min-h-screen">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <!-- Success State -->
        <div v-else-if="submitSuccess" class="max-w-2xl mx-auto">
            <div class="card bg-surface-0 dark:bg-surface-900 rounded-3xl shadow-2xl p-8 md:p-12 text-center border-0">
                <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="pi pi-check text-white text-5xl"></i>
                </div>

                <h2 class="text-3xl md:text-4xl font-bold text-surface-900 dark:text-surface-0 mb-4">Request Submitted Successfully!</h2>

                <p class="text-surface-600 dark:text-surface-400 text-lg mb-6">Your support request has been received and assigned to our team.</p>

                <div class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-8">
                    <p class="text-sm text-surface-600 dark:text-surface-400 mb-2">Your Ticket Number</p>
                    <p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">#{{ ticketNumber }}</p>
                    <p class="text-sm text-surface-500 dark:text-surface-400 mt-3">Save this number for future reference</p>
                </div>

                <div class="space-y-3 text-left mb-8">
                    <div class="flex items-start gap-3">
                        <i class="pi pi-check-circle text-green-500 text-xl mt-0.5"></i>
                        <p class="text-surface-600 dark:text-surface-400">
                            We'll send you email updates at <span class="font-semibold">{{ formData.contactEmail }}</span>
                        </p>
                    </div>
                    <div class="flex items-start gap-3">
                        <i class="pi pi-check-circle text-green-500 text-xl mt-0.5"></i>
                        <p class="text-surface-600 dark:text-surface-400">Our team will respond within 24-48 hours</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <i class="pi pi-check-circle text-green-500 text-xl mt-0.5"></i>
                        <p class="text-surface-600 dark:text-surface-400">You can reply to our emails to provide additional information</p>
                    </div>
                </div>

                <Button label="Submit Another Request" icon="pi pi-plus" @click="resetForm" class="w-full" size="large" />
            </div>
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
                    <label class="block text-surface-900 dark:text-surface-0 font-semibold mb-4 text-lg"> What do you need help with? <span class="text-red-500">*</span> </label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div
                            v-for="category in categories"
                            :key="category.value"
                            @click="
                                selectedCategory = category.value;
                                clearError('categoryId');
                            "
                            :class="[
                                'p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                                selectedCategory === category.value ? 'border-primary bg-primary-50 dark:bg-primary-900/20 shadow-md' : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 hover:shadow-md'
                            ]"
                        >
                            <div class="text-3xl mb-2">
                                {{
                                    category.data.tags?.split(',')[0] === 'hardware'
                                        ? '🖥️'
                                        : category.data.tags?.split(',')[0] === 'transaction'
                                          ? '💳'
                                          : category.data.tags?.split(',')[0] === 'document'
                                            ? '📄'
                                            : category.data.tags?.split(',')[0] === 'login'
                                              ? '🔐'
                                              : '❓'
                                }}
                            </div>
                            <div class="font-semibold text-surface-900 dark:text-surface-0 mb-1">
                                {{ category.label }}
                            </div>
                            <div class="text-xs text-surface-500 dark:text-surface-400">
                                {{ category.data.description }}
                            </div>
                            <div class="text-xs text-surface-400 dark:text-surface-500 mt-2">{{ category.data.departmentName }} • {{ category.data.targetResolutionTime }}h</div>
                        </div>
                    </div>
                    <small v-if="errors.categoryId" class="text-red-500 flex items-center gap-2 mt-2">
                        <i class="pi pi-exclamation-circle"></i>
                        {{ errors.categoryId }}
                    </small>
                </div>

                <!-- Category Info Badge -->
                <div v-if="selectedCategoryDetails" class="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-info-circle text-primary text-xl"></i>
                        <div>
                            <p class="font-semibold text-surface-900 dark:text-surface-0">{{ selectedCategoryDetails.departmentName }} will handle your request</p>
                            <p class="text-sm text-surface-600 dark:text-surface-400">Target resolution time: {{ selectedCategoryDetails.targetResolutionTime }} hours</p>
                        </div>
                    </div>
                </div>

                <!-- Title -->
                <div class="mb-6">
                    <label for="title" class="block text-surface-900 dark:text-surface-0 font-semibold mb-2"> Brief Summary <span class="text-red-500">*</span> </label>
                    <InputText id="title" v-model="formData.title" placeholder="e.g., Unable to complete payment" class="w-full" :class="{ 'p-invalid': errors.title }" @input="clearError('title')" />
                    <small v-if="errors.title" class="text-red-500 flex items-center gap-2 mt-2">
                        <i class="pi pi-exclamation-circle"></i>
                        {{ errors.title }}
                    </small>
                </div>

                <!-- Description -->
                <div class="mb-6">
                    <label for="description" class="block text-surface-900 dark:text-surface-0 font-semibold mb-2"> Detailed Description <span class="text-red-500">*</span> </label>
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

                <!-- Attachment -->
                <div class="mb-8">
                    <label class="block text-surface-900 dark:text-surface-0 font-semibold mb-2"> Attach File (Optional) </label>
                    <p class="text-sm text-surface-500 dark:text-surface-400 mb-3">You can attach screenshots, documents, or any relevant files (Max 10MB)</p>

                    <FileUpload ref="fileInputRef" mode="basic" :auto="false" chooseLabel="Choose File" accept="image/*,.pdf,.doc,.docx,.txt" :maxFileSize="10000000" @select="handleFileSelect" class="w-full" />

                    <div v-if="attachment" class="mt-3 p-3 border border-surface-200 dark:border-surface-700 rounded-lg flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <i class="pi pi-file text-2xl text-surface-400"></i>
                            <div>
                                <p class="font-medium text-surface-900 dark:text-surface-0">{{ attachment.name }}</p>
                                <p class="text-sm text-surface-500">{{ (attachment.size / 1024).toFixed(2) }} KB</p>
                            </div>
                        </div>
                        <Button icon="pi pi-times" text rounded severity="danger" @click="removeAttachment" />
                    </div>
                </div>

                <!-- Contact Information -->
                <div class="bg-surface-50 dark:bg-surface-800 rounded-2xl p-6 mb-8">
                    <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-4">Contact Information</h3>
                    <p class="text-sm text-surface-600 dark:text-surface-400 mb-6">We'll use this information to keep you updated</p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="contactName" class="block text-surface-700 dark:text-surface-300 font-medium mb-2 text-sm"> Your Name <span class="text-red-500">*</span> </label>
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
                        <label for="contactEmail" class="block text-surface-700 dark:text-surface-300 font-medium mb-2 text-sm"> Email Address <span class="text-red-500">*</span> </label>
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
                <p class="text-sm">Need immediate assistance? Call us at <span class="font-semibold text-primary">0244111222</span></p>
            </div>
        </div>
    </div>
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
</style>
