<script setup>
import { CustomerService } from '@/service/CustomerPrimeService';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, ref } from 'vue';
const customers = ref([]);
const customer = ref({});
const customerDialog = ref(false);
const submitted = ref(false);
const deletecustomerDialog = ref(false);
const filters1 = ref();
const loading1 = ref(null);
const toast = useToast();
onBeforeMount(() => {
    CustomerService.getCustomersXLarge().then((data) => {
        customers.value = data;
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
    customer.value = {};
    submitted.value = false;
    customerDialog.value = true;
}

function editcustomer(selectedcustomer) {
    customer.value = { ...selectedcustomer.data };
    customerDialog.value = true;
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < customers.value.length; i++) {
        if (customers.value[i].customerId === id) {
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
    customerDialog.value = false;
    submitted.value = false;
}

function confirmDeletecustomer(selectedcustomer) {
    customer.value = selectedcustomer.data;
    deletecustomerDialog.value = true;
}

function deletecustomer() {
    customers.value = customers.value.filter((val) => val.customerId !== customer.value.customerId);
    deletecustomerDialog.value = false;
    customer.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'customer Deleted', life: 3000 });
}

function createcustomerCode() {
    const prefix = 'C-';
    const randomNumber = Math.floor(Math.random() * 1000000); // Generate a number between 0 and 999999
    const paddedNumber = String(randomNumber).padStart(6, '0'); // Pad with leading zeros to ensure 6 digits
    return prefix + paddedNumber;
}
function savecustomer() {
    submitted.value = true;

    if (customer?.value.name?.trim()) {
        if (customer.value.customerId) {
            const index = findIndexById(customer.value.customerId);
            if (index !== -1) {
                customers.value[index] = { ...customer.value }; // Spread operator ensures reactivity
                toast.add({ severity: 'success', summary: 'Successful', detail: 'customer Updated', life: 3000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'customer Not Found', life: 3000 });
            }
            customerDialog.value = false;
            customer.value = {};
        } else {
            customer.value.customerId = createcustomerCode();
            customer.value.csatScore = 0;
            customer.value.jobTitle = 'Software Engineer';
            customer.value.department = 'Development';
            customer.value.companyName = 'PrimeTek';
            customer.value.phone = '+1 (480) 262-0555';
            customer.value.preferredContactMethod = 'Phone';

            customers.value.push(customer.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'customer Created', life: 3000 });
        }

        customerDialog.value = false;
        customer.value = {};
    }
}
</script>

<template>
    <div>
        <div class="card">
            <div class="font-semibold text-xl mb-4">Customers</div>
            <DataTable
                :value="customers"
                :paginator="true"
                :rows="10"
                dataKey="customerId"
                :rowHover="true"
                v-model:filters="filters1"
                filterDisplay="menu"
                :loading="loading1"
                :filters="filters1"
                :globalFilterFields="['name', 'email', 'companyName', 'jobTitle', 'department']"
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
                            <InputText v-model="filters1['global'].value" placeholder="customer Search" />
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
                <Column field="email" header="Email" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.email }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by email" />
                    </template>
                </Column>
                <Column field="companyName" header="Company" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.companyName }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by company" />
                    </template>
                </Column>

                <Column field="jobTitle" header="Job Title" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.jobTitle }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by job title" />
                    </template>
                </Column>

                <Column field="csatScore" header="CSAT Score" bodyClass="text-center" style="min-width: 12rem">
                    <template #body="{ data }">
                        <Rating :modelValue="data.csatScore" :key="data.customerId" :stars="10">
                            <template #onicon>
                                <img src="https://primefaces.org/cdn/primevue/images/rating/custom-onicon.png" height="24" width="24" alt="onicon" />
                            </template>
                            <template #officon>
                                <img src="https://primefaces.org/cdn/primevue/images/rating/custom-officon.png" height="24" width="24" alt="officon" />
                            </template>
                        </Rating>
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="data">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editcustomer(data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletecustomer(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="customerDialog" :style="{ width: '450px' }" header="customer Details" :modal="true">
            <div class="flex flex-col gap-6">
                <img :src="`https://avatar.iran.liara.run/public/50`" alt="customer" class="block m-auto pb-4" width="200" />
                <div>
                    <label for="name" class="block font-bold mb-3">Name</label>
                    <InputText id="name" v-model.trim="customer.name" required="true" autofocus :invalid="submitted && !customer.name" fluid />
                    <small v-if="submitted && !customer.name" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="email" class="block font-bold mb-3">Email Address</label>
                    <InputText id="email" v-model.trim="customer.email" required="true" autofocus :invalid="submitted && !customer.email" fluid />
                    <small v-if="submitted && !customer.email" class="text-red-500">Email is required.</small>
                </div>
                <div>
                    <label for="companyName" class="block font-bold mb-3">Company Name</label>
                    <InputText id="companyName" v-model.trim="customer.companyName" required="true" autofocus :invalid="submitted && !customer.companyName" fluid />
                    <small v-if="submitted && !customer.companyName" class="text-red-500">Company Name is required.</small>
                </div>
                <div>
                    <label for="department" class="block font-bold mb-3">Department</label>
                    <InputText id="department" v-model.trim="customer.department" required="true" autofocus :invalid="submitted && !customer.department" fluid />
                    <small v-if="submitted && !customer.department" class="text-red-500">Department is required.</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="savecustomer" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletecustomerDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="customer"
                    >Are you sure you want to delete <b>{{ customer.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deletecustomerDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deletecustomer" />
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
