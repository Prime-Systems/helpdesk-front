<script setup>
import { BranchService } from '@/service/BranchService';
import { EmployeeService } from '@/service/EmployeeService';
import { useAuthStore } from '@/stores/AuthStore';
import { useDepartmentStore } from '@/stores/DepartmentStore';
import { useEmployeeStore } from '@/stores/EmployeeStore';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import EmployeeDetails from './EmployeeDetails.vue'; // Import the new component

import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const isAdmin = computed(() => {
    return authStore.user?.role === 'ADMIN' || authStore.user?.role === 'MANAGER';
});
const departments = ref([]);
const branches = ref([]);
const department = ref({});
const employees = ref([]);
const departmentStore = useDepartmentStore();
const employeeStore = useEmployeeStore();
const employee = ref({});
const employeeDialog = ref(false);
const employeeDetailsDialog = ref(false); // New ref for details drawer
const submitted = ref(false);
const deleteEmployeeDialog = ref(false);
const filters1 = ref();
const loading1 = ref(null);
const toast = useToast();
const genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' }
];

// Update your existing roles to match your backend Role enum
const roles = [
    { label: 'Employee', value: 'EMPLOYEE' },
    { label: 'Team Lead', value: 'TEAM_LEAD' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'Director', value: 'DIRECTOR' },
    { label: 'Admin', value: 'ADMIN' }
];
// Initialize filters immediately
initFilters1();

// Use onMounted instead of onBeforeMount for async operations
onMounted(async () => {
    loading1.value = true;

    try {
        // Use stores instead of direct service calls
        await employeeStore.fetchEmployees();
        employees.value = employeeStore.employees;

        await departmentStore.fetchDepartments();
        departments.value = departmentStore.departments;

        // Fetch branches
        branches.value = await BranchService.getBranches();
    } catch (error) {
        console.error('Error loading data:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load data',
            life: 3000
        });
    } finally {
        loading1.value = false;
    }
});

function initFilters1() {
    filters1.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        lastname: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        branch: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        department: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] }
    };
}

function openNew() {
    employee.value = {};
    submitted.value = false;
    employeeDialog.value = true;
}

function editEmployee(selectedEmployee) {
    employee.value = { ...selectedEmployee.data };
    employeeDialog.value = true;
}

// New function to open employee details drawer
function openEmployeeDetailsDialog(event) {
    console.log('Row Clicked', event.data);
    employeeDetailsDialog.value = true;
    employee.value = event.data;
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < employees.value.length; i++) {
        if (employees.value[i].employeeId === id) {
            index = i;
            break;
        }
    }

    return index;
}

function clearFilter() {
    initFilters1();
}

function hideDialog() {
    employeeDialog.value = false;
    submitted.value = false;
}

function confirmDeleteEmployee(selectedEmployee) {
    employee.value = selectedEmployee.data;
    deleteEmployeeDialog.value = true;
}

async function deleteEmployee() {
    try {
        await EmployeeService.deleteEmployee(employee.value.id);
        employees.value = employees.value.filter((val) => val.id !== employee.value.id);
        deleteEmployeeDialog.value = false;
        employee.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Employee Deleted', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete employee', life: 3000 });
    }
}

function createEmployeeCode() {
    const prefix = 'EMP-';
    const randomNumber = Math.floor(Math.random() * 1000000); // Generate a number between 0 and 999999
    const paddedNumber = String(randomNumber).padStart(6, '0'); // Pad with leading zeros to ensure 6 digits
    return prefix + paddedNumber;
}

async function saveEmployee() {
    submitted.value = true;

    //Print the logged in user details
    console.log('Logged in User:', authStore.userId);
    console.log('Logged in User Role:', authStore.role);
    console.log('Logged in User Email:', authStore.email);

    if (employee?.value.firstName?.trim()) {
        try {
            // Prepare the user data according to your DTO structure
            const userData = {
                // From AdminSignUpDto
                firstName: employee.value.firstName || '',
                lastName: employee.value.lastName || '',
                otherNames: employee.value.otherNames || '',
                employeeId: employee.value.employeeId || createEmployeeCode(),
                email: employee.value.email || '',
                phone: employee.value.phone || '',
                profilePictureUrl: 'product-placeholder.svg', // Default image
                gender: employee.value.gender || 'MALE', // Default gender, adjust as needed
                departmentId: employee.value.department || '', // From department dropdown

                // From UserDto
                branch: employee.value.branch || 'Head Office',
                createdBy: authStore.userId,
                role: employee.value.role || 'EMPLOYEE' // Default role
            };

            if (employee.value.employeeId) {
                // Update existing employee
                await employeeStore.updateEmployee(userData);
                employees.value = employeeStore.employees;
                toast.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Employee Updated',
                    life: 3000
                });
            } else {
                // Create new employee
                await employeeStore.addEmployee(userData);
                employees.value = employeeStore.employees;
                toast.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Employee Created',
                    life: 3000
                });
            }

            employeeDialog.value = false;
            employee.value = {};
            submitted.value = false;
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: employeeStore.error || 'Failed to save employee',
                life: 3000
            });
        }
    }
}
</script>

