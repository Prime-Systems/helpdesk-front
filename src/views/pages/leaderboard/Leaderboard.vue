<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';

const toast = useToast();
const loading = ref(true);
const activeTab = ref(0);
const timeRangeFilter = ref('month');
const departmentFilter = ref(null);
const selectedAgent = ref(null);
const showAgentDetailsDialog = ref(false);

// Time range options
const timeRanges = [
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'This Year', value: 'year' },
    { label: 'All Time', value: 'all' }
];

// Department options
const departments = ref([
    { name: 'All Departments', code: null },
    { name: 'Customer Support', code: 'cs' },
    { name: 'Technical Support', code: 'tech' },
    { name: 'Billing Support', code: 'billing' },
    { name: 'Account Management', code: 'account' }
]);

// Sample agent data
const agents = ref([]);

// Metrics for different tabs
const metrics = reactive({
    resolution: {
        title: 'Resolution Time',
        description: 'Average time to resolve tickets',
        icon: 'pi pi-clock',
        unit: 'hours',
        formatter: (value) => formatTime(value),
        sortOrder: 1, // 1 = ascending (faster is better), -1 = descending (higher is better)
        color: 'bg-blue-500'
    },
    satisfaction: {
        title: 'Customer Satisfaction',
        description: 'Average CSAT score (1-5)',
        icon: 'pi pi-star',
        unit: 'stars',
        formatter: (value) => value.toFixed(1),
        sortOrder: -1,
        color: 'bg-yellow-500'
    },
    volume: {
        title: 'Ticket Volume',
        description: 'Number of tickets resolved',
        icon: 'pi pi-ticket',
        unit: 'tickets',
        formatter: (value) => value.toString(),
        sortOrder: -1,
        color: 'bg-green-500'
    },
    firstResponse: {
        title: 'First Response Time',
        description: 'Average time to first response',
        icon: 'pi pi-reply',
        unit: 'minutes',
        formatter: (value) => formatTime(value, true),
        sortOrder: 1,
        color: 'bg-purple-500'
    }
});

// Active metric based on current tab
const activeMetric = computed(() => {
    switch (activeTab.value) {
        case 0:
            return metrics.resolution;
        case 1:
            return metrics.satisfaction;
        case 2:
            return metrics.volume;
        case 3:
            return metrics.firstResponse;
        default:
            return metrics.resolution;
    }
});

// Filtered agents based on department filter
const filteredAgents = computed(() => {
    if (!departmentFilter.value) {
        return agents.value;
    }
    return agents.value.filter((agent) => agent.department.code === departmentFilter.value);
});

// Sorted agents based on active metric
const sortedAgents = computed(() => {
    const sortFactor = activeMetric.value.sortOrder;
    return [...filteredAgents.value].sort((a, b) => {
        const metricKey = Object.keys(metrics).find((key) => metrics[key] === activeMetric.value);
        return sortFactor * (a.metrics[metricKey] - b.metrics[metricKey]);
    });
});

// Top agents (top 3)
const topAgents = computed(() => {
    return sortedAgents.value.slice(0, 3);
});

// Generate color class based on ranking
const getRankingColor = (index) => {
    switch (index) {
        case 0:
            return 'bg-yellow-500'; // Gold
        case 1:
            return 'bg-gray-400'; // Silver
        case 2:
            return 'bg-amber-600'; // Bronze
        default:
            return 'bg-gray-200';
    }
};

// Generate ranking data for charts
const rankingData = computed(() => {
    const metricKey = Object.keys(metrics).find((key) => metrics[key] === activeMetric.value);
    const labels = sortedAgents.value.slice(0, 10).map((agent) => agent.name);
    const data = sortedAgents.value.slice(0, 10).map((agent) => agent.metrics[metricKey]);

    const backgroundColors = sortedAgents.value.slice(0, 10).map((_, index) => {
        switch (index) {
            case 0:
                return '#F59E0B'; // Gold
            case 1:
                return '#9CA3AF'; // Silver
            case 2:
                return '#B45309'; // Bronze
            default:
                return '#60A5FA'; // Blue for others
        }
    });

    return {
        labels,
        datasets: [
            {
                label: activeMetric.value.title,
                data,
                backgroundColor: backgroundColors
            }
        ]
    };
});

