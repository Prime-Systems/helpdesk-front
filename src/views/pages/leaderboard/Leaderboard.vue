<script setup>
import { DepartmentService } from '@/service/DepartmentService';
import { LeaderboardService } from '@/service/LeaderboardService';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';

const toast = useToast();
const loading = ref(true);
const timeRangeFilter = ref('month');
const departmentFilter = ref(null);
const selectedAgent = ref(null);
const showAgentDetailsDialog = ref(false);
const selectedMetric = ref('volume'); // Default to ticket volume
const imageErrors = ref({}); // Track failed images

// Handle image load errors
const onImageError = (agentId) => {
    imageErrors.value[agentId] = true;
};

// Time range options
const timeRanges = [
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'All Time', value: 'all' }
];

// Department options
const departments = ref([{ name: 'All Departments', code: null }]);

// Agent data from API
const agents = ref([]);

// Metric options for quick selection
const metricOptions = [
    { key: 'volume', label: 'Tickets Resolved', icon: 'pi-ticket', color: 'bg-green-500' },
    { key: 'satisfaction', label: 'Satisfaction', icon: 'pi-star-fill', color: 'bg-yellow-500' },
    { key: 'resolution', label: 'Resolution Time', icon: 'pi-clock', color: 'bg-blue-500' },
    { key: 'firstResponse', label: 'Response Time', icon: 'pi-reply', color: 'bg-purple-500' }
];

// Sorted agents based on selected metric
const sortedAgents = computed(() => {
    const metric = selectedMetric.value;
    // For time-based metrics, lower is better; for volume/satisfaction, higher is better
    const ascending = metric === 'resolution' || metric === 'firstResponse';

    return [...agents.value].sort((a, b) => {
        const aVal = a.metrics[metric] || 0;
        const bVal = b.metrics[metric] || 0;
        return ascending ? aVal - bVal : bVal - aVal;
    });
});

// Top 3 agents for podium
const topAgents = computed(() => sortedAgents.value.slice(0, 3));

// Remaining agents for table (after top 3)
const remainingAgents = computed(() => sortedAgents.value.slice(3));

// Format time value
const formatTime = (value, isMinutes = false) => {
    if (!value || isNaN(value)) return '-';
    if (isMinutes) {
        if (value < 60) return `${Math.round(value)}m`;
        return `${Math.floor(value / 60)}h ${Math.round(value % 60)}m`;
    } else {
        if (value < 1) return `${Math.round(value * 60)}m`;
        if (value < 24) return `${Math.floor(value)}h ${Math.round((value % 1) * 60)}m`;
        return `${Math.floor(value / 24)}d`;
    }
};

// Format metric value based on type
const formatMetric = (agent, metricKey) => {
    const value = agent.metrics[metricKey];
    if (value === undefined || value === null) return '-';

    switch (metricKey) {
        case 'volume':
            return value.toString();
        case 'satisfaction':
            return value.toFixed(1);
        case 'resolution':
            return formatTime(value);
        case 'firstResponse':
            return formatTime(value, true);
        default:
            return value;
    }
};

// Get primary metric value for display
const getPrimaryMetric = (agent) => formatMetric(agent, selectedMetric.value);

// Get medal color for podium
const getMedalColor = (position) => {
    switch (position) {
        case 1:
            return 'from-yellow-400 to-yellow-600'; // Gold
        case 2:
            return 'from-gray-300 to-gray-500'; // Silver
        case 3:
            return 'from-amber-600 to-amber-800'; // Bronze
        default:
            return 'from-gray-200 to-gray-400';
    }
};

const getMedalBg = (position) => {
    switch (position) {
        case 1:
            return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
        case 2:
            return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
        case 3:
            return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
        default:
            return 'bg-surface-50 dark:bg-surface-800';
    }
};

// Transform API response
const transformApiData = (apiData) => {
    return apiData.rankings.map((agent) => ({
        id: agent.userId,
        name: agent.name,
        avatar: agent.profilePictureUrl || `https://avatar.iran.liara.run/public/50?name=${encodeURIComponent(agent.name)}`,
        department: agent.department || 'General',
        metrics: {
            resolution: agent.metrics?.resolutionTime || 0,
            satisfaction: agent.metrics?.customerSatisfaction || 0,
            volume: agent.metrics?.ticketVolume || 0,
            firstResponse: agent.metrics?.firstResponseTime || 0
        }
    }));
};

