<script setup>
import { KnowledgeBaseService } from '@/service/KnowledgeBaseService';
import { useAuthStore } from '@/stores/AuthStore';
import MarkdownIt from 'markdown-it';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();
const authStore = useAuthStore();

const searchQuery = ref('');
const loading = ref(true);
const selectedCategory = ref(null);
const showArticleDialog = ref(false);
const currentArticle = ref(null);

// Admin CRUD state
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const articleToDelete = ref(null);
const editingArticle = ref(null);
const saving = ref(false);
const imageErrors = ref({});

// Handle image load errors
const onImageError = (key) => {
    imageErrors.value[key] = true;
};

// New article form
const newArticleForm = ref({
    title: '',
    summary: '',
    content: '',
    categoryId: null,
    tags: [],
    isFeatured: false
});

// Check if current user has admin/manager privileges
const isAdmin = computed(() => {
    const role = authStore.userRole;
    return role === 'ADMIN' || role === 'MANAGER';
});

// Categories - loaded from API with fallback
const categories = ref([]);
const defaultCategories = [
    { id: 1, name: 'Security Protocols', icon: 'pi pi-shield', color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'Customer Service', icon: 'pi pi-users', color: 'bg-green-100 text-green-700' },
    { id: 3, name: 'Banking Systems', icon: 'pi pi-server', color: 'bg-purple-100 text-purple-700' }
];

// Articles - loaded from API with fallback
const articles = ref([]);

// Initialize markdown-it without syntax highlighting
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

// The rendering function
const renderMarkdown = (content) => {
    return md.render(content || '');
};
// Default demo articles (fallback when API unavailable)
const defaultArticles = [
    {
        id: 1,
        title: 'Detecting and Preventing Banking Fraud: A Guide for Tellers',
        summary: 'Learn the key warning signs of potential fraud and the proper protocols to follow.',
        author: 'Sarah Johnson',
        authorRole: 'Security Compliance Officer',
        authorAvatar: 'https://avatar.iran.liara.run/public/50?name=Sarah+Johnson',
        categoryId: 1,
        content:
            '# Detecting Banking Fraud\n\nBank tellers are the first line of defense against fraud. Key warning signs include:\n\n- Inconsistent signatures\n- Customer nervousness\n- Large amounts from new accounts\n\nAlways verify identity and consult supervisors when needed.',
        publishedDate: new Date(2025, 2, 5),
        updatedDate: new Date(2025, 2, 5),
        tags: ['fraud prevention', 'security', 'compliance'],
        views: 342,
        helpful: 45,
        comments: 8,
        isFeatured: true
    },
    {
        id: 2,
        title: 'Troubleshooting Common Banking System Issues',
        summary: 'A practical guide for resolving common technical issues with core banking systems.',
        author: 'Robert Chen',
        authorRole: 'IT Support Lead',
        authorAvatar: 'https://avatar.iran.liara.run/public/50?name=Robert+Chen',
        categoryId: 3,
        content: '# Troubleshooting Banking Systems\n\nCommon issues include:\n\n1. System slowness - check connectivity and restart application\n2. Printing problems - verify paper and cables\n3. ATM issues - contact ATM Service Desk',
        publishedDate: new Date(2025, 0, 18),
        updatedDate: new Date(2025, 1, 22),
        tags: ['IT support', 'troubleshooting', 'banking systems'],
        views: 287,
        helpful: 51,
        comments: 12,
        isFeatured: true
    },
    {
        id: 3,
        title: 'Effective Customer Service Techniques for Banking Professionals',
        summary: 'Proven strategies for handling challenging customer interactions.',
        author: 'Maria Rodriguez',
        authorRole: 'Customer Experience Manager',
        authorAvatar: 'https://avatar.iran.liara.run/public/50?name=Maria+Rodriguez',
        categoryId: 2,
        content: '# Customer Service Excellence\n\nFollow the HEAR framework:\n\n- **H**ear: Listen actively\n- **E**mpathize: Acknowledge feelings\n- **A**ct: Take appropriate action\n- **R**esolve: Confirm resolution',
        publishedDate: new Date(2024, 11, 12),
        updatedDate: new Date(2025, 0, 5),
        tags: ['customer service', 'communication', 'complaint handling'],
        views: 215,
        helpful: 32,
        comments: 4,
        isFeatured: false
    }
];

