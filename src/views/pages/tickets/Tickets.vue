<script setup>
import { TicketService } from '@/service/TicketService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, ref } from 'vue';

onBeforeMount(() => {
    //ProductService.getProducts().then((data) => (products.value = data));
    TicketService.getTickets().then((data) => (tickets.value = data));
    initFilters();
});

const toast = useToast();
const dt = ref();
const tickets = ref([]);
const ticketDialog = ref(false);
const deleteTicketDialog = ref(false);
const deleteTicketsDialog = ref(false);
const ticket = ref({});
const selectedTickets = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    category: { value: null, matchMode: FilterMatchMode.EQUALS },
    priority: { value: null, matchMode: FilterMatchMode.EQUALS },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const categories = ref([
    { label: 'Network & Connectivity', value: 'network_connectivity' },
    { label: 'Hardware & Devices', value: 'hardware_devices' },
    { label: 'Software & Applications', value: 'software_applications' },
    { label: 'Email & Communication', value: 'email_communication' },
    { label: 'Security & Access', value: 'security_access' },
    { label: 'Account Management', value: 'account_management' },
    { label: 'Data & Backup', value: 'data_backup' },
    { label: 'Performance & Optimization', value: 'performance_optimization' },
    { label: 'Web & Online Services', value: 'web_online_services' },
    { label: 'Printing & Office Equipment', value: 'printing_office_equipment' },
    { label: 'Administrative & Requests', value: 'administrative_requests' }
]);

const statuses = ref(['open', 'ongoing', 'resolved', 'closed']);
const priorities = ref(['low', 'medium', 'high', 'urgent']);

const transformCategoryValue = (value) => {
    const category = categories.value.find((cat) => cat.value === value);
    return category ? category.label : value;
};

function openNew() {
    ticket.value = {};
    submitted.value = false;
    ticketDialog.value = true;
}

function hideDialog() {
    ticketDialog.value = false;
    submitted.value = false;
}

function initFilters() {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        status: { value: null, matchMode: FilterMatchMode.EQUALS },
        category: { value: null, matchMode: FilterMatchMode.EQUALS },
        priority: { value: null, matchMode: FilterMatchMode.EQUALS },
        description: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
}

