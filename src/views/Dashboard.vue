<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { getPrimary, getSurface, isDarkTheme } = useLayout();

const loading = ref(true);
const timeRangeFilter = ref('week');
const comparisonPeriod = ref('previous_period');

// Demo data
const ticketStats = ref({
    open: { count: 152, change: 24, trend: 'up' },
    inProgress: { count: 20, change: 52, trend: 'up' },
    resolved: { count: 50, change: 20, trend: 'up' },
    closed: { count: 152, change: 10, trend: 'up' }
});

const responseTimeData = ref({
    average: '3h 27m',
    target: '4h 00m',
    trend: 'down',
    change: 15
});

const satisfactionData = ref({
    score: 4.7,
    responses: 283,
    trend: 'up',
    change: 5
});

const topPerformers = ref([
    { id: 1, name: 'Sarah Johnson', avatar: 'https://avatar.iran.liara.run/public/50?name=Sarah Johnson', department: 'Technical Support', resolvedCount: 48, satisfactionScore: 4.9 },
    { id: 2, name: 'Michael Chen', avatar: 'https://avatar.iran.liara.run/public/50?name=Michael Chen', department: 'Customer Support', resolvedCount: 42, satisfactionScore: 4.8 },
    { id: 3, name: 'Emily Rodriguez', avatar: 'https://avatar.iran.liara.run/public/50?name=Emily Rodriguez', department: 'Billing Support', resolvedCount: 39, satisfactionScore: 4.7 }
]);

const recentActivity = ref([
    { id: 'ACT-001', type: 'ticket_created', user: 'John Smith', ticket: 'TICK-1234', time: new Date(new Date().getTime() - 25 * 60000), description: 'Created new ticket: "Cannot access my account"' },
    { id: 'ACT-002', type: 'ticket_assigned', user: 'Sarah Johnson', ticket: 'TICK-1234', time: new Date(new Date().getTime() - 20 * 60000), description: 'Assigned to Technical Support' },
    { id: 'ACT-003', type: 'ticket_updated', user: 'Sarah Johnson', ticket: 'TICK-1234', time: new Date(new Date().getTime() - 15 * 60000), description: 'Added comment: "Looking into this issue now"' },
    { id: 'ACT-004', type: 'ticket_resolved', user: 'Sarah Johnson', ticket: 'TICK-1230', time: new Date(new Date().getTime() - 10 * 60000), description: 'Marked as resolved: "Password reset completed"' },
    { id: 'ACT-005', type: 'ticket_closed', user: 'David Wilson', ticket: 'TICK-1228', time: new Date(new Date().getTime() - 5 * 60000), description: 'Closed ticket: "Issue confirmed as resolved"' }
]);

// Time range options
const timeRangeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' }
];

// Comparison period options
const comparisonOptions = [
    { label: 'Previous Period', value: 'previous_period' },
    { label: 'Same Period Last Year', value: 'last_year' }
];

// Chart data
const statusData = ref(null);
const statusOptions = ref(null);
const priorityData = ref(null);
const priorityOptions = ref(null);
const trendChartData = ref(null);
const trendChartOptions = ref(null);
const responseTimeChartData = ref(null);
const responseTimeChartOptions = ref(null);

// Computed statistics
const totalTickets = computed(() => {
    return ticketStats.value.open.count + ticketStats.value.inProgress.count + ticketStats.value.resolved.count + ticketStats.value.closed.count;
});

const resolutionRate = computed(() => {
    return (((ticketStats.value.resolved.count + ticketStats.value.closed.count) / totalTickets.value) * 100).toFixed(1);
});

const avgHandlingTimeFormatted = computed(() => {
    // Example conversion from 3h 27m to minutes for calculations
    const timeParts = responseTimeData.value.average.split(' ');
    const hours = parseInt(timeParts[0].replace('h', ''));
    const minutes = parseInt(timeParts[1].replace('m', ''));
    return hours * 60 + minutes;
});

const onTrackStatus = computed(() => {
    const targetParts = responseTimeData.value.target.split(' ');
    const targetHours = parseInt(targetParts[0].replace('h', ''));
    const targetMinutes = parseInt(targetParts[1].replace('m', ''));
    const targetInMinutes = targetHours * 60 + targetMinutes;

    return avgHandlingTimeFormatted.value <= targetInMinutes;
});

// Initialize dashboard data
onMounted(() => {
    // Simulate loading
    setTimeout(() => {
        initCharts();
        loading.value = false;
    }, 1000);
});