// New article form (simplified)
const newArticle = ref({
    title: '',
    content: '',
    categoryId: null,
    tags: []
});

// Computed properties
const filteredArticles = computed(() => {
    let result = articles.value;

    // Filter by search query
    if (searchQuery.value?.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter((article) => article.title.toLowerCase().includes(query) || article.summary.toLowerCase().includes(query) || article.tags.some((tag) => tag.includes(query)));
    }

    // Filter by category
    if (selectedCategory.value) {
        result = result.filter((article) => article.categoryId === selectedCategory.value);
    }

    return result;
});

const featuredArticles = computed(() => {
    return articles.value.filter((a) => a.isFeatured);
});

// Format date helper
const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// Methods
const fetchArticles = async () => {
    loading.value = true;
    try {
        const [categoriesData, articlesData] = await Promise.all([KnowledgeBaseService.getArticleCategories(), KnowledgeBaseService.getArticles({ size: 100 })]);

        // Map categories from API
        if (categoriesData && categoriesData.length > 0) {
            categories.value = categoriesData.map((cat) => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon || 'pi pi-file',
                color: cat.color || 'bg-gray-100 text-gray-700'
            }));
        } else {
            categories.value = defaultCategories;
        }

        // Map articles from API
        if (articlesData && (articlesData.articles || articlesData.length > 0)) {
            const apiArticles = articlesData.articles || articlesData;
            articles.value = apiArticles.map((article) => ({
                id: article.id,
                title: article.title,
                summary: article.summary,
                author: article.authorName,
                authorRole: article.authorRole || 'Contributor',
                authorAvatar: article.authorAvatar || `https://avatar.iran.liara.run/public/50?name=${encodeURIComponent(article.authorName || 'User')}`,
                categoryId: article.categoryId,
                content: article.content,
                publishedDate: new Date(article.publishedDate),
                updatedDate: article.updatedDate ? new Date(article.updatedDate) : null,
                tags: article.tags || [],
                views: article.views || 0,
                helpful: article.helpful || 0,
                comments: article.comments || 0,
                isFeatured: article.isFeatured || false
            }));
        } else {
            // Use default articles if no API data
            articles.value = defaultArticles;
        }
    } catch (error) {
        console.warn('Knowledge Base API not available, using demo data:', error.message);
        categories.value = defaultCategories;
        articles.value = defaultArticles;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchArticles();
});

const viewArticle = async (article) => {
    currentArticle.value = article;
    showArticleDialog.value = true;

    // Increment view count via API
    try {
        await KnowledgeBaseService.getArticleById(article.id); // This will increment views on backend
    } catch (error) {
        // Fallback: just increment locally
    }

    // Update local view count
    const articleToUpdate = articles.value.find((a) => a.id === article.id);
    if (articleToUpdate) {
        articleToUpdate.views += 1;
    }
};

const markArticleHelpful = async (articleId) => {
    try {
        await KnowledgeBaseService.markArticleHelpful(articleId);
        const article = articles.value.find((a) => a.id === articleId);
        if (article) {
            article.helpful += 1;
        }
        toast.add({
            severity: 'success',
            summary: 'Thank you',
            detail: 'Your feedback has been recorded',
            life: 3000
        });
    } catch (error) {
        // Still update locally even if API fails
        const article = articles.value.find((a) => a.id === articleId);
        if (article) {
            article.helpful += 1;
        }
        toast.add({
            severity: 'success',
            summary: 'Thank you',
            detail: 'Your feedback has been recorded',
            life: 3000
        });
    }
};

const selectCategory = (categoryId) => {
    selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId;
};

