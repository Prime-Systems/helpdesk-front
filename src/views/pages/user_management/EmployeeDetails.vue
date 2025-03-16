<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
    visible: Boolean,
    employee: Object
});

const emit = defineEmits(['update:visible']);

const toast = useToast();
const activeTab = ref('0');
const performanceData = ref({});

// Method to close the drawer
const closeDrawer = () => {
    emit('update:visible', false);
};

// Sample performance data - in a real app, you would fetch this from an API
onMounted(() => {
    // Simulate API call to get performance data
    setTimeout(() => {
        performanceData.value = {
            ticketsResolved: Math.floor(Math.random() * 200) + 50,
            averageResolutionTime: `${Math.floor(Math.random() * 8) + 1}h ${Math.floor(Math.random() * 59) + 1}m`,
            customerSatisfaction: (Math.random() * 2 + 3).toFixed(1),
            responseTime: `${Math.floor(Math.random() * 30) + 5}m`,
            ticketsResolvedThisMonth: Math.floor(Math.random() * 30) + 5,
            leaderboardPosition: Math.floor(Math.random() * 10) + 1,
            leaderboardTotal: 25,
            ticketsByCategory: [
                { category: 'Hardware', count: Math.floor(Math.random() * 50) + 10 },
                { category: 'Software', count: Math.floor(Math.random() * 50) + 10 },
                { category: 'Network', count: Math.floor(Math.random() * 30) + 5 },
                { category: 'Access', count: Math.floor(Math.random() * 20) + 5 },
                { category: 'Other', count: Math.floor(Math.random() * 15) + 5 }
            ],
            monthlyPerformance: [
                { month: 'Jan', resolved: Math.floor(Math.random() * 30) + 10, reopened: Math.floor(Math.random() * 5) },
                { month: 'Feb', resolved: Math.floor(Math.random() * 30) + 10, reopened: Math.floor(Math.random() * 5) },
                { month: 'Mar', resolved: Math.floor(Math.random() * 30) + 10, reopened: Math.floor(Math.random() * 5) },
                { month: 'Apr', resolved: Math.floor(Math.random() * 30) + 10, reopened: Math.floor(Math.random() * 5) },
                { month: 'May', resolved: Math.floor(Math.random() * 30) + 10, reopened: Math.floor(Math.random() * 5) },
                { month: 'Jun', resolved: Math.floor(Math.random() * 30) + 10, reopened: Math.floor(Math.random() * 5) }
            ],
            skills: [
                { name: 'Technical Troubleshooting', level: Math.floor(Math.random() * 30) + 70 },
                { name: 'Customer Communication', level: Math.floor(Math.random() * 30) + 70 },
                { name: 'Problem Analysis', level: Math.floor(Math.random() * 30) + 70 },
                { name: 'Documentation', level: Math.floor(Math.random() * 30) + 70 },
                { name: 'System Administration', level: Math.floor(Math.random() * 30) + 70 }
            ],
            recentActivity: [
                { action: 'Resolved ticket TICK-123456', timestamp: new Date(2025, 2, 15, 14, 32) },
                { action: 'Commented on ticket TICK-123457', timestamp: new Date(2025, 2, 15, 11, 15) },
                { action: 'Assigned to ticket TICK-123458', timestamp: new Date(2025, 2, 14, 16, 48) },
                { action: 'Closed ticket TICK-123459', timestamp: new Date(2025, 2, 14, 15, 22) },
                { action: 'Updated ticket TICK-123460', timestamp: new Date(2025, 2, 13, 9, 17) }
            ]
        };
    }, 500);
});