// Bar chart options
const barChartOptions = computed(() => {
    return {
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.raw} ${activeMetric.value.unit}`;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: activeMetric.value.unit
                }
            }
        },
        maintainAspectRatio: false
    };
});

// Format time value (hours or minutes)
const formatTime = (value, isMinutes = false) => {
    if (isMinutes) {
        if (value < 60) {
            return `${value.toFixed(0)} min`;
        } else {
            const hours = Math.floor(value / 60);
            const minutes = Math.round(value % 60);
            return `${hours}h ${minutes}m`;
        }
    } else {
        if (value < 1) {
            const minutes = Math.round(value * 60);
            return `${minutes} min`;
        } else if (value < 24) {
            const hours = Math.floor(value);
            const minutes = Math.round((value - hours) * 60);
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        } else {
            const days = Math.floor(value / 24);
            const hours = Math.round(value % 24);
            return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
        }
    }
};

// Get the trend icon and color based on change value
const getTrendInfo = (change) => {
    if (change > 0) {
        return { icon: 'pi pi-arrow-up', color: 'text-green-500' };
    } else if (change < 0) {
        return { icon: 'pi pi-arrow-down', color: 'text-red-500' };
    } else {
        return { icon: 'pi pi-minus', color: 'text-gray-500' };
    }
};

// Generate random agent data (for demo)
const generateAgentData = () => {
    const departmentOptions = departments.value.filter((d) => d.code !== null);
    const names = [
        'Sarah Johnson',
        'Michael Brown',
        'Emily Davis',
        'David Wilson',
        'Jessica Taylor',
        'Daniel Martinez',
        'Lauren Anderson',
        'James Thompson',
        'Sophia Clark',
        'Matthew Rodriguez',
        'Olivia White',
        'Ethan Lewis',
        'Emma Hall',
        'Andrew Young',
        'Abigail King',
        'Benjamin Wright',
        'Ava Scott',
        'Christopher Green',
        'Mia Baker',
        'Joshua Hill'
    ];

    return names.map((name, index) => {
        const dept = departmentOptions[Math.floor(Math.random() * departmentOptions.length)];

        // Calculate metrics with some variability
        const baseResolution = 2 + Math.random() * 6; // 2-8 hours
        const baseSatisfaction = 3.5 + Math.random() * 1.5; // 3.5-5.0 stars
        const baseVolume = 20 + Math.floor(Math.random() * 80); // 20-100 tickets
        const baseFirstResponse = 10 + Math.floor(Math.random() * 50); // 10-60 minutes

        // Previous period metrics (with slight variation)
        const prevResolution = baseResolution * (0.8 + Math.random() * 0.4); // 80-120% of current
        const prevSatisfaction = baseSatisfaction * (0.8 + Math.random() * 0.4);
        const prevVolume = baseVolume * (0.8 + Math.random() * 0.4);
        const prevFirstResponse = baseFirstResponse * (0.8 + Math.random() * 0.4);

        // Calculate percentage changes
        const resolutionChange = ((prevResolution - baseResolution) / prevResolution) * 100;
        const satisfactionChange = ((baseSatisfaction - prevSatisfaction) / prevSatisfaction) * 100;
        const volumeChange = ((baseVolume - prevVolume) / prevVolume) * 100;
        const firstResponseChange = ((prevFirstResponse - baseFirstResponse) / prevFirstResponse) * 100;

        return {
            id: index + 1,
            name,
            avatar: `https://avatar.iran.liara.run/public/50?name=${encodeURIComponent(name)}`,
            department: dept,
            metrics: {
                resolution: baseResolution,
                satisfaction: baseSatisfaction,
                volume: baseVolume,
                firstResponse: baseFirstResponse
            },
            changes: {
                resolution: resolutionChange,
                satisfaction: satisfactionChange,
                volume: volumeChange,
                firstResponse: firstResponseChange
            },
            details: {
                ticketsAssigned: baseVolume + Math.floor(Math.random() * 20),
                reopenRate: Math.random() * 10,
                escalationRate: Math.random() * 15,
                responsesByHour: Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)),
                categoriesHandled: [
                    { name: 'Account Access', count: Math.floor(Math.random() * 30) },
                    { name: 'Billing Issues', count: Math.floor(Math.random() * 30) },
                    { name: 'Technical Support', count: Math.floor(Math.random() * 30) },
                    { name: 'Product Questions', count: Math.floor(Math.random() * 30) },
                    { name: 'Feature Requests', count: Math.floor(Math.random() * 30) }
                ].sort((a, b) => b.count - a.count)
            }
        };
    });
};