// Fetch leaderboard data
const fetchLeaderboardData = async () => {
    loading.value = true;
    try {
        const response = await LeaderboardService.getLeaderboard({
            metric: selectedMetric.value,
            period: timeRangeFilter.value,
            departmentId: departmentFilter.value,
            limit: 50
        });

        if (response && response.rankings) {
            agents.value = transformApiData(response);
        } else {
            agents.value = [];
        }
    } catch (error) {
        console.error('Leaderboard API failed:', error.message);
        toast.add({ severity: 'warn', summary: 'Note', detail: 'Could not load leaderboard data', life: 3000 });
        agents.value = [];
    } finally {
        loading.value = false;
    }
};

// Fetch departments
const fetchDepartments = async () => {
    try {
        const deptData = await DepartmentService.getDepartments();
        departments.value = [{ name: 'All Departments', code: null }, ...deptData.map((d) => ({ name: d.name, code: d.id }))];
    } catch (error) {
        console.warn('Using default departments');
    }
};

// Show agent details
const showAgentDetails = (agent) => {
    selectedAgent.value = agent;
    showAgentDetailsDialog.value = true;
};

onMounted(async () => {
    await fetchDepartments();
    await fetchLeaderboardData();
});

watch([timeRangeFilter, departmentFilter, selectedMetric], () => {
    fetchLeaderboardData();
});
</script>

