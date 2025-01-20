<script setup>
import { EmployeeService } from '@/service/EmployeeService';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, ref } from 'vue';
const employees = ref();
const employee = ref({});
const employeeDialog = ref(false);
const submitted = ref(false);
const deleteEmployeeDialog = ref(false);
const filters1 = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const loading1 = ref(null);
const toast = useToast();
onBeforeMount(() => {
    EmployeeService.getEmployeesXLarge().then((data) => {
        employees.value = data;
        loading1.value = false;
    });

    initFilters1();
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

function hideDialog() {
    employeeDialog.value = false;
    submitted.value = false;
}

function createTicketCode() {
    const prefix = 'EMP-';
    const randomNumber = Math.floor(Math.random() * 1000000); // Generate a number between 0 and 999999
    const paddedNumber = String(randomNumber).padStart(6, '0'); // Pad with leading zeros to ensure 6 digits
    return prefix + paddedNumber;
}
function saveEmployee() {
    submitted.value = true;

    if (employee?.value.name?.trim()) {
        if (employee.value.employeeId) {
            const index = findIndexById(employee.value.employeeId);
            if (index !== -1) {
                employees.value[index] = { ...employee.value }; // Spread operator ensures reactivity
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Employee Updated', life: 3000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Employee Not Found', life: 3000 });
            }
            employeeDialog.value = false;
            employee.value = {};
        } else {
            employee.value.emploeeId = createTicketCode();
            employee.value.photo = 'product-placeholder.svg';
            employee.value.branch = employee.value.branch ? employee.value.branch : 'Head Office';
            employee.value.department = employee.value.department ? employee.value.department : 'IT';
            employee.value.rating = 0;
            employee.value.role = 'Employee';
            employee.value.email = employee.value.email ? employee.value.email : 'email@email.com';
            employee.value.phone = employee.value.phone ? employee.value.phone : '1234567890';
            employee.value.hireDate = new Date();

            employees.value.push(employee.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Employee Created', life: 3000 });
        }

        employeeDialog.value = false;
        employee.value = {};
    }
}
</script>

<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl mb-4">Filtering</div>
            <DataTable
                :value="employees"
                :paginator="true"
                :rows="10"
                dataKey="id"
                :rowHover="true"
                v-model:filters="filters1"
                filterDisplay="menu"
                :loading="loading1"
                :filters="filters1"
                :globalFilterFields="['name', 'branch', 'department']"
                showGridlines
            >
                <template #header>
                    <div class="flex justify-between">
                        <div>
                            <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                            <Button label="New" icon="pi pi-plus" class="ml-2" severity="secondary" @click="openNew" />
                        </div>

                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters1['global'].value" placeholder="Employee Search" />
                        </IconField>
                    </div>
                </template>
                <template #empty> No customers found. </template>
                <template #loading> Loading customers data. Please wait. </template>
                <Column field="name" header="Name" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.name }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by name" />
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
                <Column field="department" header="Department" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.department }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by branch" />
                    </template>
                </Column>

                <Column field="rating" header="Rating" dataType="boolean" bodyClass="text-center" style="min-width: 8rem">
                    <template #body="{ data }">
                        <Rating :modelValue="data.rating" :key="data.employeeId" :stars="10" />
                    </template>
                    <!-- <template #filter="{ filterModel }">
                    <label for="verified-filter" class="font-bold"> Verified </label>
                    <Checkbox v-model="filterModel.value" :indeterminate="filterModel.value === null" binary inputId="verified-filter" />
                </template> -->
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="data">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editEmployee(data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteEmplyee(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="employeeDialog" :style="{ width: '450px' }" header="Employee Details" :modal="true">
            <div class="flex flex-col gap-6">
                <img :src="`https://avatar.iran.liara.run/public/50`" alt="employee" class="block m-auto pb-4" width="200" />
                <div>
                    <label for="name" class="block font-bold mb-3">Name</label>
                    <InputText id="name" v-model.trim="employee.name" required="true" autofocus :invalid="submitted && !employee.name" fluid />
                    <small v-if="submitted && !employee.name" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="email" class="block font-bold mb-3">Email Address</label>
                    <InputText id="name" v-model.trim="employee.email" required="true" autofocus :invalid="submitted && !employee.email" fluid />
                    <small v-if="submitted && !employee.email" class="text-red-500">Email is required.</small>
                </div>
                <div>
                    <label for="branch" class="block font-bold mb-3">Branch</label>
                    <InputText id="name" v-model.trim="employee.branch" required="true" autofocus :invalid="submitted && !employee.branch" fluid />
                    <small v-if="submitted && !employee.branch" class="text-red-500">Branch is required.</small>
                </div>
                <div>
                    <label for="department" class="block font-bold mb-3">Department</label>
                    <InputText id="department" v-model.trim="employee.department" required="true" autofocus :invalid="submitted && !employee.department" fluid />
                    <small v-if="submitted && !employee.department" class="text-red-500">Department is required.</small>
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