// Load data
onMounted(() => {
    // Simulate API call
    setTimeout(() => {
        agents.value = generateAgentData();
        loading.value = false;
    }, 1000);
});

// Show agent details
const showAgentDetails = (agent) => {
    selectedAgent.value = agent;
    showAgentDetailsDialog.value = true;
};

// Agent performance chart data
const agentPerformanceChartData = computed(() => {
    if (!selectedAgent.value) return null;

    return {
        labels: ['Resolution Time', 'Customer Satisfaction', 'Ticket Volume', 'First Response Time'],
        datasets: [
            {
                label: 'Performance',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)',
                data: [
                    // Normalize values between 0-100
                    // Lower resolution time is better (invert scale)
                    100 - (selectedAgent.value.metrics.resolution / 8) * 100,
                    // Higher satisfaction is better (5.0 = 100%)
                    (selectedAgent.value.metrics.satisfaction / 5) * 100,
                    // Higher volume is better (normalize to 0-100 scale)
                    (selectedAgent.value.metrics.volume / 100) * 100,
                    // Lower first response time is better (invert scale)
                    100 - (selectedAgent.value.metrics.firstResponse / 60) * 100
                ]
            }
        ]
    };
});

// Agent performance chart options
const radarChartOptions = {
    scales: {
        r: {
            angleLines: {
                display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
        }
    }
};

// Response distribution chart data
const responseDistributionChartData = computed(() => {
    if (!selectedAgent.value) return null;

    return {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
            {
                label: 'Responses',
                data: selectedAgent.value.details.responsesByHour,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1
            }
        ]
    };
});

// Response distribution chart options
const lineChartOptions = {
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Number of Responses'
            }
        },
        x: {
            title: {
                display: true,
                text: 'Hour of Day'
            }
        }
    },
    plugins: {
        tooltip: {
            callbacks: {
                title: function (tooltipItems) {
                    const hour = parseInt(tooltipItems[0].label);
                    return `${hour}:00 - ${hour + 1}:00`;
                }
            }
        }
    }
};