<template>
    <div class="min-h-screen">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-1">Leaderboard</h1>
                    <p class="text-surface-600 dark:text-surface-400">Top performing team members</p>
                </div>

                <div class="flex flex-wrap gap-2">
                    <Dropdown v-model="timeRangeFilter" :options="timeRanges" optionLabel="label" optionValue="value" class="w-40" />
                    <Dropdown v-model="departmentFilter" :options="departments" optionLabel="name" optionValue="code" placeholder="All Depts" class="w-44" />
                </div>
            </div>
        </div>

        <!-- Metric Selector Pills -->
        <div class="flex flex-wrap gap-2 mb-8">
            <button
                v-for="metric in metricOptions"
                :key="metric.key"
                @click="selectedMetric = metric.key"
                :class="[
                    'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                    selectedMetric === metric.key ? 'bg-primary text-white shadow-md' : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                ]"
            >
                <i :class="['pi', metric.icon, 'text-xs']"></i>
                {{ metric.label }}
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <!-- Empty State -->
        <div v-else-if="agents.length === 0" class="text-center py-20">
            <i class="pi pi-users text-6xl text-surface-300 dark:text-surface-600 mb-4"></i>
            <h3 class="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">No Data Available</h3>
            <p class="text-surface-500 dark:text-surface-400">No performance data found for the selected filters</p>
        </div>

        <div v-else>
            <!-- Top 3 Podium -->
            <div class="mb-10">
                <div class="flex justify-center items-end gap-4 md:gap-6">
                    <!-- 2nd Place -->
                    <div v-if="topAgents[1]" class="flex flex-col items-center w-28 md:w-36">
                        <div :class="['relative p-4 rounded-2xl border-2 transition-all hover:scale-105 cursor-pointer w-full', getMedalBg(2)]" @click="showAgentDetails(topAgents[1])">
                            <div class="flex flex-col items-center">
                                <div class="relative mb-2">
                                    <img
                                        v-if="!imageErrors[topAgents[1].id]"
                                        :src="topAgents[1].avatar"
                                        :alt="topAgents[1].name"
                                        class="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-white dark:border-surface-800 shadow-lg"
                                        @error="onImageError(topAgents[1].id)"
                                    />
                                    <div v-else class="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-white dark:border-surface-800 shadow-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                        <i class="pi pi-user text-xl text-surface-500 dark:text-surface-400"></i>
                                    </div>
                                    <div :class="['absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow bg-gradient-to-br', getMedalColor(2)]">2</div>
                                </div>
                                <h4 class="font-semibold text-sm text-center text-surface-900 dark:text-surface-0 truncate w-full">{{ topAgents[1].name.split(' ')[0] }}</h4>
                                <p class="text-xs text-surface-500 dark:text-surface-400 truncate w-full text-center">{{ topAgents[1].department }}</p>
                                <div class="mt-2 text-lg font-bold text-surface-900 dark:text-surface-0">{{ getPrimaryMetric(topAgents[1]) }}</div>
                            </div>
                        </div>
                        <div class="w-full h-16 md:h-20 bg-gradient-to-t from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-b-lg mt-1"></div>
                    </div>

                    <!-- 1st Place (Center, Elevated) -->
                    <div v-if="topAgents[0]" class="flex flex-col items-center w-32 md:w-44 -mb-4">
                        <div :class="['relative p-5 rounded-2xl border-2 transition-all hover:scale-105 cursor-pointer w-full shadow-xl', getMedalBg(1)]" @click="showAgentDetails(topAgents[0])">
                            <div class="flex flex-col items-center">
                                <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <i class="pi pi-crown text-yellow-500 text-2xl drop-shadow-lg"></i>
                                </div>
                                <div class="relative mb-2 mt-2">
                                    <img
                                        v-if="!imageErrors[topAgents[0].id]"
                                        :src="topAgents[0].avatar"
                                        :alt="topAgents[0].name"
                                        class="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-yellow-400 shadow-lg"
                                        @error="onImageError(topAgents[0].id)"
                                    />
                                    <div v-else class="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-yellow-400 shadow-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                        <i class="pi pi-user text-2xl text-surface-500 dark:text-surface-400"></i>
                                    </div>
                                    <div :class="['absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow bg-gradient-to-br', getMedalColor(1)]">1</div>
                                </div>
                                <h4 class="font-bold text-base text-center text-surface-900 dark:text-surface-0 truncate w-full">{{ topAgents[0].name.split(' ')[0] }}</h4>
                                <p class="text-xs text-surface-500 dark:text-surface-400 truncate w-full text-center">{{ topAgents[0].department }}</p>
                                <div class="mt-2 text-2xl font-bold text-surface-900 dark:text-surface-0">{{ getPrimaryMetric(topAgents[0]) }}</div>
                            </div>
                        </div>
                        <div class="w-full h-24 md:h-28 bg-gradient-to-t from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-700 rounded-b-lg mt-1"></div>
                    </div>

                    <!-- 3rd Place -->
                    <div v-if="topAgents[2]" class="flex flex-col items-center w-28 md:w-36">
                        <div :class="['relative p-4 rounded-2xl border-2 transition-all hover:scale-105 cursor-pointer w-full', getMedalBg(3)]" @click="showAgentDetails(topAgents[2])">
                            <div class="flex flex-col items-center">
                                <div class="relative mb-2">
                                    <img
                                        v-if="!imageErrors[topAgents[2].id]"
                                        :src="topAgents[2].avatar"
                                        :alt="topAgents[2].name"
                                        class="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-white dark:border-surface-800 shadow-lg"
                                        @error="onImageError(topAgents[2].id)"
                                    />
                                    <div v-else class="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-white dark:border-surface-800 shadow-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                        <i class="pi pi-user text-xl text-surface-500 dark:text-surface-400"></i>
                                    </div>
                                    <div :class="['absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow bg-gradient-to-br', getMedalColor(3)]">3</div>
                                </div>
                                <h4 class="font-semibold text-sm text-center text-surface-900 dark:text-surface-0 truncate w-full">{{ topAgents[2].name.split(' ')[0] }}</h4>
                                <p class="text-xs text-surface-500 dark:text-surface-400 truncate w-full text-center">{{ topAgents[2].department }}</p>
                                <div class="mt-2 text-lg font-bold text-surface-900 dark:text-surface-0">{{ getPrimaryMetric(topAgents[2]) }}</div>
                            </div>
                        </div>
                        <div class="w-full h-12 md:h-14 bg-gradient-to-t from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800 rounded-b-lg mt-1"></div>
                    </div>
                </div>
            </div>

            <!-- Full Rankings Table -->
            <div class="bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm">
                <div class="p-4 border-b border-surface-200 dark:border-surface-700">
                    <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0">All Rankings</h2>
                </div>

                <DataTable
                    :value="sortedAgents"
                    :paginator="true"
                    :rows="10"
                    :rowsPerPageOptions="[10, 20, 50]"
                    :rowHover="true"
                    responsiveLayout="scroll"
                    class="p-datatable-sm"
                    @row-click="(e) => showAgentDetails(e.data)"
                    :pt="{ bodyRow: { class: 'cursor-pointer' } }"
                >
                    <Column header="Rank" style="width: 4rem">
                        <template #body="{ index }">
                            <div
                                :class="[
                                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                                    index === 0
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                                        : index === 1
                                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                          : index === 2
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                                            : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
                                ]"
                            >
                                {{ index + 1 }}
                            </div>
                        </template>
                    </Column>

                    <Column header="Employee" style="min-width: 14rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-3">
                                <img v-if="!imageErrors[data.id]" :src="data.avatar" :alt="data.name" class="w-10 h-10 rounded-full" @error="onImageError(data.id)" />
                                <div v-else class="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                    <i class="pi pi-user text-surface-500 dark:text-surface-400"></i>
                                </div>
                                <div>
                                    <div class="font-medium text-surface-900 dark:text-surface-0">{{ data.name }}</div>
                                    <div class="text-xs text-surface-500 dark:text-surface-400">{{ data.department }}</div>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column header="Tickets" style="width: 6rem">
                        <template #body="{ data }">
                            <span class="font-semibold text-surface-900 dark:text-surface-0">{{ data.metrics.volume || 0 }}</span>
                        </template>
                    </Column>

                    <Column header="Satisfaction" style="width: 7rem">
                        <template #body="{ data }">
                            <div class="flex items-center gap-1">
                                <i class="pi pi-star-fill text-yellow-500 text-xs"></i>
                                <span class="font-semibold text-surface-900 dark:text-surface-0">{{ (data.metrics.satisfaction || 0).toFixed(1) }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column header="Avg Resolution" style="width: 8rem">
                        <template #body="{ data }">
                            <span class="text-surface-700 dark:text-surface-300">{{ formatTime(data.metrics.resolution) }}</span>
                        </template>
                    </Column>

                    <Column header="First Response" style="width: 8rem">
                        <template #body="{ data }">
                            <span class="text-surface-700 dark:text-surface-300">{{ formatTime(data.metrics.firstResponse, true) }}</span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <Dialog v-model:visible="showAgentDetailsDialog" :header="selectedAgent?.name" :modal="true" :style="{ width: '500px', maxWidth: '95vw' }">
            <div v-if="selectedAgent" class="flex flex-col items-center">
                <img v-if="!imageErrors[selectedAgent.id]" :src="selectedAgent.avatar" :alt="selectedAgent.name" class="w-24 h-24 rounded-full mb-4 border-4 border-primary shadow-lg" @error="onImageError(selectedAgent.id)" />
                <div v-else class="w-24 h-24 rounded-full mb-4 border-4 border-primary shadow-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                    <i class="pi pi-user text-3xl text-surface-500 dark:text-surface-400"></i>
                </div>
                <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0 mb-1">{{ selectedAgent.name }}</h3>
                <p class="text-surface-600 dark:text-surface-400 mb-6">{{ selectedAgent.department }}</p>

                <div class="grid grid-cols-2 gap-4 w-full">
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ selectedAgent.metrics.volume || 0 }}</div>
                        <div class="text-xs text-surface-500 dark:text-surface-400 mt-1">Tickets Resolved</div>
                    </div>
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 text-center">
                        <div class="flex items-center justify-center gap-1">
                            <i class="pi pi-star-fill text-yellow-500"></i>
                            <span class="text-2xl font-bold text-surface-900 dark:text-surface-0">{{ (selectedAgent.metrics.satisfaction || 0).toFixed(1) }}</span>
                        </div>
                        <div class="text-xs text-surface-500 dark:text-surface-400 mt-1">Satisfaction</div>
                    </div>
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ formatTime(selectedAgent.metrics.resolution) }}</div>
                        <div class="text-xs text-surface-500 dark:text-surface-400 mt-1">Avg Resolution</div>
                    </div>
                    <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 text-center">
                        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ formatTime(selectedAgent.metrics.firstResponse, true) }}</div>
                        <div class="text-xs text-surface-500 dark:text-surface-400 mt-1">First Response</div>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
:deep(.p-datatable .p-datatable-tbody > tr) {
    transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: var(--surface-50) !important;
}

:deep(.dark .p-datatable .p-datatable-tbody > tr:hover) {
    background-color: var(--surface-800) !important;
}
</style>
