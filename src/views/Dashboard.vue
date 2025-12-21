<script setup>
import { useLayout } from '@/layout/composables/layout';
import { BranchService } from '@/service/BranchService';
import { CategoryService } from '@/service/CategoryService';
import { DepartmentService } from '@/service/DepartmentService';
import { EmployeeService } from '@/service/EmployeeService';
import { TicketService } from '@/service/TicketService';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { getPrimary, getSurface, isDarkTheme } = useLayout();

const loading = ref(true);
const timeRangeFilter = ref('week');
const comparisonPeriod = ref('previous_period');

// API Data - Replace with actual API calls
const ticketsData = ref({
    isFirst: true,
    totalItems: 0,
    tickets: []
});

const categoriesData = ref([]);
const departmentsData = ref([]);
const employeesData = ref([]);
const branchesData = ref([]);

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

// Computed statistics from actual data
const ticketStats = computed(() => {
    const tickets = ticketsData.value.tickets;

    return {
        open: {
            count: tickets.filter((t) => t.status === 'OPEN').length,
            change: 15,
            trend: 'up'
        },
        ongoing: {
            count: tickets.filter((t) => t.status === 'ONGOING').length,
            change: 8,
            trend: 'up'
        },
        resolved: {
            count: tickets.filter((t) => t.status === 'RESOLVED').length,
            change: 12,
            trend: 'up'
        },
        closed: {
            count: tickets.filter((t) => t.status === 'CLOSED').length,
            change: 5,
            trend: 'up'
        }
    };
});

const totalTickets = computed(() => {
    return ticketsData.value.totalItems;
});

const priorityDistribution = computed(() => {
    const tickets = ticketsData.value.tickets;
    const distribution = {
        LOW: 0,
        MEDIUM: 0,
        HIGH: 0,
        URGENT: 0
    };

    tickets.forEach((ticket) => {
        if (distribution.hasOwnProperty(ticket.priority)) {
            distribution[ticket.priority]++;
        }
    });

    return distribution;
});

const categoryDistribution = computed(() => {
    const tickets = ticketsData.value.tickets;
    const distribution = {};

    tickets.forEach((ticket) => {
        const category = ticket.categoryName;
        distribution[category] = (distribution[category] || 0) + 1;
    });

    return distribution;
});

const departmentWorkload = computed(() => {
    const workload = {};

    categoriesData.value.forEach((category) => {
        const dept = category.departmentName;
        if (!workload[dept]) {
            workload[dept] = {
                name: dept,
                ticketCount: 0,
                avgResolutionTime: 0,
                teamSize: departmentsData.value.find((d) => d.name === dept)?.teamSize || 0
            };
        }

        const categoryTickets = ticketsData.value.tickets.filter((t) => t.categoryName === category.name);
        workload[dept].ticketCount += categoryTickets.length;
        workload[dept].avgResolutionTime += category.targetResolutionTime;
    });

    return Object.values(workload);
});

const topPerformers = computed(() => {
    const performanceMap = {};

    ticketsData.value.tickets.forEach((ticket) => {
        const email = ticket.assignedUserEmail;
        if (!performanceMap[email]) {
            const employee = employeesData.value.find((e) => e.email === email);
            if (employee) {
                performanceMap[email] = {
                    id: employee.id,
                    name: `${employee.firstName} ${employee.lastName}`,
                    email: employee.email,
                    department: employee.departmentName,
                    resolvedCount: 0,
                    avatar: `https://avatar.iran.liara.run/public/50?name=${employee.firstName}+${employee.lastName}`
                };
            }
        }

        if (performanceMap[email] && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')) {
            performanceMap[email].resolvedCount++;
        }
    });

    return Object.values(performanceMap)
        .sort((a, b) => b.resolvedCount - a.resolvedCount)
        .slice(0, 5);
});