<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl mb-4">Employees</div>
            <DataTable
                :value="employees"
                :paginator="true"
                :rows="10"
                dataKey="employeeId"
                :rowHover="true"
                v-model:filters="filters1"
                filterDisplay="menu"
                :loading="loading1"
                :filters="filters1"
                :globalFilterFields="['name', 'branch', 'department']"
                showGridlines
                @row-click="openEmployeeDetailsDialog"
                class="[&_tr]:cursor-pointer"
            >
                <template #header>
                    <div class="flex flex-col md:flex-row justify-between gap-4">
                        <div class="flex flex-wrap gap-2">
                            <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                            <Button v-if="isAdmin" label="Bulk Import" icon="pi pi-upload" severity="help" @click="router.push('/users/bulk-import')" />
                            <Button label="New" icon="pi pi-plus" severity="secondary" @click="openNew" />
                        </div>

                        <IconField class="w-full md:w-auto">
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters1['global'].value" placeholder="Employee Search" class="w-full md:w-auto" />
                        </IconField>
                    </div>
                </template>
                <template #empty> No employees found. </template>
                <template #loading> Loading employees data. Please wait. </template>
                <Column field="employeeId" header="Employee ID" :frozen="true" style="min-width: 10rem">
                    <template #body="{ data }">
                        {{ data.employeeId }}
                    </template>
                </Column>

                <Column field="firstName" header="First Name" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.firstName }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by first name" />
                    </template>
                </Column>
                <Column field="lastName" header="Last Name" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.lastName }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by last name" />
                    </template>
                </Column>

                <Column field="department" header="Department" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.departmentName }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by department" />
                    </template>
                </Column>
                <Column field="email" header="Email" style="min-width: 15rem">
                    <template #body="{ data }">
                        {{ data.email }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by email" />
                    </template>
                </Column>

                <Column field="branch" header="Branch" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.branch }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by branch" />
                    </template>
                </Column>

                <Column field="rating" header="Rating" dataType="boolean" bodyClass="text-center" style="min-width: 8rem">
                    <template #body="{ data }">
                        <Rating :modelValue="data.rating" :key="data.employeeId" :stars="10" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="data">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editEmployee(data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteEmployee(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="employeeDialog" :style="{ width: '550px' }" header="Employee Details" :modal="true">
            <div class="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="firstName" class="block font-bold mb-2">First Name *</label>
                        <InputText id="firstName" v-model.trim="employee.firstName" required="true" autofocus :invalid="submitted && !employee.firstName" class="w-full" />
                        <small v-if="submitted && !employee.firstName" class="text-red-500">First Name is required.</small>
                    </div>
                    <div>
                        <label for="lastName" class="block font-bold mb-2">Last Name *</label>
                        <InputText id="lastName" v-model.trim="employee.lastName" required="true" :invalid="submitted && !employee.lastName" class="w-full" />
                        <small v-if="submitted && !employee.lastName" class="text-red-500">Last Name is required.</small>
                    </div>
                </div>

                <div>
                    <label for="otherNames" class="block font-bold mb-2">Other Names</label>
                    <InputText id="otherNames" v-model.trim="employee.otherNames" class="w-full" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="email" class="block font-bold mb-2">Email Address *</label>
                        <InputText id="email" v-model.trim="employee.email" required="true" :invalid="submitted && !employee.email" class="w-full" />
                        <small v-if="submitted && !employee.email" class="text-red-500">Email is required.</small>
                    </div>
                    <div>
                        <label for="phone" class="block font-bold mb-2">Phone *</label>
                        <InputText id="phone" v-model.trim="employee.phone" required="true" :invalid="submitted && !employee.phone" class="w-full" />
                        <small v-if="submitted && !employee.phone" class="text-red-500">Phone is required.</small>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="branch" class="block font-bold mb-2">Branch *</label>
                        <Dropdown id="branch" v-model="employee.branch" :options="branches" optionLabel="name" optionValue="name" placeholder="Select a branch" class="w-full" :invalid="submitted && !employee.branch" />
                        <small v-if="submitted && !employee.branch" class="text-red-500">Branch is required.</small>
                    </div>
                    <div>
                        <label for="department" class="block font-bold mb-2">Department *</label>
                        <Dropdown id="department" v-model="employee.department" :options="departmentStore.departments" optionLabel="name" optionValue="id" placeholder="Select department" class="w-full" :invalid="submitted && !employee.department" />
                        <small v-if="submitted && !employee.department" class="text-red-500">Department is required.</small>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="gender" class="block font-bold mb-2">Gender</label>
                        <Dropdown id="gender" v-model="employee.gender" :options="genderOptions" optionLabel="label" optionValue="value" placeholder="Select gender" class="w-full" />
                    </div>
                    <div>
                        <label for="role" class="block font-bold mb-2">Role</label>
                        <Dropdown id="role" v-model="employee.role" :options="roles" optionLabel="label" optionValue="value" placeholder="Select a role" class="w-full" />
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveEmployee" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteEmployeeDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="employee"
                    >Are you sure you want to delete <b>{{ employee.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteEmployeeDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteEmployee" />
            </template>
        </Dialog>

        <!-- Employee Details Drawer -->
        <EmployeeDetails v-model:visible="employeeDetailsDialog" :employee="employee" />
    </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
