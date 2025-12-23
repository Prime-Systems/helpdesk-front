<script setup>
import { useAuthStore } from '@/stores/AuthStore';
import { useLeaveStore } from '@/stores/LeaveStore';
import { FilterMatchMode } from '@primevue/core/api'; // Fixed import
import { format, parseISO } from 'date-fns';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';

// PrimeVue Components
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import ProgressSpinner from 'primevue/progressspinner';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';

const toast = useToast();
const confirm = useConfirm();
const leaveStore = useLeaveStore();
const authStore = useAuthStore();

// State management
const activeTab = ref(0);
const selectedLeaves = ref([]);
const showDetailsDialog = ref(false);
const showRejectDialog = ref(false);
const showBulkActionDialog = ref(false);
const selectedLeave = ref(null);
const bulkAction = ref('APPROVE');
const bulkRejectReason = ref('');
const bulkComments = ref('');

// Filter values
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.IN },
    departmentName: { value: null, matchMode: FilterMatchMode.IN },
    leaveType: { value: null, matchMode: FilterMatchMode.IN }
});

const filterValues = ref({
    status: [],
    department: [],
    leaveType: [],
    search: '',
    dateRange: null
});

// Enums matching backend
const LeaveStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
    IN_REVIEW: 'IN_REVIEW'
};

const LeaveType = {
    VACATION: 'VACATION',
    SICK: 'SICK',
    PERSONAL: 'PERSONAL',
    UNPAID: 'UNPAID',
    MATERNITY: 'MATERNITY',
    PATERNITY: 'PATERNITY',
    BEREAVEMENT: 'BEREAVEMENT'
};

// UI Options
const statusOptions = [
    { label: 'Pending', value: LeaveStatus.PENDING, severity: 'warning', icon: 'pi pi-clock' },
    { label: 'In Review', value: LeaveStatus.IN_REVIEW, severity: 'info', icon: 'pi pi-eye' },
    { label: 'Approved', value: LeaveStatus.APPROVED, severity: 'success', icon: 'pi pi-check' },
    { label: 'Rejected', value: LeaveStatus.REJECTED, severity: 'danger', icon: 'pi pi-times' },
    { label: 'Cancelled', value: LeaveStatus.CANCELLED, severity: 'secondary', icon: 'pi pi-ban' }
];

const leaveTypeOptions = [
    { label: 'Vacation', value: LeaveType.VACATION, color: '#3B82F6', icon: 'pi pi-sun' },
    { label: 'Sick', value: LeaveType.SICK, color: '#10B981', icon: 'pi pi-heart' },
    { label: 'Personal', value: LeaveType.PERSONAL, color: '#F59E0B', icon: 'pi pi-user' },
    { label: 'Unpaid', value: LeaveType.UNPAID, color: '#6B7280', icon: 'pi pi-money-bill' },
    { label: 'Maternity', value: LeaveType.MATERNITY, color: '#EC4899', icon: 'pi pi-baby-carriage' },
    { label: 'Paternity', value: LeaveType.PATERNITY, color: '#8B5CF6', icon: 'pi pi-users' },
    { label: 'Bereavement', value: LeaveType.BEREAVEMENT, color: '#374151', icon: 'pi pi-cloud' }
];

// Computed properties
const pendingLeaves = computed(() => leaveStore.getPendingLeaves);
const pendingCount = computed(() => leaveStore.getPendingCount);
const inReviewCount = computed(() => {
    return pendingLeaves.value.filter((req) => req.status === LeaveStatus.IN_REVIEW).length;
});
const selectedCount = computed(() => selectedLeaves.value.length);
const loading = computed(() => leaveStore.isLoading);

const canBulkApprove = computed(() => {
    return selectedLeaves.value.length > 0 && selectedLeaves.value.every((leave) => leave.status === LeaveStatus.PENDING || leave.status === LeaveStatus.IN_REVIEW);
});

const canBulkReject = computed(() => {
    return selectedLeaves.value.length > 0 && selectedLeaves.value.every((leave) => leave.status === LeaveStatus.PENDING || leave.status === LeaveStatus.IN_REVIEW);
});

const totalLeaves = computed(() => pendingLeaves.value.length);
const leaveStatistics = computed(() => leaveStore.getStatistics);
const departments = computed(() => {
    const deptSet = new Set();
    pendingLeaves.value.forEach((leave) => {
        if (leave.departmentName) deptSet.add(leave.departmentName);
    });
    return Array.from(deptSet);
});

// Lifecycle
onMounted(async () => {
    await loadAllData();
});