const getCategoryName = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.name : '';
};

const getCategoryIcon = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.icon : 'pi pi-file';
};

const getCategoryColor = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.color : 'bg-gray-100 text-gray-700';
};

// Admin CRUD methods
const resetForm = () => {
    newArticleForm.value = {
        title: '',
        summary: '',
        content: '',
        categoryId: null,
        tags: [],
        isFeatured: false
    };
};

const openCreateDialog = () => {
    resetForm();
    showCreateDialog.value = true;
};

const openEditDialog = (article) => {
    editingArticle.value = { ...article };
    showEditDialog.value = true;
};

const confirmDelete = (article) => {
    articleToDelete.value = article;
    showDeleteDialog.value = true;
};

const createArticle = async () => {
    if (!newArticleForm.value.title || !newArticleForm.value.content) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Title and content are required', life: 3000 });
        return;
    }

    saving.value = true;
    try {
        const response = await KnowledgeBaseService.createArticle(newArticleForm.value);

        // Add to local list
        articles.value.unshift({
            id: response.id,
            title: newArticleForm.value.title,
            summary: newArticleForm.value.summary,
            content: newArticleForm.value.content,
            categoryId: newArticleForm.value.categoryId,
            tags: newArticleForm.value.tags,
            isFeatured: newArticleForm.value.isFeatured,
            author: authStore.userName || 'Admin',
            authorAvatar: `https://avatar.iran.liara.run/public/50?name=${encodeURIComponent(authStore.userName || 'Admin')}`,
            publishedDate: new Date(),
            views: 0,
            helpful: 0,
            comments: 0
        });

        showCreateDialog.value = false;
        resetForm();
        toast.add({ severity: 'success', summary: 'Success', detail: 'Article created successfully', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create article', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const updateArticle = async () => {
    if (!editingArticle.value.title || !editingArticle.value.content) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Title and content are required', life: 3000 });
        return;
    }

    saving.value = true;
    try {
        await KnowledgeBaseService.updateArticle(editingArticle.value.id, editingArticle.value);

        // Update local list
        const index = articles.value.findIndex((a) => a.id === editingArticle.value.id);
        if (index !== -1) {
            articles.value[index] = { ...articles.value[index], ...editingArticle.value };
        }

        showEditDialog.value = false;
        editingArticle.value = null;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Article updated successfully', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update article', life: 3000 });
    } finally {
        saving.value = false;
    }
};

