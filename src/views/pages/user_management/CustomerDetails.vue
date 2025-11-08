<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, ref, watch } from 'vue';

const props = defineProps({
    visible: Boolean,
    employee: Object
});

const emit = defineEmits(['update:visible']);

const toast = useToast();
const activeTab = ref('0');
const performanceData = ref({});
const isLoading = ref(false);

// Method to close the drawer
const closeDrawer = () => {
    emit('update:visible', false);
};

// Watch for employee changes to load performance data
watch(
    () => props.employee,
    (newEmployee) => {
        if (newEmployee && props.visible) {
            loadPerformanceData(newEmployee.employeeId);
        }
    },
    { immediate: true }
);

// Load performance data based on employee
const loadPerformanceData = async (employeeId) => {
    if (!employeeId) return;

    isLoading.value = true;
    try {
        // Simulate API call to get performance data
        // In a real app, you would fetch this from your backend
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Generate consistent but unique data based on employee ID
        const employeeHash = employeeId.split('').reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
        }, 0);

        performanceData.value = {
            ticketsResolved: Math.abs(employeeHash % 200) + 50,
            averageResolutionTime: `${Math.abs(employeeHash % 8) + 1}h ${Math.abs(employeeHash % 59) + 1}m`,
            customerSatisfaction: (Math.abs(employeeHash % 20) / 10 + 3).toFixed(1),
            responseTime: `${Math.abs(employeeHash % 30) + 5}m`,
            ticketsResolvedThisMonth: Math.abs(employeeHash % 30) + 5,
            leaderboardPosition: Math.abs(employeeHash % 10) + 1,
            leaderboardTotal: 25,
            ticketsByCategory: [
                { category: 'Hardware', count: Math.abs(employeeHash % 50) + 10 },
                { category: 'Software', count: Math.abs(employeeHash % 50) + 10 },
                { category: 'Network', count: Math.abs(employeeHash % 30) + 5 },
                { category: 'Access', count: Math.abs(employeeHash % 20) + 5 },
                { category: 'Other', count: Math.abs(employeeHash % 15) + 5 }
            ],
            monthlyPerformance: [
                { month: 'Jan', resolved: Math.abs(employeeHash % 30) + 10, reopened: Math.abs(employeeHash % 5) },
                { month: 'Feb', resolved: Math.abs(employeeHash % 30) + 10, reopened: Math.abs(employeeHash % 5) },
                { month: 'Mar', resolved: Math.abs(employeeHash % 30) + 10, reopened: Math.abs(employeeHash % 5) },
                { month: 'Apr', resolved: Math.abs(employeeHash % 30) + 10, reopened: Math.abs(employeeHash % 5) },
                { month: 'May', resolved: Math.abs(employeeHash % 30) + 10, reopened: Math.abs(employeeHash % 5) },
                { month: 'Jun', resolved: Math.abs(employeeHash % 30) + 10, reopened: Math.abs(employeeHash % 5) }
            ],
            skills: [
                { name: 'Technical Troubleshooting', level: Math.abs(employeeHash % 30) + 70 },
                { name: 'Customer Communication', level: Math.abs(employeeHash % 30) + 70 },
                { name: 'Problem Analysis', level: Math.abs(employeeHash % 30) + 70 },
                { name: 'Documentation', level: Math.abs(employeeHash % 30) + 70 },
                { name: 'System Administration', level: Math.abs(employeeHash % 30) + 70 }
            ],
            recentActivity: [
                { action: `Resolved ticket TICK-${100000 + Math.abs(employeeHash % 1000)}`, timestamp: new Date(2025, 2, 15, 14, 32) },
                { action: `Commented on ticket TICK-${100000 + Math.abs(employeeHash % 1000)}`, timestamp: new Date(2025, 2, 15, 11, 15) },
                { action: `Assigned to ticket TICK-${100000 + Math.abs(employeeHash % 1000)}`, timestamp: new Date(2025, 2, 14, 16, 48) },
                { action: `Closed ticket TICK-${100000 + Math.abs(employeeHash % 1000)}`, timestamp: new Date(2025, 2, 14, 15, 22) },
                { action: `Updated ticket TICK-${100000 + Math.abs(employeeHash % 1000)}`, timestamp: new Date(2025, 2, 13, 9, 17) }
            ]
        };
    } catch (error) {
        console.error('Error loading performance data:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load performance data',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Computed properties
const employeeName = computed(() => {
    if (!props.employee) return '';
    return `${props.employee.firstName || ''} ${props.employee.lastName || ''}`.trim();
});

const employeeEmail = computed(() => {
    return props.employee?.email || 'No email provided';
});

const employeePhone = computed(() => {
    return props.employee?.phone || 'No phone provided';
});

const employeeDepartment = computed(() => {
    return props.employee?.departmentName || props.employee?.department || 'Not assigned';
});

const employeeRole = computed(() => {
    return props.employee?.role || 'Employee';
});

const employeeBranch = computed(() => {
    return props.employee?.branch || 'Head Office';
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
    },
    maintainAspectRatio: false
};

// Format date helper
const formatDate = (date) => {
    if (!date) return 'Not specified';
    try {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

// Format time helper
const formatTime = (date) => {
    if (!date) return '';
    try {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Invalid time';
    }
};

// Calculate employee tenure
const calculateTenure = (hireDate) => {
    if (!hireDate) return 'Not specified';

    try {
        const hire = new Date(hireDate);
        const now = new Date();
        const years = now.getFullYear() - hire.getFullYear();
        const months = now.getMonth() - hire.getMonth();

        if (months < 0) {
            return `${years - 1} years, ${months + 12} months`;
        }

        return `${years} years, ${months} months`;
    } catch {
        return 'Invalid hire date';
    }
};

// Performance rating based on position
const getPerformanceRating = computed(() => {
    const position = performanceData.value.leaderboardPosition;
    if (!position) return 'Not rated';

    if (position <= 3) return 'Top Performer';
    if (position <= 8) return 'Above Average';
    if (position <= 15) return 'Average';
    return 'Needs Improvement';
});

const getPerformanceColor = computed(() => {
    const position = performanceData.value.leaderboardPosition;
    if (!position) return 'gray';

    if (position <= 3) return 'green';
    if (position <= 8) return 'blue';
    if (position <= 15) return 'orange';
    return 'red';
});

// Action handlers
const handleEmail = () => {
    if (props.employee?.email) {
        window.location.href = `mailto:${props.employee.email}`;
    } else {
        toast.add({
            severity: 'warn',
            summary: 'No Email',
            detail: 'No email address available',
            life: 3000
        });
    }
};

const handleCall = () => {
    if (props.employee?.phone) {
        window.location.href = `tel:${props.employee.phone}`;
    } else {
        toast.add({
            severity: 'warn',
            summary: 'No Phone',
            detail: 'No phone number available',
            life: 3000
        });
    }
};
</script>

<template>
    <Drawer :visible="visible" position="right" class="!w-full md:!w-[50rem] lg:!w-[50rem]" :blockScroll="true" @update:visible="closeDrawer">
        <template #header>
            <div class="flex flex-row justify-between items-center">
                <div class="flex items-center gap-2">
                    <Badge :value="getPerformanceRating" :severity="getPerformanceColor" />
                    <span class="font-bold text-lg">{{ employee?.employeeId }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <Button icon="pi pi-envelope" text size="small" label="Email" @click="handleEmail" />
                    <Button icon="pi pi-phone" text size="small" label="Call" @click="handleCall" />
                </div>
            </div>
        </template>

        <template #default>
            <div class="flex flex-col">
                <!-- Loading State -->
                <div v-if="isLoading" class="flex justify-center items-center py-8">
                    <ProgressSpinner />
                </div>

                <!-- Employee Header -->
                <div v-else class="flex flex-col md:flex-row mb-6 gap-4">
                    <div class="w-full md:w-1/3 flex justify-center">
                        <img :src="`https://avatar.iran.liara.run/public/50?name=${encodeURIComponent(employeeName || 'Employee')}`" :alt="employeeName" class="w-40 h-40 rounded-full border-4 border-primary" />
                    </div>
                    <div class="w-full md:w-2/3">
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-4xl mb-2">{{ employeeName }}</h1>
                        <div class="flex flex-col gap-1 text-gray-600">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-briefcase text-primary"></i>
                                <span>{{ employeeRole }} - {{ employeeDepartment }}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-map-marker text-primary"></i>
                                <span>{{ employeeBranch }}</span>
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
                <Tabs v-model="activeTab">
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
                                            <div
                                                class="absolute inset-0 rounded-full border-8 border-transparent border-t-primary"
                                                :style="`transform: rotate(${(performanceData.leaderboardPosition / performanceData.leaderboardTotal) * 360 - 90}deg)`"
                                            ></div>
                                            <div class="absolute inset-0 flex items-center justify-center flex-col">
                                                <span class="text-4xl font-bold text-primary">{{ performanceData.leaderboardPosition || '—' }}</span>
                                                <span class="text-sm text-gray-500">of {{ performanceData.leaderboardTotal }}</span>
                                            </div>
                                        </div>
                                        <div class="text-center">
                                            <h3 class="text-lg font-semibold mb-1">{{ employeeName }}</h3>
                                            <p class="text-gray-500 mb-3">Currently ranks #{{ performanceData.leaderboardPosition }} in the team</p>
                                            <p
                                                class="font-semibold"
                                                :class="{
                                                    'text-green-600': performanceData.leaderboardPosition <= 3,
                                                    'text-blue-600': performanceData.leaderboardPosition > 3 && performanceData.leaderboardPosition <= 10,
                                                    'text-orange-600': performanceData.leaderboardPosition > 10
                                                }"
                                            >
                                                {{ getPerformanceRating }}
                                            </p>
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
                                                <span>{{ employeeName }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Email</span>
                                                <span>{{ employeeEmail }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Phone</span>
                                                <span>{{ employeePhone }}</span>
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
                                                <span>{{ employeeDepartment }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Branch</span>
                                                <span>{{ employeeBranch }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Role</span>
                                                <span>{{ employeeRole }}</span>
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
                                            <div class="text-lg font-semibold">{{ Math.floor((performanceData.ticketsResolved / (performanceData.ticketsResolved + 20)) * 100) || 85 }}%</div>
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

                            <!-- Recent Tickets -->
                            <Card class="shadow-md mt-6">
                                <template #title>
                                    <div class="flex items-center justify-between">
                                        <span>Recent Tickets</span>
                                        <Button label="View All" icon="pi pi-external-link" text />
                                    </div>
                                </template>
                                <template #content>
                                    <div class="space-y-4">
                                        <div v-for="(activity, index) in performanceData.recentActivity?.slice(0, 5)" :key="index" class="border-b pb-4 last:border-b-0 last:pb-0">
                                            <div class="flex justify-between">
                                                <div>
                                                    <div class="font-medium">{{ activity.action.split(' ').slice(-1)[0] }}</div>
                                                    <div class="text-sm text-gray-500">{{ activity.action.split(' ').slice(0, -1).join(' ') }}</div>
                                                </div>
                                                <Tag value="Completed" severity="success" />
                                            </div>
                                            <div class="flex justify-between mt-2 text-xs text-gray-500">
                                                <span>{{ formatDate(activity.timestamp) }}</span>
                                                <span>Completed</span>
                                            </div>
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
