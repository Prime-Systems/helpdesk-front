<script setup>
import { EmployeeService } from '@/service/EmployeeService';
import { ReportService } from '@/service/ReportService';
import { FilterMatchMode } from '@primevue/core/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const employees = ref([]);
const selectedEmployee = ref(null);
const dateRange = ref([new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date()]);
const loading = ref(false);
const generateDialogVisible = ref(false);
const reportData = ref(null);
const selectedMetrics = ref(['ticketsResolved', 'avgResolutionTime', 'customerSatisfaction', 'responseTime']);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const imageErrors = ref({});

// Handle image load errors
const onImageError = (key) => {
    imageErrors.value[key] = true;
};

const availableMetrics = ref([
    { name: 'Tickets Resolved', key: 'ticketsResolved' },
    { name: 'Average Resolution Time', key: 'avgResolutionTime' },
    { name: 'Customer Satisfaction', key: 'customerSatisfaction' },
    { name: 'Response Time', key: 'responseTime' },
    { name: 'First Contact Resolution Rate', key: 'firstContactResolution' },
    { name: 'Knowledge Base Contributions', key: 'kbContributions' }
]);

const recentReports = ref([]);

// Fetch employees and recent reports
// Fetch employees and recent reports
const fetchData = async () => {
    loading.value = true;

    // Fetch Employees
    try {
        const employeesData = await EmployeeService.getEmployees();
        // Map API response to include 'name' property for Dropdown
        employees.value = employeesData.map((e) => ({
            ...e,
            name: e.name || (e.firstName && e.lastName ? `${e.firstName} ${e.lastName}` : e.email)
        }));
    } catch (error) {
        console.warn('Employees API not available, using fallback:', error.message);
        employees.value = [
            { id: 1, name: 'John Doe', employeeId: 'EMP-123456', role: 'EMPLOYEE' },
            { id: 2, name: 'Jane Smith', employeeId: 'EMP-789012', role: 'MANAGER' },
            { id: 3, name: 'Bob Wilson', employeeId: 'EMP-456789', role: 'EMPLOYEE' }
        ];
    }

    // Fetch Reports
    try {
        const reportsData = await ReportService.getReports({ size: 20 });

        // Transform reports data if available
        if (reportsData && reportsData.reports) {
            recentReports.value = reportsData.reports.map((report) => ({
                id: report.id,
                employeeName: report.employeeName,
                employeeId: report.employeeId,
                startDate: new Date(report.startDate),
                endDate: new Date(report.endDate),
                generatedDate: new Date(report.generatedDate),
                metrics: report.metrics || {}
            }));
        } else if (reportsData && Array.isArray(reportsData.content)) {
            // Handle paginated response structure if backend uses Spring Data REST style
            recentReports.value = reportsData.content.map((report) => ({
                id: report.id,
                employeeName: report.employeeName,
                employeeId: report.employeeId,
                startDate: new Date(report.startDate),
                endDate: new Date(report.endDate),
                generatedDate: new Date(report.generatedDate),
                metrics: report.metrics || {}
            }));
        }
    } catch (error) {
        console.warn('Reports API not available, using fallback:', error.message);
        recentReports.value = [
            {
                id: 1,
                employeeName: 'John Doe',
                employeeId: 'EMP-123456',
                startDate: new Date(2025, 0, 1),
                endDate: new Date(2025, 2, 31),
                generatedDate: new Date(2025, 3, 2),
                metrics: {
                    ticketsResolved: 127,
                    avgResolutionTime: '3h 45m',
                    customerSatisfaction: 4.5,
                    responseTime: '25m'
                }
            },
            {
                id: 2,
                employeeName: 'Jane Smith',
                employeeId: 'EMP-789012',
                startDate: new Date(2025, 1, 1),
                endDate: new Date(2025, 2, 29),
                generatedDate: new Date(2025, 3, 1),
                metrics: {
                    ticketsResolved: 143,
                    avgResolutionTime: '2h 55m',
                    customerSatisfaction: 4.8,
                    responseTime: '18m'
                }
            }
        ];
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchData();
});

// Date formatting helper
const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// Format date for API (YYYY-MM-DD)
const formatDateForApi = (date) => {
    return date.toISOString().split('T')[0];
};