const deleteArticle = async () => {
    if (!articleToDelete.value) return;

    saving.value = true;
    try {
        await KnowledgeBaseService.deleteArticle(articleToDelete.value.id);

        // Remove from local list
        articles.value = articles.value.filter((a) => a.id !== articleToDelete.value.id);

        showDeleteDialog.value = false;
        articleToDelete.value = null;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Article deleted successfully', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete article', life: 3000 });
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <div class="card">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
                <h1 class="text-3xl font-semibold mb-2">Banking Knowledge Center</h1>
                <p class="text-gray-600">Resources and guides for banking professionals</p>
            </div>
            <!-- Admin: Add Article Button -->
            <Button v-if="isAdmin" label="New Article" icon="pi pi-plus" severity="primary" @click="openCreateDialog" class="mt-4 md:mt-0" />
        </div>

        <!-- Search and Categories -->
        <div class="mb-8">
            <div class="p-input-icon-left w-full mb-6">
                <!-- <i class="pi pi-search"></i> -->
                <InputText v-model="searchQuery" placeholder="Search articles..." class="w-full p-inputtext-lg" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Badge :value="selectedCategory ? getCategoryName(selectedCategory) : 'Search Results'" severity="primary" class="mr-2" />
                <span class="text-sm text-gray-600 mr-4"> {{ filteredArticles.length }} result{{ filteredArticles.length !== 1 ? 's' : '' }} </span>
                <Button
                    label="Clear Filters"
                    icon="pi pi-filter-slash"
                    text
                    size="small"
                    @click="
                        searchQuery = '';
                        selectedCategory = null;
                    "
                    v-if="selectedCategory || searchQuery"
                />
            </div>
        </div>

        <div v-if="loading" class="flex justify-center my-12">
            <ProgressSpinner />
        </div>

        <template v-else>
            <!-- Featured Articles -->
            <div v-if="featuredArticles.length > 0 && !searchQuery && !selectedCategory" class="mb-8">
                <h2 class="text-xl font-semibold mb-4">Featured Articles</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div v-for="article in featuredArticles" :key="article.id" class="border rounded-lg p-6 hover:shadow-md transition cursor-pointer bg-primary/5 border-primary/20" @click="viewArticle(article)">
                        <div class="flex items-center mb-4">
                            <i :class="[getCategoryIcon(article.categoryId), 'text-primary text-xl mr-3']"></i>
                            <h3 class="text-xl font-medium">{{ article.title }}</h3>
                        </div>

                        <p class="text-gray-600 mb-4">{{ article.summary }}</p>

                        <div class="flex flex-wrap gap-2 mb-4">
                            <Chip v-for="tag in article.tags.slice(0, 3)" :key="tag" :label="tag" class="bg-primary/10 text-primary" />
                            <span v-if="article.tags.length > 3" class="text-sm text-gray-500"> +{{ article.tags.length - 3 }} more </span>
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="flex items-center">
                                <img v-if="!imageErrors[`featured-${article.id}`]" :src="article.authorAvatar" :alt="article.author" class="w-8 h-8 rounded-full mr-2" @error="onImageError(`featured-${article.id}`)" />
                                <div v-else class="w-8 h-8 rounded-full mr-2 bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                    <i class="pi pi-user text-sm text-surface-500 dark:text-surface-400"></i>
                                </div>
                                <span class="text-sm text-gray-600">{{ article.author }}</span>
                            </div>
                            <span class="text-sm text-gray-500">{{ formatDate(article.publishedDate) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Article List -->
            <div v-if="filteredArticles.length === 0 && (searchQuery || selectedCategory)" class="text-center py-12 border rounded-lg">
                <i class="pi pi-search text-gray-400 text-4xl mb-4"></i>
                <h3 class="text-xl font-medium mb-2">No matching articles found</h3>
                <p class="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
            </div>

            <div v-else class="grid grid-cols-1 gap-6">
                <div v-for="article in filteredArticles" :key="article.id" class="border rounded-lg p-6 hover:shadow-md transition cursor-pointer" @click="viewArticle(article)">
                    <div class="flex flex-col md:flex-row md:items-start gap-4">
                        <div class="md:w-1/6 flex justify-center">
                            <div :class="['w-16 h-16 rounded-full flex items-center justify-center', getCategoryColor(article.categoryId)]">
                                <i :class="[getCategoryIcon(article.categoryId), 'text-2xl']"></i>
                            </div>
                        </div>

                        <div class="md:w-5/6">
                            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                                <h3 class="text-xl font-medium">{{ article.title }}</h3>
                                <Tag :value="getCategoryName(article.categoryId)" :severity="article.categoryId === 1 ? 'danger' : article.categoryId === 2 ? 'success' : 'info'" />
                            </div>

                            <p class="text-gray-600 mb-4">{{ article.summary }}</p>

                            <div class="flex flex-wrap gap-2 mb-4">
                                <Chip v-for="tag in article.tags.slice(0, 4)" :key="tag" :label="tag" class="bg-gray-100" />
                            </div>

                            <div class="flex flex-col sm:flex-row justify-between gap-3">
                                <div class="flex items-center">
                                    <img v-if="!imageErrors[`article-${article.id}`]" :src="article.authorAvatar" :alt="article.author" class="w-8 h-8 rounded-full mr-2" @error="onImageError(`article-${article.id}`)" />
                                    <div v-else class="w-8 h-8 rounded-full mr-2 bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                        <i class="pi pi-user text-sm text-surface-500 dark:text-surface-400"></i>
                                    </div>
                                    <div>
                                        <div class="text-sm font-medium">{{ article.author }}</div>
                                        <div class="text-xs text-gray-500">{{ article.authorRole }}</div>
                                    </div>
                                </div>
                                <div class="flex items-center text-sm text-gray-500 gap-4">
                                    <span><i class="pi pi-calendar mr-1"></i>{{ formatDate(article.publishedDate) }}</span>
                                    <span><i class="pi pi-eye mr-1"></i>{{ article.views }}</span>
                                    <span><i class="pi pi-thumbs-up mr-1"></i>{{ article.helpful }}</span>
                                    <!-- Admin Actions -->
                                    <div v-if="isAdmin" class="flex gap-1" @click.stop>
                                        <Button icon="pi pi-pencil" severity="secondary" text rounded size="small" @click="openEditDialog(article)" v-tooltip.top="'Edit'" />
                                        <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="confirmDelete(article)" v-tooltip.top="'Delete'" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Article Dialog -->
        <Dialog v-model:visible="showArticleDialog" :header="currentArticle?.title" :modal="true" :closable="true" :dismissableMask="true" :style="{ width: '90vw', maxWidth: '1000px' }" :maximizable="true">
            <div v-if="currentArticle" class="article-content">
                <div class="flex justify-between items-center mb-6 pb-4 border-b">
                    <div class="flex items-center">
                        <img v-if="!imageErrors[`dialog-${currentArticle.id}`]" :src="currentArticle.authorAvatar" :alt="currentArticle.author" class="w-10 h-10 rounded-full mr-3" @error="onImageError(`dialog-${currentArticle.id}`)" />
                        <div v-else class="w-10 h-10 rounded-full mr-3 bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                            <i class="pi pi-user text-lg text-surface-500 dark:text-surface-400"></i>
                        </div>
                        <div>
                            <div class="font-medium">{{ currentArticle.author }}</div>
                            <div class="text-sm text-gray-500">{{ currentArticle.authorRole }}</div>
                        </div>
                    </div>
                    <div class="text-sm text-gray-500">
                        <span><i class="pi pi-calendar mr-1"></i>{{ formatDate(currentArticle.publishedDate) }}</span>
                    </div>
                </div>

                <!-- Use a markdown renderer here -->
                <div v-html="renderMarkdown(currentArticle.content)"></div>

                <div class="mt-8 pt-4 border-t">
                    <div class="flex justify-between items-center">
                        <div class="flex flex-wrap gap-2">
                            <Chip v-for="tag in currentArticle.tags" :key="tag" :label="tag" class="bg-gray-100" />
                        </div>
                        <div>
                            <Button label="Helpful" icon="pi pi-thumbs-up" outlined @click="markArticleHelpful(currentArticle.id)" />
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>

        <!-- Create Article Dialog (Admin only) -->
        <Dialog v-model:visible="showCreateDialog" header="Create New Article" :modal="true" :closable="true" :style="{ width: '90vw', maxWidth: '700px' }">
            <div class="flex flex-col gap-4">
                <div class="field">
                    <label for="newTitle" class="font-semibold block mb-2">Title *</label>
                    <InputText id="newTitle" v-model="newArticleForm.title" class="w-full" placeholder="Enter article title" />
                </div>
                <div class="field">
                    <label for="newSummary" class="font-semibold block mb-2">Summary</label>
                    <Textarea id="newSummary" v-model="newArticleForm.summary" rows="2" class="w-full" placeholder="Brief summary of the article" />
                </div>
                <div class="field">
                    <label for="newCategory" class="font-semibold block mb-2">Category</label>
                    <Select id="newCategory" v-model="newArticleForm.categoryId" :options="categories" optionLabel="name" optionValue="id" placeholder="Select a category" class="w-full" />
                </div>
                <div class="field">
                    <label for="newContent" class="font-semibold block mb-2">Content * (Markdown supported)</label>
                    <Textarea id="newContent" v-model="newArticleForm.content" rows="10" class="w-full" placeholder="Write your article content in Markdown..." />
                </div>
                <div class="field flex items-center gap-2">
                    <Checkbox id="newFeatured" v-model="newArticleForm.isFeatured" :binary="true" />
                    <label for="newFeatured">Mark as Featured</label>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="showCreateDialog = false" />
                <Button label="Create" icon="pi pi-check" :loading="saving" @click="createArticle" />
            </template>
        </Dialog>

        <!-- Edit Article Dialog (Admin only) -->
        <Dialog v-model:visible="showEditDialog" header="Edit Article" :modal="true" :closable="true" :style="{ width: '90vw', maxWidth: '700px' }">
            <div v-if="editingArticle" class="flex flex-col gap-4">
                <div class="field">
                    <label for="editTitle" class="font-semibold block mb-2">Title *</label>
                    <InputText id="editTitle" v-model="editingArticle.title" class="w-full" />
                </div>
                <div class="field">
                    <label for="editSummary" class="font-semibold block mb-2">Summary</label>
                    <Textarea id="editSummary" v-model="editingArticle.summary" rows="2" class="w-full" />
                </div>
                <div class="field">
                    <label for="editCategory" class="font-semibold block mb-2">Category</label>
                    <Select id="editCategory" v-model="editingArticle.categoryId" :options="categories" optionLabel="name" optionValue="id" class="w-full" />
                </div>
                <div class="field">
                    <label for="editContent" class="font-semibold block mb-2">Content * (Markdown supported)</label>
                    <Textarea id="editContent" v-model="editingArticle.content" rows="10" class="w-full" />
                </div>
                <div class="field flex items-center gap-2">
                    <Checkbox id="editFeatured" v-model="editingArticle.isFeatured" :binary="true" />
                    <label for="editFeatured">Mark as Featured</label>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="showEditDialog = false" />
                <Button label="Save Changes" icon="pi pi-check" :loading="saving" @click="updateArticle" />
            </template>
        </Dialog>

        <!-- Delete Confirmation Dialog (Admin only) -->
        <Dialog v-model:visible="showDeleteDialog" header="Confirm Delete" :modal="true" :closable="true" :style="{ width: '450px' }">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle text-4xl text-orange-500"></i>
                <div>
                    <p class="font-semibold">Are you sure you want to delete this article?</p>
                    <p class="text-gray-600 mt-2" v-if="articleToDelete">"{{ articleToDelete.title }}"</p>
                    <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="showDeleteDialog = false" />
                <Button label="Delete" icon="pi pi-trash" severity="danger" :loading="saving" @click="deleteArticle" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.article-content :deep(h1) {
    font-size: 2rem;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 1.5rem;
}

.article-content :deep(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
}

.article-content :deep(h3) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
}

.article-content :deep(p) {
    margin-bottom: 1rem;
    line-height: 1.6;
}

.article-content :deep(ul),
.article-content :deep(ol) {
    margin-bottom: 1rem;
    padding-left: 2rem;
}

.article-content :deep(li) {
    margin-bottom: 0.5rem;
}

.article-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
}

.article-content :deep(table th),
.article-content :deep(table td) {
    border: 1px solid #e2e8f0;
    padding: 0.75rem;
}

.article-content :deep(table th) {
    background-color: #f8fafc;
    font-weight: 600;
}

.article-content :deep(code) {
    font-family: monospace;
    background-color: #f1f5f9;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
}

.article-content :deep(pre) {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1.5rem;
}

.article-content :deep(pre code) {
    background-color: transparent;
    padding: 0;
    color: inherit;
    font-size: 0.875rem;
}

.article-content :deep(blockquote) {
    border-left: 4px solid #cbd5e1;
    padding-left: 1rem;
    margin-left: 0;
    margin-right: 0;
    font-style: italic;
    color: #64748b;
}

.p-progressspinner {
    width: 50px;
    height: 50px;
}
</style>