// Store Methods
const loadAllData = async () => {
    try {
        await Promise.all([loadPendingLeaves(), loadStatistics()]);
    } catch (error) {
        showError('Failed to load leave management data');
    }
};

const loadPendingLeaves = async () => {
    try {
        await leaveStore.fetchPendingLeaves();
    } catch (error) {
        showError('Failed to load pending leave requests');
    }
};

const loadStatistics = async () => {
    try {
        await leaveStore.fetchStatistics();
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
};

const loadLeaveDetails = async (leaveId) => {
    try {
        await leaveStore.fetchLeaveById(leaveId);
        return leaveStore.getSelectedLeave;
    } catch (error) {
        showError('Failed to load leave details');
        return null;
    }
};

const updateLeaveStatus = async (leaveId, statusDto) => {
    try {
        const response = await leaveStore.updateLeaveStatus(leaveId, statusDto);
        return response;
    } catch (error) {
        throw error;
    }
};

const bulkUpdateStatus = async (leaveIds, statusDto) => {
    try {
        // Update sequentially using store
        const results = await Promise.allSettled(leaveIds.map((id) => leaveStore.updateLeaveStatus(id, statusDto)));

        const successful = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        return {
            success: true,
            successful,
            failed,
            total: leaveIds.length
        };
    } catch (error) {
        throw error;
    }
};

// UI Methods
const viewLeaveDetails = async (leave) => {
    try {
        await loadLeaveDetails(leave.id);
        selectedLeave.value = leaveStore.getSelectedLeave;
        showDetailsDialog.value = true;
    } catch (error) {
        showError('Failed to load leave details');
    }
};

const approveLeave = async (leave) => {
    confirm.require({
        message: `Approve ${leave.userName}'s ${leave.leaveTypeDisplay} request?`,
        header: 'Confirm Approval',
        icon: 'pi pi-check-circle',
        acceptClass: 'p-button-success',
        accept: async () => {
            try {
                const statusDto = {
                    status: LeaveStatus.APPROVED,
                    comments: bulkComments.value || 'Leave approved by administrator'
                };

                await updateLeaveStatus(leave.id, statusDto);

                toast.add({
                    severity: 'success',
                    summary: 'Approved',
                    detail: `${leave.userName}'s leave request has been approved`,
                    life: 3000
                });

                if (showDetailsDialog.value) {
                    showDetailsDialog.value = false;
                }
            } catch (error) {
                showError('Failed to approve leave request');
            }
        }
    });
};

const rejectLeave = (leave) => {
    selectedLeave.value = leave;
    bulkRejectReason.value = '';
    bulkComments.value = '';
    showRejectDialog.value = true;
};

const confirmReject = async () => {
    if (!selectedLeave.value || !bulkRejectReason.value.trim()) {
        showWarning('Please provide a rejection reason');
        return;
    }

    try {
        const statusDto = {
            status: LeaveStatus.REJECTED,
            comments: bulkRejectReason.value
        };

        await updateLeaveStatus(selectedLeave.value.id, statusDto);

        toast.add({
            severity: 'success',
            summary: 'Rejected',
            detail: `${selectedLeave.value.userName}'s leave request has been rejected`,
            life: 3000
        });

        showRejectDialog.value = false;
        selectedLeave.value = null;
    } catch (error) {
        showError('Failed to reject leave request');
    }
};

const openBulkActionDialog = (action) => {
    if (selectedLeaves.value.length === 0) {
        showWarning('Please select leaves to perform bulk action');
        return;
    }

    bulkAction.value = action;
    bulkRejectReason.value = '';
    bulkComments.value = '';
    showBulkActionDialog.value = true;
};

const performBulkAction = async () => {
    if (bulkAction.value === 'APPROVE') {
        await bulkApprove();
    } else {
        await bulkReject();
    }
};

const bulkApprove = async () => {
    try {
        const statusDto = {
            status: LeaveStatus.APPROVED,
            comments: bulkComments.value || 'Bulk approved by administrator'
        };

        const leaveIds = selectedLeaves.value.map((leave) => leave.id);
        const result = await bulkUpdateStatus(leaveIds, statusDto);

        toast.add({
            severity: 'success',
            summary: 'Bulk Approved',
            detail: `${result.successful} of ${result.total} leave requests approved successfully`,
            life: 3000
        });

        if (result.failed > 0) {
            toast.add({
                severity: 'warn',
                summary: 'Partial Success',
                detail: `${result.failed} leave requests failed to update`,
                life: 3000
            });
        }

        showBulkActionDialog.value = false;
        selectedLeaves.value = [];
    } catch (error) {
        showError('Failed to bulk approve leaves');
    }
};

const bulkReject = async () => {
    if (!bulkRejectReason.value.trim()) {
        showWarning('Please provide a rejection reason');
        return;
    }

    try {
        const statusDto = {
            status: LeaveStatus.REJECTED,
            comments: bulkRejectReason.value
        };

        const leaveIds = selectedLeaves.value.map((leave) => leave.id);
        const result = await bulkUpdateStatus(leaveIds, statusDto);

        toast.add({
            severity: 'success',
            summary: 'Bulk Rejected',
            detail: `${result.successful} of ${result.total} leave requests rejected successfully`,
            life: 3000
        });

        if (result.failed > 0) {
            toast.add({
                severity: 'warn',
                summary: 'Partial Success',
                detail: `${result.failed} leave requests failed to update`,
                life: 3000
            });
        }

        showBulkActionDialog.value = false;
        selectedLeaves.value = [];
    } catch (error) {
        showError('Failed to bulk reject leaves');
    }
};

const applyFilters = () => {
    // Filtering will be handled by DataTable's built-in filters
};

const resetFilters = () => {
    filterValues.value = {
        status: [],
        department: [],
        leaveType: [],
        search: '',
        dateRange: null
    };
    // Reset DataTable filters
    filters.value.global.value = null;
    filters.value.status.value = null;
    filters.value.departmentName.value = null;
    filters.value.leaveType.value = null;
};

const exportToCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Applied Date'];
    const csvData = pendingLeaves.value.map((leave) => [
        leave.employeeId,
        leave.userName,
        leave.departmentName || 'N/A',
        leave.leaveTypeDisplay,
        formatDate(leave.startDate),
        formatDate(leave.endDate),
        leave.totalDays,
        leave.statusDisplay,
        formatDateTime(leave.appliedDate)
    ]);

    const csvContent = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leave_requests_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast.add({
        severity: 'success',
        summary: 'Exported',
        detail: 'Leave requests exported to CSV',
        life: 3000
    });
};