// Generate the report
const generateReport = async () => {
    if (!selectedEmployee.value || !dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Please select an employee and date range', life: 3000 });
        return;
    }

    loading.value = true;

    try {
        // Try to fetch from API
        const apiReport = await ReportService.generateEmployeeReport({
            employeeId: selectedEmployee.value.id,
            startDate: formatDateForApi(dateRange.value[0]),
            endDate: formatDateForApi(dateRange.value[1]),
            metrics: selectedMetrics.value
        });

        reportData.value = {
            employee: selectedEmployee.value,
            startDate: dateRange.value[0],
            endDate: dateRange.value[1],
            generatedDate: new Date(apiReport.generatedDate),
            metrics: apiReport.metrics,
            performanceTrend: apiReport.performanceTrend,
            categoryBreakdown: apiReport.categoryBreakdown
        };

        // Add to recent reports
        const newReport = {
            id: apiReport.id || recentReports.value.length + 1,
            employeeName: selectedEmployee.value.name || `${selectedEmployee.value.firstName} ${selectedEmployee.value.lastName}`,
            employeeId: selectedEmployee.value.employeeId || selectedEmployee.value.id,
            startDate: dateRange.value[0],
            endDate: dateRange.value[1],
            generatedDate: new Date(),
            metrics: reportData.value.metrics
        };

        recentReports.value = [newReport, ...recentReports.value];

        toast.add({ severity: 'success', summary: 'Success', detail: 'Performance report generated', life: 3000 });
    } catch (error) {
        console.warn('Report API not available, using mock data:', error.message);

        // Fallback to mock data
        reportData.value = {
            employee: selectedEmployee.value,
            startDate: dateRange.value[0],
            endDate: dateRange.value[1],
            generatedDate: new Date(),
            metrics: {
                ticketsResolved: Math.floor(Math.random() * 100) + 50,
                avgResolutionTime: `${Math.floor(Math.random() * 5) + 1}h ${Math.floor(Math.random() * 60)}m`,
                customerSatisfaction: (Math.random() * 2 + 3).toFixed(1),
                responseTime: `${Math.floor(Math.random() * 30) + 10}m`,
                firstContactResolution: `${Math.floor(Math.random() * 30) + 60}%`,
                kbContributions: Math.floor(Math.random() * 10)
            },
            performanceTrend: [
                { month: 'Jan', resolved: Math.floor(Math.random() * 30) + 20 },
                { month: 'Feb', resolved: Math.floor(Math.random() * 30) + 20 },
                { month: 'Mar', resolved: Math.floor(Math.random() * 30) + 20 },
                { month: 'Apr', resolved: Math.floor(Math.random() * 30) + 20 },
                { month: 'May', resolved: Math.floor(Math.random() * 30) + 20 },
                { month: 'Jun', resolved: Math.floor(Math.random() * 30) + 20 }
            ],
            categoryBreakdown: [
                { category: 'Hardware', count: Math.floor(Math.random() * 40) + 10 },
                { category: 'Software', count: Math.floor(Math.random() * 40) + 10 },
                { category: 'Network', count: Math.floor(Math.random() * 30) + 5 },
                { category: 'Security', count: Math.floor(Math.random() * 20) + 5 },
                { category: 'Other', count: Math.floor(Math.random() * 15) + 5 }
            ]
        };

        // Add to recent reports
        const newReport = {
            id: recentReports.value.length + 1,
            employeeName: selectedEmployee.value.name || `${selectedEmployee.value.firstName} ${selectedEmployee.value.lastName}`,
            employeeId: selectedEmployee.value.employeeId || selectedEmployee.value.id,
            startDate: dateRange.value[0],
            endDate: dateRange.value[1],
            generatedDate: new Date(),
            metrics: reportData.value.metrics
        };

        recentReports.value = [newReport, ...recentReports.value];

        toast.add({ severity: 'success', summary: 'Success', detail: 'Performance report generated (demo)', life: 3000 });
    } finally {
        loading.value = false;
        generateDialogVisible.value = false;
    }
};

// Performance trend chart data
const performanceTrendData = computed(() => {
    if (!reportData.value || !reportData.value.performanceTrend) return null;

    return {
        labels: reportData.value.performanceTrend.map((item) => item.month),
        datasets: [
            {
                label: 'Tickets Resolved',
                data: reportData.value.performanceTrend.map((item) => item.resolved),
                fill: false,
                backgroundColor: '#42A5F5',
                borderColor: '#42A5F5',
                tension: 0.4
            }
        ]
    };
});

