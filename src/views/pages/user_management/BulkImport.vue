<script setup>
import { BulkImportService } from '@/service/BulkImportService';
import { DepartmentService } from '@/service/DepartmentService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();

const fileUploadRef = ref(null);
const loading = ref(false);
const importHistory = ref([]);
const totalRecords = ref(0);
const departments = ref([]);
const expandedRows = ref([]);

// Form State
const importOptions = ref({
    defaultRole: 'EMPLOYEE',
    defaultDepartmentId: null,
    sendWelcomeEmail: true
});

const roles = [
    { label: 'Employee', value: 'EMPLOYEE' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Customer', value: 'CUSTOMER' }
];

// DataTable Filters
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const dt = ref(null);

onMounted(() => {
    loadDepartments();
    loadHistory();
});

const loadDepartments = async () => {
    try {
        const data = await DepartmentService.getDepartments();
        departments.value = data.map(d => ({ label: d.name, value: d.id }));
    } catch (error) {
        console.warn('Failed to load departments', error);
        // Fallback or empty
        departments.value = [
            { label: 'IT', value: 1 },
            { label: 'HR', value: 2 },
            { label: 'Sales', value: 3 }
        ];
    }
};

const loadHistory = async (page = 0) => {
    loading.value = true;
    try {
        const data = await BulkImportService.getImportHistory({ page, size: 10 });
        if (data && data.imports) {
            importHistory.value = data.imports;
            totalRecords.value = data.totalItems || data.length;
        } else if (Array.isArray(data)) {
             importHistory.value = data;
             totalRecords.value = data.length;
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load import history', life: 3000 });
        // Demo data fallback
        importHistory.value = [
            {
                id: 1,
                fileName: 'users_q1.xlsx',
                status: 'COMPLETED',
                totalRecords: 50,
                successCount: 48,
                failureCount: 2,
                importedBy: 'Admin User',
                importedAt: new Date().toISOString(),
                errors: [
                    { rowNumber: 15, error: 'Invalid email format' },
                    { rowNumber: 22, error: 'Duplicate username' }
                ]
            }
        ];
    } finally {
        loading.value = false;
    }
};

const onUpload = async (event) => {
    const file = event.files[0];
    if (!file) return;

    loading.value = true;
    try {
        await BulkImportService.importUsers(file, {
            defaultRole: importOptions.value.defaultRole,
            defaultDepartmentId: importOptions.value.defaultDepartmentId,
            sendWelcomeEmail: importOptions.value.sendWelcomeEmail
        });
        
        toast.add({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully. Processing started.', life: 3000 });
        fileUploadRef.value.clear();
        loadHistory();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to upload file', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const downloadTemplate = async (format) => {
    try {
        const data = await BulkImportService.downloadTemplate(format);
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `user_import_template.${format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to download template', life: 3000 });
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'COMPLETED': return 'success';
        case 'FAILED': return 'danger';
        case 'PROCESSING': return 'warning';
        case 'PENDING': return 'info';
        default: return null;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
};
</script>

<template>
    <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12">
            <div class="card">
                <h5>Bulk User Import</h5>
                <p class="text-gray-600 mb-4">Upload Excel or CSV files to bulk import users into the system.</p>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="field">
                        <label for="role" class="block font-medium mb-2">Default Role</label>
                        <Select id="role" v-model="importOptions.defaultRole" :options="roles" optionLabel="label" optionValue="value" placeholder="Select Role" class="w-full" />
                    </div>
                    <div class="field">
                        <label for="department" class="block font-medium mb-2">Default Department</label>
                        <Select id="department" v-model="importOptions.defaultDepartmentId" :options="departments" optionLabel="label" optionValue="value" placeholder="Select Department" class="w-full" />
                    </div>
                    <div class="field flex items-end">
                        <div class="flex items-center mb-2 h-full">
                            <Checkbox id="email" v-model="importOptions.sendWelcomeEmail" :binary="true" />
                            <label for="email" class="ml-2">Send Welcome Email</label>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row gap-3 mb-6">
                     <FileUpload ref="fileUploadRef" mode="basic" name="file" accept=".csv,.xlsx" :maxFileSize="1000000" customUpload @uploader="onUpload" :auto="true" chooseLabel="Select & Upload File" class="p-button-primary w-full md:w-auto" />
                     <Button label="Download Template (XLSX)" icon="pi pi-download" severity="secondary" outlined @click="downloadTemplate('xlsx')" class="w-full md:w-auto" />
                     <Button label="Download Template (CSV)" icon="pi pi-download" severity="secondary" outlined @click="downloadTemplate('csv')" class="w-full md:w-auto" />
                </div>
            </div>

            <div class="card">
                <h5>Import History</h5>
                <DataTable ref="dt" :value="importHistory" :paginator="true" :rows="10" :loading="loading" 
                          v-model:expandedRows="expandedRows" dataKey="id"
                          responsiveLayout="scroll">
                    <Column :expander="true" headerStyle="width: 3rem" />
                    <Column field="fileName" header="File Name" :sortable="true"></Column>
                    <Column field="importedAt" header="Date" :sortable="true">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.importedAt) }}
                        </template>
                    </Column>
                    <Column field="status" header="Status" :sortable="true">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
                        </template>
                    </Column>
                    <Column field="totalRecords" header="Total" :sortable="true"></Column>
                    <Column field="successCount" header="Success" :sortable="true" class="text-green-600 font-bold"></Column>
                    <Column field="failureCount" header="Failed" :sortable="true" class="text-red-600 font-bold"></Column>
                    <Column field="importedBy" header="Imported By" :sortable="true"></Column>
                    
                    <template #expansion="slotProps">
                        <div class="p-3">
                            <h5>Import Errors ({{ slotProps.data.errors?.length || 0 }})</h5>
                             <DataTable :value="slotProps.data.errors" v-if="slotProps.data.errors && slotProps.data.errors.length > 0" responsiveLayout="scroll">
                                <Column field="rowNumber" header="Row" :sortable="true"></Column>
                                <Column field="error" header="Error Message" :sortable="true"></Column>
                            </DataTable>
                            <div v-else class="text-green-600">No errors found.</div>
                        </div>
                    </template>
                </DataTable>
            </div>
        </div>
    </div>
</template>