// Helper Methods
const getStatusSeverity = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.severity : 'info';
};

const getStatusIcon = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.icon : 'pi pi-info-circle';
};

const getLeaveTypeColor = (leaveType) => {
    const typeOption = leaveTypeOptions.find((opt) => opt.value === leaveType);
    return typeOption ? typeOption.color : '#6B7280';
};

const getLeaveTypeIcon = (leaveType) => {
    const typeOption = leaveTypeOptions.find((opt) => opt.value === leaveType);
    return typeOption ? typeOption.icon : 'pi pi-calendar';
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
        return dateString;
    }
};

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
        return format(parseISO(dateTimeString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
        return dateTimeString;
    }
};

const showError = (message) => {
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000
    });
};

const showWarning = (message) => {
    toast.add({
        severity: 'warn',
        summary: 'Warning',
        detail: message,
        life: 3000
    });
};

// Clear selection when dialog closes
watch(showDetailsDialog, (newVal) => {
    if (!newVal) {
        leaveStore.clearSelectedLeave();
        selectedLeave.value = null;
    }
});

// Clear error when component mounts
onMounted(() => {
    leaveStore.clearError();
});
</script>

<template>
    <div class="leave-management">
        <Toast position="top-right" />
        <ConfirmDialog />

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <ProgressSpinner />
            <p class="mt-3 text-color-secondary">Loading leave management data...</p>
        </div>

        <!-- Main Content -->
        <div v-else class="p-4">
            <!-- Header -->
            <div class="mb-6">
                <div class="flex flex-column lg:flex-row justify-content-between align-items-start lg:align-items-center gap-4 mb-4">
                    <div>
                        <h1 class="text-3xl font-bold m-0">Leave Management</h1>
                        <p class="text-color-secondary m-0 mt-2">Manage employee leave requests and approvals</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <Button label="Export CSV" icon="pi pi-file-excel" severity="secondary" outlined @click="exportToCSV" size="small" />
                        <Button label="Refresh" icon="pi pi-refresh" @click="loadAllData" size="small" />
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="grid">
                    <div class="col-12 sm:col-6 lg:col-3">
                        <Card
                            class="h-full border-round-lg hover:shadow-3 transition-all cursor-pointer"
                            @click="
                                filterValues.status = [LeaveStatus.PENDING];
                                activeTab = 0;
                            "
                        >
                            <template #content>
                                <div class="flex align-items-center justify-content-between">
                                    <div>
                                        <div class="text-2xl font-bold text-warning">{{ pendingCount }}</div>
                                        <div class="text-color-secondary text-sm">Pending Requests</div>
                                    </div>
                                    <i class="pi pi-clock text-3xl text-warning opacity-60"></i>
                                </div>
                            </template>
                        </Card>
                    </div>
                    <div class="col-12 sm:col-6 lg:col-3">
                        <Card
                            class="h-full border-round-lg hover:shadow-3 transition-all cursor-pointer"
                            @click="
                                filterValues.status = [LeaveStatus.IN_REVIEW];
                                activeTab = 0;
                            "
                        >
                            <template #content>
                                <div class="flex align-items-center justify-content-between">
                                    <div>
                                        <div class="text-2xl font-bold text-info">{{ inReviewCount }}</div>
                                        <div class="text-color-secondary text-sm">In Review</div>
                                    </div>
                                    <i class="pi pi-eye text-3xl text-info opacity-60"></i>
                                </div>
                            </template>
                        </Card>
                    </div>
                    <div class="col-12 sm:col-6 lg:col-3">
                        <Card class="h-full border-round-lg hover:shadow-3 transition-all">
                            <template #content>
                                <div class="flex align-items-center justify-content-between">
                                    <div>
                                        <div class="text-2xl font-bold text-primary">{{ totalLeaves }}</div>
                                        <div class="text-color-secondary text-sm">Total Requests</div>
                                    </div>
                                    <i class="pi pi-inbox text-3xl text-primary opacity-60"></i>
                                </div>
                            </template>
                        </Card>
                    </div>
                    <div class="col-12 sm:col-6 lg:col-3">
                        <Card class="h-full border-round-lg hover:shadow-3 transition-all">
                            <template #content>
                                <div class="flex align-items-center justify-content-between">
                                    <div>
                                        <div class="text-2xl font-bold text-green-600">{{ leaveStatistics?.averageProcessingTime || 0 }} days</div>
                                        <div class="text-color-secondary text-sm">Avg Processing Time</div>
                                    </div>
                                    <i class="pi pi-chart-line text-3xl text-green-600 opacity-60"></i>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </div>

            <!-- Main Tabs -->
            <TabView v-model:activeIndex="activeTab" class="leave-tabs">
                <!-- Leave Requests Tab -->
                <TabPanel header="Pending Requests">
                    <Card>
                        <template #title>
                            <div class="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-3">
                                <div>
                                    <h2 class="text-xl font-bold m-0">Pending Leave Requests</h2>
                                    <p class="text-color-secondary m-0 mt-1 text-sm">{{ totalLeaves }} request(s) requiring action</p>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    <Button v-if="selectedCount > 0" :label="`Approve Selected (${selectedCount})`" icon="pi pi-check" severity="success" outlined size="small" @click="openBulkActionDialog('APPROVE')" :disabled="!canBulkApprove" />
                                    <Button v-if="selectedCount > 0" :label="`Reject Selected (${selectedCount})`" icon="pi pi-times" severity="danger" outlined size="small" @click="openBulkActionDialog('REJECT')" :disabled="!canBulkReject" />
                                    <Button label="Clear Filters" icon="pi pi-filter-slash" severity="secondary" outlined size="small" @click="resetFilters" />
                                </div>
                            </div>
                        </template>

                        <template #content>
                            <!-- Filters -->
                            <div class="filters-section mb-4 p-3 border-round surface-card">
                                <div class="grid">
                                    <div class="col-12 md:col-3">
                                        <div class="field">
                                            <label class="font-bold block mb-2 text-sm">Status</label>
                                            <MultiSelect v-model="filterValues.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="All Status" display="chip" class="w-full" />
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-3">
                                        <div class="field">
                                            <label class="font-bold block mb-2 text-sm">Department</label>
                                            <MultiSelect v-model="filterValues.department" :options="departments" placeholder="All Departments" display="chip" class="w-full" />
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-3">
                                        <div class="field">
                                            <label class="font-bold block mb-2 text-sm">Leave Type</label>
                                            <MultiSelect v-model="filterValues.leaveType" :options="leaveTypeOptions" optionLabel="label" optionValue="value" placeholder="All Types" display="chip" class="w-full" />
                                        </div>
                                    </div>
                                    <div class="col-12 md:col-3">
                                        <div class="field">
                                            <label class="font-bold block mb-2 text-sm">Search</label>
                                            <div class="p-inputgroup">
                                                <InputText v-model="filterValues.search" placeholder="Search by name or ID..." class="w-full" @input="filters.global.value = $event.target.value" />
                                                <Button icon="pi pi-search" @click="applyFilters" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Data Table -->
                            <DataTable
                                :value="pendingLeaves"
                                v-model:selection="selectedLeaves"
                                dataKey="id"
                                :paginator="true"
                                :rows="10"
                                :filters="filters"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                :rowsPerPageOptions="[5, 10, 20, 50]"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                                class="p-datatable-sm"
                                responsiveLayout="scroll"
                                :globalFilterFields="['userName', 'employeeId', 'departmentName']"
                            >
                                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                                <Column field="userName" header="Employee" sortable style="min-width: 200px">
                                    <template #body="slotProps">
                                        <div class="flex align-items-center gap-2">
                                            <Avatar :label="slotProps.data.userName?.charAt(0) || '?'" size="small" shape="circle" />
                                            <div>
                                                <div class="font-bold">{{ slotProps.data.userName || 'N/A' }}</div>
                                                <div class="text-xs text-color-secondary">{{ slotProps.data.employeeId || 'N/A' }}</div>
                                            </div>
                                        </div>
                                    </template>
                                </Column>

                                <Column field="departmentName" header="Department" sortable style="min-width: 150px">
                                    <template #body="slotProps">
                                        {{ slotProps.data.departmentName || 'N/A' }}
                                    </template>
                                    <template #filter="{ filterModel }">
                                        <MultiSelect v-model="filterModel.value" :options="departments" placeholder="Any" class="p-column-filter" />
                                    </template>
                                </Column>

                                <Column field="leaveTypeDisplay" header="Leave Type" sortable style="min-width: 150px">
                                    <template #body="slotProps">
                                        <Tag
                                            :value="slotProps.data.leaveTypeDisplay"
                                            :style="{ backgroundColor: getLeaveTypeColor(slotProps.data.leaveType) + '20', color: getLeaveTypeColor(slotProps.data.leaveType), borderColor: getLeaveTypeColor(slotProps.data.leaveType) }"
                                        >
                                            <i :class="getLeaveTypeIcon(slotProps.data.leaveType)" class="mr-1"></i>
                                            {{ slotProps.data.leaveTypeDisplay }}
                                        </Tag>
                                    </template>
                                    <template #filter="{ filterModel }">
                                        <MultiSelect v-model="filterModel.value" :options="leaveTypeOptions" optionLabel="label" optionValue="value" placeholder="Any" class="p-column-filter" />
                                    </template>
                                </Column>

                                <Column header="Dates" style="min-width: 200px">
                                    <template #body="slotProps">
                                        <div>
                                            <div class="font-medium">{{ formatDate(slotProps.data.startDate) }}</div>
                                            <div class="text-xs text-color-secondary">to {{ formatDate(slotProps.data.endDate) }}</div>
                                            <div class="text-xs font-bold mt-1">{{ slotProps.data.totalDays || 0 }} day(s)</div>
                                        </div>
                                    </template>
                                </Column>

                                <Column field="statusDisplay" header="Status" sortable style="min-width: 120px">
                                    <template #body="slotProps">
                                        <Tag :value="slotProps.data.statusDisplay" :severity="getStatusSeverity(slotProps.data.status)" :icon="getStatusIcon(slotProps.data.status)" />
                                    </template>
                                    <template #filter="{ filterModel }">
                                        <MultiSelect v-model="filterModel.value" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Any" class="p-column-filter" />
                                    </template>
                                </Column>

                                <Column field="appliedDate" header="Applied On" sortable style="min-width: 120px">
                                    <template #body="slotProps">
                                        {{ formatDateTime(slotProps.data.appliedDate) }}
                                    </template>
                                </Column>

                                <Column header="Actions" style="min-width: 180px">
                                    <template #body="slotProps">
                                        <div class="flex gap-1">
                                            <Button icon="pi pi-eye" severity="info" text rounded size="small" @click="viewLeaveDetails(slotProps.data)" v-tooltip="'View Details'" />
                                            <Button
                                                v-if="slotProps.data.status === LeaveStatus.PENDING || slotProps.data.status === LeaveStatus.IN_REVIEW"
                                                icon="pi pi-check"
                                                severity="success"
                                                text
                                                rounded
                                                size="small"
                                                @click="approveLeave(slotProps.data)"
                                                v-tooltip="'Approve'"
                                            />
                                            <Button
                                                v-if="slotProps.data.status === LeaveStatus.PENDING || slotProps.data.status === LeaveStatus.IN_REVIEW"
                                                icon="pi pi-times"
                                                severity="danger"
                                                text
                                                rounded
                                                size="small"
                                                @click="rejectLeave(slotProps.data)"
                                                v-tooltip="'Reject'"
                                            />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </template>
                    </Card>
                </TabPanel>

                <!-- Analytics Tab -->
                <TabPanel header="Analytics">
                    <Card>
                        <template #title>
                            <h2 class="text-xl font-bold m-0">Leave Analytics</h2>
                        </template>
                        <template #content>
                            <div class="grid">
                                <div class="col-12 lg:col-6">
                                    <Card class="h-full">
                                        <template #title>Quick Statistics</template>
                                        <template #content>
                                            <div class="grid">
                                                <div class="col-12 sm:col-6">
                                                    <div class="stat-card text-center p-3">
                                                        <div class="text-2xl font-bold text-primary">{{ leaveStatistics?.totalRequests || totalLeaves }}</div>
                                                        <div class="text-sm text-color-secondary">Total Requests</div>
                                                    </div>
                                                </div>
                                                <div class="col-12 sm:col-6">
                                                    <div class="stat-card text-center p-3">
                                                        <div class="text-2xl font-bold text-warning">{{ pendingCount }}</div>
                                                        <div class="text-sm text-color-secondary">Pending</div>
                                                    </div>
                                                </div>
                                                <div class="col-12 sm:col-6">
                                                    <div class="stat-card text-center p-3">
                                                        <div class="text-2xl font-bold text-info">{{ inReviewCount }}</div>
                                                        <div class="text-sm text-color-secondary">In Review</div>
                                                    </div>
                                                </div>
                                                <div class="col-12 sm:col-6">
                                                    <div class="stat-card text-center p-3">
                                                        <div class="text-2xl font-bold text-green-600">{{ leaveStatistics?.approvedThisMonth || 0 }}</div>
                                                        <div class="text-sm text-color-secondary">Approved This Month</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                                <div class="col-12 lg:col-6">
                                    <Card class="h-full">
                                        <template #title>Leave Type Distribution</template>
                                        <template #content>
                                            <div class="text-center p-6">
                                                <i class="pi pi-chart-pie text-4xl text-color-secondary mb-3"></i>
                                                <h3 class="text-lg font-bold mb-2">Distribution Chart</h3>
                                                <p class="text-color-secondary">Leave type distribution analytics would be displayed here</p>
                                                <div v-if="leaveStore.getError" class="p-3 border-round bg-red-50 border-1 border-red-200 mt-3">
                                                    <i class="pi pi-exclamation-triangle text-red-600 mr-2"></i>
                                                    <span class="text-sm text-red-600">{{ leaveStore.getError }}</span>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                            </div>
                        </template>
                    </Card>
                </TabPanel>
            </TabView>
        </div>

        <!-- Leave Details Dialog -->
        <Dialog v-model:visible="showDetailsDialog" header="Leave Request Details" :modal="true" :style="{ width: '90vw', maxWidth: '700px' }" :draggable="false">
            <div v-if="leaveStore.getSelectedLeave" class="leave-details">
                <div class="grid">
                    <div class="col-12">
                        <div class="flex align-items-center gap-3 mb-4">
                            <Avatar :label="leaveStore.getSelectedLeave.userName?.charAt(0) || '?'" size="large" shape="circle" />
                            <div>
                                <h3 class="m-0">{{ leaveStore.getSelectedLeave.userName || 'N/A' }}</h3>
                                <p class="text-color-secondary m-0">{{ leaveStore.getSelectedLeave.employeeId || 'N/A' }}</p>
                                <p class="text-color-secondary m-0 text-sm">{{ leaveStore.getSelectedLeave.departmentName || 'No department' }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 md:col-6">
                        <Card class="h-full">
                            <template #title>Leave Information</template>
                            <template #content>
                                <div class="space-y-3">
                                    <div class="flex justify-content-between">
                                        <span class="text-color-secondary">Leave Type:</span>
                                        <Tag
                                            :value="leaveStore.getSelectedLeave.leaveTypeDisplay"
                                            :style="{ backgroundColor: getLeaveTypeColor(leaveStore.getSelectedLeave.leaveType) + '20', color: getLeaveTypeColor(leaveStore.getSelectedLeave.leaveType) }"
                                        />
                                    </div>
                                    <div class="flex justify-content-between">
                                        <span class="text-color-secondary">Start Date:</span>
                                        <span class="font-bold">{{ formatDate(leaveStore.getSelectedLeave.startDate) }}</span>
                                    </div>
                                    <div class="flex justify-content-between">
                                        <span class="text-color-secondary">End Date:</span>
                                        <span class="font-bold">{{ formatDate(leaveStore.getSelectedLeave.endDate) }}</span>
                                    </div>
                                    <div class="flex justify-content-between">
                                        <span class="text-color-secondary">Total Days:</span>
                                        <span class="font-bold">{{ leaveStore.getSelectedLeave.totalDays || 0 }} day(s)</span>
                                    </div>
                                    <div class="flex justify-content-between">
                                        <span class="text-color-secondary">Applied On:</span>
                                        <span>{{ formatDateTime(leaveStore.getSelectedLeave.appliedDate) }}</span>
                                    </div>
                                    <div class="flex justify-content-between">
                                        <span class="text-color-secondary">Status:</span>
                                        <Tag :value="leaveStore.getSelectedLeave.statusDisplay" :severity="getStatusSeverity(leaveStore.getSelectedLeave.status)" :icon="getStatusIcon(leaveStore.getSelectedLeave.status)" />
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>

                    <div class="col-12 md:col-6">
                        <Card class="h-full">
                            <template #title>Reason & Details</template>
                            <template #content>
                                <div class="space-y-3">
                                    <div>
                                        <h4 class="text-sm font-bold mb-2">Reason for Leave:</h4>
                                        <p class="p-3 border-1 surface-border border-round bg-surface-50">
                                            {{ leaveStore.getSelectedLeave.reason || 'No reason provided' }}
                                        </p>
                                    </div>

                                    <div v-if="leaveStore.getSelectedLeave.attachmentUrl">
                                        <h4 class="text-sm font-bold mb-2">Attachment:</h4>
                                        <a :href="leaveStore.getSelectedLeave.attachmentUrl" target="_blank" class="flex align-items-center gap-2 text-primary hover:underline">
                                            <i class="pi pi-paperclip"></i>
                                            <span>View Attachment</span>
                                        </a>
                                    </div>

                                    <div v-if="leaveStore.getSelectedLeave.comments">
                                        <h4 class="text-sm font-bold mb-2">Review Comments:</h4>
                                        <p class="p-3 border-1 surface-border border-round bg-surface-50">
                                            {{ leaveStore.getSelectedLeave.comments }}
                                        </p>
                                    </div>

                                    <div v-if="leaveStore.getSelectedLeave.reviewedByName">
                                        <div class="flex justify-content-between text-sm">
                                            <span class="text-color-secondary">Reviewed By:</span>
                                            <span class="font-medium">{{ leaveStore.getSelectedLeave.reviewedByName }}</span>
                                        </div>
                                        <div v-if="leaveStore.getSelectedLeave.reviewedDate" class="flex justify-content-between text-sm mt-1">
                                            <span class="text-color-secondary">Reviewed On:</span>
                                            <span>{{ formatDateTime(leaveStore.getSelectedLeave.reviewedDate) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex flex-wrap justify-content-between gap-2">
                    <div class="flex gap-2">
                        <Button
                            v-if="leaveStore.getSelectedLeave && (leaveStore.getSelectedLeave.status === LeaveStatus.PENDING || leaveStore.getSelectedLeave.status === LeaveStatus.IN_REVIEW)"
                            label="Approve"
                            icon="pi pi-check"
                            severity="success"
                            @click="approveLeave(leaveStore.getSelectedLeave)"
                        />
                        <Button
                            v-if="leaveStore.getSelectedLeave && (leaveStore.getSelectedLeave.status === LeaveStatus.PENDING || leaveStore.getSelectedLeave.status === LeaveStatus.IN_REVIEW)"
                            label="Reject"
                            icon="pi pi-times"
                            severity="danger"
                            outlined
                            @click="rejectLeave(leaveStore.getSelectedLeave)"
                        />
                    </div>
                    <Button label="Close" icon="pi pi-times" severity="secondary" @click="showDetailsDialog = false" />
                </div>
            </template>
        </Dialog>

        <!-- Reject Dialog -->
        <Dialog v-model:visible="showRejectDialog" header="Reject Leave Request" :modal="true" :style="{ width: '90vw', maxWidth: '500px' }" :draggable="false">
            <div class="reject-dialog">
                <p class="mb-4">Please provide a reason for rejecting this leave request:</p>
                <Textarea v-model="bulkRejectReason" rows="3" class="w-full" placeholder="Enter rejection reason..." required />
            </div>

            <template #footer>
                <div class="flex justify-content-end gap-2">
                    <Button label="Cancel" icon="pi pi-times" severity="secondary" @click="showRejectDialog = false" />
                    <Button label="Confirm Reject" icon="pi pi-times" severity="danger" @click="confirmReject" :disabled="!bulkRejectReason.trim()" />
                </div>
            </template>
        </Dialog>

        <!-- Bulk Action Dialog -->
        <Dialog v-model:visible="showBulkActionDialog" :header="bulkAction === 'APPROVE' ? 'Bulk Approve Leaves' : 'Bulk Reject Leaves'" :modal="true" :style="{ width: '90vw', maxWidth: '500px' }" :draggable="false">
            <div class="bulk-action-dialog">
                <p class="mb-4">
                    You are about to {{ bulkAction === 'APPROVE' ? 'approve' : 'reject' }} <strong>{{ selectedCount }} leave request(s)</strong>.
                </p>

                <div v-if="bulkAction === 'APPROVE'" class="mb-4">
                    <label class="font-bold block mb-2">Comments (optional)</label>
                    <Textarea v-model="bulkComments" rows="2" class="w-full" placeholder="Add comments for approval..." />
                </div>

                <div v-if="bulkAction === 'REJECT'" class="mb-4">
                    <label class="font-bold block mb-2">Rejection Reason (required)</label>
                    <Textarea v-model="bulkRejectReason" rows="3" class="w-full" placeholder="Enter reason for rejection..." required />
                </div>

                <div class="selected-list border-1 surface-border border-round p-3">
                    <h4 class="text-sm font-bold mb-2">Selected Leaves:</h4>
                    <div class="space-y-2 max-h-15rem overflow-y-auto">
                        <div v-for="leave in selectedLeaves.slice(0, 5)" :key="leave.id" class="flex justify-content-between align-items-center p-2 border-round surface-card">
                            <div>
                                <div class="font-medium text-sm">{{ leave.userName }}</div>
                                <div class="text-xs text-color-secondary">{{ leave.leaveTypeDisplay }} • {{ leave.totalDays }} days</div>
                            </div>
                            <Tag :value="leave.statusDisplay" :severity="getStatusSeverity(leave.status)" size="small" />
                        </div>
                        <div v-if="selectedLeaves.length > 5" class="text-center text-sm text-color-secondary">... and {{ selectedLeaves.length - 5 }} more</div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-content-end gap-2">
                    <Button label="Cancel" icon="pi pi-times" severity="secondary" @click="showBulkActionDialog = false" />
                    <Button
                        :label="bulkAction === 'APPROVE' ? 'Approve All' : 'Reject All'"
                        :icon="bulkAction === 'APPROVE' ? 'pi pi-check' : 'pi pi-times'"
                        :severity="bulkAction === 'APPROVE' ? 'success' : 'danger'"
                        @click="performBulkAction"
                        :disabled="bulkAction === 'REJECT' && !bulkRejectReason.trim()"
                    />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.leave-management {
    min-height: 100vh;
    background: var(--surface-ground);
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;
}

.filters-section {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
}

.stat-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.leave-details {
    max-height: 60vh;
    overflow-y: auto;
}

.selected-list {
    background: var(--surface-50);
}

/* Mobile optimizations */
@media (max-width: 768px) {
    .leave-tabs :deep(.p-tabmenu-nav) {
        flex-wrap: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
    }

    .leave-tabs :deep(.p-tabmenu-nav::-webkit-scrollbar) {
        display: none;
    }

    .leave-tabs :deep(.p-tabmenuitem) {
        flex-shrink: 0;
    }

    :deep(.p-datatable) {
        font-size: 0.875rem;
    }

    :deep(.p-button) {
        min-height: 2.5rem;
    }
}

/* Table improvements */
:deep(.p-datatable) {
    font-size: 0.9rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
    background: var(--surface-50);
    font-weight: 600;
    color: var(--text-color);
}

:deep(.p-datatable .p-datatable-tbody > tr) {
    transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background: var(--surface-hover) !important;
}

/* Tag improvements */
:deep(.p-tag) {
    font-weight: 500;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
}

/* Dialog improvements */
:deep(.p-dialog) {
    border-radius: 12px;
}

:deep(.p-dialog .p-dialog-header) {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    padding: 1.25rem 1.5rem;
}

:deep(.p-dialog .p-dialog-content) {
    padding: 1.5rem;
}

/* Card hover effects */
:deep(.p-card) {
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

:deep(.p-card:hover) {
    transform: translateY(-2px);
}

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: var(--surface-100);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: var(--surface-300);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--surface-400);
}
</style>