function saveTicket() {
    submitted.value = true;

    if (ticket?.value.title?.trim()) {
        if (ticket.value.id) {
            ticket.value.category = ticket.value.category.value ? ticket.value.category.value : ticket.value.category;
            const index = findIndexById(ticket.value.id);
            if (index !== -1) {
                tickets.value.splice(index, 1, ticket.value);
            }

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Ticket Updated', life: 3000 });
        } else {
            ticket.value.id = createId();
            ticket.value.code = createTicketCode();
            ticket.value.image = 'product-placeholder.svg';
            ticket.value.status = ticket.value.status ? ticket.value.status.value : 'open';
            ticket.value.category = ticket.value.category.status ? ticket.value.category.value : 'administrative_requests';
            tickets.value.push(ticket.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Ticket Created', life: 3000 });
        }

        ticketDialog.value = false;
        ticket.value = {};
    }
}

function editTicket(prod) {
    ticket.value = { ...prod };
    ticketDialog.value = true;
}

function confirmDeleteTicket(prod) {
    ticket.value = prod;
    deleteTicketDialog.value = true;
}

function deleteTicket() {
    tickets.value = tickets.value.filter((val) => val.id !== ticket.value.id);
    deleteTicketDialog.value = false;
    ticket.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Ticket Deleted', life: 3000 });
}

function findIndexById(id) {
    if (!Array.isArray(tickets.value)) return -1;
    return tickets.value.findIndex((ticket) => ticket.id === id);
}

function createId() {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function createTicketCode() {
    const prefix = 'TICK-';
    const randomNumber = Math.floor(Math.random() * 1000000); // Generate a number between 0 and 999999
    const paddedNumber = String(randomNumber).padStart(6, '0'); // Pad with leading zeros to ensure 6 digits
    return prefix + paddedNumber;
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteTicketsDialog.value = true;
}

function deleteSelectedTickets() {
    tickets.value = tickets.value.filter((val) => !selectedTickets.value.includes(val));
    deleteTicketsDialog.value = false;
    selectedTickets.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Tickets Deleted', life: 3000 });
}

function getStatusLabel(status) {
    switch (status) {
        case 'resolved':
            return 'success';

        case 'ongoing':
            return 'warn';

        case 'open':
            return 'danger';

        case 'closed':
            return 'info';

        default:
            return null;
    }
}

function getPriorityLabel(status) {
    switch (status) {
        case 'low':
            return 'info';

        case 'medium':
            return 'success';

        case 'high':
            return 'warn';

        case 'urgent':
            return 'danger';

        default:
            return null;
    }
}

function transformPriorityAndStatus(priority) {
    return priority
        .split('_')
        .map((word) => word.toUpperCase())
        .join(' ');
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedTickets || !selectedTickets.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                v-model:selection="selectedTickets"
                :value="tickets"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                row-click=""
                :globalFilterFields="['category', 'status', 'category', 'priority', 'description']"
                filterDisplay="row"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Tickets</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <!-- <Column field="code" header="Code" style="min-width: 7rem"></Column> -->

                <Column field="category" header="Category" style="min-width: 6rem" sortable :showFilterMenu="false">
                    <template #body="{ data }">
                        {{ transformCategoryValue(data.category) }}
                    </template>
                    <template #filter="{ filterModel }">
                        <Select v-model="filters['category'].value" :options="categories" placeholder="Select One" style="min-width: 4rem" :showClear="true" :optionLabel="(option) => option.label" :optionValue="(option) => option.value">
                            <template #option="slotProps">
                                {{ slotProps.option.label }}
                            </template>
                        </Select>
                    </template>
                </Column>
                <Column field="description" sortable header="Description" style="min-width: 15rem" :showFilterMenu="false">
                    <template #body="{ data }">
                        <span>{{ data.description }}</span>
                    </template>

                    <template #filter="{ filterModel }">
                        <InputText v-model="filters['description'].value" placeholder="Search..." />
                    </template>
                </Column>
                <Column field="priority" sortable header="Priority" style="min-width: 6rem" :showFilterMenu="false">
                    <template #body="{ data }">
                        <Tag :value="transformPriorityAndStatus(data.priority)" :severity="getPriorityLabel(data.priority)" />
                    </template>
                    <template #filter="{ filterModel }">
                        <Select v-model="filters['priority'].value" :options="priorities" placeholder="Select One" style="min-width: 4rem" :showClear="true">
                            <template #option="slotProps">
                                <Tag :value="transformPriorityAndStatus(slotProps.option)" :severity="getPriorityLabel(slotProps.option)" />
                            </template>
                        </Select>
                    </template>
                </Column>

                <Column field="status" header="Status" style="min-width: 6rem" sortable :showFilterMenu="false">
                    <template #body="{ data }">
                        <Tag :value="transformPriorityAndStatus(data.status)" :severity="getStatusLabel(data.status)" />
                    </template>
                    <template #filter="{ filterModel }">
                        <Select v-model="filters['status'].value" :options="statuses" placeholder="Select One" style="min-width: 4rem" :showClear="true">
                            <template #option="slotProps">
                                <Tag :value="transformPriorityAndStatus(slotProps.option)" :severity="getStatusLabel(slotProps.option)" />
                            </template>
                        </Select>
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="{ data }">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editTicket(data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteTicket(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="ticketDialog" :style="{ width: '450px' }" header="Ticket Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Title</label>
                    <InputText id="name" v-model.trim="ticket.title" required="true" autofocus :invalid="submitted && !ticket.title" fluid />
                    <small v-if="submitted && !ticket.title" class="text-red-500">Title is required.</small>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model="ticket.description" required="true" rows="3" cols="20" fluid />
                </div>
                <div>
                    <label for="category" class="block font-bold mb-3">Category</label>
                    <Select id="category" v-model="ticket.category" :options="categories" optionLabel="label" optionValue="value" placeholder="Select a category" checkmark :highlightOnSelect="false" fluid></Select>
                </div>

                <div>
                    <span class="block font-bold mb-4">Priority</span>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="flex items-center gap-2 col-span-6">
                            <RadioButton id="priority1" v-model="ticket.priority" name="priority" value="low" />
                            <label for="priority1">Low</label>
                        </div>
                        <div class="flex items-center gap-2 col-span-6">
                            <RadioButton id="priority2" v-model="ticket.priority" name="priority" value="medium" />
                            <label for="priority2">Medium</label>
                        </div>
                        <div class="flex items-center gap-2 col-span-6">
                            <RadioButton id="priority3" v-model="ticket.priority" name="priority" value="high" />
                            <label for="priority3">High</label>
                        </div>
                        <div class="flex items-center gap-2 col-span-6">
                            <RadioButton id="priority4" v-model="ticket.priority" name="priority" value="urgent" />
                            <label for="priority4">Urgent</label>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveTicket" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteTicketDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="ticket"
                    >Are you sure you want to delete <b>{{ ticket.code }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteTicketDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteTicket" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteTicketsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="ticket">Are you sure you want to delete the selected products?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteTicketsDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedTickets" />
            </template>
        </Dialog>
    </div>
</template>
