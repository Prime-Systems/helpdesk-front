<script setup>
import { KnowledgeBaseService } from '@/service/KnowledgeBaseService';
import { useAuthStore } from '@/stores/AuthStore';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const authStore = useAuthStore();

const searchQuery = ref('');
const categories = ref([]);
const selectedCategory = ref(null);
const popularFaqs = ref([]);
const loading = ref(true);
const accordionActiveIndex = ref(null);
const faqs = ref([]);

// Admin CRUD state
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const faqToDelete = ref(null);
const editingFaq = ref(null);
const saving = ref(false);
const newFaqForm = ref({
    question: '',
    answer: '',
    categoryId: null,
    tags: []
});

// Check if current user has admin/manager privileges
const isAdmin = computed(() => {
    const role = authStore.userRole;
    return role === 'ADMIN' || role === 'MANAGER' || role === 'SUPER_ADMIN';
});

// Default categories (fallback)
const defaultCategories = [
    { id: 1, name: 'Account Access', icon: 'pi pi-lock', color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'Billing & Payments', icon: 'pi pi-credit-card', color: 'bg-green-100 text-green-700' },
    { id: 3, name: 'Product Features', icon: 'pi pi-star', color: 'bg-purple-100 text-purple-700' },
    { id: 4, name: 'Integrations', icon: 'pi pi-link', color: 'bg-yellow-100 text-yellow-700' },
    { id: 5, name: 'Troubleshooting', icon: 'pi pi-question-circle', color: 'bg-red-100 text-red-700' },
    { id: 6, name: 'Getting Started', icon: 'pi pi-flag', color: 'bg-cyan-100 text-cyan-700' }
];

// Default FAQs (fallback when API unavailable)
const defaultFaqs = [
    {
        id: 1,
        categoryId: 1,
        question: 'How do I reset my password?',
        answer: 'To reset your password, click on the "Forgot Password" link on the login page. You will receive an email with instructions to reset your password. For security reasons, the reset link expires after 24 hours.',
        views: 4582,
        helpful: 423,
        tags: ['account', 'password', 'login']
    },
    {
        id: 2,
        categoryId: 1,
        question: "I can't log in to my account. What should I do?",
        answer: 'If you\'re having trouble logging in, please try the following steps:<br><ol class="list-decimal pl-5 space-y-2 mb-4"><li>Ensure your caps lock is off and you\'re using the correct email address</li><li>Clear your browser cache and cookies</li><li>Try using an incognito/private browser window</li><li>Reset your password using the "Forgot Password" link</li></ol>If you\'re still unable to login after trying these steps, please contact support with your account email address.',
        views: 3896,
        helpful: 367,
        tags: ['account', 'login', 'troubleshooting']
    },
    {
        id: 3,
        categoryId: 2,
        question: 'When will I be billed for my subscription?',
        answer: "Your subscription will be billed on the same date each month/year, based on your initial signup date.",
        views: 3241,
        helpful: 298,
        tags: ['billing', 'subscription', 'payment']
    },
    {
        id: 4,
        categoryId: 3,
        question: 'What are the differences between Basic and Pro plans?',
        answer: 'The main differences include: Users, Storage, Reports, API Access, Support, and Custom Branding options.',
        views: 4123,
        helpful: 387,
        tags: ['plans', 'pricing', 'features']
    },
    {
        id: 5,
        categoryId: 6,
        question: 'How do I create my first project?',
        answer: 'From the dashboard, click the "+ New Project" button, enter project details, and click "Create Project".',
        views: 4231,
        helpful: 456,
        tags: ['projects', 'getting started', 'tutorial']
    }
];

