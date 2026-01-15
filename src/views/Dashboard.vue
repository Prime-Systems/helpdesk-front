<script setup>
import { useLayout } from '@/layout/composables/layout';
import { BranchService } from '@/service/BranchService';
import { CategoryService } from '@/service/CategoryService';
import { DashboardService } from '@/service/DashboardService';
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

// API Data
const ticketsData = ref({
    isFirst: true,
    totalItems: 0,
    tickets: []
});

const categoriesData = ref([]);
const departmentsData = ref([]);
const employeesData = ref([]);
const branchesData = ref([]);

// Dashboard stats from API
const dashboardStats = ref(null);
const topPerformersData = ref([]);
const recentActivityData = ref([]);

// Time range options
const timeRangeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'All Time', value: 'all_time' }
];

// Comparison period options
const comparisonOptions = [
    { label: 'Previous Period', value: 'previous_period' },
    { label: 'Same Period Last Year', value: 'last_year' }
];

// Computed statistics - use API data if available, fallback to computed
const ticketStats = computed(() => {
    // If we have dashboard stats from API, use them
    if (dashboardStats.value && dashboardStats.value.tickets) {
        return dashboardStats.value.tickets;
    }
    
    // Fallback to computing from raw ticket data
    const tickets = ticketsData.value.tickets;
    return {
        open: {
            count: tickets.filter((t) => t.status === 'OPEN').length,
            change: 15,
            trend: 'UP'
        },
        ongoing: {
            count: tickets.filter((t) => t.status === 'ONGOING').length,
            change: 8,
            trend: 'UP'
        },
        resolved: {
            count: tickets.filter((t) => t.status === 'RESOLVED').length,
            change: 12,
            trend: 'UP'
        },
        closed: {
            count: tickets.filter((t) => t.status === 'CLOSED').length,
            change: 5,
            trend: 'UP'
        }
    };
});

