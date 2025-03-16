<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
    visible: Boolean,
    customer: Object
});

const emit = defineEmits(['update:visible']);

const toast = useToast();
const activeTab = ref('0');
const customerData = ref({});

// Method to close the drawer
const closeDrawer = () => {
    emit('update:visible', false);
};

// Sample customer data - in a real app, you would fetch this from an API
onMounted(() => {
    // Simulate API call to get customer data
    setTimeout(() => {
        customerData.value = {
            // Purchase history
            totalSpent: Math.floor(Math.random() * 50000) + 10000,
            orders: Math.floor(Math.random() * 30) + 5,
            avgOrderValue: Math.floor(Math.random() * 1000) + 500,
            lastPurchaseDate: new Date(2025, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1),

            // Customer support metrics
            ticketsOpened: Math.floor(Math.random() * 20) + 1,
            ticketsClosed: Math.floor(Math.random() * 15) + 1,
            avgResponseTime: `${Math.floor(Math.random() * 4) + 1}h ${Math.floor(Math.random() * 59) + 1}m`,
            customerSatisfaction: (Math.random() * 2 + 3).toFixed(1),

            // Account activity
            lastLoginDate: new Date(2025, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1),
            registrationDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),

            // Purchases by category
            purchasesByCategory: [
                { category: 'Software Licenses', amount: Math.floor(Math.random() * 5000) + 2000 },
                { category: 'Support & Maintenance', amount: Math.floor(Math.random() * 3000) + 1000 },
                { category: 'Professional Services', amount: Math.floor(Math.random() * 5000) + 3000 },
                { category: 'Training', amount: Math.floor(Math.random() * 2000) + 500 },
                { category: 'Hardware', amount: Math.floor(Math.random() * 4000) + 1000 }
            ],

            // Monthly spending
            monthlySpending: [
                { month: 'Jan', amount: Math.floor(Math.random() * 2000) + 500 },
                { month: 'Feb', amount: Math.floor(Math.random() * 2000) + 500 },
                { month: 'Mar', amount: Math.floor(Math.random() * 2000) + 500 },
                { month: 'Apr', amount: Math.floor(Math.random() * 2000) + 500 },
                { month: 'May', amount: Math.floor(Math.random() * 2000) + 500 },
                { month: 'Jun', amount: Math.floor(Math.random() * 2000) + 500 }
            ],

            // Recent activities
            recentActivity: [
                { action: 'Purchased Enterprise License', timestamp: new Date(2025, 2, 15, 14, 32), amount: '$3,599.00' },
                { action: 'Opened support ticket #45892', timestamp: new Date(2025, 2, 10, 11, 15) },
                { action: 'Renewed Annual Support', timestamp: new Date(2025, 1, 25, 16, 48), amount: '$1,299.00' },
                { action: 'Downloaded invoice #INV-2025-0123', timestamp: new Date(2025, 1, 25, 15, 22) },
                { action: 'Attended product training webinar', timestamp: new Date(2025, 1, 18, 9, 17) }
            ],

            // Product usage data
            productUsage: [
                { product: 'Core Platform', users: Math.floor(Math.random() * 100) + 50, lastUsed: new Date(2025, 2, 15) },
                { product: 'Analytics Module', users: Math.floor(Math.random() * 50) + 20, lastUsed: new Date(2025, 2, 14) },
                { product: 'Integration API', users: Math.floor(Math.random() * 30) + 10, lastUsed: new Date(2025, 2, 10) },
                { product: 'Mobile App', users: Math.floor(Math.random() * 80) + 30, lastUsed: new Date(2025, 2, 15) }
            ],

            // Contact history
            contactHistory: [
                { type: 'Email', date: new Date(2025, 2, 14), subject: 'License Renewal', response: 'Responded same day', agent: 'Sarah Smith' },
                { type: 'Phone', date: new Date(2025, 2, 2), subject: 'Technical Issue', response: 'Resolved on call', agent: 'Mike Johnson' },
                { type: 'Support Ticket', date: new Date(2025, 1, 20), subject: 'API Integration', response: 'Resolved in 2 days', agent: 'David Lee' },
                { type: 'Webinar', date: new Date(2025, 1, 18), subject: 'Product Training', response: 'Attended', agent: 'Lisa Chen' }
            ],

            // Contract info
            contractInfo: {
                type: 'Enterprise License',
                startDate: new Date(2024, 5, 15),
                endDate: new Date(2025, 5, 14),
                value: Math.floor(Math.random() * 50000) + 20000,
                status: 'Active',
                renewalStatus: 'Auto-renewal enabled'
            }
        };
    }, 500);
});