// Computed properties for charts
const ticketCategoryData = computed(() => {
    if (!performanceData.value.ticketsByCategory) return [];

    return {
        labels: performanceData.value.ticketsByCategory.map((item) => item.category),
        datasets: [
            {
                data: performanceData.value.ticketsByCategory.map((item) => item.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }
        ]
    };
});

const monthlyPerformanceData = computed(() => {
    if (!performanceData.value.monthlyPerformance) return [];

    return {
        labels: performanceData.value.monthlyPerformance.map((item) => item.month),
        datasets: [
            {
                label: 'Resolved',
                data: performanceData.value.monthlyPerformance.map((item) => item.resolved),
                fill: false,
                backgroundColor: '#42A5F5',
                borderColor: '#42A5F5',
                tension: 0.4
            },
            {
                label: 'Reopened',
                data: performanceData.value.monthlyPerformance.map((item) => item.reopened),
                fill: false,
                backgroundColor: '#FFA726',
                borderColor: '#FFA726',
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

// Calculate employee tenure
const calculateTenure = (hireDate) => {
    if (!hireDate) return '';

    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();

    if (months < 0) {
        return `${years - 1} years, ${months + 12} months`;
    }

    return `${years} years, ${months} months`;
};
</script>

<template>
    <Drawer :visible="visible" position="right" class="!w-full md:!w-[50rem] lg:!w-[50rem]" :blockScroll="true" @update:visible="closeDrawer">
        <template #header>
            <div class="flex flex-row justify-between items-center">
                <div class="flex items-center gap-2">
                    <Badge value="Active" severity="success" />
                    <span class="font-bold text-lg">{{ employee?.employeeId }}</span>
                </div>
                <div class="flex items-center">
                    <Button icon="pi pi-envelope" text size="small" label="Email" @click="toast.add({ severity: 'info', summary: 'Info', detail: 'Email action clicked', life: 3000 })" />
                    <Button icon="pi pi-phone" text size="small" label="Call" @click="toast.add({ severity: 'info', summary: 'Info', detail: 'Call action clicked', life: 3000 })" />
                </div>
            </div>
        </template>

        <template #default>
            <div class="flex flex-col">
                <!-- Employee Header -->
                <div class="flex flex-col md:flex-row mb-6 gap-4">
                    <div class="w-full md:w-1/3 flex justify-center">
                        <img :src="`https://avatar.iran.liara.run/public/50?name=${encodeURIComponent(employee?.name || '')}`" alt="employee" class="w-40 h-40 rounded-full border-4 border-primary" />
                    </div>
                    <div class="w-full md:w-2/3">
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-4xl mb-2">{{ employee?.name }}</h1>
                        <div class="flex flex-col gap-1 text-gray-600">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-briefcase text-primary"></i>
                                <span>{{ employee?.role }} - {{ employee?.department }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-map-marker text-primary"></i>
                                <span>{{ employee?.branch }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-calendar text-primary"></i>
                                <span>Hired: {{ formatDate(employee?.hireDate) }} ({{ calculateTenure(employee?.hireDate) }})</span>
                            </div>
                        </div>

                        <!-- Performance Highlights -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                            <div class="bg-primary/10 rounded-lg p-3 flex flex-col items-center justify-center">
                                <span class="text-primary text-2xl font-bold">{{ performanceData.ticketsResolved || '—' }}</span>
                                <span class="text-xs text-gray-600">Tickets Resolved</span>
                            </div>
                            <div class="bg-green-100 rounded-lg p-3 flex flex-col items-center justify-center">
                                <span class="text-green-600 text-2xl font-bold">{{ performanceData.customerSatisfaction || '—' }}/5</span>
                                <span class="text-xs text-gray-600">Customer Rating</span>
                            </div>
                            <div class="bg-blue-100 rounded-lg p-3 flex flex-col items-center justify-center">
                                <span class="text-blue-600 text-2xl font-bold">{{ performanceData.averageResolutionTime || '—' }}</span>
                                <span class="text-xs text-gray-600">Avg Resolution</span>
                            </div>
                            <div class="bg-orange-100 rounded-lg p-3 flex flex-col items-center justify-center">
                                <span class="text-orange-600 text-2xl font-bold">#{{ performanceData.leaderboardPosition || '—' }}</span>
                                <span class="text-xs text-gray-600">Leaderboard</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabs for Performance and Details -->
                <Tabs :value="activeTab">
                    <TabList>
                        <Tab value="0">Performance</Tab>
                        <Tab value="1">Details</Tab>
                        <Tab value="2">Activity</Tab>
                    </TabList>

                    <TabPanels>
                        <!-- Performance Tab -->
                        <TabPanel value="0">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <!-- Monthly Performance Chart -->
                                <Card class="shadow-md">
                                    <template #title>
                                        <div class="flex items-center justify-between">
                                            <span>Monthly Performance</span>
                                            <Dropdown placeholder="Last 6 Months" :options="['Last 6 Months', 'Last Year', 'All Time']" class="text-sm" />
                                        </div>
                                    </template>
                                    <template #content>
                                        <Chart type="line" :data="monthlyPerformanceData" :options="chartOptions" class="h-64" />
                                    </template>
                                </Card>

                                <!-- Tickets by Category Chart -->
                                <Card class="shadow-md">
                                    <template #title>
                                        <div class="flex items-center justify-between">
                                            <span>Tickets by Category</span>
                                            <Dropdown placeholder="This Year" :options="['This Year', 'Last Year', 'All Time']" class="text-sm" />
                                        </div>
                                    </template>
                                    <template #content>
                                        <Chart type="doughnut" :data="ticketCategoryData" :options="chartOptions" class="h-64" />
                                    </template>
                                </Card>
                            </div>

                            <!-- Skills Progress -->
                            <Card class="shadow-md mb-6">
                                <template #title>Skills & Competencies</template>
                                <template #content>
                                    <div class="space-y-4">
                                        <div v-for="skill in performanceData.skills" :key="skill.name" class="mb-2">
                                            <div class="flex justify-between mb-1">
                                                <span>{{ skill.name }}</span>
                                                <span>{{ skill.level }}%</span>
                                            </div>
                                            <ProgressBar :value="skill.level" :showValue="false" :class="`h-2 ${skill.level > 85 ? 'bg-green-100' : skill.level > 70 ? 'bg-blue-100' : 'bg-orange-100'}`" />
                                        </div>
                                    </div>
                                </template>
                            </Card>

                            <!-- Leaderboard Position -->
                            <Card class="shadow-md">
                                <template #title>Performance Ranking</template>
                                <template #content>
                                    <div class="flex flex-col items-center py-4">
                                        <div class="relative w-40 h-40 mb-6">
                                            <div class="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                                            <div class="absolute inset-0 rounded-full border-8 border-transparent border-t-primary" style="transform: rotate(-90deg)"></div>
                                            <div class="absolute inset-0 flex items-center justify-center flex-col">
                                                <span class="text-4xl font-bold text-primary">{{ performanceData.leaderboardPosition || '—' }}</span>
                                                <span class="text-sm text-gray-500">of {{ performanceData.leaderboardTotal }}</span>
                                            </div>
                                        </div>
                                        <div class="text-center">
                                            <h3 class="text-lg font-semibold mb-1">{{ employee?.name }}</h3>
                                            <p class="text-gray-500 mb-3">Currently ranks #{{ performanceData.leaderboardPosition }} in the team</p>
                                            <p v-if="performanceData.leaderboardPosition <= 3" class="text-green-600 font-semibold">Top performer!</p>
                                            <p v-else-if="performanceData.leaderboardPosition <= 10" class="text-blue-600 font-semibold">Above average</p>
                                            <p v-else class="text-orange-600 font-semibold">Needs improvement</p>
                                        </div>
                                    </div>
                                </template>
                            </Card>
                        </TabPanel>

                        <!-- Details Tab -->
                        <TabPanel value="1">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Personal Information -->
                                <Card class="shadow-md">
                                    <template #title>Personal Information</template>
                                    <template #content>
                                        <div class="space-y-4">
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Full Name</span>
                                                <span>{{ employee?.name }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Email</span>
                                                <span>{{ employee?.email }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Phone</span>
                                                <span>{{ employee?.phone }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Hire Date</span>
                                                <span>{{ formatDate(employee?.hireDate) }}</span>
                                            </div>
                                        </div>
                                    </template>
                                </Card>

                                <!-- Employment Details -->
                                <Card class="shadow-md">
                                    <template #title>Employment Details</template>
                                    <template #content>
                                        <div class="space-y-4">
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Employee ID</span>
                                                <span>{{ employee?.employeeId }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Department</span>
                                                <span>{{ employee?.department }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Branch</span>
                                                <span>{{ employee?.branch }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Role</span>
                                                <span>{{ employee?.role }}</span>
                                            </div>
                                        </div>
                                    </template>
                                </Card>
                            </div>

                            <!-- Performance Metrics -->
                            <Card class="shadow-md mt-6">
                                <template #title>Performance Metrics</template>
                                <template #content>
                                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Response Time</div>
                                            <div class="text-lg font-semibold">{{ performanceData.responseTime }}</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Resolution Time</div>
                                            <div class="text-lg font-semibold">{{ performanceData.averageResolutionTime }}</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Customer Rating</div>
                                            <div class="text-lg font-semibold">{{ performanceData.customerSatisfaction }} / 5</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Total Tickets</div>
                                            <div class="text-lg font-semibold">{{ performanceData.ticketsResolved }} tickets</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">This Month</div>
                                            <div class="text-lg font-semibold">{{ performanceData.ticketsResolvedThisMonth }} tickets</div>
                                        </div>
                                        <div class="border rounded-lg p-4">
                                            <div class="text-xs text-gray-500 mb-1">Efficiency</div>
                                            <div class="text-lg font-semibold">{{ Math.floor(Math.random() * 15) + 85 }}%</div>
                                        </div>
                                    </div>
                                </template>
                            </Card>

                            <!-- Direct Manager -->
                            <Card class="shadow-md mt-6">
                                <template #title>Reporting Structure</template>
                                <template #content>
                                    <div class="flex items-center gap-4 p-4">
                                        <img src="https://avatar.iran.liara.run/public/50?name=Manager" alt="Manager" class="w-16 h-16 rounded-full" />
                                        <div>
                                            <div class="font-semibold">Sarah Johnson</div>
                                            <div class="text-sm text-gray-500">Department Manager</div>
                                            <div class="flex items-center gap-2 mt-1">
                                                <Button icon="pi pi-envelope" text size="small" class="p-button-sm" />
                                                <Button icon="pi pi-phone" text size="small" class="p-button-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </Card>
                        </TabPanel>

                        <!-- Activity Tab -->
                        <TabPanel value="2">
                            <Card class="shadow-md">
                                <template #title>Recent Activity</template>
                                <template #content>
                                    <Timeline :value="performanceData.recentActivity">
                                        <template #content="slotProps">
                                            <div class="flex flex-col">
                                                <span class="text-md font-medium">{{ slotProps.item.action }}</span>
                                                <small class="text-gray-500">{{ formatDate(slotProps.item.timestamp) }} at {{ formatTime(slotProps.item.timestamp) }}</small>
                                            </div>
                                        </template>
                                    </Timeline>
                                </template>
                            </Card>

                            <!-- Tickets Handled -->
                            <Card class="shadow-md mt-6">
                                <template #title>
                                    <div class="flex items-center justify-between">
                                        <span>Recent Tickets</span>
                                        <Button label="View All" icon="pi pi-external-link" text />
                                    </div>
                                </template>
                                <template #content>
                                    <div class="space-y-4">
                                        <div v-for="i in 5" :key="i" class="border-b pb-4 last:border-b-0 last:pb-0">
                                            <div class="flex justify-between">
                                                <div>
                                                    <div class="font-medium">TICK-{{ 100000 + i }}</div>
                                                    <div class="text-sm text-gray-500">{{ ['Network issue', 'Software crash', 'Hardware failure', 'Access problem', 'Email configuration'][i - 1] }}</div>
                                                </div>
                                                <Tag :value="['Resolved', 'Closed', 'Pending', 'In Progress', 'Escalated'][i - 1]" :severity="['success', 'success', 'warn', 'info', 'danger'][i - 1]" />
                                            </div>
                                            <div class="flex justify-between mt-2 text-xs text-gray-500">
                                                <span>{{ formatDate(new Date(2025, 2, 16 - i)) }}</span>
                                                <span>Resolution time: {{ ['2h 15m', '1h 30m', '3h 45m', '4h 10m', '5h 22m'][i - 1] }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </Card>

                            <!-- Training & Certifications -->
                            <Card class="shadow-md mt-6">
                                <template #title>Training & Certifications</template>
                                <template #content>
                                    <div class="space-y-4">
                                        <div
                                            v-for="(cert, i) in ['Customer Service Excellence', 'Technical Support Fundamentals', 'Network Troubleshooting', 'Security Best Practices']"
                                            :key="i"
                                            class="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                        >
                                            <div class="flex items-center gap-3">
                                                <i class="pi pi-certificate text-primary text-xl"></i>
                                                <div>
                                                    <div class="font-medium">{{ cert }}</div>
                                                    <div class="text-xs text-gray-500">Completed {{ formatDate(new Date(2024, i, i + 10)) }}</div>
                                                </div>
                                            </div>
                                            <Badge value="Verified" severity="success" />
                                        </div>
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

<style scoped>
.p-progressbar .p-progressbar-value {
    background: var(--primary-color);
}
</style>