// Category breakdown chart data
const categoryBreakdownData = computed(() => {
    if (!reportData.value || !reportData.value.categoryBreakdown) return null;

    return {
        labels: reportData.value.categoryBreakdown.map((item) => item.category),
        datasets: [
            {
                data: reportData.value.categoryBreakdown.map((item) => item.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }
        ]
    };
});

// Chart options
const chartOptions = {
    plugins: {
        legend: {
            position: 'bottom'
        }
    }
};

// View a specific report from history
const viewReport = async (report) => {
    loading.value = true;
    try {
        // Fetch full report details from API
        const fullReport = await ReportService.getReportById(report.id);

        reportData.value = {
            employee: {
                name: fullReport.employeeName || report.employeeName,
                employeeId: fullReport.employeeId || report.employeeId,
                // Ensure name is properly formatted if missing
                ...(!fullReport.employeeName && report.employeeName ? { name: report.employeeName } : {})
            },
            startDate: new Date(fullReport.startDate),
            endDate: new Date(fullReport.endDate),
            generatedDate: new Date(fullReport.generatedDate),
            metrics: fullReport.metrics,
            performanceTrend: fullReport.performanceTrend || [],
            categoryBreakdown: fullReport.categoryBreakdown || []
        };
    } catch (error) {
        console.error('Failed to load report details:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load report details', life: 3000 });
    } finally {
        loading.value = false;
    }
};

// Export to PDF
const exportToPdf = () => {
    try {
        if (!reportData.value) return;

        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text('Employee Performance Report', 14, 22);

        // Safe access to employee details
        const emp = reportData.value.employee || {};
        const empName = emp.name || (emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : 'Unknown');
        const empId = emp.employeeId || emp.id || 'N/A';

        // Add employee info
        doc.setFontSize(12);
        doc.text(`Employee: ${empName} (${empId})`, 14, 32);
        doc.text(`Period: ${formatDate(reportData.value.startDate)} to ${formatDate(reportData.value.endDate)}`, 14, 38);
        doc.text(`Generated on: ${formatDate(reportData.value.generatedDate)}`, 14, 44);

        // Add metrics table
        const metricsData = [];
        if (reportData.value.metrics) {
            Object.entries(reportData.value.metrics).forEach(([key, value]) => {
                const metricName = availableMetrics.value.find((m) => m.key === key)?.name || key;
                metricsData.push([metricName, value ? value.toString() : '0']);
            });
        }

        doc.text('Performance Metrics', 14, 54);

        // Check for autoTable support
        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                head: [['Metric', 'Value']],
                body: metricsData,
                startY: 56,
                margin: { top: 60 },
                styles: { cellPadding: 3 },
                headStyles: { fillColor: [66, 139, 202] }
            });
        } else {
            // Fallback if autoTable not loaded
            let yPos = 60;
            metricsData.forEach((row) => {
                doc.text(`${row[0]}: ${row[1]}`, 14, yPos);
                yPos += 7;
            });
        }

        doc.save(`performance_report_${empId}_${formatDate(reportData.value.endDate)}.pdf`);

        toast.add({ severity: 'success', summary: 'Success', detail: 'Report exported to PDF', life: 3000 });
    } catch (error) {
        console.error('PDF Export Failed:', error);
        toast.add({ severity: 'error', summary: 'Export Error', detail: 'Failed to generate PDF. See console.', life: 3000 });
    }
};

