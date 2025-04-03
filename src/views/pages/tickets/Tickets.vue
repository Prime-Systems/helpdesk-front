<script setup>
import { CommentService } from '@/service/CommentService';
import { TicketService } from '@/service/TicketService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeMount, ref } from 'vue';

onBeforeMount(() => {
    //ProductService.getProducts().then((data) => (products.value = data));
    TicketService.getTickets().then((data) => (tickets.value = data));
    CommentService.getComments().then((data) => {
        comments.value = data;
        console.log('Comments', comments.value);
    });
    initFilters();
});

const toast = useToast();
const dt = ref();
const tickets = ref([]);
const comments = ref([]);
const ticketDialog = ref(false);
const ticketDetailsDialog = ref(false);
const deleteTicketDialog = ref(false);
const deleteTicketsDialog = ref(false);
const editingAssignee = ref(false);
const selectedAssignee = ref(null);
const editingDueDate = ref(false);
const selectedDueDate = ref(null);
const ticket = ref({
    title: '',
    description: '',
    category: null,
    tags: [],
    attachments: []
});
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

const documents = ref([
    { name: 'Project Proposal.pdf', type: 'pdf', url: '/files/project-proposal.pdf' },
    { name: 'Design Mockup.png', type: 'image', url: '/files/design-mockup.png' },
    { name: 'Report.docx', type: 'file', url: '/files/report.docx' }
]);

const newComment = ref({ text: '', private: false });

const statuses = ref(['open', 'ongoing', 'resolved', 'closed']);
const priorities = ref(['low', 'medium', 'high', 'urgent']);