// Fetch FAQs and categories from API
const fetchData = async () => {
    loading.value = true;
    try {
        // Fetch categories
        const [categoriesData, faqsData, popularData] = await Promise.all([
            KnowledgeBaseService.getFaqCategories(),
            KnowledgeBaseService.getFaqs({ size: 100 }),
            KnowledgeBaseService.getPopularFaqs(5)
        ]);
        
        if (categoriesData && categoriesData.length > 0) {
            categories.value = categoriesData.map(cat => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon || 'pi pi-folder',
                color: cat.color || 'bg-gray-100 text-gray-700'
            }));
        } else if (isAdmin.value) {
            // Auto-seed categories if empty and user is admin
            toast.add({ severity: 'info', summary: 'Setup', detail: 'Initializing default categories...', life: 3000 });
            await seedDefaultCategories();
            // Re-fetch categories after seeding
            const newCategories = await KnowledgeBaseService.getFaqCategories();
             categories.value = newCategories.map(cat => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon || 'pi pi-folder',
                color: cat.color || 'bg-gray-100 text-gray-700'
            }));
        } else {
             categories.value = [];
        }
        
        faqs.value = faqsData.faqs || faqsData;
        popularFaqs.value = popularData;
    } catch (error) {
        console.warn('Knowledge Base API not available, using default data:', error.message);
        // Fallback to default data
        categories.value = defaultCategories;
        faqs.value = defaultFaqs;
        popularFaqs.value = [...defaultFaqs].sort((a, b) => b.views - a.views).slice(0, 5);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});

const filteredFaqs = computed(() => {
    let result = faqs.value;

    // Filter by category if selected
    if (selectedCategory.value) {
        result = result.filter((faq) => faq.categoryId === selectedCategory.value);
    }

    // Filter by search query if present
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter((faq) => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query) || (faq.tags && faq.tags.some((tag) => tag.includes(query))));
    }

    return result;
});

// Seed default categories if none exist
const seedDefaultCategories = async () => {
    for (const cat of defaultCategories) {
        try {
            await KnowledgeBaseService.createFaqCategory({
                name: cat.name,
                icon: cat.icon,
                color: cat.color
            });
        } catch (error) {
            console.error(`Failed to create category ${cat.name}:`, error.message);
        }
    }
};

const selectCategory = (categoryId) => {
    selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId;
};

const markHelpful = async (faqId) => {
    try {
        await KnowledgeBaseService.markFaqHelpful(faqId);
        const faq = faqs.value.find((f) => f.id === faqId);
        if (faq) {
            faq.helpful += 1;
        }
        toast.add({
            severity: 'success',
            summary: 'Thank you',
            detail: 'Your feedback has been recorded',
            life: 3000
        });
    } catch (error) {
        // Still update locally even if API fails
        const faq = faqs.value.find((f) => f.id === faqId);
        if (faq) {
            faq.helpful += 1;
        }
        toast.add({
            severity: 'success',
            summary: 'Thank you',
            detail: 'Your feedback has been recorded',
            life: 3000
        });
    }
};

const resetFilters = () => {
    selectedCategory.value = null;
    searchQuery.value = '';
};

const formatViews = (views) => {
    return new Intl.NumberFormat().format(views);
};

const getCategoryName = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.name : '';
};

const getCategoryIcon = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.icon : 'pi pi-question-circle';
};

const getCategoryColor = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.color : 'bg-gray-100 text-gray-700';
};

// Admin CRUD methods
const resetForm = () => {
    newFaqForm.value = {
        question: '',
        answer: '',
        categoryId: null,
        tags: []
    };
};

const openCreateDialog = () => {
    resetForm();
    showCreateDialog.value = true;
};

const openEditDialog = (faq) => {
    editingFaq.value = { ...faq };
    showEditDialog.value = true;
};

const confirmDelete = (faq) => {
    faqToDelete.value = faq;
    showDeleteDialog.value = true;
};