// Initialize chart data
function initCharts() {
    setStatusChart();
    setPriorityChart();
    setTrendChart();
    setResponseTimeChart();
}

// Status distribution chart
function setStatusChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    statusData.value = {
        labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
        datasets: [
            {
                data: [ticketStats.value.open.count, ticketStats.value.inProgress.count, ticketStats.value.resolved.count, ticketStats.value.closed.count],
                backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--orange-500'), documentStyle.getPropertyValue('--green-500'), documentStyle.getPropertyValue('--purple-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--orange-400'), documentStyle.getPropertyValue('--green-400'), documentStyle.getPropertyValue('--purple-400')]
            }
        ]
    };

    statusOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor,
                    font: {
                        weight: 'medium'
                    }
                },
                position: 'bottom'
            }
        },
        cutout: '40%'
    };
}

// Priority distribution chart
function setPriorityChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    priorityData.value = {
        labels: ['Low', 'Medium', 'High', 'Urgent'],
        datasets: [
            {
                data: [25, 38, 32, 5],
                backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500'), documentStyle.getPropertyValue('--orange-500'), documentStyle.getPropertyValue('--red-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--yellow-400'), documentStyle.getPropertyValue('--orange-400'), documentStyle.getPropertyValue('--red-400')]
            }
        ]
    };

    priorityOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor,
                    font: {
                        weight: 'medium'
                    }
                },
                position: 'bottom'
            }
        },
        cutout: '60%'
    };
}

// Ticket volume trend chart
function setTrendChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    trendChartData.value = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
            {
                label: 'Created',
                backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                data: [28, 32, 35, 27, 33, 12, 15],
                fill: false,
                tension: 0.4
            },
            {
                label: 'Resolved',
                backgroundColor: documentStyle.getPropertyValue('--green-500'),
                borderColor: documentStyle.getPropertyValue('--green-500'),
                data: [25, 29, 30, 25, 32, 15, 13],
                fill: false,
                tension: 0.4
            }
        ]
    };

    trendChartOptions.value = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}

// Response time by category chart
function setResponseTimeChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    responseTimeChartData.value = {
        labels: ['Account Issues', 'Billing', 'Technical Support', 'Product Questions', 'Feature Requests'],
        datasets: [
            {
                label: 'Average Response Time (minutes)',
                backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                borderColor: documentStyle.getPropertyValue('--primary-500'),
                data: [45, 32, 60, 25, 85]
            }
        ]
    };

    responseTimeChartOptions.value = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}

// Format date/time for activity feed
function formatTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// Navigate to leaderboard
function viewLeaderboard() {
    router.push('/leaderboard');
}

// Activity icon based on type
function getActivityIcon(type) {
    switch (type) {
        case 'ticket_created':
            return 'pi pi-plus-circle text-blue-500';
        case 'ticket_assigned':
            return 'pi pi-user text-indigo-500';
        case 'ticket_updated':
            return 'pi pi-pencil text-orange-500';
        case 'ticket_resolved':
            return 'pi pi-check-circle text-green-500';
        case 'ticket_closed':
            return 'pi pi-lock text-purple-500';
        default:
            return 'pi pi-info-circle text-primary';
    }
}

// Badge class based on trend
function getTrendBadgeClass(trend, inverted = false) {
    if (trend === 'up') {
        return inverted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
    } else {
        return inverted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    }
}

// Trend icon based on trend
function getTrendIcon(trend, inverted = false) {
    if (trend === 'up') {
        return inverted ? 'pi pi-arrow-up text-red-700' : 'pi pi-arrow-up text-green-700';
    } else {
        return inverted ? 'pi pi-arrow-down text-green-700' : 'pi pi-arrow-down text-red-700';
    }
}

// Update charts when theme changes
watch([getPrimary, getSurface, isDarkTheme], () => {
    initCharts();
});

// Update data when time range changes
watch(timeRangeFilter, () => {
    // In a real app, this would fetch new data based on the selected time range
    // For demo, we'll just simulate loading
    loading.value = true;
    setTimeout(() => {
        initCharts();
        loading.value = false;
    }, 500);
});
</script>