const users = ref([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
    { id: 3, name: 'Michael Johnson', email: 'michael.johnson@example.com' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@example.com' },
    { id: 5, name: 'Robert Wilson', email: 'robert.wilson@example.com' },
    { id: 6, name: 'Sarah Brown', email: 'sarah.brown@example.com' },
    { id: 7, name: 'David Martinez', email: 'david.martinez@example.com' },
    { id: 8, name: 'Lisa Anderson', email: 'lisa.anderson@example.com' },
    { id: 9, name: 'James Taylor', email: 'james.taylor@example.com' },
    { id: 10, name: 'Jennifer Garcia', email: 'jennifer.garcia@example.com' }
]);
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

function openTicketDetailsDialog(event) {
    console.log('Row Clicked', event.data);
    ticketDetailsDialog.value = true;
    ticket.value = event.data;
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

// Add these methods to handle file uploads
const onUpload = (event) => {
    // This will be called when files are selected
    toast.add({ severity: 'info', summary: 'Success', detail: 'Files selected', life: 3000 });
};

// Modify your saveTicket function to handle the new form fields
function saveTicket() {
    submitted.value = true;

    if (ticket?.value.title?.trim()) {
        if (ticket.value.id) {
            // For existing tickets
            ticket.value.category = ticket.value.category.value ? ticket.value.category.value : ticket.value.category;

            // Set priority based on category (example logic)
            ticket.value.priority = determinePriorityFromCategory(ticket.value.category);

            const index = findIndexById(ticket.value.id);
            if (index !== -1) {
                tickets.value.splice(index, 1, ticket.value);
            }

            // Handle file uploads for existing ticket
            if (ticket.value.attachments && ticket.value.attachments.length > 0) {
                uploadFiles(ticket.value.id, ticket.value.attachments);
            }

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Ticket Updated', life: 3000 });
        } else {
            // For new tickets
            ticket.value.id = createId();
            ticket.value.code = createTicketCode();
            ticket.value.image = 'product-placeholder.svg';
            ticket.value.status = 'open';

            // Set priority based on category
            ticket.value.priority = determinePriorityFromCategory(ticket.value.category);

            // Ensure tags is an array
            if (!ticket.value.tags) {
                ticket.value.tags = [];
            }

            tickets.value.push(ticket.value);

            // Handle file uploads for new ticket
            if (ticket.value.attachments && ticket.value.attachments.length > 0) {
                uploadFiles(ticket.value.id, ticket.value.attachments);
            }

            toast.add({ severity: 'success', summary: 'Successful', detail: 'Ticket Created', life: 3000 });
        }

        ticketDialog.value = false;
        ticket.value = {};
    }
}

// Add a function to determine priority based on category
function determinePriorityFromCategory(category) {
    // Example logic - customize based on your business rules
    switch (category) {
        case 'security_access':
        case 'network_connectivity':
            return 'high';

        case 'email_communication':
        case 'account_management':
        case 'performance_optimization':
            return 'medium';

        default:
            return 'low';
    }
}

// Function to remove an attachment by index
function removeAttachment(index) {
    if (ticket.value.attachments && index >= 0 && index < ticket.value.attachments.length) {
        ticket.value.attachments.splice(index, 1);
        toast.add({ severity: 'info', summary: 'File Removed', detail: 'Attachment has been removed', life: 3000 });
    }
}

// Simulate file upload - in a real app, this would be an API call
function uploadFiles(ticketId, files) {
    console.log(`Uploading ${files.length} files for ticket ${ticketId}`);
    // In a real application, you would:
    // 1. Create FormData
    // 2. Append files
    // 3. Send to your API
    // 4. Handle response

    // Example:
    // const formData = new FormData();
    // formData.append('ticketId', ticketId);
    // files.forEach((fileInfo, index) => {
    //     formData.append(`file${index}`, fileInfo.file);
    // });
    //
    // fetch('/api/upload', {
    //     method: 'POST',
    //     body: formData
    // })
    // .then(response => response.json())
    // .then(data => console.log('Upload successful', data))
    // .catch(error => console.error('Error uploading files', error));

    // For this example, we'll just log it
    setTimeout(() => {
        console.log('Files uploaded successfully');
    }, 1500);
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

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

function getDaysUntilDue(dueDate) {
    if (!dueDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isPastDue(dueDate) {
    return getDaysUntilDue(dueDate) < 0;
}

const fileTypeIcon = (type) => {
    return type === 'pdf' ? 'pi pi-file-pdf text-red-500' : type === 'image' ? 'pi pi-image text-blue-500' : 'pi pi-file text-gray-500';
};

const fileTypeClass = (type) => {
    return type === 'pdf' ? 'bg-red-100 text-red-500' : type === 'image' ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-500';
};

const addComment = (ticketId) => {
    if (newComment.value.text.trim() !== '') {
        // Find the comment entry for this ticketId
        const ticketComments = comments.value.find((ticket) => ticket.ticketId === ticketId);

        if (ticketComments) {
            // If ticket exists, push the new comment into its comments array
            ticketComments.comments.push({
                commentId: `c${ticketComments.comments.length + 1}`, // Unique comment ID
                timestamp: new Date().toISOString(),
                comment: newComment.value.text,
                visibility: newComment.value.private ? 'private' : 'public',
                author: 'You'
            });
        } else {
            // If no comments exist for this ticket, create a new entry
            comments.value.push({
                ticketId,
                comments: [
                    {
                        commentId: 'c1',
                        timestamp: new Date().toISOString(),
                        comment: newComment.value.text,
                        visibility: newComment.value.private ? 'private' : 'public',
                        author: 'You'
                    }
                ]
            });
        }

        // Reset input fields
        newComment.value.text = '';
        newComment.value.private = false;
    }
};

const filteredComments = computed(() => {
    const ticketComm = comments.value.find((ticketComments) => ticketComments.ticketId == ticket.value.id);
    return ticketComm ? ticketComm.comments : [];
});

function editAssignee() {
    // Find current assignee in users array to pre-select
    selectedAssignee.value = users.value.find((user) => user.name === ticket.value.assignee) || null;
    editingAssignee.value = true;
}

function saveAssignee() {
    if (selectedAssignee.value) {
        // Here you would update the ticket
        // Either directly modify the ticket object if using a reactive ref
        ticket.value.assignee = selectedAssignee.value.name;

        // Or call an API method that you have in your component
        // updateTicketAssignee(ticket.value.id, selectedAssignee.value.id);
    }
    editingAssignee.value = false;
}

function cancelEdit() {
    editingAssignee.value = false;
    selectedAssignee.value = null;
}

const viewFile = (url) => {
    // Option 1: Open in a new tab
    window.open(url, '_blank');

    // Option 2: If you want to show in a modal/dialog instead
    // showDocumentDialog.value = true;
    // currentDocumentUrl.value = url;
};

function editDueDate() {
    // Set the currently selected date to the ticket's due date
    selectedDueDate.value = ticket.value.due_date ? new Date(ticket.value.due_date) : new Date();
    editingDueDate.value = true;
}

function saveDueDate() {
    if (selectedDueDate.value) {
        // Update the ticket's due date
        ticket.value.due_date = selectedDueDate.value;

        // Here you would call your API to update the ticket
        // updateTicketDueDate(ticket.value.id, selectedDueDate.value);
    }
    editingDueDate.value = false;
}

function cancelDueDateEdit() {
    editingDueDate.value = false;
    selectedDueDate.value = null;
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
                @row-click="openTicketDetailsDialog"
                :globalFilterFields="['category', 'status', 'category', 'priority', 'description']"
                filterDisplay="row"
                :rowHover="true"
                class="[&_tr]:cursor-pointer"
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
                        <InputText v-model="filters['description'].value" placeholder="Search..." style="min-width: 4rem" />
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

        <Dialog v-model:visible="ticketDialog" :style="{ width: '550px' }" header="Ticket Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Title</label>
                    <InputText id="name" v-model.trim="ticket.title" required="true" autofocus :invalid="submitted && !ticket.title" class="w-full" />
                    <small v-if="submitted && !ticket.title" class="text-red-500">Title is required.</small>
                </div>

                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model="ticket.description" required="true" rows="3" class="w-full" />
                </div>

                <div>
                    <label for="category" class="block font-bold mb-3">Category</label>
                    <Select id="category" v-model="ticket.category" :options="categories" optionLabel="label" optionValue="value" placeholder="Select a category" checkmark :highlightOnSelect="false" class="w-full" />
                    <small class="text-gray-500">Priority will be set automatically based on category</small>
                </div>

                <div>
                    <label for="tags" class="block font-bold mb-3">Tags</label>
                    <Chips v-model="ticket.tags" class="w-full" placeholder="Add tags and press enter" :addOnBlur="true" :allowDuplicate="false" />
                </div>

                <div>
                    <label for="attachments" class="block font-bold mb-3">Attachments</label>
                    <FileUpload
                        :multiple="true"
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        :maxFileSize="5000000"
                        chooseLabel="Browse"
                        class="w-full"
                        @upload="onUpload"
                    >
                        <template #empty>
                            <p>Drag and drop files here to upload.</p>
                        </template>
                    </FileUpload>
                    <small class="text-gray-500">Maximum file size: 5MB</small>
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

        <div class="card flex justify-center items-center">
            <Drawer v-model:visible="ticketDetailsDialog" position="right" class="!w-full md:!w-[50rem] lg:!w-[50rem]" :blockScroll="true">
                <template #header>
                    <div class="flex flex-row justify-between items-center">
                        <div class="flex items-center gap-2">
                            <Tag :value="transformPriorityAndStatus(ticket.status)" :severity="getStatusLabel(ticket.status)" />
                            <span class="font-bold text-lg">{{ ticket.code }}</span>
                        </div>
                        <div class="flex items-center">
                            <Button icon="pi pi-paperclip" text size="small" label="Attach" @click="editTicket(ticket)" />
                            <Button icon="pi pi-share-alt" text size="small" label="Share" @click="editTicket(ticket)" />
                        </div>
                    </div>
                </template>

                <template #default>
                    <div class="flex flex-col">
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2 capitalize">{{ ticket.title }}</h1>

                        <div class="flex items-center gap-6 mb-2">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-clock text-gray-400"></i>
                                <span class="text-sm" :class="{ 'text-red-500': isPastDue(ticket.due_date) }">
                                    {{ isPastDue(ticket.due_date) ? 'Late by ' : 'Due in ' }}
                                    {{ Math.abs(getDaysUntilDue(ticket.due_date)) }}
                                    {{ Math.abs(getDaysUntilDue(ticket.due_date)) === 1 ? 'day' : 'days' }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-flag-fill text-red-500"></i>
                                <span class="text-sm">{{ transformPriorityAndStatus(ticket.priority) }} Priority</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-comments text-gray-400"></i>
                                <span class="text-sm">8 comments</span>
                            </div>
                        </div>
                    </div>

                    <!--Tabs for activity and comments-->
                    <Tabs value="0">
                        <TabList>
                            <Tab value="0">Activities</Tab>
                            <Tab value="1">Comments</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel value="0">
                                <div class="flex flex-col gap-6">
                                    <div class="space-y-3">
                                        <h2 class="text-lg font-semibold">Details</h2>
                                        <div class="flex flex-col gap-3 text-sm">
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[100px]">Assignee</span>
                                                <div class="flex items-center gap-2">
                                                    <template v-if="editingAssignee">
                                                        <Dropdown v-model="selectedAssignee" :options="users" optionLabel="name" placeholder="Select an Assignee" class="w-full md:w-14rem" />
                                                        <Button icon="pi pi-check" size="small" outlined severity="success" aria-label="Save" @click="saveAssignee" />
                                                        <Button icon="pi pi-times" size="small" outlined severity="secondary" aria-label="Cancel" @click="cancelEdit" />
                                                    </template>
                                                    <template v-else>
                                                        <span>{{ ticket.assignee }}</span>
                                                        <button class="text-gray-400 hover:text-gray-600 focus:outline-none ml-2" @click="editAssignee" title="Reassign">
                                                            <i class="pi pi-user-edit text-sm"></i>
                                                        </button>
                                                    </template>
                                                </div>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[100px]">Due Date</span>
                                                <div class="flex items-center gap-2">
                                                    <template v-if="editingDueDate">
                                                        <Calendar v-model="selectedDueDate" showIcon :minDate="new Date()" dateFormat="dd/mm/yy" class="w-full md:w-14rem" />
                                                        <Button icon="pi pi-check" size="small" outlined severity="success" aria-label="Save" @click="saveDueDate" />
                                                        <Button icon="pi pi-times" size="small" outlined severity="secondary" aria-label="Cancel" @click="cancelDueDateEdit" />
                                                    </template>
                                                    <template v-else>
                                                        <i class="pi pi-calendar"></i>
                                                        <span>{{ formatDate(ticket.due_date) }}</span>
                                                        <button class="text-gray-400 hover:text-gray-600 focus:outline-none ml-2" @click="editDueDate" title="Change due date">
                                                            <i class="pi pi-pencil text-sm"></i>
                                                        </button>
                                                    </template>
                                                </div>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[100px]">Category</span>
                                                <span>{{ transformCategoryValue(ticket.category) }}</span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[100px]">Status</span>
                                                <Tag :value="ticket.status" :severity="getStatusLabel(ticket.status)" />
                                            </div>
                                        </div>
                                    </div>

                                    <div class="space-y-4">
                                        <h2 class="text-sm font-semibold">Tags</h2>
                                        <div class="flex flex-wrap gap-2">
                                            <Tag value="Support" severity="info" />
                                            <Tag value="Urgent" severity="danger" />
                                            <Tag value="Mobile" severity="success" />
                                        </div>
                                    </div>
                                </div>

                                <div class="flex-grow">
                                    <div class="mb-6">
                                        <h2 class="text-lg font-semibold mb-2">Description</h2>
                                        <p class="text-sm text-gray-600 leading-relaxed">{{ ticket.description }}</p>
                                    </div>

                                    <div class="mb-6">
                                        <div class="flex flex-row">
                                            <h2 class="text-lg font-semibold min-w-[100px]">Attachments</h2>
                                            <!-- <Button icon="pi pi-download" text size="small" label="Download all" /> -->
                                        </div>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            <Card v-for="(doc, index) in documents" :key="index" class="p-2 shadow-lg rounded-xl cursor-pointer">
                                                <template #content>
                                                    <div class="flex items-center gap-2" @click="viewFile(doc.url)">
                                                        <!-- File Type Icon -->
                                                        <div class="p-2 rounded-lg" :class="fileTypeClass(doc.type)">
                                                            <i :class="fileTypeIcon(doc.type)" class="text-xl"></i>
                                                        </div>

                                                        <!-- File Info -->
                                                        <div class="flex-1">
                                                            <p class="truncate text-md font-medium">{{ doc.name }}</p>
                                                            <p class="text-sm text-gray-500">{{ doc.type.toUpperCase() }}</p>
                                                        </div>

                                                        <!-- Actions -->
                                                        <!-- <div class="flex gap-1">
                                                            <Button icon="pi pi-eye" class="p-button-rounded p-button-text" @click="viewFile(doc.url)" />
                                                            <Button icon="pi pi-download" class="p-button-rounded p-button-text" @click="downloadFile(doc.url, doc.name)" />
                                                        </div> -->
                                                    </div>
                                                </template>
                                            </Card>
                                        </div>
                                    </div>
                                </div>

                                <!-- Activities Timeline Tab -->

                                <p class="text-lg font-semibold">Activity Timeline</p>

                                <Timeline :value="ticket.activities" class="w-full md:w-80" align="alternate">
                                    <template #opposite="slotProps">
                                        <small class="text-surface-500 dark:text-surface-400">{{ formatDate(slotProps.item.timestamp) }}</small>
                                    </template>
                                    <template #content="slotProps">
                                        <div class="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                            <p class="text-md font-medium">{{ slotProps.item.activity }}</p>
                                            <!-- <p class="text-sm text-gray-500">{{ formatDate(slotProps.item.timestamp) }}</p> -->
                                        </div>
                                    </template>
                                </Timeline>
                            </TabPanel>

                            <!-- Comments Tab -->
                            <TabPanel value="1">
                                <div class="space-y-4">
                                    <!-- List Comments -->

                                    <div v-for="comment in filteredComments" :key="comment.commentId" class="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <div class="flex items-center justify-between">
                                            <p class="font-medium">{{ comment.author }}</p>
                                            <p class="text-xs text-gray-500">{{ formatDate(comment.timestamp) }}</p>
                                        </div>
                                        <p class="text-sm mt-2" :class="{ 'italic text-gray-400': comment.visibility == 'private' }">{{ comment.comment }} <span v-if="comment.visibility == 'private'">(Private)</span></p>
                                    </div>

                                    <!-- Add New Comment -->
                                    <div class="mt-4">
                                        <Textarea v-model="newComment.text" rows="3" class="w-full" placeholder="Add a comment..." />
                                        <div class="flex items-center justify-between mt-2">
                                            <div class="flex items-center gap-2">
                                                <Checkbox v-model="newComment.private" :binary="true" />
                                                <label for="privateComment">Private</label>
                                            </div>
                                            <Button label="Post" icon="pi pi-send" class="p-button-sm" @click="addComment(ticket.id)" />
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </template>
            </Drawer>
        </div>
    </div>
</template>

<style scoped>
.p-drawer .p-drawer-header {
    padding-bottom: 0;
}

.p-drawer .p-drawer-content {
    padding: 1.5rem;
}

.p-drawer .p-drawer-mask.p-component-overlay {
    background-color: rgba(0, 0, 0, 0.4);
}

.p-card {
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}
.p-card:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
</style>