const recentActivity = computed(() => {
    return ticketsData.value.tickets
        .map((ticket) => ({
            id: `ACT-${ticket.id}`,
            type: ticket.status === 'OPEN' ? 'ticket_created' : 'ticket_updated',
            user: ticket.assignedUserName,
            ticket: `TICK-${ticket.id}`,
            time: new Date(ticket.createdAt),
            description: ticket.status === 'OPEN' ? `Created new ticket: "${ticket.title}"` : `Updated ticket: "${ticket.title}"`
        }))
        .sort((a, b) => b.time - a.time)
        .slice(0, 3);
});

const avgResolutionTime = computed(() => {
    const totalTime = categoriesData.value.reduce((sum, cat) => sum + cat.targetResolutionTime, 0);
    const avgHours = totalTime / categoriesData.value.length;
    const hours = Math.floor(avgHours);
    const minutes = Math.round((avgHours - hours) * 60);
    return `${hours}h ${minutes}m`;
});

const resolutionRate = computed(() => {
    const tickets = ticketsData.value.tickets;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    return tickets.length > 0 ? ((resolved / tickets.length) * 100).toFixed(1) : 0;
});

// Chart data
const statusData = ref(null);
const statusOptions = ref(null);
const priorityData = ref(null);
const priorityOptions = ref(null);
const departmentChartData = ref(null);
const departmentChartOptions = ref(null);
const categoryChartData = ref(null);
const categoryChartOptions = ref(null);
const branchChartData = ref(null);
const branchChartOptions = ref(null);

// Timeline layout
const timelineLayout = ref('horizontal');
const imageErrorMap = ref({});

function updateTimelineLayout() {
    timelineLayout.value = window.innerWidth < 768 ? 'vertical' : 'horizontal';
}

// Initialize dashboard data
onMounted(() => {
    updateTimelineLayout();
    window.addEventListener('resize', updateTimelineLayout);
    fetchDashboardData();
});

async function fetchDashboardData() {
    loading.value = true;
    try {
        const [ticketsRes, categoriesRes, departmentsRes, employeesRes, branchesRes] = await Promise.all([
            TicketService.getTickets(),
            CategoryService.getCategories(),
            DepartmentService.getDepartments(),
            EmployeeService.getEmployees(),
            BranchService.getBranches()
        ]);

        ticketsData.value = ticketsRes;
        categoriesData.value = categoriesRes;
        departmentsData.value = departmentsRes;
        employeesData.value = employeesRes;
        branchesData.value = branchesRes;

        initCharts();
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    } finally {
        loading.value = false;
    }
}

onUnmounted(() => {
    window.removeEventListener('resize', updateTimelineLayout);
});

// Initialize chart data
function initCharts() {
    setStatusChart();
    setPriorityChart();
    setDepartmentChart();
    setCategoryChart();
    setBranchChart();
}

// Status distribution chart
function setStatusChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    statusData.value = {
        labels: ['Open', 'Ongoing', 'Resolved', 'Closed'],
        datasets: [
            {
                data: [ticketStats.value.open.count, ticketStats.value.ongoing.count, ticketStats.value.resolved.count, ticketStats.value.closed.count],
                backgroundColor: ['#3b82f6', '#f97316', '#22c55e', '#a855f7'],
                hoverBackgroundColor: ['#60a5fa', '#fb923c', '#4ade80', '#c084fc']
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
                        weight: 500
                    }
                },
                position: 'bottom'
            }
        },
        cutout: '60%'
    };
}

// Priority distribution chart
function setPriorityChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const dist = priorityDistribution.value;

    priorityData.value = {
        labels: ['Low', 'Medium', 'High', 'Urgent'],
        datasets: [
            {
                data: [dist.LOW, dist.MEDIUM, dist.HIGH, dist.URGENT],
                backgroundColor: ['#3b82f6', '#eab308', '#f97316', '#ef4444'],
                hoverBackgroundColor: ['#60a5fa', '#facc15', '#fb923c', '#f87171']
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
                        weight: 500
                    }
                },
                position: 'bottom'
            }
        },
        cutout: '60%'
    };
}