<template>
    <div>
        <!-- Dashboard Header with Controls -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
                <h1 class="text-3xl font-semibold">Helpdesk Dashboard</h1>
                <p class="text-gray-500">Overview of your support operations</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 mt-3 md:mt-0">
                <Dropdown v-model="timeRangeFilter" :options="timeRangeOptions" optionLabel="label" optionValue="value" placeholder="Select Time Range" class="w-full sm:w-auto" />

                <Dropdown v-model="comparisonPeriod" :options="comparisonOptions" optionLabel="label" optionValue="value" placeholder="Comparison" class="w-full sm:w-auto" />
            </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="card flex justify-center items-center py-8">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <div v-else>
            <!-- Key Metrics Row -->
            <div class="grid grid-cols-12 gap-4 mb-4">
                <!-- Open Tickets -->
                <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                    <div class="card mb-0 h-full">
                        <div class="flex justify-between mb-3">
                            <div>
                                <span class="block text-gray-500 font-medium mb-3">Open Tickets</span>
                                <div class="text-2xl font-medium">{{ ticketStats.open.count }}</div>
                            </div>
                            <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-lg" style="width: 3rem; height: 3rem">
                                <i class="pi pi-folder-open text-blue-500 text-2xl"></i>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <Badge :class="getTrendBadgeClass(ticketStats.open.trend, true)" class="mr-2">
                                <i :class="[getTrendIcon(ticketStats.open.trend, true), 'mr-1']"></i>
                                {{ ticketStats.open.change }}%
                            </Badge>
                            <span class="text-gray-500">vs {{ comparisonPeriod === 'previous_period' ? 'previous' : 'last year' }}</span>
                        </div>
                    </div>
                </div>

                <!-- In Progress -->
                <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                    <div class="card mb-0 h-full">
                        <div class="flex justify-between mb-3">
                            <div>
                                <span class="block text-gray-500 font-medium mb-3">In Progress</span>
                                <div class="text-2xl font-medium">{{ ticketStats.inProgress.count }}</div>
                            </div>
                            <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-lg" style="width: 3rem; height: 3rem">
                                <i class="pi pi-spin pi-spinner text-orange-500 text-2xl"></i>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <Badge :class="getTrendBadgeClass(ticketStats.inProgress.trend)" class="mr-2">
                                <i :class="[getTrendIcon(ticketStats.inProgress.trend), 'mr-1']"></i>
                                {{ ticketStats.inProgress.change }}%
                            </Badge>
                            <span class="text-gray-500">vs {{ comparisonPeriod === 'previous_period' ? 'previous' : 'last year' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Resolved -->
                <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                    <div class="card mb-0 h-full">
                        <div class="flex justify-between mb-3">
                            <div>
                                <span class="block text-gray-500 font-medium mb-3">Resolved</span>
                                <div class="text-2xl font-medium">{{ ticketStats.resolved.count }}</div>
                            </div>
                            <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-lg" style="width: 3rem; height: 3rem">
                                <i class="pi pi-check-circle text-green-500 text-2xl"></i>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <Badge :class="getTrendBadgeClass(ticketStats.resolved.trend)" class="mr-2">
                                <i :class="[getTrendIcon(ticketStats.resolved.trend), 'mr-1']"></i>
                                {{ ticketStats.resolved.change }}%
                            </Badge>
                            <span class="text-gray-500">vs {{ comparisonPeriod === 'previous_period' ? 'previous' : 'last year' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Closed -->
                <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                    <div class="card mb-0 h-full">
                        <div class="flex justify-between mb-3">
                            <div>
                                <span class="block text-gray-500 font-medium mb-3">Closed</span>
                                <div class="text-2xl font-medium">{{ ticketStats.closed.count }}</div>
                            </div>
                            <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-lg" style="width: 3rem; height: 3rem">
                                <i class="pi pi-lock text-purple-500 text-2xl"></i>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <Badge :class="getTrendBadgeClass(ticketStats.closed.trend)" class="mr-2">
                                <i :class="[getTrendIcon(ticketStats.closed.trend), 'mr-1']"></i>
                                {{ ticketStats.closed.change }}%
                            </Badge>
                            <span class="text-gray-500">vs {{ comparisonPeriod === 'previous_period' ? 'previous' : 'last year' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Second Row - Key Performance Indicators -->
            <div class="grid grid-cols-12 gap-4 mb-4">
                <!-- Resolution Efficiency -->
                <div class="col-span-12 lg:col-span-4">
                    <div class="card h-full">
                        <div class="flex flex-col h-full">
                            <div class="font-medium text-lg mb-3">Resolution Efficiency</div>

                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                                    <div class="text-gray-500 text-sm mb-1">Total Tickets</div>
                                    <div class="text-xl font-medium">{{ totalTickets }}</div>
                                </div>

                                <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
                                    <div class="text-gray-500 text-sm mb-1">Resolution Rate</div>
                                    <div class="text-xl font-medium">{{ resolutionRate }}%</div>
                                </div>
                            </div>

                            <div class="flex-grow flex flex-col justify-center items-center">
                                <div class="relative w-40 h-40">
                                    <svg viewBox="0 0 100 100" class="w-full h-full">
                                        <!-- Background circle -->
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e9e9e9" stroke-width="10" />

                                        <!-- Progress circle -->
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#4ade80" stroke-width="10" stroke-dasharray="282.7" :stroke-dashoffset="282.7 - (282.7 * parseInt(resolutionRate)) / 100" transform="rotate(-90 50 50)" />

                                        <!-- Text in center -->
                                        <text x="50" y="45" text-anchor="middle" font-size="16" font-weight="bold">{{ resolutionRate }}%</text>
                                        <text x="50" y="65" text-anchor="middle" font-size="8">Resolution Rate</text>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Average Handling Time -->
                <div class="col-span-12 lg:col-span-4">
                    <div class="card h-full">
                        <div class="flex flex-col h-full">
                            <div class="font-medium text-lg mb-3">Handling Time</div>

                            <div class="flex flex-col flex-grow">
                                <div class="mb-4 text-center">
                                    <div class="text-gray-500 text-sm mb-1">Average Resolution Time</div>
                                    <div class="text-3xl font-medium">{{ responseTimeData.average }}</div>

                                    <div class="flex items-center justify-center mt-2">
                                        <Badge :class="getTrendBadgeClass(responseTimeData.trend, true)" class="mr-2">
                                            <i :class="[getTrendIcon(responseTimeData.trend, true), 'mr-1']"></i>
                                            {{ responseTimeData.change }}%
                                        </Badge>
                                        <span class="text-gray-500">vs {{ comparisonPeriod === 'previous_period' ? 'previous' : 'last year' }}</span>
                                    </div>
                                </div>

                                <div class="flex-grow flex flex-col justify-center">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-gray-500">Target: {{ responseTimeData.target }}</span>
                                        <Badge :severity="onTrackStatus ? 'success' : 'danger'">
                                            {{ onTrackStatus ? 'On Target' : 'Above Target' }}
                                        </Badge>
                                    </div>

                                    <ProgressBar :value="(avgHandlingTimeFormatted / 300) * 100" :class="onTrackStatus ? 'custom-progress-success' : 'custom-progress-danger'" />

                                    <div class="text-xs text-gray-500 text-center mt-3">Response time measured from ticket creation to resolution</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Customer Satisfaction -->
                <div class="col-span-12 lg:col-span-4">
                    <div class="card h-full">
                        <div class="flex flex-col h-full">
                            <div class="font-medium text-lg mb-3">Customer Satisfaction</div>

                            <div class="flex-grow flex flex-col justify-center items-center">
                                <div class="mb-2 text-center">
                                    <div class="text-4xl font-bold">{{ satisfactionData.score }}/5</div>
                                    <div class="flex justify-center mt-2">
                                        <Rating :modelValue="satisfactionData.score" readonly :stars="5" />
                                    </div>
                                    <div class="text-gray-500 text-sm mt-2">Based on {{ satisfactionData.responses }} responses</div>
                                </div>

                                <div class="flex items-center justify-center mt-4">
                                    <Badge :class="getTrendBadgeClass(satisfactionData.trend)" class="mr-2">
                                        <i :class="[getTrendIcon(satisfactionData.trend), 'mr-1']"></i>
                                        {{ satisfactionData.change }}%
                                    </Badge>
                                    <span class="text-gray-500">vs {{ comparisonPeriod === 'previous_period' ? 'previous' : 'last year' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Third Row - Charts and Performance Insights -->
            <div class="grid grid-cols-12 gap-4 mb-4">
                <!-- Weekly Trend Chart -->
                <div class="col-span-12 lg:col-span-8">
                    <div class="card h-full">
                        <div class="flex justify-between items-center mb-3">
                            <div class="font-medium text-lg">Ticket Volume Trend</div>
                        </div>

                        <div style="height: 300px">
                            <Chart type="line" :data="trendChartData" :options="trendChartOptions" />
                        </div>
                    </div>
                </div>

                <!-- Status Distribution -->
                <div class="col-span-12 sm:col-span-6 lg:col-span-4">
                    <div class="card h-full flex flex-col">
                        <div class="font-medium text-lg mb-3">Ticket Status</div>

                        <div class="flex-grow flex items-center justify-center">
                            <Chart type="doughnut" :data="statusData" :options="statusOptions" class="w-full max-w-xs" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fourth Row - Detailed Insights -->
            <div class="grid grid-cols-12 gap-4 mb-4">
                <!-- Top Performers -->
                <div class="col-span-12 lg:col-span-4">
                    <div class="card h-full">
                        <div class="flex justify-between items-center mb-4">
                            <div class="font-medium text-lg">Top Performers</div>
                            <Button label="View All" icon="pi pi-external-link" text @click="viewLeaderboard" />
                        </div>

                        <div class="space-y-4">
                            <div v-for="(agent, index) in topPerformers" :key="agent.id" class="flex items-center p-3 border-round bg-gray-50 dark:bg-gray-900">
                                <div class="flex-shrink-0 mr-3 relative">
                                    <img :src="agent.avatar" :alt="agent.name" class="w-12 h-12 rounded-full" />
                                    <div :class="['absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-white rounded-full font-bold text-xs', index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600']">
                                        {{ index + 1 }}
                                    </div>
                                </div>

                                <div class="flex-grow min-w-0">
                                    <h3 class="font-medium truncate">{{ agent.name }}</h3>
                                    <p class="text-sm text-gray-500 truncate">{{ agent.department }}</p>
                                </div>

                                <div class="flex-shrink-0 text-right">
                                    <div class="font-medium">{{ agent.resolvedCount }}</div>
                                    <div class="text-sm text-gray-500">tickets</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Priority Distribution -->
                <div class="col-span-12 lg:col-span-4">
                    <div class="card h-full flex flex-col">
                        <div class="font-medium text-lg mb-3">Ticket Priority</div>

                        <div class="flex-grow flex items-center justify-center">
                            <Chart type="pie" :data="priorityData" :options="priorityOptions" class="w-full max-w-xs" />
                        </div>
                    </div>
                </div>

                <!-- Activity Feed -->
                <div class="col-span-12 lg:col-span-4">
                    <div class="card h-full">
                        <div class="font-medium text-lg mb-3">Recent Activity</div>

                        <div class="overflow-y-auto" style="max-height: 350px">
                            <Timeline :value="recentActivity" class="w-full">
                                <template #marker="slotProps">
                                    <span class="flex w-8 h-8 items-center justify-center rounded-full border-2 border-surface-200">
                                        <i :class="getActivityIcon(slotProps.item.type)"></i>
                                    </span>
                                </template>
                                <template #content="slotProps">
                                    <div class="text-sm mb-1">
                                        <span class="font-medium">{{ slotProps.item.user }}</span>
                                        <span class="text-gray-500"> {{ slotProps.item.description }}</span>
                                    </div>
                                    <div class="flex justify-between text-xs text-gray-500">
                                        <span>{{ formatTime(slotProps.item.time) }}</span>
                                        <span class="text-primary font-medium">#{{ slotProps.item.ticket }}</span>
                                    </div>
                                </template>
                            </Timeline>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fifth Row - Category Performance -->
            <div class="grid grid-cols-12 gap-4">
                <!-- Response Time by Category -->
                <div class="col-span-12">
                    <div class="card">
                        <div class="font-medium text-lg mb-3">Response Time by Category</div>

                        <div style="height: 300px">
                            <Chart type="bar" :data="responseTimeChartData" :options="responseTimeChartOptions" />
                        </div>

                        <div class="text-xs text-gray-500 text-center mt-3">Average response time in minutes for each ticket category</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Timeline customization */
:deep(.p-timeline-event-content) {
    @apply bg-gray-50 dark:bg-gray-900 p-3 rounded-lg;
}

:deep(.p-timeline-event) {
    @apply pb-4;
}

/* Progress bar colors */
:deep(.custom-progress-success .p-progressbar-value) {
    background-color: #4ade80 !important;
}

:deep(.custom-progress-danger .p-progressbar-value) {
    background-color: #f87171 !important;
}

/* Remove unnecessary padding from Timeline */
:deep(.p-timeline-event-opposite) {
    @apply hidden;
}

:deep(.p-timeline-event-content),
:deep(.p-timeline-event-separator) {
    @apply pl-0;
}

/* Badge styling */
:deep(.p-badge) {
    @apply font-normal px-2 py-1;
}

/* Chart container */
:deep(.p-card-content) {
    @apply p-0;
}
</style>