const totalTickets = computed(() => {
    if (dashboardStats.value && dashboardStats.value.tickets) {
        return dashboardStats.value.tickets.total || ticketsData.value.totalItems;
    }
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

// Use API data for top performers if available
const topPerformers = computed(() => {
    if (topPerformersData.value && topPerformersData.value.length > 0) {
        return topPerformersData.value.map(p => ({
            id: p.userId,
            name: p.name,
            email: p.email,
            department: p.department,
            resolvedCount: p.resolvedCount,
            avgRating: p.avgRating,
            avatar: p.avatar || `https://avatar.iran.liara.run/public/50?name=${encodeURIComponent(p.name)}`
        }));
    }
    
    // Fallback to computing from ticket data
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

// Use API data for recent activity if available
const recentActivity = computed(() => {
    if (recentActivityData.value && recentActivityData.value.length > 0) {
        return recentActivityData.value.map(a => ({
            id: a.id,
            type: a.type.toLowerCase(),
            user: a.userName,
            ticket: a.ticketId ? `TICK-${a.ticketId}` : null,
            time: new Date(a.timestamp),
            description: a.description
        })).slice(0, 3);
    }
    
    // Fallback to computing from ticket data
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
    if (dashboardStats.value && dashboardStats.value.avgResolutionTime) {
        const hours = Math.floor(dashboardStats.value.avgResolutionTime);
        const minutes = Math.round((dashboardStats.value.avgResolutionTime - hours) * 60);
        return `${hours}h ${minutes}m`;
    }
    
    const totalTime = categoriesData.value.reduce((sum, cat) => sum + cat.targetResolutionTime, 0);
    const avgHours = totalTime / categoriesData.value.length || 0;
    const hours = Math.floor(avgHours);
    const minutes = Math.round((avgHours - hours) * 60);
    return `${hours}h ${minutes}m`;
});

const resolutionRate = computed(() => {
    if (dashboardStats.value && dashboardStats.value.resolutionRate !== undefined) {
        return dashboardStats.value.resolutionRate.toFixed(1);
    }
    
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
        // Fetch dashboard stats from API alongside raw data
        const [statsRes, topPerformersRes, activityRes, ticketsRes, categoriesRes, departmentsRes, employeesRes, branchesRes] = await Promise.allSettled([
            DashboardService.getStats({ period: timeRangeFilter.value, comparison: comparisonPeriod.value }),
            DashboardService.getTopPerformers({ limit: 5, period: timeRangeFilter.value }),
            DashboardService.getActivity({ limit: 10 }),
            TicketService.getTickets(),
            CategoryService.getCategories(),
            DepartmentService.getDepartments(),
            EmployeeService.getEmployees(),
            BranchService.getBranches()
        ]);

        // Use dashboard stats if available
        if (statsRes.status === 'fulfilled') {
            dashboardStats.value = statsRes.value;
        }
        
        if (topPerformersRes.status === 'fulfilled') {
            topPerformersData.value = topPerformersRes.value;
        }
        
        if (activityRes.status === 'fulfilled') {
            recentActivityData.value = activityRes.value;
        }

        // Always fetch raw data as fallback/supplement
        if (ticketsRes.status === 'fulfilled') {
            ticketsData.value = ticketsRes.value;
        }
        if (categoriesRes.status === 'fulfilled') {
            categoriesData.value = categoriesRes.value;
        }
        if (departmentsRes.status === 'fulfilled') {
            departmentsData.value = departmentsRes.value;
        }
        if (employeesRes.status === 'fulfilled') {
            employeesData.value = employeesRes.value;
        }
        if (branchesRes.status === 'fulfilled') {
            branchesData.value = branchesRes.value;
        }

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

function navigateToTickets(status) {
    router.push({ path: '/tickets', query: { status: status } });
}

function navigateTo(path) {
    router.push(path);
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
                <div @click="navigateToTickets('OPEN')" class="card h-full bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden group">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
                    <div class="flex justify-between items-start mb-3 pl-2">
                        <div>
                            <span class="block text-surface-500 dark:text-surface-400 font-medium text-sm">Open Tickets</span>
                            <div class="text-3xl font-bold text-surface-900 dark:text-surface-0 mt-1">{{ ticketStats.open.count }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-lg w-10 h-10 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                            <i class="pi pi-folder-open text-blue-500 text-xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 pl-2">
                        <span :class="['text-xs font-medium px-2 py-0.5 rounded', ticketStats.open.trend === 'UP' ? 'bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-400/10 dark:text-green-400']">
                            <i :class="[ticketStats.open.trend === 'UP' ? 'pi pi-arrow-up' : 'pi pi-arrow-down', 'text-[10px] mr-1']"></i>
                            {{ ticketStats.open.change }}%
                        </span>
                        <span class="text-xs text-surface-400 dark:text-surface-500">vs last period</span>
                    </div>
                </div>

                <!-- In Progress -->
                <div @click="navigateToTickets('ONGOING')" class="card h-full bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden group">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-xl"></div>
                    <div class="flex justify-between items-start mb-3 pl-2">
                        <div>
                            <span class="block text-surface-500 dark:text-surface-400 font-medium text-sm">Ongoing</span>
                            <div class="text-3xl font-bold text-surface-900 dark:text-surface-0 mt-1">{{ ticketStats.ongoing.count }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-50 dark:bg-orange-900/30 rounded-lg w-10 h-10 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                            <i class="pi pi-spinner text-orange-500 text-xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 pl-2">
                        <span :class="['text-xs font-medium px-2 py-0.5 rounded', ticketStats.ongoing.trend === 'UP' ? 'bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-400/10 dark:text-green-400']">
                            <i :class="[ticketStats.ongoing.trend === 'UP' ? 'pi pi-arrow-up' : 'pi pi-arrow-down', 'text-[10px] mr-1']"></i>
                            {{ ticketStats.ongoing.change }}%
                        </span>
                        <span class="text-xs text-surface-400 dark:text-surface-500">vs last period</span>
                    </div>
                </div>

                <!-- Resolved -->
                <div @click="navigateToTickets('RESOLVED')" class="card h-full bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden group">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl"></div>
                    <div class="flex justify-between items-start mb-3 pl-2">
                        <div>
                            <span class="block text-surface-500 dark:text-surface-400 font-medium text-sm">Resolved</span>
                            <div class="text-3xl font-bold text-surface-900 dark:text-surface-0 mt-1">{{ ticketStats.resolved.count }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-green-50 dark:bg-green-900/30 rounded-lg w-10 h-10 group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                            <i class="pi pi-check-circle text-green-500 text-xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 pl-2">
                        <span :class="['text-xs font-medium px-2 py-0.5 rounded', ticketStats.resolved.trend === 'UP' ? 'bg-green-50 text-green-600 dark:bg-green-400/10 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400']">
                            <i :class="[ticketStats.resolved.trend === 'UP' ? 'pi pi-arrow-up' : 'pi pi-arrow-down', 'text-[10px] mr-1']"></i>
                            {{ ticketStats.resolved.change }}%
                        </span>
                        <span class="text-xs text-surface-400 dark:text-surface-500">vs last period</span>
                    </div>
                </div>

                <!-- Closed -->
                <div @click="navigateToTickets('CLOSED')" class="card h-full bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden group">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-l-xl"></div>
                    <div class="flex justify-between items-start mb-3 pl-2">
                        <div>
                            <span class="block text-surface-500 dark:text-surface-400 font-medium text-sm">Closed</span>
                            <div class="text-3xl font-bold text-surface-900 dark:text-surface-0 mt-1">{{ ticketStats.closed.count }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-purple-50 dark:bg-purple-900/30 rounded-lg w-10 h-10 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                            <i class="pi pi-lock text-purple-500 text-xl"></i>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 pl-2">
                        <span :class="['text-xs font-medium px-2 py-0.5 rounded', ticketStats.closed.trend === 'UP' ? 'bg-green-50 text-green-600 dark:bg-green-400/10 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400']">
                            <i :class="[ticketStats.closed.trend === 'UP' ? 'pi pi-arrow-up' : 'pi pi-arrow-down', 'text-[10px] mr-1']"></i>
                            {{ ticketStats.closed.change }}%
                        </span>
                        <span class="text-xs text-surface-400 dark:text-surface-500">vs last period</span>
                    </div>
                </div>
            </div>

            <!-- KPI Cards Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Resolution Efficiency -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Resolution Efficiency</h3>
                        <Button icon="pi pi-ellipsis-h" text rounded severity="secondary" size="small" />
                    </div>

                    <div class="flex flex-col items-center justify-center py-4">
                        <div class="relative w-40 h-40 mb-6">
                            <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" class="text-surface-100 dark:text-surface-800" stroke-width="8" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" :class="resolutionRate >= 70 ? 'text-green-500' : resolutionRate >= 50 ? 'text-orange-500' : 'text-red-500'" stroke-width="8" stroke-dasharray="251.2" :stroke-dashoffset="251.2 - (251.2 * parseInt(resolutionRate)) / 100" stroke-linecap="round" />
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">{{ resolutionRate }}%</span>
                                <span class="text-xs text-surface-500 dark:text-surface-400 mt-1 uppercase tracking-wider">Resolved</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 w-full">
                            <div class="text-center p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                                <div class="text-xs text-surface-500 dark:text-surface-400 mb-1 uppercase tracking-wider">Total Tickets</div>
                                <div class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ totalTickets }}</div>
                            </div>
                            <div class="text-center p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                                <div class="text-xs text-surface-500 dark:text-surface-400 mb-1 uppercase tracking-wider">Closed</div>
                                <div class="text-xl font-bold text-surface-900 dark:text-surface-0">{{ ticketStats.closed.count }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Average Resolution Time -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Avg Resolution Time</h3>
                        <Button icon="pi pi-clock" text rounded severity="secondary" size="small" class="cursor-default" />
                    </div>

                    <div class="flex flex-col items-center justify-center py-4">
                        <div class="text-5xl font-bold text-surface-900 dark:text-surface-0 mb-8">{{ avgResolutionTime }}</div>

                        <div class="w-full space-y-4">
                            <div v-for="category in categoriesData.slice(0, 3)" :key="category.id">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm font-medium text-surface-700 dark:text-surface-300">{{ category.name }}</span>
                                    <span class="text-sm font-medium text-surface-900 dark:text-surface-100">{{ category.targetResolutionTime }}h target</span>
                                </div>
                                <ProgressBar :value="(category.targetResolutionTime / 72) * 100" :showValue="false" style="height: 6px" class="bg-surface-100 dark:bg-surface-800" :pt="{ value: { class: 'bg-primary-500' } }" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Department Overview -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Departments</h3>
                        <Button label="View All" text size="small" @click="navigateTo('/users/employees')" />
                    </div>

                    <div class="space-y-0 overflow-y-auto max-h-[22rem]">
                        <div v-for="(dept, index) in departmentsData" :key="dept.id" class="flex items-center justify-between p-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 rounded-lg transition-colors cursor-pointer border-b border-surface-100 dark:border-surface-800 last:border-0" @click="navigateTo('/users/employees')">
                            <div>
                                <h4 class="font-medium text-surface-900 dark:text-surface-0 text-sm mb-0.5">{{ dept.name }}</h4>
                                <p class="text-xs text-surface-500 dark:text-surface-400">{{ dept.teamSize }} members</p>
                            </div>
                            <Button icon="pi pi-chevron-right" text rounded size="small" severity="secondary" class="h-8 w-8" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Department Workload -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm flex flex-col">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Department Workload</h3>
                        <Button icon="pi pi-ellipsis-v" text rounded severity="secondary" size="small" />
                    </div>
                    <div class="flex-grow min-h-[300px] relative">
                        <Chart type="bar" :data="departmentChartData" :options="departmentChartOptions" class="h-full w-full" />
                    </div>
                </div>

                <!-- Ticket Status Distribution -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm flex flex-col">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Ticket Status</h3>
                        <Button icon="pi pi-ellipsis-v" text rounded severity="secondary" size="small" />
                    </div>
                    <div class="flex-grow flex items-center justify-center min-h-[300px] relative">
                        <Chart type="doughnut" :data="statusData" :options="statusOptions" class="w-full h-full" />
                    </div>
                </div>
            </div>

            <!-- Bottom Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- Priority Distribution -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm flex flex-col">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Priority Breakdown</h3>
                        <Button icon="pi pi-ellipsis-v" text rounded severity="secondary" size="small" />
                    </div>
                    <div class="flex-grow flex items-center justify-center min-h-[300px] relative">
                        <Chart type="pie" :data="priorityData" :options="priorityOptions" class="w-full h-full" />
                    </div>
                </div>

                <!-- Category Distribution -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm flex flex-col">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Tickets by Category</h3>
                        <Button icon="pi pi-ellipsis-v" text rounded severity="secondary" size="small" />
                    </div>
                    <div class="flex-grow min-h-[300px] relative">
                        <Chart type="bar" :data="categoryChartData" :options="categoryChartOptions" class="h-full w-full" />
                    </div>
                </div>

                <!-- Top Performers -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Top Performers</h3>
                        <Button icon="pi pi-external-link" text rounded size="small" @click="navigateTo('/users/employees')" />
                    </div>

                    <div class="space-y-0">
                        <div v-if="topPerformers.length === 0" class="text-center py-8 text-surface-600 dark:text-surface-400">
                            <i class="pi pi-inbox text-4xl mb-3"></i>
                            <p>No performance data available</p>
                        </div>

                        <div v-for="(agent, index) in topPerformers" :key="agent.id" class="flex items-center gap-3 p-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 rounded-lg transition-colors border-b border-surface-100 dark:border-surface-800 last:border-0 cursor-pointer" @click="navigateTo('/users/employees')">
                            <div class="relative flex-shrink-0">
                                <img v-if="!imageErrorMap[`agent-${agent.id}`]" :src="agent.avatar" :alt="agent.name" class="w-10 h-10 rounded-full border border-surface-200 dark:border-surface-700" @error="onImageError(`agent-${agent.id}`)" />
                                <div v-else class="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center border border-surface-200 dark:border-surface-700">
                                    <i class="pi pi-user text-surface-500 text-lg"></i>
                                </div>
                                <div :class="['absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-white rounded-full font-bold text-[10px] shadow-sm', index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600']" v-if="index < 3">
                                    {{ index + 1 }}
                                </div>
                            </div>

                            <div class="flex-1 min-w-0">
                                <h4 class="font-medium text-surface-900 dark:text-surface-0 truncate text-sm">{{ agent.name }}</h4>
                                <p class="text-xs text-surface-500 dark:text-surface-400 truncate">{{ agent.department }}</p>
                            </div>

                            <div class="text-right flex-shrink-0">
                                <div class="text-lg font-bold text-primary">{{ agent.resolvedCount }}</div>
                                <div class="text-[10px] text-surface-500 dark:text-surface-400 uppercase tracking-wide">resolved</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Branch & Activity Row -->
            <div class="grid grid-cols-1 gap-6">
                <!-- Recent Activity -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Recent Activity</h3>
                        <Button label="View All" icon="pi pi-arrow-right" iconPos="right" text size="small" @click="navigateTo('/tickets')" />
                    </div>

                    <div class="overflow-x-auto">
                        <Timeline :value="recentActivity" :layout="timelineLayout" align="top" :pt="{ marker: { class: 'border-0' }, connector: { class: 'bg-surface-200 dark:bg-surface-700' } }">
                            <template #marker="slotProps">
                                <span class="flex w-10 h-10 items-center justify-center rounded-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 z-10">
                                    <i :class="[getActivityIcon(slotProps.item.type), getActivityIconColor(slotProps.item.type), 'text-lg']"></i>
                                </span>
                            </template>
                            <template #content="slotProps">
                                <div class="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-lg border border-surface-100 dark:border-surface-800 max-w-sm hover:shadow-sm transition-shadow">
                                    <div class="font-medium text-surface-900 dark:text-surface-0 text-sm mb-1">{{ slotProps.item.user }}</div>
                                    <div class="text-sm text-surface-600 dark:text-surface-400 mb-2">{{ slotProps.item.description }}</div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-surface-500 dark:text-surface-500">{{ formatTime(slotProps.item.time) }}</span>
                                        <Badge v-if="slotProps.item.ticket" :value="slotProps.item.ticket" severity="secondary" size="small" class="font-mono text-[10px]" />
                                    </div>
                                </div>
                            </template>
                        </Timeline>
                    </div>
                </div>
            </div>

            <!-- Current Tickets Table -->
            <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-6 rounded-xl shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">Active Tickets</h3>
                    <Button label="View All Tickets" icon="pi pi-arrow-right" iconPos="right" size="small" @click="navigateTo('/tickets')" />
                </div>

                <DataTable :value="ticketsData.tickets" stripedRows responsiveLayout="scroll" :pt="{ thead: { class: 'bg-surface-50 dark:bg-surface-800' } }">
                    <Column field="id" header="ID" style="min-width: 80px">
                        <template #body="slotProps">
                            <span class="font-mono text-sm font-medium text-surface-600 dark:text-surface-400">#{{ slotProps.data.id }}</span>
                        </template>
                    </Column>

                    <Column field="title" header="Title" style="min-width: 250px">
                        <template #body="slotProps">
                            <div class="font-medium text-surface-900 dark:text-surface-0 text-sm hover:text-primary cursor-pointer transition-colors">{{ slotProps.data.title }}</div>
                            <div class="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{{ slotProps.data.categoryName }}</div>
                        </template>
                    </Column>

                    <Column field="status" header="Status" style="min-width: 120px">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.status" :severity="getStatusBadgeSeverity(slotProps.data.status)" size="small" />
                        </template>
                    </Column>

                    <Column field="priority" header="Priority" style="min-width: 120px">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.priority" :severity="getPriorityBadgeSeverity(slotProps.data.priority)" size="small" />
                        </template>
                    </Column>

                    <Column field="assignedUserName" header="Assigned To" style="min-width: 180px">
                        <template #body="slotProps">
                            <div class="flex items-center gap-2">
                                <img
                                    v-if="!imageErrorMap[`ticket-${slotProps.data.id}`]"
                                    :src="`https://avatar.iran.liara.run/public/50?name=${slotProps.data.assignedUserName}`"
                                    :alt="slotProps.data.assignedUserName"
                                    class="w-6 h-6 rounded-full border border-surface-200 dark:border-surface-700"
                                    @error="onImageError(`ticket-${slotProps.data.id}`)"
                                />
                                <div v-else class="w-6 h-6 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center border border-surface-200 dark:border-surface-700">
                                    <i class="pi pi-user text-surface-500 text-[10px]"></i>
                                </div>
                                <span class="text-sm text-surface-700 dark:text-surface-300">{{ slotProps.data.assignedUserName }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="createdAt" header="Created" style="min-width: 150px">
                        <template #body="slotProps">
                            <span class="text-sm text-surface-600 dark:text-surface-400">{{ formatTime(new Date(slotProps.data.createdAt)) }}</span>
                        </template>
                    </Column>

                    <Column header="Actions" style="min-width: 80px" bodyClass="text-right">
                        <template #body>
                            <Button icon="pi pi-angle-right" text rounded size="small" severity="secondary" @click="navigateTo('/tickets')" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Scoped styles are minimized; using Utility classes in template primarily to avoid @apply lints. */

/* Simple fade animation for cards */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.grid > div {
    animation: fadeInUp 0.4s ease-out backwards;
}

/* Staggered delays */
.grid > div:nth-child(1) { animation-delay: 0.05s; }
.grid > div:nth-child(2) { animation-delay: 0.1s; }
.grid > div:nth-child(3) { animation-delay: 0.15s; }
.grid > div:nth-child(4) { animation-delay: 0.2s; }
</style>