// Department workload chart
function setDepartmentChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const workload = departmentWorkload.value;

    departmentChartData.value = {
        labels: workload.map((d) => d.name),
        datasets: [
            {
                label: 'Active Tickets',
                backgroundColor: '#3b82f6',
                borderColor: '#3b82f6',
                data: workload.map((d) => d.ticketCount)
            },
            {
                label: 'Team Size',
                backgroundColor: '#a855f7',
                borderColor: '#a855f7',
                data: workload.map((d) => d.teamSize)
            }
        ]
    };

    departmentChartOptions.value = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    font: {
                        weight: 500
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };
}

// Category distribution chart
function setCategoryChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const categories = Object.entries(categoryDistribution.value);

    const primaryColor = documentStyle.getPropertyValue('--primary-color') || '#3b82f6';

    categoryChartData.value = {
        labels: categories.map(([name]) => name),
        datasets: [
            {
                label: 'Tickets by Category',
                backgroundColor: primaryColor,
                borderColor: primaryColor,
                data: categories.map(([, count]) => count),
                borderRadius: 8
            }
        ]
    };

    categoryChartOptions.value = {
        indexAxis: 'y',
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            }
        }
    };
}

// Branch performance chart
function setBranchChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    branchChartData.value = {
        labels: branchesData.value.map((b) => b.name),
        datasets: [
            {
                label: 'Resolved Tickets',
                backgroundColor: '#22c55e',
                borderColor: '#22c55e',
                data: branchesData.value.map((b) => b.resolvedTickets)
            },
            {
                label: 'Active Tickets',
                backgroundColor: '#f97316',
                borderColor: '#f97316',
                data: branchesData.value.map((b) => b.activeTickets)
            }
        ]
    };

    branchChartOptions.value = {
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
                ticks: { color: textColorSecondary },
                grid: { color: surfaceBorder, drawBorder: false }
            },
            y: {
                ticks: { color: textColorSecondary },
                grid: { color: surfaceBorder, drawBorder: false }
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

// Activity icon based on type
function getActivityIcon(type) {
    switch (type) {
        case 'ticket_created':
            return 'pi pi-plus-circle';
        case 'ticket_assigned':
            return 'pi pi-user';
        case 'ticket_updated':
            return 'pi pi-pencil';
        case 'ticket_resolved':
            return 'pi pi-check-circle';
        case 'ticket_closed':
            return 'pi pi-lock';
        default:
            return 'pi pi-info-circle';
    }
}

function getActivityIconColor(type) {
    switch (type) {
        case 'ticket_created':
            return 'text-blue-500';
        case 'ticket_assigned':
            return 'text-indigo-500';
        case 'ticket_updated':
            return 'text-orange-500';
        case 'ticket_resolved':
            return 'text-green-500';
        case 'ticket_closed':
            return 'text-purple-500';
        default:
            return 'text-primary';
    }
}

// Badge class based on trend
function getTrendBadgeClass(trend, inverted = false) {
    if (trend === 'up') {
        return inverted ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    } else {
        return inverted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
}

// Trend icon based on trend
function getTrendIcon(trend, inverted = false) {
    if (trend === 'up') {
        return inverted ? 'pi pi-arrow-up' : 'pi pi-arrow-up';
    } else {
        return inverted ? 'pi pi-arrow-down' : 'pi pi-arrow-down';
    }
}

// Priority badge severity
function getPriorityBadgeSeverity(priority) {
    switch (priority) {
        case 'URGENT':
            return 'danger';
        case 'HIGH':
            return 'warning';
        case 'MEDIUM':
            return 'info';
        case 'LOW':
            return 'success';
        default:
            return null;
    }
}

// Status badge severity
function getStatusBadgeSeverity(status) {
    switch (status) {
        case 'OPEN':
            return 'info';
        case 'ONGOING':
            return 'warning';
        case 'RESOLVED':
            return 'success';
        case 'CLOSED':
            return null;
        default:
            return null;
    }
}

// Update charts when theme changes
watch([getPrimary, getSurface, isDarkTheme], () => {
    initCharts();
});

// Update data when time range changes
watch(timeRangeFilter, () => {
    fetchDashboardData();
});

function onImageError(id) {
    imageErrorMap.value[id] = true;
}
</script>

<template>
    <div class="p-4">
        <!-- Dashboard Header with Controls -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div>
                <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">Helpdesk Dashboard</h1>
                <p class="text-surface-600 dark:text-surface-400">Monitor and manage support operations</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Dropdown v-model="timeRangeFilter" :options="timeRangeOptions" optionLabel="label" optionValue="value" placeholder="Select Time Range" class="w-full sm:w-48" />

                <Dropdown v-model="comparisonPeriod" :options="comparisonOptions" optionLabel="label" optionValue="value" placeholder="Comparison" class="w-full sm:w-48" />
            </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="card flex justify-center items-center py-16">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <div v-else class="space-y-6">
            <!-- Key Metrics Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Open Tickets -->
                <div class="card min-h-full flex flex-col justify-between bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <span class="block text-blue-700 dark:text-blue-300 font-semibold mb-2 text-sm uppercase tracking-wide">Open Tickets</span>
                            <div class="text-4xl font-bold text-blue-900 dark:text-blue-100">{{ ticketStats.open.count }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-500 dark:bg-blue-600 rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-folder-open text-white text-2xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <Badge :class="getTrendBadgeClass(ticketStats.open.trend, true)" class="font-semibold">
                            <i :class="[getTrendIcon(ticketStats.open.trend, true), 'mr-1 text-xs']"></i>
                            {{ ticketStats.open.change }}%
                        </Badge>
                        <span class="text-sm text-blue-600 dark:text-blue-400">vs previous period</span>
                    </div>
                </div>

                <!-- In Progress -->
                <div class="card min-h-full flex flex-col justify-between bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-0 shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <span class="block text-orange-700 dark:text-orange-300 font-semibold mb-2 text-sm uppercase tracking-wide">Ongoing</span>
                            <div class="text-4xl font-bold text-orange-900 dark:text-orange-100">{{ ticketStats.ongoing.count }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-500 dark:bg-orange-600 rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-spin pi-spinner text-white text-2xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <Badge :class="getTrendBadgeClass(ticketStats.ongoing.trend)" class="font-semibold">
                            <i :class="[getTrendIcon(ticketStats.ongoing.trend), 'mr-1 text-xs']"></i>
                            {{ ticketStats.ongoing.change }}%
                        </Badge>
                        <span class="text-sm text-orange-600 dark:text-orange-400">vs previous period</span>
                    </div>
                </div>

                <!-- Resolved -->
                <div class="card min-h-full flex flex-col justify-between bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0 shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <span class="block text-green-700 dark:text-green-300 font-semibold mb-2 text-sm uppercase tracking-wide">Resolved</span>
                            <div class="text-4xl font-bold text-green-900 dark:text-green-100">{{ ticketStats.resolved.count }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-green-500 dark:bg-green-600 rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-check-circle text-white text-2xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <Badge :class="getTrendBadgeClass(ticketStats.resolved.trend)" class="font-semibold">
                            <i :class="[getTrendIcon(ticketStats.resolved.trend), 'mr-1 text-xs']"></i>
                            {{ ticketStats.resolved.change }}%
                        </Badge>
                        <span class="text-sm text-green-600 dark:text-green-400">vs previous period</span>
                    </div>
                </div>

                <!-- Closed -->
                <div class="card min-h-full flex flex-col justify-between bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                            <span class="block text-purple-700 dark:text-purple-300 font-semibold mb-2 text-sm uppercase tracking-wide">Closed</span>
                            <div class="text-4xl font-bold text-purple-900 dark:text-purple-100">{{ ticketStats.closed.count }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-purple-500 dark:bg-purple-600 rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem">
                            <i class="pi pi-lock text-white text-2xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <Badge :class="getTrendBadgeClass(ticketStats.closed.trend)" class="font-semibold">
                            <i :class="[getTrendIcon(ticketStats.closed.trend), 'mr-1 text-xs']"></i>
                            {{ ticketStats.closed.change }}%
                        </Badge>
                        <span class="text-sm text-purple-600 dark:text-purple-400">vs previous period</span>
                    </div>
                </div>
            </div>

            <!-- KPI Cards Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Resolution Efficiency -->
                <div class="card shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Resolution Rate</h3>
                        <i class="pi pi-chart-line text-2xl text-primary"></i>
                    </div>

                    <div class="flex flex-col items-center justify-center py-6">
                        <div class="relative w-48 h-48 mb-4">
                            <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="currentColor"
                                    class="text-surface-200 dark:text-surface-700"
                                    stroke-width="8"
                                    stroke-dasharray="251.2"
                                    :stroke-dashoffset="251.2 - (251.2 * parseInt(resolutionRate)) / 100"
                                    stroke-linecap="round"
                                />
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="text-5xl font-bold text-surface-900 dark:text-surface-0">{{ resolutionRate }}%</span>
                                <span class="text-sm text-surface-600 dark:text-surface-400 mt-1">Resolved</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 w-full">
                            <div class="bg-surface-100 dark:bg-surface-800 rounded-lg p-4 text-center">
                                <div class="text-sm text-surface-600 dark:text-surface-400 mb-1">Total</div>
                                <div class="text-2xl font-bold text-surface-900 dark:text-surface-0">{{ totalTickets }}</div>
                            </div>
                            <div class="bg-surface-100 dark:bg-surface-800 rounded-lg p-4 text-center">
                                <div class="text-sm text-surface-600 dark:text-surface-400 mb-1">Closed</div>
                                <div class="text-2xl font-bold text-surface-900 dark:text-surface-0">{{ ticketStats.closed.count }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Average Resolution Time -->
                <div class="card shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Avg Resolution Time</h3>
                        <i class="pi pi-clock text-2xl text-primary"></i>
                    </div>

                    <div class="flex flex-col items-center justify-center py-6">
                        <div class="text-6xl font-bold text-primary mb-4">{{ avgResolutionTime }}</div>

                        <div class="w-full space-y-3">
                            <div v-for="category in categoriesData.slice(0, 3)" :key="category.id" class="bg-surface-100 dark:bg-surface-800 rounded-lg p-3">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ category.name }}</span>
                                    <span class="text-sm font-bold text-primary">{{ category.targetResolutionTime }}h</span>
                                </div>
                                <ProgressBar :value="(category.targetResolutionTime / 72) * 100" :showValue="false" style="height: 6px" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Department Overview -->
                <div class="card shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Departments</h3>
                        <i class="pi pi-sitemap text-2xl text-primary"></i>
                    </div>

                    <div class="space-y-4 py-2 overflow-y-auto max-h-[20rem] pr-2">
                        <div v-for="dept in departmentsData" :key="dept.id" class="bg-surface-100 dark:bg-surface-800 rounded-lg p-4 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <h4 class="font-bold text-surface-900 dark:text-surface-0 mb-1">{{ dept.name }}</h4>
                                    <p class="text-xs text-surface-600 dark:text-surface-400">{{ dept.description }}</p>
                                </div>
                                <Badge :value="dept.teamSize" severity="info" />
                            </div>
                            <div class="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-400">
                                <i class="pi pi-users"></i>
                                <span>{{ dept.teamSize }} team members</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Department Workload -->
                <div class="card shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Department Workload</h3>
                        <i class="pi pi-chart-bar text-xl text-primary"></i>
                    </div>
                    <div style="height: 300px">
                        <Chart type="bar" :data="departmentChartData" :options="departmentChartOptions" />
                    </div>
                </div>

                <!-- Ticket Status Distribution -->
                <div class="card shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Ticket Status</h3>
                        <i class="pi pi-chart-pie text-xl text-primary"></i>
                    </div>
                    <div class="flex items-center justify-center" style="height: 300px">
                        <Chart type="doughnut" :data="statusData" :options="statusOptions" class="w-full max-w-sm" />
                    </div>
                </div>
            </div>

            <!-- Bottom Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Priority Distribution -->
                <div class="card shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Priority Breakdown</h3>
                        <i class="pi pi-exclamation-triangle text-xl text-primary"></i>
                    </div>
                    <div class="flex items-center justify-center" style="min-height: 280px">
                        <Chart type="pie" :data="priorityData" :options="priorityOptions" class="w-full max-w-xs" />
                    </div>
                </div>

                <!-- Category Distribution -->
                <div class="card shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Tickets by Category</h3>
                        <i class="pi pi-tags text-xl text-primary"></i>
                    </div>
                    <div style="height: 280px">
                        <Chart type="bar" :data="categoryChartData" :options="categoryChartOptions" />
                    </div>
                </div>

                <!-- Top Performers -->
                <div class="card shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Top Performers</h3>
                        <Button icon="pi pi-external-link" text rounded size="small" />
                    </div>

                    <div class="space-y-3">
                        <div v-if="topPerformers.length === 0" class="text-center py-8 text-surface-600 dark:text-surface-400">
                            <i class="pi pi-inbox text-4xl mb-3"></i>
                            <p>No performance data available</p>
                        </div>

                        <div v-for="(agent, index) in topPerformers" :key="agent.id" class="flex items-center gap-3 p-3 bg-surface-100 dark:bg-surface-800 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                            <div class="relative flex-shrink-0">
                                <img v-if="!imageErrorMap[`agent-${agent.id}`]" :src="agent.avatar" :alt="agent.name" class="w-12 h-12 rounded-full border-2 border-surface-200 dark:border-surface-700" @error="onImageError(`agent-${agent.id}`)" />
                                <div v-else class="w-12 h-12 rounded-full border-2 border-surface-200 dark:border-surface-700 bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                    <i class="pi pi-user text-surface-500 text-xl"></i>
                                </div>
                                <div :class="['absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center text-white rounded-full font-bold text-xs shadow-md', index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600']">
                                    {{ index + 1 }}
                                </div>
                            </div>

                            <div class="flex-1 min-w-0">
                                <h4 class="font-semibold text-surface-900 dark:text-surface-0 truncate">{{ agent.name }}</h4>
                                <p class="text-sm text-surface-600 dark:text-surface-400 truncate">{{ agent.department }}</p>
                            </div>

                            <div class="text-right flex-shrink-0">
                                <div class="text-xl font-bold text-primary">{{ agent.resolvedCount }}</div>
                                <div class="text-xs text-surface-600 dark:text-surface-400">resolved</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Branch & Activity Row -->
            <div class="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <!-- Branch Performance -->
                <!-- <div class="card shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Branch Performance</h3>
                        <i class="pi pi-building text-xl text-primary"></i>
                    </div>
                    <div style="height: 320px">
                        <Chart type="bar" :data="branchChartData" :options="branchChartOptions" />
                    </div>
                </div> -->

                <!-- Recent Activity -->
                <div class="card shadow-md hover:shadow-lg transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Recent Activity</h3>
                        <Button label="View All" icon="pi pi-arrow-right" iconPos="right" text size="small" />
                    </div>

                    <div class="overflow-x-auto">
                        <Timeline :value="recentActivity" :layout="timelineLayout" align="top">
                            <template #marker="slotProps">
                                <span class="flex w-12 h-12 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 border-2 border-surface-300 dark:border-surface-600 shadow-md">
                                    <i :class="[getActivityIcon(slotProps.item.type), getActivityIconColor(slotProps.item.type), 'text-xl']"></i>
                                </span>
                            </template>
                            <template #content="slotProps">
                                <div class="bg-surface-100 dark:bg-surface-800 p-4 rounded-lg shadow-sm max-w-xs">
                                    <div class="font-semibold text-surface-900 dark:text-surface-0 mb-1">{{ slotProps.item.user }}</div>
                                    <div class="text-sm text-surface-600 dark:text-surface-400 mb-2">{{ slotProps.item.description }}</div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-surface-500 dark:text-surface-500">{{ formatTime(slotProps.item.time) }}</span>
                                        <Badge :value="slotProps.item.ticket" severity="info" size="small" />
                                    </div>
                                </div>
                            </template>
                        </Timeline>
                    </div>
                </div>
            </div>

            <!-- Current Tickets Table -->
            <div class="card shadow-md hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">Active Tickets</h3>
                    <Button label="View All Tickets" icon="pi pi-arrow-right" iconPos="right" size="small" />
                </div>

                <DataTable :value="ticketsData.tickets" stripedRows responsiveLayout="scroll">
                    <Column field="id" header="ID" style="min-width: 80px">
                        <template #body="slotProps">
                            <span class="font-mono text-sm font-semibold">#{{ slotProps.data.id }}</span>
                        </template>
                    </Column>

                    <Column field="title" header="Title" style="min-width: 200px">
                        <template #body="slotProps">
                            <div class="font-semibold text-surface-900 dark:text-surface-0">{{ slotProps.data.title }}</div>
                            <div class="text-xs text-surface-600 dark:text-surface-400 mt-1">{{ slotProps.data.categoryName }}</div>
                        </template>
                    </Column>

                    <Column field="status" header="Status" style="min-width: 120px">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.status" :severity="getStatusBadgeSeverity(slotProps.data.status)" />
                        </template>
                    </Column>

                    <Column field="priority" header="Priority" style="min-width: 120px">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.priority" :severity="getPriorityBadgeSeverity(slotProps.data.priority)" />
                        </template>
                    </Column>

                    <Column field="assignedUserName" header="Assigned To" style="min-width: 180px">
                        <template #body="slotProps">
                            <div class="flex items-center gap-2">
                                <img
                                    v-if="!imageErrorMap[`ticket-${slotProps.data.id}`]"
                                    :src="`https://avatar.iran.liara.run/public/50?name=${slotProps.data.assignedUserName}`"
                                    :alt="slotProps.data.assignedUserName"
                                    class="w-8 h-8 rounded-full"
                                    @error="onImageError(`ticket-${slotProps.data.id}`)"
                                />
                                <div v-else class="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                    <i class="pi pi-user text-surface-500 text-xs"></i>
                                </div>
                                <span class="text-sm font-medium">{{ slotProps.data.assignedUserName }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="createdAt" header="Created" style="min-width: 150px">
                        <template #body="slotProps">
                            <span class="text-sm">{{ formatTime(new Date(slotProps.data.createdAt)) }}</span>
                        </template>
                    </Column>

                    <Column header="Actions" style="min-width: 100px">
                        <template #body>
                            <Button icon="pi pi-eye" text rounded size="small" severity="info" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom styling for consistent design */
.card {
    @apply bg-surface-0 dark:bg-surface-900 rounded-xl p-6 border border-surface-200 dark:border-surface-700;
}

/* Timeline customization */
:deep(.p-timeline-event-marker) {
    @apply border-0;
}

:deep(.p-timeline-event-connector) {
    @apply bg-surface-300 dark:bg-surface-600;
}

/* Progress bar styling */
:deep(.p-progressbar) {
    @apply bg-surface-200 dark:bg-surface-700 rounded-full;
}

:deep(.p-progressbar-value) {
    @apply rounded-full;
}

/* DataTable styling */
:deep(.p-datatable .p-datatable-thead > tr > th) {
    @apply bg-surface-100 dark:bg-surface-800 font-semibold;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    @apply hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors;
}

/* Badge styling */
:deep(.p-badge) {
    @apply font-semibold px-3 py-1;
}

/* Chart responsiveness */
:deep(.p-chart) {
    @apply w-full h-full;
}

/* Button styling */
:deep(.p-button) {
    @apply font-semibold transition-all;
}

:deep(.p-button:hover) {
    @apply shadow-md;
}

/* Dropdown styling */
:deep(.p-dropdown) {
    @apply border-surface-300 dark:border-surface-600;
}

:deep(.p-dropdown:hover) {
    @apply border-primary;
}

/* Timeline horizontal layout adjustments */
:deep(.p-timeline-horizontal .p-timeline-event) {
    @apply flex-shrink-0;
}

:deep(.p-timeline-horizontal .p-timeline-event-content) {
    @apply mt-4;
}

/* Scrollbar styling */
::-webkit-scrollbar {
    @apply w-2 h-2;
}

::-webkit-scrollbar-track {
    @apply bg-surface-100 dark:bg-surface-800 rounded;
}

::-webkit-scrollbar-thumb {
    @apply bg-surface-400 dark:bg-surface-600 rounded hover:bg-surface-500 dark:hover:bg-surface-500;
}

/* Gradient text effect */
.gradient-text {
    @apply bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent;
}

/* Card hover animations */
.card {
    @apply transition-all duration-300;
}

.card:hover {
    @apply transform scale-[1.01];
}

/* Smooth transitions for theme switching */
* {
    @apply transition-colors duration-200;
}

/* Badge size variants */
:deep(.p-badge-sm) {
    @apply text-xs px-2 py-0.5;
}

/* Custom progress bar colors */
:deep(.p-progressbar-value) {
    @apply bg-gradient-to-r from-primary-400 to-primary-600;
}

/* Enhanced shadow utilities */
.shadow-soft {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.dark .shadow-soft {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Status badge custom colors */
:deep(.p-badge.p-badge-info) {
    @apply bg-blue-500 text-white;
}

:deep(.p-badge.p-badge-warning) {
    @apply bg-orange-500 text-white;
}

:deep(.p-badge.p-badge-success) {
    @apply bg-green-500 text-white;
}

:deep(.p-badge.p-badge-danger) {
    @apply bg-red-500 text-white;
}

/* Chart container padding adjustments */
:deep(.p-chart canvas) {
    @apply max-h-full;
}

/* DataTable header alignment */
:deep(.p-datatable-thead > tr > th) {
    @apply text-left;
}

/* Loading spinner customization */
:deep(.p-progress-spinner-circle) {
    @apply stroke-primary;
}

/* Responsive text sizing */
@media (max-width: 640px) {
    .card {
        @apply p-4;
    }

    h1 {
        @apply text-2xl;
    }

    h3 {
        @apply text-lg;
    }
}

/* Animation for metric cards */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card {
    animation: fadeInUp 0.5s ease-out;
}

/* Staggered animation for grid items */
.grid > .card:nth-child(1) {
    animation-delay: 0.1s;
}
.grid > .card:nth-child(2) {
    animation-delay: 0.2s;
}
.grid > .card:nth-child(3) {
    animation-delay: 0.3s;
}
.grid > .card:nth-child(4) {
    animation-delay: 0.4s;
}

/* Custom focus styles */
:deep(.p-dropdown:focus),
:deep(.p-button:focus) {
    @apply ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-surface-900;
}

/* Tooltip styling if using PrimeVue tooltips */
:deep(.p-tooltip .p-tooltip-text) {
    @apply bg-surface-900 dark:bg-surface-100 text-surface-0 dark:text-surface-900 text-sm px-3 py-2 rounded-lg shadow-lg;
}

/* Timeline marker pulse effect */
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

:deep(.p-timeline-event-marker) {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Avatar border glow effect */
.card img[alt] {
    @apply transition-all duration-300;
}

.card:hover img[alt] {
    @apply shadow-lg ring-2 ring-primary-400;
}

/* Empty state styling */
.empty-state {
    @apply flex flex-col items-center justify-center py-12 text-surface-500 dark:text-surface-400;
}

.empty-state i {
    @apply text-6xl mb-4 opacity-50;
}
</style>