// Categories handled chart data
const categoriesChartData = computed(() => {
    if (!selectedAgent.value) return null;

    return {
        labels: selectedAgent.value.details.categoriesHandled.map((c) => c.name),
        datasets: [
            {
                data: selectedAgent.value.details.categoriesHandled.map((c) => c.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }
        ]
    };
});

// Categories handled chart options
const pieChartOptions = {
    plugins: {
        legend: {
            position: 'right'
        }
    }
};
</script>

<template>
    <div class="card">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
                <h1 class="text-3xl font-semibold mb-2">Employee Leaderboard</h1>
                <p class="text-gray-600">Recognize top performers across different metrics</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                <Dropdown v-model="timeRangeFilter" :options="timeRanges" optionLabel="label" optionValue="value" placeholder="Select Time Range" class="w-full sm:w-auto" />

                <Dropdown v-model="departmentFilter" :options="departments" optionLabel="name" optionValue="code" placeholder="Select Department" class="w-full sm:w-auto" />
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
            <ProgressSpinner />
        </div>

        <div v-else>
            <!-- Metric Selection Tabs -->
            <TabView v-model:activeIndex="activeTab" class="mb-6">
                <TabPanel v-for="(metric, key) in metrics" :key="key" :header="metric.title">
                    <div class="text-center mb-6">
                        <p class="text-gray-600">{{ metric.description }}</p>
                    </div>
                </TabPanel>
            </TabView>

            <!-- Top 3 Agents Showcase -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold mb-4">Top Performers</h2>

                <div v-if="topAgents.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
                    <i class="pi pi-users text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">No agents found for the selected filters</p>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div v-for="(agent, index) in topAgents" :key="agent.id" class="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg cursor-pointer" @click="showAgentDetails(agent)">
                        <div :class="['h-2', getRankingColor(index)]"></div>
                        <div class="p-4">
                            <div class="flex items-center mb-4">
                                <div class="relative">
                                    <img :src="agent.avatar" :alt="agent.name" class="w-16 h-16 rounded-full object-cover" />
                                    <div :class="['absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center text-white rounded-full font-bold text-sm', getRankingColor(index)]">
                                        {{ index + 1 }}
                                    </div>
                                </div>
                                <div class="ml-4">
                                    <h3 class="font-semibold text-lg">{{ agent.name }}</h3>
                                    <p class="text-sm text-gray-600">{{ agent.department.name }}</p>
                                </div>
                            </div>

                            <div class="bg-gray-50 p-3 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i :class="[activeMetric.icon, 'text-xl mr-2', activeMetric.color.replace('bg-', 'text-')]"></i>
                                        <span class="font-bold text-xl">{{ activeMetric.formatter(agent.metrics[Object.keys(metrics).find((key) => metrics[key] === activeMetric)]) }}</span>
                                    </div>

                                    <div class="flex items-center">
                                        <i
                                            :class="[
                                                getTrendInfo(agent.changes[Object.keys(metrics).find((key) => metrics[key] === activeMetric)]).icon,
                                                getTrendInfo(agent.changes[Object.keys(metrics).find((key) => metrics[key] === activeMetric)]).color,
                                                'mr-1'
                                            ]"
                                        ></i>
                                        <span :class="getTrendInfo(agent.changes[Object.keys(metrics).find((key) => metrics[key] === activeMetric)]).color">
                                            {{ Math.abs(agent.changes[Object.keys(metrics).find((key) => metrics[key] === activeMetric)]).toFixed(1) }}%
                                        </span>
                                    </div>
                                </div>
                                <div class="text-xs text-gray-500 mt-1">vs. previous {{ timeRangeFilter }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Full Rankings -->
            <div>
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">Full Rankings</h2>
                    <Button label="Export CSV" icon="pi pi-download" outlined @click="toast.add({ severity: 'info', summary: 'Info', detail: 'Export feature would be implemented here', life: 3000 })" />
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <DataTable
                            :value="sortedAgents"
                            :paginator="true"
                            :rows="10"
                            :rowsPerPageOptions="[5, 10, 25, 50]"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                            :rowHover="true"
                            stripedRows
                            responsiveLayout="scroll"
                            class="p-datatable-sm"
                        >
                            <Column field="name" header="Agent" style="min-width: 12rem">
                                <template #body="{ data, index }">
                                    <div class="flex items-center">
                                        <div :class="['w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-2', index < 3 ? getRankingColor(index) : 'bg-gray-200']">
                                            {{ index + 1 }}
                                        </div>
                                        <img :src="data.avatar" :alt="data.name" class="w-8 h-8 rounded-full mr-2" />
                                        <div>
                                            <div class="font-medium">{{ data.name }}</div>
                                            <div class="text-xs text-gray-500">{{ data.department.name }}</div>
                                        </div>
                                    </div>
                                </template>
                            </Column>

                            <Column :field="Object.keys(metrics).find((key) => metrics[key] === activeMetric)" :header="activeMetric.title" sortable style="min-width: 8rem">
                                <template #body="{ data }">
                                    <div class="font-medium">
                                        {{ activeMetric.formatter(data.metrics[Object.keys(metrics).find((key) => metrics[key] === activeMetric)]) }}
                                    </div>
                                </template>
                            </Column>

                            <Column field="change" header="Change" style="min-width: 8rem">
                                <template #body="{ data }">
                                    <div class="flex items-center">
                                        <i
                                            :class="[
                                                getTrendInfo(data.changes[Object.keys(metrics).find((key) => metrics[key] === activeMetric)]).icon,
                                                getTrendInfo(data.changes[Object.keys(metrics).find((key) => metrics[key] === activeMetric)]).color,
                                                'mr-1'
                                            ]"
                                        ></i>
                                        <span :class="getTrendInfo(data.changes[Object.keys(metrics).find((key) => metrics[key] === activeMetric)]).color">
                                            {{ Math.abs(data.changes[Object.keys(metrics).find((key) => metrics[key] === activeMetric)]).toFixed(1) }}%
                                        </span>
                                    </div>
                                </template>
                            </Column>

                            <Column header="Actions" style="width: 5rem">
                                <template #body="{ data }">
                                    <Button icon="pi pi-search" text rounded @click="showAgentDetails(data)" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>

                    <div class="bg-white rounded-lg shadow-md p-4">
                        <h3 class="text-lg font-semibold mb-3">{{ activeMetric.title }} Rankings</h3>
                        <div class="relative" style="height: 350px">
                            <Chart type="bar" :data="rankingData" :options="barChartOptions" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Agent Details Dialog -->
        <Dialog v-model:visible="showAgentDetailsDialog" :header="selectedAgent?.name" :modal="true" :style="{ width: '90vw', maxWidth: '1000px' }" :closable="true" :maximizable="true">
            <div v-if="selectedAgent" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Agent Profile -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <div class="flex flex-col items-center mb-4 text-center">
                        <img :src="selectedAgent.avatar" :alt="selectedAgent.name" class="w-24 h-24 rounded-full mb-3" />
                        <h3 class="text-xl font-semibold">{{ selectedAgent.name }}</h3>
                        <p class="text-gray-600">{{ selectedAgent.department.name }}</p>
                    </div>

                    <Divider />

                    <div class="space-y-3">
                        <div>
                            <div class="text-sm text-gray-500 mb-1">Tickets Assigned</div>
                            <div class="font-semibold">{{ selectedAgent.details.ticketsAssigned }}</div>
                        </div>

                        <div>
                            <div class="text-sm text-gray-500 mb-1">Tickets Resolved</div>
                            <div class="font-semibold">{{ selectedAgent.metrics.volume }}</div>
                        </div>

                        <div>
                            <div class="text-sm text-gray-500 mb-1">Resolution Rate</div>
                            <div class="font-semibold">{{ ((selectedAgent.metrics.volume / selectedAgent.details.ticketsAssigned) * 100).toFixed(1) }}%</div>
                        </div>

                        <div>
                            <div class="text-sm text-gray-500 mb-1">Average Resolution Time</div>
                            <div class="font-semibold">{{ formatTime(selectedAgent.metrics.resolution) }}</div>
                        </div>

                        <div>
                            <div class="text-sm text-gray-500 mb-1">First Response Time</div>
                            <div class="font-semibold">{{ formatTime(selectedAgent.metrics.firstResponse, true) }}</div>
                        </div>

                        <div>
                            <div class="text-sm text-gray-500 mb-1">Customer Satisfaction</div>
                            <div class="flex items-center">
                                <Rating :modelValue="selectedAgent.metrics.satisfaction" :readonly="true" :stars="5" :cancel="false" />
                                <span class="ml-2">{{ selectedAgent.metrics.satisfaction.toFixed(1) }}</span>
                            </div>
                        </div>

                        <div>
                            <div class="text-sm text-gray-500 mb-1">Reopen Rate</div>
                            <div class="font-semibold">{{ selectedAgent.details.reopenRate.toFixed(1) }}%</div>
                        </div>

                        <div>
                            <div class="text-sm text-gray-500 mb-1">Escalation Rate</div>
                            <div class="font-semibold">{{ selectedAgent.details.escalationRate.toFixed(1) }}%</div>
                        </div>
                    </div>
                </div>

                <!-- Performance Radar Chart -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-lg font-semibold mb-3">Performance Overview</h3>
                    <div style="height: 300px">
                        <Chart type="radar" :data="agentPerformanceChartData" :options="radarChartOptions" />
                    </div>
                    <div class="mt-4 text-sm text-gray-500 text-center">
                        <p>Radar chart showing performance across all key metrics</p>
                        <p class="mt-2 italic">Higher values indicate better performance</p>
                    </div>
                </div>

                <!-- Categories Handled -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-lg font-semibold mb-3">Categories Handled</h3>
                    <div style="height: 300px">
                        <Chart type="pie" :data="categoriesChartData" :options="pieChartOptions" />
                    </div>
                </div>

                <!-- Response Time Distribution -->
                <div class="md:col-span-3 bg-white rounded-lg shadow-sm p-4">
                    <h3 class="text-lg font-semibold mb-3">Response Distribution by Hour</h3>
                    <div style="height: 300px">
                        <Chart type="line" :data="responseDistributionChartData" :options="lineChartOptions" />
                    </div>
                    <div class="mt-2 text-sm text-gray-500 text-center">Number of ticket responses by hour of day (24-hour format)</div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.p-tabview-nav li .p-tabview-nav-link {
    padding: 1rem 1.5rem;
}

:deep(.p-datatable-wrapper) {
    overflow-x: auto;
}

:deep(.p-dialog-content) {
    padding-bottom: 2rem;
}

:deep(.p-dialog-maximized) {
    top: 1rem;
    left: 1rem;
    width: calc(100% - 2rem) !important;
    height: calc(100% - 2rem) !important;
}
</style>