// Computed properties for charts
const purchasesByCategoryData = computed(() => {
    if (!customerData.value.purchasesByCategory) return [];

    return {
        labels: customerData.value.purchasesByCategory.map((item) => item.category),
        datasets: [
            {
                data: customerData.value.purchasesByCategory.map((item) => item.amount),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }
        ]
    };
});

const monthlySpendingData = computed(() => {
    if (!customerData.value.monthlySpending) return [];

    return {
        labels: customerData.value.monthlySpending.map((item) => item.month),
        datasets: [
            {
                label: 'Monthly Spending',
                data: customerData.value.monthlySpending.map((item) => item.amount),
                fill: false,
                backgroundColor: '#42A5F5',
                borderColor: '#42A5F5',
                tension: 0.4
            }
        ]
    };
});

const chartOptions = {
    plugins: {
        legend: {
            position: 'bottom'
        }
    }
};

// Format currency helper
const formatCurrency = (value) => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

// Format date helper
const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// Format time helper
const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Calculate customer tenure
const calculateTenure = (registrationDate) => {
    if (!registrationDate) return '';

    const registration = new Date(registrationDate);
    const now = new Date();
    const years = now.getFullYear() - registration.getFullYear();
    const months = now.getMonth() - registration.getMonth();

    if (months < 0) {
        return `${years - 1} years, ${months + 12} months`;
    }

    return `${years} years, ${months} months`;
};

// Calculate customer lifetime value trend
const customerValueTrend = computed(() => {
    const totalSpent = customerData.value.totalSpent || 0;
    const tenure = calculateTenureMonths(customerData.value.registrationDate);

    if (tenure <= 0) return { value: 0, trend: 'neutral' };

    const monthlyValue = totalSpent / tenure;

    // Calculate trend based on monthly value
    let trend = 'neutral';
    if (monthlyValue > 1000) trend = 'increasing';
    if (monthlyValue > 2000) trend = 'strong';
    if (monthlyValue < 500) trend = 'decreasing';

    return { value: monthlyValue, trend };
});

const calculateTenureMonths = (registrationDate) => {
    if (!registrationDate) return 0;

    const registration = new Date(registrationDate);
    const now = new Date();
    const years = now.getFullYear() - registration.getFullYear();
    const months = now.getMonth() - registration.getMonth();

    return years * 12 + months;
};

function isRecent(date) {
    if (!date) return false;
    const lastUsed = new Date(date);
    const now = new Date();
    const diffTime = now - lastUsed;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30; // Consider active if used in the last 30 days
}

function getContactIcon(type) {
    switch (type) {
        case 'Email':
            return 'pi pi-envelope';
        case 'Phone':
            return 'pi pi-phone';
        case 'Support Ticket':
            return 'pi pi-ticket';
        case 'Webinar':
            return 'pi pi-video';
        default:
            return 'pi pi-comment';
    }
}

function getResponseSeverity(response) {
    if (response.includes('same day') || response.includes('Resolved') || response.includes('Attended')) {
        return 'success';
    } else if (response.includes('2 days')) {
        return 'info';
    } else {
        return 'warn';
    }
}
</script>