// Reset report data
const resetReport = () => {
    reportData.value = null;
};
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-semibold">Employee Performance Reports</h1>
            <Button label="Generate New Report" icon="pi pi-plus" severity="primary" @click="generateDialogVisible = true" />
        </div>

        <!-- Report viewing area -->
        <div v-if="reportData" class="mb-8">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Performance Report</h2>
                <div class="flex gap-2">
                    <Button label="Export to PDF" icon="pi pi-file-pdf" outlined @click="exportToPdf" />
                    <Button icon="pi pi-times" severity="secondary" text @click="resetReport" />
                </div>
            </div>

            <div class="p-4 border rounded-lg bg-gray-50 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-gray-500 mb-1">Employee</p>
                        <p class="font-medium">{{ reportData.employee.name }}</p>
                        <p class="text-sm text-gray-600">{{ reportData.employee.employeeId }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 mb-1">Report Period</p>
                        <p class="font-medium">{{ formatDate(reportData.startDate) }} - {{ formatDate(reportData.endDate) }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 mb-1">Generated On</p>
                        <p class="font-medium">{{ formatDate(reportData.generatedDate) }}</p>
                    </div>
                </div>
            </div>

            <!-- Performance Metrics -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div v-for="(metric, key) in reportData.metrics" :key="key" class="border rounded-lg p-4 shadow-sm">
                    <div class="text-gray-500 text-sm mb-1">
                        {{ availableMetrics.find((m) => m.key === key)?.name || key }}
                    </div>
                    <div class="text-xl font-semibold">{{ metric }}</div>
                </div>
            </div>

            <!-- Performance Charts -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card class="shadow-sm">
                    <template #title>Monthly Ticket Resolution</template>
                    <template #content>
                        <Chart type="line" :data="performanceTrendData" :options="chartOptions" />
                    </template>
                </Card>

                <Card class="shadow-sm">
                    <template #title>Tickets by Category</template>
                    <template #content>
                        <Chart type="doughnut" :data="categoryBreakdownData" :options="chartOptions" />
                    </template>
                </Card>
            </div>
        </div>

        <!-- Recent reports table -->
        <div>
            <h2 class="text-xl font-semibold mb-4">Recent Reports</h2>
            <DataTable :value="recentReports" :paginator="true" :rows="10" :rowHover="true" v-model:filters="filters" filterDisplay="menu" class="p-datatable-sm" :rowsPerPageOptions="[5, 10, 25]">
                <template #header>
                    <div class="flex justify-between">
                        <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </span>
                    </div>
                </template>

                <Column field="employeeName" header="Employee" sortable>
                    <template #body="slotProps">
                        <div class="flex items-center gap-2">
                            <img
                                v-if="!imageErrors[`emp-${slotProps.data.id}`]"
                                :src="`https://avatar.iran.liara.run/public/50?name=${encodeURIComponent(slotProps.data.employeeName)}`"
                                class="w-8 h-8 rounded-full"
                                :alt="slotProps.data.employeeName"
                                @error="onImageError(`emp-${slotProps.data.id}`)"
                            />
                            <div v-else class="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                <i class="pi pi-user text-sm text-surface-500 dark:text-surface-400"></i>
                            </div>
                            <div>
                                <div>{{ slotProps.data.employeeName }}</div>
                                <div class="text-xs text-gray-500">{{ slotProps.data.employeeId }}</div>
                            </div>
                        </div>
                    </template>
                </Column>

                <Column field="startDate" header="Report Period" sortable>
                    <template #body="slotProps"> {{ formatDate(slotProps.data.startDate) }} - {{ formatDate(slotProps.data.endDate) }} </template>
                </Column>

                <Column field="generatedDate" header="Generated Date" sortable>
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.generatedDate) }}
                    </template>
                </Column>

                <Column field="metrics.ticketsResolved" header="Tickets" sortable>
                    <template #body="slotProps">
                        {{ slotProps.data.metrics.ticketsResolved }}
                    </template>
                </Column>

                <Column field="metrics.customerSatisfaction" header="CSAT" sortable>
                    <template #body="slotProps">
                        <Rating :modelValue="slotProps.data.metrics.customerSatisfaction" :readonly="true" :cancel="false" />
                    </template>
                </Column>

                <Column header="Actions" :exportable="false">
                    <template #body="slotProps">
                        <Button icon="pi pi-eye" rounded outlined severity="info" @click="viewReport(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Generate report dialog -->
        <Dialog v-model:visible="generateDialogVisible" header="Generate Performance Report" :modal="true" :style="{ width: '500px' }">
            <div class="flex flex-col gap-4">
                <div>
                    <label for="employee" class="block font-medium mb-2">Select Employee</label>
                    <Dropdown v-model="selectedEmployee" :options="employees" optionLabel="name" placeholder="Select an employee" class="w-full" :filter="true" />
                </div>

                <div>
                    <label for="dateRange" class="block font-medium mb-2">Report Period</label>
                    <Calendar v-model="dateRange" selectionMode="range" :showIcon="true" placeholder="Select date range" class="w-full" />
                </div>

                <div>
                    <label for="metrics" class="block font-medium mb-2">Performance Metrics</label>
                    <MultiSelect v-model="selectedMetrics" :options="availableMetrics" optionLabel="name" optionValue="key" placeholder="Select metrics" class="w-full" :filter="true" />
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="generateDialogVisible = false" />
                <Button label="Generate" icon="pi pi-check" @click="generateReport" :loading="loading" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.p-dialog-mask {
    backdrop-filter: blur(4px);
}
</style>