const createFaq = async () => {
    if (!newFaqForm.value.question || !newFaqForm.value.answer) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Question and answer are required', life: 3000 });
        return;
    }
    
    saving.value = true;
    try {
        const response = await KnowledgeBaseService.createFaq(newFaqForm.value);
        
        faqs.value.unshift({
            id: response.id,
            question: newFaqForm.value.question,
            answer: newFaqForm.value.answer,
            categoryId: newFaqForm.value.categoryId,
            tags: newFaqForm.value.tags,
            views: 0,
            helpful: 0
        });
        
        showCreateDialog.value = false;
        resetForm();
        toast.add({ severity: 'success', summary: 'Success', detail: 'FAQ created successfully', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create FAQ', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const updateFaq = async () => {
    if (!editingFaq.value.question || !editingFaq.value.answer) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Question and answer are required', life: 3000 });
        return;
    }
    
    saving.value = true;
    try {
        await KnowledgeBaseService.updateFaq(editingFaq.value.id, editingFaq.value);
        
        const index = faqs.value.findIndex(f => f.id === editingFaq.value.id);
        if (index !== -1) {
            faqs.value[index] = { ...faqs.value[index], ...editingFaq.value };
        }
        
        showEditDialog.value = false;
        editingFaq.value = null;
        toast.add({ severity: 'success', summary: 'Success', detail: 'FAQ updated successfully', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update FAQ', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const deleteFaq = async () => {
    if (!faqToDelete.value) return;
    
    saving.value = true;
    try {
        await KnowledgeBaseService.deleteFaq(faqToDelete.value.id);
        
        faqs.value = faqs.value.filter(f => f.id !== faqToDelete.value.id);
        
        showDeleteDialog.value = false;
        faqToDelete.value = null;
        toast.add({ severity: 'success', summary: 'Success', detail: 'FAQ deleted successfully', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete FAQ', life: 3000 });
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="card p-0">
        <!-- Hero Section -->
        <div class="bg-primary p-8 md:p-12 rounded-t-lg">
            <div class="max-w-4xl mx-auto text-center">
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">How can we help you?</h1>
                <div v-if="isAdmin" class="mb-4">
                    <Button label="New FAQ" icon="pi pi-plus" class="p-button-raised p-button-secondary font-bold" @click="openCreateDialog" />
                </div>
                <p class="text-white/80 mb-6 text-lg">Find answers to common questions and solutions to issues you might be facing</p>

                <div class="relative">
                    <span class="p-input-icon-left w-full">
                        <!-- <i class="pi pi-search"></i> -->
                        <InputText v-model="searchQuery" placeholder="Search for answers..." class="w-full p-3 pr-12 text-lg" />
                    </span>
                    <Button v-if="searchQuery" icon="pi pi-times" class="absolute right-2 top-1/2 transform -translate-y-1/2" text aria-label="Clear search" @click="searchQuery = ''" />
                </div>
            </div>
        </div>

        <div class="p-6 md:p-8">
            <div class="max-w-7xl mx-auto">
                <!-- Categories -->
                <div class="mb-8">
                    <h2 class="text-xl font-semibold mb-4">Browse by Category</h2>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div
                            v-for="category in categories"
                            :key="category.id"
                            class="p-4 border rounded-lg text-center cursor-pointer transition-all hover:shadow-md"
                            :class="{ 'border-primary bg-primary/5': selectedCategory === category.id }"
                            @click="selectCategory(category.id)"
                        >
                            <div :class="['w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3', category.color]">
                                <i :class="['text-xl', category.icon]"></i>
                            </div>
                            <h3 class="font-medium">{{ category.name }}</h3>
                        </div>
                    </div>

                    <div v-if="selectedCategory || searchQuery" class="mt-4 flex items-center">
                        <Badge value="Filtered" severity="primary" class="mr-2" />
                        <span class="text-sm text-gray-600 mr-4"> Showing {{ filteredFaqs.length }} results </span>
                        <Button label="Reset Filters" icon="pi pi-filter-slash" text size="small" @click="resetFilters" />
                    </div>
                </div>

                <div v-if="loading" class="flex justify-center my-12">
                    <ProgressSpinner />
                </div>

                <template v-else>
                    <!-- Popular Questions (if no search/filter) -->
                    <div v-if="!searchQuery && !selectedCategory" class="mb-8">
                        <h2 class="text-xl font-semibold mb-4">Popular Questions</h2>
                        <div class="space-y-4">
                            <div v-for="faq in popularFaqs" :key="faq.id" class="border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-all" @click="accordionActiveIndex = accordionActiveIndex === faq.id ? null : faq.id">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <i :class="[getCategoryIcon(faq.categoryId), getCategoryColor(faq.categoryId), 'p-2 rounded-full']"></i>
                                        <h3 class="font-medium">{{ faq.question }}</h3>
                                    </div>
                                    <i :class="[accordionActiveIndex === faq.id ? 'pi pi-chevron-up' : 'pi pi-chevron-down', 'transition-transform']"></i>
                                </div>

                                <div v-if="accordionActiveIndex === faq.id" class="mt-4 pt-4 border-t">
                                    <div class="text-gray-700 prose max-w-none" v-html="faq.answer"></div>

                                    <div class="mt-4 pt-4 border-t flex items-center justify-between">
                                        <div class="flex items-center gap-4">
                                            <span class="text-sm text-gray-500"> <i class="pi pi-eye mr-1"></i> {{ formatViews(faq.views) }} views </span>
                                            <span class="text-sm text-gray-500"> <i class="pi pi-tag mr-1"></i> {{ getCategoryName(faq.categoryId) }} </span>
                                        </div>

                                        <Button label="Helpful" icon="pi pi-thumbs-up" text size="small" @click.stop="markHelpful(faq.id)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filtered/Search Results -->
                    <div v-else class="mb-8">
                        <h2 class="text-xl font-semibold mb-4">
                            <template v-if="selectedCategory">
                                {{ getCategoryName(selectedCategory) }}
                            </template>
                            <template v-else-if="searchQuery"> Search Results </template>
                        </h2>

                        <div v-if="filteredFaqs.length === 0" class="text-center py-12">
                            <i class="pi pi-search text-gray-400 text-4xl mb-4"></i>
                            <h3 class="text-xl font-medium mb-2">No results found</h3>
                            <p class="text-gray-600 mb-4">Try adjusting your search or filters to find what you're looking for</p>
                            <Button label="Reset Filters" icon="pi pi-filter-slash" @click="resetFilters" />
                        </div>

                        <div v-else class="space-y-4">
                            <div v-for="faq in filteredFaqs" :key="faq.id" class="border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-all" @click="accordionActiveIndex = accordionActiveIndex === faq.id ? null : faq.id">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <i :class="[getCategoryIcon(faq.categoryId), getCategoryColor(faq.categoryId), 'p-2 rounded-full']"></i>
                                        <h3 class="font-medium">{{ faq.question }}</h3>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div v-if="isAdmin" class="flex gap-1 mr-2" @click.stop>
                                            <Button icon="pi pi-pencil" severity="secondary" text rounded size="small" @click="openEditDialog(faq)" v-tooltip.top="'Edit'" />
                                            <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="confirmDelete(faq)" v-tooltip.top="'Delete'" />
                                        </div>
                                        <i :class="[accordionActiveIndex === faq.id ? 'pi pi-chevron-up' : 'pi pi-chevron-down', 'transition-transform']"></i>
                                    </div>
                                </div>

                                <div v-if="accordionActiveIndex === faq.id" class="mt-4 pt-4 border-t">
                                    <div class="text-gray-700 prose max-w-none" v-html="faq.answer"></div>

                                    <div class="mt-4 pt-4 border-t flex items-center justify-between">
                                        <div class="flex flex-wrap items-center gap-4">
                                            <span class="text-sm text-gray-500"> <i class="pi pi-eye mr-1"></i> {{ formatViews(faq.views) }} views </span>
                                            <span class="text-sm text-gray-500"> <i class="pi pi-tag mr-1"></i> {{ getCategoryName(faq.categoryId) }} </span>
                                            <span class="text-sm text-gray-500">
                                                Tags:
                                                <span v-for="(tag, i) in faq.tags" :key="tag" class="mr-1"> {{ tag }}<span v-if="i < faq.tags.length - 1">,</span> </span>
                                            </span>
                                        </div>

                                        <Button label="Helpful" icon="pi pi-thumbs-up" text size="small" @click.stop="markHelpful(faq.id)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Contact Support -->
                <div class="bg-gray-100 rounded-lg p-6 text-center">
                    <h2 class="text-xl font-semibold mb-2">Still need help?</h2>
                    <p class="text-gray-600 mb-4">If you couldn't find the answer you were looking for, our support team is here to help</p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button label="Contact Support" icon="pi pi-envelope" />
                        <Button label="Request a Call" icon="pi pi-phone" outlined />
                    </div>
                </div>
            </div>
        </div>
        <!-- Create FAQ Dialog (Admin only) -->
        <Dialog v-model:visible="showCreateDialog" header="Create New FAQ" :modal="true" :closable="true" :style="{ width: '90vw', maxWidth: '600px' }">
            <div class="flex flex-col gap-4">
                <div class="field">
                    <label for="newQuestion" class="font-semibold block mb-2">Question *</label>
                    <InputText id="newQuestion" v-model="newFaqForm.question" class="w-full" placeholder="Enter question" />
                </div>
                <div class="field">
                    <label for="newCategory" class="font-semibold block mb-2">Category</label>
                    <Select id="newCategory" v-model="newFaqForm.categoryId" :options="categories" optionLabel="name" optionValue="id" placeholder="Select a category" class="w-full" />
                </div>
                <div class="field">
                    <label for="newAnswer" class="font-semibold block mb-2">Answer *</label>
                    <Textarea id="newAnswer" v-model="newFaqForm.answer" rows="5" class="w-full" placeholder="Enter answer (HTML supported)" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="showCreateDialog = false" />
                <Button label="Create" icon="pi pi-check" :loading="saving" @click="createFaq" />
            </template>
        </Dialog>

        <!-- Edit FAQ Dialog (Admin only) -->
        <Dialog v-model:visible="showEditDialog" header="Edit FAQ" :modal="true" :closable="true" :style="{ width: '90vw', maxWidth: '600px' }">
            <div v-if="editingFaq" class="flex flex-col gap-4">
                <div class="field">
                    <label for="editQuestion" class="font-semibold block mb-2">Question *</label>
                    <InputText id="editQuestion" v-model="editingFaq.question" class="w-full" />
                </div>
                <div class="field">
                    <label for="editCategory" class="font-semibold block mb-2">Category</label>
                    <Select id="editCategory" v-model="editingFaq.categoryId" :options="categories" optionLabel="name" optionValue="id" class="w-full" />
                </div>
                <div class="field">
                    <label for="editAnswer" class="font-semibold block mb-2">Answer *</label>
                    <Textarea id="editAnswer" v-model="editingFaq.answer" rows="5" class="w-full" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="showEditDialog = false" />
                <Button label="Save Changes" icon="pi pi-check" :loading="saving" @click="updateFaq" />
            </template>
        </Dialog>

        <!-- Delete Confirmation Dialog (Admin only) -->
        <Dialog v-model:visible="showDeleteDialog" header="Confirm Delete" :modal="true" :closable="true" :style="{ width: '450px' }">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-4xl text-orange-500"></i>
                <div>
                    <p class="font-semibold">Are you sure you want to delete this FAQ?</p>
                    <p class="text-gray-600 mt-2" v-if="faqToDelete">"{{ faqToDelete.question }}"</p>
                    <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="showDeleteDialog = false" />
                <Button label="Delete" icon="pi pi-trash" severity="danger" :loading="saving" @click="deleteFaq" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.p-progressspinner {
    width: 50px;
    height: 50px;
}

:deep(.prose) {
    line-height: 1.6;
}

:deep(.prose a) {
    text-decoration: none;
}

:deep(.prose ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
}

:deep(.prose ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
}

:deep(.prose li) {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

:deep(.prose strong) {
    font-weight: 600;
}
</style>