<template>
    <Drawer :visible="visible" position="right" class="!w-full md:!w-[50rem] lg:!w-[50rem]" :blockScroll="true" @update:visible="closeDrawer">
        <template #header>
            <div class="flex flex-row justify-between items-center">
                <div class="flex items-center gap-2">
                    <Badge :value="customerData.contractInfo?.status || 'Active'" severity="success" />
                    <span class="font-bold text-lg">{{ customer?.customerId }}</span>
                </div>
                <div class="flex items-center">
                    <Button icon="pi pi-envelope" text size="small" label="Email" @click="toast.add({ severity: 'info', summary: 'Info', detail: 'Email action clicked', life: 3000 })" />
                    <Button icon="pi pi-phone" text size="small" label="Call" @click="toast.add({ severity: 'info', summary: 'Info', detail: 'Call action clicked', life: 3000 })" />
                </div>
            </div>
        </template>

        <template #default>
            <div class="flex flex-col">
                <!-- Customer Header -->
                <div class="flex flex-col md:flex-row mb-6 gap-4">
                    <div class="w-full md:w-1/3 flex justify-center">
                        <img :src="`https://avatar.iran.liara.run/public/50?name=${encodeURIComponent(customer?.name || '')}`" alt="customer" class="w-40 h-40 rounded-full border-4 border-primary" />
                    </div>
                    <div class="w-full md:w-2/3">
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-4xl mb-2">{{ customer?.name }}</h1>
                        <div class="flex flex-col gap-1 text-gray-600">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-briefcase text-primary"></i>
                                <span>{{ customer?.jobTitle }} at {{ customer?.companyName }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-at text-primary"></i>
                                <span>{{ customer?.email }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-calendar text-primary"></i>
                                <span>Customer since: {{ formatDate(customerData.registrationDate) }} ({{ calculateTenure(customerData.registrationDate) }})</span>
                            </div>
                        </div>

                        <!-- Customer Highlights -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                            <div class="bg-primary/10 rounded-lg p-3 flex flex-col items-center justify-center">
                                <span class="text-primary text-2xl font-bold">{{ formatCurrency(customerData.totalSpent) }}</span>
                                <span class="text-xs text-gray-600">Total Spend</span>
                            </div>
                            <div class="bg-green-100 rounded-lg p-3 flex flex-col items-center justify-center">
                                <span class="text-green-600 text-2xl font-bold">{{ customerData.orders || '—' }}</span>
                                <span class="text-xs text-gray-600">Total Orders</span>
                            </div>
                            <div class="bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                                <span class="text-blue-600 text-2xl font-bold">{{ customerData.customerSatisfaction || '—' }}/5</span>
                                <span class="text-xs text-gray-600">CSAT Score</span>
                            </div>
                            <div class="bg-orange-100 rounded-lg p-3 flex flex-col items-center justify-center">
                                <span class="text-orange-600 text-2xl font-bold">{{ formatCurrency(customerData.avgOrderValue) }}</span>
                                <span class="text-xs text-gray-600">Avg Order</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs for Account, Purchases and Support -->
                <Tabs v-model:activeIndex="activeTab">
                    <TabList>
                        <Tab value="0">Overview</Tab>
                        <Tab value="1">Purchases</Tab>
                        <Tab value="2">Support</Tab>
                    </TabList>

                    <TabPanels>
                        <!-- Overview Tab -->
                        <TabPanel value="0">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <!-- Contract Information -->
                                <Card class="shadow-md">
                                    <template #title>Contract Information</template>
                                    <template #content>
                                        <div class="space-y-4">
                                            <div class="flex items-center justify-between">
                                                <span class="text-gray-500">Contract Type</span>
                                                <span class="font-medium">{{ customerData.contractInfo?.type }}</span>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <span class="text-gray-500">Start Date</span>
                                                <span>{{ formatDate(customerData.contractInfo?.startDate) }}</span>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <span class="text-gray-500">End Date</span>
                                                <span>{{ formatDate(customerData.contractInfo?.endDate) }}</span>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <span class="text-gray-500">Contract Value</span>
                                                <span class="font-medium">{{ formatCurrency(customerData.contractInfo?.value) }}</span>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <span class="text-gray-500">Renewal Status</span>
                                                <Tag :value="customerData.contractInfo?.renewalStatus" severity="success" />
                                            </div>
                                        </div>
                                    </template>
                                </Card>

                                <!-- Customer Value Analysis -->
                                <Card class="shadow-md">
                                    <template #title>Customer Value Analysis</template>
                                    <template #content>
                                        <div class="flex flex-col items-center py-4">
                                            <div class="relative w-40 h-40 mb-6">
                                                <div class="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                                                <div class="absolute inset-0 rounded-full border-8 border-transparent border-t-primary" style="transform: rotate(-90deg)"></div>
                                                <div class="absolute inset-0 flex items-center justify-center flex-col">
                                                    <span class="text-4xl font-bold text-primary">{{ formatCurrency(customerValueTrend.value) }}</span>
                                                    <span class="text-sm text-gray-500">per month</span>
                                                </div>
                                            </div>
                                            <div class="text-center">
                                                <h3 class="text-lg font-semibold mb-1">Lifetime Value</h3>
                                                <p class="text-gray-500 mb-3">Based on {{ calculateTenure(customerData.registrationDate) }} history</p>
                                                <p v-if="customerValueTrend.trend === 'strong'" class="text-green-600 font-semibold">High-value customer!</p>
                                                <p v-else-if="customerValueTrend.trend === 'increasing'" class="text-blue-600 font-semibold">Growing relationship</p>
                                                <p v-else-if="customerValueTrend.trend === 'decreasing'" class="text-orange-600 font-semibold">Needs attention</p>
                                                <p v-else class="text-gray-600 font-semibold">Stable customer</p>
                                            </div>
                                        </div>
                                    </template>
                                </Card>
                            </div>

                            <!-- Products Used -->
                            <Card class="shadow-md mb-6">
                                <template #title>Products & Services</template>
                                <template #content>
                                    <div class="overflow-x-auto">
                                        <table class="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th class="py-3 text-left text-sm font-medium text-gray-500">Product</th>
                                                    <th class="py-3 text-left text-sm font-medium text-gray-500">Users</th>
                                                    <th class="py-3 text-left text-sm font-medium text-gray-500">Last Used</th>
                                                    <th class="py-3 text-left text-sm font-medium text-gray-500">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-gray-200">
                                                <tr v-for="(product, i) in customerData.productUsage" :key="i" class="hover:bg-gray-50">
                                                    <td class="py-3 text-sm">{{ product.product }}</td>
                                                    <td class="py-3 text-sm">{{ product.users }}</td>
                                                    <td class="py-3 text-sm">{{ formatDate(product.lastUsed) }}</td>
                                                    <td class="py-3 text-sm">
                                                        <Tag :value="isRecent(product.lastUsed) ? 'Active' : 'Inactive'" :severity="isRecent(product.lastUsed) ? 'success' : 'warning'" />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </template>
                            </Card>

                            <!-- Recent Activity -->
                            <Card class="shadow-md">
                                <template #title>Recent Activity</template>
                                <template #content>
                                    <Timeline :value="customerData.recentActivity">
                                        <template #content="slotProps">
                                            <div class="flex flex-col">
                                                <div class="flex justify-between">
                                                    <span class="text-md font-medium">{{ slotProps.item.action }}</span>
                                                    <span v-if="slotProps.item.amount" class="font-bold">{{ slotProps.item.amount }}</span>
                                                </div>
                                                <small class="text-gray-500">{{ formatDate(slotProps.item.timestamp) }} at {{ formatTime(slotProps.item.timestamp) }}</small>
                                            </div>
                                        </template>
                                    </Timeline>
                                </template>
                            </Card>
                        </TabPanel>

                        <!-- Purchases Tab -->
                        <TabPanel value="1">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <!-- Purchases by Category Chart -->
                                <Card class="shadow-md">
                                    <template #title>
                                        <div class="flex items-center justify-between">
                                            <span>Purchases by Category</span>
                                            <Dropdown placeholder="This Year" :options="['This Year', 'Last Year', 'All Time']" class="text-sm" />
                                        </div>
                                    </template>
                                    <template #content>
                                        <Chart type="pie" :data="purchasesByCategoryData" :options="chartOptions" class="h-64" />
                                    </template>
                                </Card>

                                <!-- Monthly Spending Chart -->
                                <Card class="shadow-md">
                                    <template #title>
                                        <div class="flex items-center justify-between">
                                            <span>Monthly Spending</span>
                                            <Dropdown placeholder="Last 6 Months" :options="['Last 6 Months', 'Last Year', 'All Time']" class="text-sm" />
                                        </div>
                                    </template>
                                    <template #content>
                                        <Chart type="bar" :data="monthlySpendingData" :options="chartOptions" class="h-64" />
                                    </template>
                                </Card>
                            </div>

                            <!-- Purchase Summary -->
                            <Card class="shadow-md mb-6">
                                <template #title>Purchase Summary</template>
                                <template #content>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Total Spend</div>
                                            <div class="text-lg font-semibold">{{ formatCurrency(customerData.totalSpent) }}</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Orders</div>
                                            <div class="text-lg font-semibold">{{ customerData.orders }} orders</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Avg. Order Value</div>
                                            <div class="text-lg font-semibold">{{ formatCurrency(customerData.avgOrderValue) }}</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Last Purchase</div>
                                            <div class="text-lg font-semibold">{{ formatDate(customerData.lastPurchaseDate) }}</div>
                                        </div>
                                    </div>
                                </template>
                            </Card>

                            <!-- Recent Orders -->
                            <Card class="shadow-md">
                                <template #title>
                                    <div class="flex items-center justify-between">
                                        <span>Recent Orders</span>
                                        <Button label="View All" icon="pi pi-external-link" text />
                                    </div>
                                </template>
                                <template #content>
                                    <div class="space-y-4">
                                        <div v-for="i in 5" :key="i" class="border-b pb-4 last:border-b-0 last:pb-0">
                                            <div class="flex justify-between">
                                                <div>
                                                    <div class="font-medium">Order #{{ 10000 + i }}</div>
                                                    <div class="text-sm text-gray-500">{{ ['Enterprise License', 'Support Renewal', 'Professional Services', 'Custom Development', 'Training Package'][i - 1] }}</div>
                                                </div>
                                                <div class="text-right">
                                                    <div class="font-medium">{{ formatCurrency(Math.floor(Math.random() * 4000) + 1000) }}</div>
                                                    <Tag :value="['Delivered', 'Processing', 'Completed', 'Pending', 'Shipped'][i - 1]" :severity="['success', 'info', 'success', 'warn', 'info'][i - 1]" />
                                                </div>
                                            </div>
                                            <div class="flex justify-between mt-2 text-xs text-gray-500">
                                                <span>{{ formatDate(new Date(2025, 2, 16 - i)) }}</span>
                                                <span>Invoice: INV-2025-{{ 10000 + i }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </Card>
                        </TabPanel>

                        <!-- Support Tab -->
                        <TabPanel value="2">
                            <!-- Support metrics -->
                            <Card class="shadow-md mb-6">
                                <template #title>Support Statistics</template>
                                <template #content>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Open Tickets</div>
                                            <div class="text-lg font-semibold">{{ customerData.ticketsOpened - customerData.ticketsClosed }} ticket(s)</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Total Tickets</div>
                                            <div class="text-lg font-semibold">{{ customerData.ticketsOpened }} tickets</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Avg Response Time</div>
                                            <div class="text-lg font-semibold">{{ customerData.avgResponseTime }}</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Satisfaction</div>
                                            <div class="text-lg font-semibold">{{ customerData.customerSatisfaction }}/5</div>
                                        </div>
                                    </div>
                                </template>
                            </Card>

                            <!-- Contact History -->
                            <Card class="shadow-md mb-6">
                                <template #title>Contact History</template>
                                <template #content>
                                    <div class="space-y-4">
                                        <div v-for="(contact, i) in customerData.contactHistory" :key="i" class="border-b pb-4 last:border-b-0 last:pb-0">
                                            <div class="flex justify-between">
                                                <div>
                                                    <div class="font-medium">{{ contact.subject }}</div>
                                                    <div class="text-sm text-gray-500">
                                                        <i :class="getContactIcon(contact.type)" class="mr-1"></i>
                                                        {{ contact.type }}
                                                    </div>
                                                </div>
                                                <div class="text-right">
                                                    <div class="font-medium">{{ formatDate(contact.date) }}</div>
                                                    <Tag :value="contact.response" :severity="getResponseSeverity(contact.response)" />
                                                </div>
                                            </div>
                                            <div class="flex justify-between mt-2 text-xs text-gray-500">
                                                <span>Handled by: {{ contact.agent }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </Card>

                            <!-- Open Tickets -->
                            <Card class="shadow-md">
                                <template #title>
                                    <div class="flex items-center justify-between">
                                        <span>Open Support Tickets</span>
                                        <Button label="Create Ticket" icon="pi pi-plus" size="small" severity="secondary" class="p-button-sm" />
                                    </div>
                                </template>
                                <template #content>
                                    <div v-if="customerData.ticketsOpened > customerData.ticketsClosed" class="space-y-4">
                                        <div v-for="i in Math.min(3, customerData.ticketsOpened - customerData.ticketsClosed)" :key="i" class="border rounded-lg p-4 hover:bg-gray-50">
                                            <div class="flex justify-between">
                                                <div>
                                                    <div class="font-medium">Ticket #{{ 45000 + i }}</div>
                                                    <div class="text-sm text-gray-500">{{ ['API Integration Issue', 'Account Access Problem', 'Feature Request'][i - 1] }}</div>
                                                </div>
                                                <Tag :value="['In Progress', 'New', 'Under Review'][i - 1]" :severity="['info', 'danger', 'warn'][i - 1]" />
                                            </div>
                                            <div class="mt-2 text-sm">
                                                <div class="text-gray-600 mb-2">{{ ['Having trouble connecting to the REST API endpoint', 'Unable to reset password for admin account', 'Would like to request custom reporting feature'][i - 1] }}</div>
                                                <div class="flex justify-between text-xs text-gray-500">
                                                    <span>Opened: {{ formatDate(new Date(2025, 2, 10 - i)) }}</span>
                                                    <span>Priority: {{ ['Medium', 'High', 'Low'][i - 1] }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="p-4 text-center text-gray-500">
                                        <i class="pi pi-check-circle text-green-500 text-4xl mb-2"></i>
                                        <p>No open support tickets</p>
                                    </div>
                                </template>
                            </Card>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        </template>
    </Drawer>
</template>
