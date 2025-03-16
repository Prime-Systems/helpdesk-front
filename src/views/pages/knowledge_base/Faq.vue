<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const searchQuery = ref('');
const categories = ref([
    { id: 1, name: 'Account Access', icon: 'pi pi-lock', color: 'bg-blue-100 text-blue-700' },
    { id: 2, name: 'Billing & Payments', icon: 'pi pi-credit-card', color: 'bg-green-100 text-green-700' },
    { id: 3, name: 'Product Features', icon: 'pi pi-star', color: 'bg-purple-100 text-purple-700' },
    { id: 4, name: 'Integrations', icon: 'pi pi-link', color: 'bg-yellow-100 text-yellow-700' },
    { id: 5, name: 'Troubleshooting', icon: 'pi pi-question-circle', color: 'bg-red-100 text-red-700' },
    { id: 6, name: 'Getting Started', icon: 'pi pi-flag', color: 'bg-cyan-100 text-cyan-700' }
]);

const selectedCategory = ref(null);
const popularFaqs = ref([]);
const loading = ref(true);
const accordionActiveIndex = ref(null);

const faqs = ref([
    // Account Access
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
        categoryId: 1,
        question: 'How can I change my email address?',
        answer: 'You can change your email address by going to Account Settings > Personal Information. Click "Edit" next to your email address, enter your new email address, and click "Save Changes". You will receive a verification email at your new address to confirm the change.',
        views: 1845,
        helpful: 256,
        tags: ['account', 'email', 'settings']
    },

    // Billing & Payments
    {
        id: 4,
        categoryId: 2,
        question: 'When will I be billed for my subscription?',
        answer: "Your subscription will be billed on the same date each month/year, based on your initial signup date. For example, if you signed up on the 15th of the month, you'll be billed on the 15th of each subsequent month for monthly plans. For annual plans, you'll be billed on the same date each year.",
        views: 3241,
        helpful: 298,
        tags: ['billing', 'subscription', 'payment']
    },
    {
        id: 5,
        categoryId: 2,
        question: 'How do I update my payment method?',
        answer: 'To update your payment method:<br><ol class="list-decimal pl-5 space-y-2 mb-4"><li>Go to Account Settings > Billing & Payments</li><li>Click "Manage Payment Methods"</li><li>Click "Add Payment Method" to add a new card or "Edit" to update an existing one</li><li>Enter your card details and click "Save"</li></ol>Your new payment method will be used for future charges.',
        views: 2756,
        helpful: 312,
        tags: ['billing', 'payment', 'credit card']
    },
    {
        id: 6,
        categoryId: 2,
        question: 'How do I download my invoices?',
        answer: 'You can download your invoices by navigating to Account Settings > Billing & Payments > Invoice History. Here you\'ll see a list of all your past invoices. Click the "Download" button next to any invoice to download a PDF copy. You can also click "View" to preview the invoice before downloading.',
        views: 1987,
        helpful: 254,
        tags: ['billing', 'invoice', 'payment']
    },

    // Product Features
    {
        id: 7,
        categoryId: 3,
        question: 'What are the system requirements for the desktop application?',
        answer: 'Our desktop application is compatible with:<br><ul class="list-disc pl-5 space-y-2 mb-4"><li>Windows 10 or higher (64-bit)</li><li>macOS 10.14 (Mojave) or higher</li><li>Linux: Ubuntu 18.04+, Fedora 30+, or CentOS 7+</li></ul>We recommend at least 4GB of RAM and 200MB of free disk space. An internet connection is required for initial setup and regular updates.',
        views: 2365,
        helpful: 289,
        tags: ['desktop', 'requirements', 'installation']
    },
    {
        id: 8,
        categoryId: 3,
        question: 'How do I export my data?',
        answer: 'To export your data:<br><ol class="list-decimal pl-5 space-y-2 mb-4"><li>Go to Settings > Data Management</li><li>Click "Export Data"</li><li>Select the data types you want to export (All Data, Reports, User Information, etc.)</li><li>Choose your preferred format (CSV, Excel, or JSON)</li><li>Click "Generate Export" and wait for the export to complete</li><li>Download your data when ready</li></ol>Large exports may take several minutes to generate.',
        views: 1876,
        helpful: 234,
        tags: ['data', 'export', 'reports']
    },
    {
        id: 9,
        categoryId: 3,
        question: 'What are the differences between Basic and Pro plans?',
        answer: 'The main differences between our Basic and Pro plans are:<br><ul class="list-disc pl-5 space-y-2 mb-4"><li><strong>Users:</strong> Basic supports up to 5 users; Pro allows unlimited users</li><li><strong>Storage:</strong> Basic includes 10GB storage; Pro includes 100GB</li><li><strong>Reports:</strong> Basic has essential reporting; Pro has advanced analytics</li><li><strong>API Access:</strong> Limited in Basic; Full access in Pro</li><li><strong>Support:</strong> Email support for Basic; Priority phone/email support for Pro</li><li><strong>Custom Branding:</strong> Not available in Basic; Available in Pro</li></ul>For a detailed comparison, visit our <a href="#" class="text-primary hover:underline">Pricing Page</a>.',
        views: 4123,
        helpful: 387,
        tags: ['plans', 'pricing', 'features']
    },

    // Integrations
    {
        id: 10,
        categoryId: 4,
        question: 'How do I connect to my Google account?',
        answer: 'To connect your Google account:<br><ol class="list-decimal pl-5 space-y-2 mb-4"><li>Go to Settings > Integrations</li><li>Find "Google" in the list and click "Connect"</li><li>You\'ll be redirected to Google\'s authentication page</li><li>Sign in to your Google account and grant the requested permissions</li><li>After successful authentication, you\'ll be redirected back to our platform</li></ol>Once connected, you can sync your calendar, contacts, and other Google services with our application.',
        views: 2187,
        helpful: 267,
        tags: ['integrations', 'google', 'authentication']
    },
    {
        id: 11,
        categoryId: 4,
        question: 'Which third-party integrations do you support?',
        answer: 'We support integrations with a wide range of third-party services, including:<br><ul class="list-disc pl-5 space-y-2 mb-4"><li><strong>Productivity:</strong> Google Workspace, Microsoft 365, Slack, Zoom</li><li><strong>CRM:</strong> Salesforce, HubSpot, Zoho CRM</li><li><strong>Marketing:</strong> Mailchimp, Marketo, SendGrid</li><li><strong>Payment:</strong> Stripe, PayPal, Square</li><li><strong>Developer Tools:</strong> GitHub, Jira, Trello</li></ul>Visit our <a href="#" class="text-primary hover:underline">Integrations Directory</a> for a complete list and setup instructions.',
        views: 3042,
        helpful: 321,
        tags: ['integrations', 'third-party', 'apps']
    },
    {
        id: 12,
        categoryId: 4,
        question: 'How do I use the API?',
        answer: 'To use our API:<br><ol class="list-decimal pl-5 space-y-2 mb-4"><li>Generate an API key in Settings > Developer > API Keys</li><li>Review our <a href="#" class="text-primary hover:underline">API Documentation</a> for endpoint details</li><li>Make authenticated requests using your API key in the headers</li><li>Monitor your API usage in the Developer Dashboard</li></ol>Our API follows RESTful principles and returns JSON responses. Rate limits apply based on your subscription plan.',
        views: 1854,
        helpful: 278,
        tags: ['api', 'developer', 'integration']
    },

    // Troubleshooting
    {
        id: 13,
        categoryId: 5,
        question: 'The application is running slowly. How can I improve performance?',
        answer: 'If you\'re experiencing slow performance, try these steps:<br><ol class="list-decimal pl-5 space-y-2 mb-4"><li>Clear your browser cache and cookies</li><li>Close unused browser tabs and applications</li><li>Check your internet connection speed</li><li>Disable browser extensions that might interfere</li><li>Try using a different browser</li><li>If using the desktop app, restart the application</li></ol>If the issue persists, please contact our support team with details about your device and when the slowdown occurs.',
        views: 3876,
        helpful: 412,
        tags: ['performance', 'troubleshooting', 'slow']
    },
    {
        id: 14,
        categoryId: 5,
        question: "I'm seeing error code E-1023. What does this mean?",
        answer: 'Error code E-1023 indicates a temporary connection issue between your device and our servers. This is usually caused by:<br><ul class="list-disc pl-5 space-y-2 mb-4"><li>Unstable internet connection</li><li>Network firewall blocking the connection</li><li>Temporary server maintenance</li></ul>To resolve this:<br><ol class="list-decimal pl-5 space-y-2 mb-4"><li>Check your internet connection</li><li>Wait a few minutes and try again</li><li>If using a VPN, try disconnecting it</li><li>Check our <a href="#" class="text-primary hover:underline">Status Page</a> for any ongoing issues</li></ol>If the error persists for more than 30 minutes, please contact support with your account details and when the error started occurring.',
        views: 2987,
        helpful: 347,
        tags: ['error', 'connection', 'troubleshooting']
    },
    {
        id: 15,
        categoryId: 5,
        question: "My data isn't syncing between devices. What should I do?",
        answer: 'If your data isn\'t syncing properly between devices, try these troubleshooting steps:<br><ol class="list-decimal pl-5 space-y-2 mb-4"><li>Ensure all devices are connected to the internet</li><li>Check that you\'re signed in with the same account on all devices</li><li>Force a manual sync by pulling down on the screen (mobile) or clicking the sync button (desktop)</li><li>Restart the application on each device</li><li>Check if automatic sync is enabled in Settings > Data > Sync Options</li></ol>Syncing typically takes a few seconds to complete, but large amounts of data may take longer. If the issue persists after trying these steps, please contact our support team.',
        views: 2543,
        helpful: 298,
        tags: ['sync', 'data', 'troubleshooting']
    },

    // Getting Started
    {
        id: 16,
        categoryId: 6,
        question: 'How do I create my first project?',
        answer: 'To create your first project:<br><ol class="list-decimal pl-5 space-y-2 mb-4"><li>From the dashboard, click the "+ New Project" button</li><li>Enter a name and description for your project</li><li>Select a project template or start from scratch</li><li>Choose team members to add to the project (optional)</li><li>Set a due date if applicable</li><li>Click "Create Project" to finish</li></ol>Once created, you\'ll be taken to your new project where you can add tasks, upload files, and invite more team members.',
        views: 4231,
        helpful: 456,
        tags: ['projects', 'getting started', 'tutorial']
    },
    {
        id: 17,
        categoryId: 6,
        question: 'How do I invite team members?',
        answer: 'To invite team members to your account:<br><ol class="list-decimal pl-5 space-y-2 mb-4"><li>Go to Settings > Team Members</li><li>Click "Invite Members"</li><li>Enter email addresses of people you want to invite (separate multiple emails with commas)</li><li>Select the role/permission level for the invitees</li><li>Add a personal message (optional)</li><li>Click "Send Invitations"</li></ol>Invitees will receive an email with instructions to join your team. You can manage pending invitations and resend them if needed from the Team Members page.',
        views: 3654,
        helpful: 387,
        tags: ['team', 'invitations', 'collaboration']
    },
    {
        id: 18,
        categoryId: 6,
        question: 'What training resources are available for new users?',
        answer: 'We offer several resources to help new users get started:<br><ul class="list-disc pl-5 space-y-2 mb-4"><li><strong>Interactive Tutorials:</strong> Available within the app by clicking the "?" icon</li><li><strong>Video Library:</strong> Step-by-step guides on our <a href="#" class="text-primary hover:underline">YouTube channel</a></li><li><strong>Knowledge Base:</strong> Comprehensive articles in our <a href="#" class="text-primary hover:underline">Help Center</a></li><li><strong>Webinars:</strong> Live training sessions held twice monthly (check our <a href="#" class="text-primary hover:underline">Events Page</a>)</li><li><strong>Onboarding Calls:</strong> Personalized 1:1 training sessions (Pro and Enterprise plans only)</li></ul>We also offer a <a href="#" class="text-primary hover:underline">Getting Started Guide</a> that walks you through the basic features and setup process.',
        views: 2876,
        helpful: 325,
        tags: ['training', 'resources', 'onboarding']
    }
]);

onMounted(() => {
    // Simulate loading
    setTimeout(() => {
        loading.value = false;
        // Get popular FAQs based on views
        popularFaqs.value = [...faqs.value].sort((a, b) => b.views - a.views).slice(0, 5);
    }, 800);
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
        result = result.filter((faq) => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query) || faq.tags.some((tag) => tag.includes(query)));
    }

    return result;
});

const selectCategory = (categoryId) => {
    selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId;
};

const markHelpful = (faqId) => {
    const faq = faqs.value.find((f) => f.id === faqId);
    if (faq) {
        faq.helpful += 1;
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
</script>

<template>
    <div class="card p-0">
        <!-- Hero Section -->
        <div class="bg-primary p-8 md:p-12 rounded-t-lg">
            <div class="max-w-4xl mx-auto text-center">
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-4">How can we help you?</h1>
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
                                    <i :class="[accordionActiveIndex === faq.id ? 'pi pi-chevron-up' : 'pi pi-chevron-down', 'transition-transform']"></i>
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
