<script setup>
import { CategoryService } from '@/service/CategoryService';
import { CommentService } from '@/service/CommentService';
import { EmployeeService } from '@/service/EmployeeService';
import { TicketService } from '@/service/TicketService';
import { useAuthStore } from '@/stores/AuthStore';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeMount, ref } from 'vue';
const loading = ref(false);

const authStore = useAuthStore();

onBeforeMount(() => {
    TicketService.getTickets().then((data) => {
        // Handle the new API response structure
        tickets.value = data.tickets || [];
        totalRecords.value = data.totalItems || 0;
        currentPageData.value = {
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            pageSize: data.pageSize,
            hasNext: data.hasNext,
            hasPrevious: data.hasPrevious,
            isFirst: data.isFirst,
            isLast: data.isLast
        };

        console.log('Tickets', tickets.value);
    });

    // CategoryService.getCategories().then((data) => {
    //     categories.value = data.map((cat) => ({
    //         label: cat.displayName,
    //         value: cat.name
    //     }));
    //     console.log('Categories', categories.value);
    // });

    CategoryService.getCategories().then((data) => {
        categories.value = data.map((cat) => ({
            label: cat.name, // Use 'name' instead of 'displayName'
            value: cat.name, // Use 'name' to match ticket.categoryName
            data: cat, // Store the full category object for reference
            id: cat.id
        }));
        console.log('Categories', categories.value);
    });

    // EmployeeService.getEmployees().then((data) => {
    //     users.value = data;
    //     console.log('Users', users.value);
    // });

    EmployeeService.getEmployees().then((data) => {
        users.value = data.map((user) => ({
            ...user,
            name: `${user.firstName} ${user.lastName}`.trim() // Create full name
        }));
        console.log('Users', users.value);
    });

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
const userId = computed(() => authStore.user?.id);
const editingStatus = ref(false);
const selectedStatus = ref(null);

// Fixed ticket object with proper defaults
const ticket = ref({
    title: '',
    description: '',
    categoryName: null,
    tags: '',
    attachmentUrl: null, // Single string, not array
    assignedUserName: '',
    assignedUserEmail: '',
    dueDate: null,
    priority: 'MEDIUM',
    status: 'OPEN'
});

const selectedTickets = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    categoryName: { value: null, matchMode: FilterMatchMode.EQUALS },
    priority: { value: null, matchMode: FilterMatchMode.EQUALS },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const categories = ref([]);

const documents = ref([
    { name: 'Project Proposal.pdf', type: 'pdf', url: '/files/project-proposal.pdf' },
    { name: 'Design Mockup.png', type: 'image', url: '/files/design-mockup.png' },
    { name: 'Report.docx', type: 'file', url: '/files/report.docx' }
]);

const newComment = ref({ text: '', private: false });

const statuses = ref(['open', 'ongoing', 'resolved', 'closed']);
const priorities = ref(['low', 'medium', 'high', 'urgent']);

const users = ref([]);

const transformCategoryValue = (value) => {
    return value || 'Unknown Category';
};

const transformAssigneeName = (ticket) => {
    return ticket.assignedUserName || 'Unassigned';
};

const transformAssigneeEmail = (ticket) => {
    return ticket.assignedUserEmail || '';
};

const totalRecords = ref(0);
const currentPageData = ref({});

function openNew() {
    // Fixed: Properly reset ticket with all required fields
    ticket.value = {
        title: '',
        description: '',
        categoryName: null,
        tags: '',
        attachmentUrl: null,
        assignedUserName: '',
        assignedUserEmail: '',
        dueDate: null,
        priority: 'MEDIUM',
        status: 'OPEN'
    };
    selectedAssignee.value = null;
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
    ticket.value = { ...event.data };
}

function initFilters() {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        status: { value: null, matchMode: FilterMatchMode.EQUALS },
        categoryName: { value: null, matchMode: FilterMatchMode.EQUALS },
        priority: { value: null, matchMode: FilterMatchMode.EQUALS },
        description: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
}

// Fixed: Handle single file upload
const onUpload = (event) => {
    if (event.files && event.files.length > 0) {
        // For now, just store the file name or URL
        ticket.value.attachmentUrl = event.files[0].name;
        toast.add({ severity: 'info', summary: 'Success', detail: 'File selected', life: 3000 });
    }
};

// Fixed: Save ticket function
async function saveTicket() {
    submitted.value = true;

    if (ticket.value?.title?.trim()) {
        if (ticket.value.id) {
            // Update existing ticket
            const index = findIndexById(ticket.value.id);
            if (index !== -1) {
                // Ensure categoryName is properly set
                if (ticket.value.categoryName && typeof ticket.value.categoryName === 'object') {
                    ticket.value.categoryName = ticket.value.categoryName.value;
                }

                //Make api call to update ticket
                const response = await TicketService.updateTicket(ticket.value.id, ticketData);

                if (response) {
                    tickets.value.splice(index, 1, { ...ticket.value });
                    toast.add({ severity: 'success', summary: 'Successful', detail: 'Ticket Updated', life: 3000 });
                } else {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update ticket', life: 3000 });
                }
            }
        } else {
            // Create new ticket
            ticket.value.id = createId();
            ticket.value.createdAt = new Date().toISOString();
            ticket.value.commentCount = 0;

            console.log('Categroy object before assignment:', ticket.value.categoryName);

            // Ensure categoryName is properly set
            // if (ticket.value.categoryName && typeof ticket.value.categoryName === 'object') {
            //     ticket.value.categoryName = ticket.value.categoryName.value;
            // }

            //Set categoryId based on selected category
            console.log('Category after assignment:', ticket.value.categoryName);
            const selectedCategory = categories.value.find((category) => category.value === ticket.value.categoryName);
            if (selectedCategory) {
                ticket.value.categoryId = selectedCategory.id;
            }

            console.log('Category ID set to:', ticket.value.categoryId);

            // Set assignee if selected
            if (selectedAssignee.value) {
                ticket.value.assignedUserName = selectedAssignee.value.name;
                ticket.value.assignedUserEmail = selectedAssignee.value.email;
            }
            ticket.value.createdById = userId.value;
            console.log('Creating Ticket', ticket.value);

            // Make API call to create ticket
            const response = await TicketService.createTicket(ticket.value);

            if (response) {
                tickets.value.unshift({ ...ticket.value });
                toast.add({ severity: 'success', summary: 'Successful', detail: 'Ticket Created', life: 3000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create ticket', life: 3000 });
            }
        }

        ticketDialog.value = false;
        // Reset ticket for next use
        ticket.value = {
            title: '',
            description: '',
            categoryName: null,
            tags: '',
            attachmentUrl: null,
            assignedUserName: '',
            assignedUserEmail: '',
            dueDate: null,
            priority: 'MEDIUM',
            status: 'OPEN'
        };
        selectedAssignee.value = null;
    }
}

function resetTicketForm() {
    ticket.value = {
        title: '',
        description: '',
        categoryName: null,
        tags: '',
        attachmentUrl: null,
        assignedUserName: '',
        assignedUserEmail: '',
        dueDate: null,
        priority: 'MEDIUM',
        status: 'OPEN'
    };
    selectedAssignee.value = null;
    submitted.value = false;
}

function editStatus() {
    selectedStatus.value = ticket.value.status;
    editingStatus.value = true;
}

function saveStatus() {
    if (selectedStatus.value) {
        ticket.value.status = selectedStatus.value;

        // Call API to update ticket status
        TicketService.updateStatus(ticket.value.id, selectedStatus.value, authStore.userId)
            .then((response) => {
                // Update local state
                const index = findIndexById(ticket.value.id);
                if (index !== -1) {
                    tickets.value[index].status = selectedStatus.value;
                }

                toast.add({ severity: 'success', summary: 'Successful', detail: 'Status Updated', life: 3000 });
            })
            .catch((error) => {
                console.error('Error updating status:', error);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status', life: 3000 });

                // Revert local change if API call fails
                selectedStatus.value = ticket.value.status;
            });
    }
    editingStatus.value = false;
}

function cancelStatusEdit() {
    editingStatus.value = false;
    selectedStatus.value = null;
}

// Fixed: Remove the removeAttachment function since we only have one URL
function removeAttachment() {
    ticket.value.attachmentUrl = null;
    toast.add({ severity: 'info', summary: 'File Removed', detail: 'Attachment has been removed', life: 3000 });
}

// Update the editTicket function to handle the new user structure
function editTicket(prod) {
    // Copy ticket
    ticket.value = { ...prod };

    // Set category (it's already a string from API)
    ticket.value.categoryName = prod.categoryName;

    // Set assignee - match by the full name we created
    if (prod.assignedUserName) {
        selectedAssignee.value = users.value.find((user) => user.name === prod.assignedUserName) || null;
    } else {
        selectedAssignee.value = null;
    }

    ticketDialog.value = true;
}

function confirmDeleteTicket(prod) {
    ticket.value = prod;
    deleteTicketDialog.value = true;
}

async function deleteTicket() {
    try {
        await TicketService.deleteTicket(ticket.value.id);
        tickets.value = tickets.value.filter((val) => val.id !== ticket.value.id);
        deleteTicketDialog.value = false;
        ticket.value = {};
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Ticket Deleted', life: 3000 });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete ticket',
            life: 5000
        });
    }
}

async function deleteSelectedTickets() {
    try {
        // Delete each selected ticket
        const deletePromises = selectedTickets.value.map((ticket) => TicketService.deleteTicket(ticket.id));
        await Promise.all(deletePromises);

        // Update local state
        tickets.value = tickets.value.filter((val) => !selectedTickets.value.includes(val));
        deleteTicketsDialog.value = false;
        selectedTickets.value = null;
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Tickets Deleted', life: 3000 });
    } catch (error) {
        console.error('Error deleting tickets:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete some tickets',
            life: 5000
        });
    }
}

function findIndexById(id) {
    if (!Array.isArray(tickets.value)) return -1;
    return tickets.value.findIndex((ticket) => ticket.id === id);
}

function createId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function createTicketCode() {
    const prefix = 'TICK-';
    const randomNumber = Math.floor(Math.random() * 1000000);
    const paddedNumber = String(randomNumber).padStart(6, '0');
    return prefix + paddedNumber;
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteTicketsDialog.value = true;
}

function getStatusLabel(status) {
    if (!status) return null;

    switch (status.toLowerCase()) {
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

function getPriorityLabel(priority) {
    if (!priority) return null;

    switch (priority.toLowerCase()) {
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

const transformPriorityAndStatus = (value) => {
    if (!value) return '';
    return value
        .toLowerCase()
        .replace('_', ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
        const ticketComments = comments.value.find((ticket) => ticket.ticketId === ticketId);

        if (ticketComments) {
            ticketComments.comments.push({
                commentId: `c${ticketComments.comments.length + 1}`,
                timestamp: new Date().toISOString(),
                comment: newComment.value.text,
                visibility: newComment.value.private ? 'private' : 'public',
                author: 'You'
            });
        } else {
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

        newComment.value.text = '';
        newComment.value.private = false;
    }
};

const filteredComments = computed(() => {
    const ticketComm = comments.value.find((ticketComments) => ticketComments.ticketId == ticket.value.id);
    return ticketComm ? ticketComm.comments : [];
});

function editAssignee() {
    selectedAssignee.value = users.value.find((user) => user.name === ticket.value.assignedUserName) || null;
    editingAssignee.value = true;
}

// function saveAssignee() {
//     if (selectedAssignee.value) {
//         ticket.value.assignedUserName = selectedAssignee.value.name;
//         ticket.value.assignedUserEmail = selectedAssignee.value.email;

//         TicketService.reassignTicket(ticket.value.id, selectedAssignee.value.name, selectedAssignee.value.email)
//             .then((response) => {
//                 toast.add({ severity: 'success', summary: 'Successful', detail: 'Assignee Updated', life: 3000 });
//             })
//             .catch((error) => {
//                 console.error('Error reassigning ticket:', error);
//                 toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update assignee', life: 3000 });
//             });
//     }
//     editingAssignee.value = false;
// }

function saveAssignee() {
    if (selectedAssignee.value) {
        ticket.value.assignedUserName = selectedAssignee.value.name;
        ticket.value.assignedUserEmail = selectedAssignee.value.email;

        // Use the actual user ID from the selected assignee
        TicketService.reassignTicket(ticket.value.id, selectedAssignee.value.id)
            .then((response) => {
                // Update local state
                const index = findIndexById(ticket.value.id);
                if (index !== -1) {
                    tickets.value[index].assignedUserName = selectedAssignee.value.name;
                    tickets.value[index].assignedUserEmail = selectedAssignee.value.email;
                }

                toast.add({ severity: 'success', summary: 'Successful', detail: 'Assignee Updated', life: 3000 });
            })
            .catch((error) => {
                console.error('Error reassigning ticket:', error);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update assignee', life: 3000 });
            });
    }
    editingAssignee.value = false;
}

function getEmployeeDetails(name) {
    return users.value.find((user) => user.name === name);
}

function getCategoryDetails(categoryName) {
    return categories.value.find((category) => category.value === categoryName);
}

function cancelEdit() {
    editingAssignee.value = false;
    selectedAssignee.value = null;
}

const viewFile = (url) => {
    if (url) {
        window.open(url, '_blank');
    }
};

function editDueDate() {
    selectedDueDate.value = ticket.value.dueDate ? new Date(ticket.value.dueDate) : new Date();
    editingDueDate.value = true;
}

function saveDueDate() {
    if (selectedDueDate.value) {
        ticket.value.dueDate = selectedDueDate.value.toISOString();
        // Call API to update ticket due date
        // TicketService.updateTicketDueDate(ticket.value.id, ticket.value.dueDate);
    }
    editingDueDate.value = false;
}

function cancelDueDateEdit() {
    editingDueDate.value = false;
    selectedDueDate.value = null;
}

// Fixed: Add updateTicketAssignee function
function updateTicketAssignee() {
    if (selectedAssignee.value) {
        ticket.value.assignedUserName = selectedAssignee.value.name;
        ticket.value.assignedUserEmail = selectedAssignee.value.email;
    } else {
        ticket.value.assignedUserName = '';
        ticket.value.assignedUserEmail = '';
    }
}

// Fixed: Add onCategoryChange function
function onCategoryChange() {
    // You can add logic here to auto-set priority based on category if needed
    console.log('Category changed to:', ticket.value.categoryName);
}
</script>

<template>
    <div>
        <div class="card">
            <!-- ... Toolbar and DataTable remain the same ... -->
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
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tickets"
                @row-click="openTicketDetailsDialog"
                :globalFilterFields="['categoryName', 'status', 'priority', 'description', 'title']"
                filterDisplay="row"
                :rowHover="true"
                class="[&_tr]:cursor-pointer"
            >
                <!-- ... DataTable columns remain the same ... -->
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

                <Column field="title" header="Title" style="min-width: 12rem" sortable>
                    <template #body="{ data }">
                        <span class="font-medium">{{ data.title }}</span>
                    </template>
                </Column>

                <Column field="categoryName" header="Category" style="min-width: 8rem" sortable :showFilterMenu="false">
                    <template #body="{ data }">
                        {{ data.categoryName }}
                    </template>
                    <template #filter="{ filterModel }">
                        <Select v-model="filters['categoryName'].value" :options="categories" placeholder="Select Category" style="min-width: 6rem" :showClear="true" optionLabel="label" optionValue="value">
                            <template #option="slotProps">
                                <div class="flex flex-col">
                                    <span>{{ slotProps.option.label }}</span>
                                    <span class="text-xs text-gray-500">{{ slotProps.option.departmentName }}</span>
                                </div>
                            </template>
                        </Select>
                    </template>
                </Column>

                <Column field="description" sortable header="Description" style="min-width: 15rem" :showFilterMenu="false">
                    <template #body="{ data }">
                        <span class="truncate">{{ data.description }}</span>
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filters['description'].value" placeholder="Search..." style="min-width: 4rem" />
                    </template>
                </Column>

                <Column field="assignedUserName" header="Assignee" style="min-width: 10rem" sortable>
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-user text-gray-400"></i>
                            <span>{{ data.assignedUserName || 'Unassigned' }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="priority" sortable header="Priority" style="min-width: 6rem" :showFilterMenu="false">
                    <template #body="{ data }">
                        <Tag :value="transformPriorityAndStatus(data.priority)" :severity="getPriorityLabel(data.priority)" />
                    </template>
                    <template #filter="{ filterModel }">
                        <Select v-model="filters['priority'].value" :options="['LOW', 'MEDIUM', 'HIGH', 'URGENT']" placeholder="Select Priority" style="min-width: 4rem" :showClear="true">
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
                        <Select v-model="filters['status'].value" :options="['OPEN', 'ONGOING', 'RESOLVED', 'CLOSED']" placeholder="Select Status" style="min-width: 4rem" :showClear="true">
                            <template #option="slotProps">
                                <Tag :value="transformPriorityAndStatus(slotProps.option)" :severity="getStatusLabel(slotProps.option)" />
                            </template>
                        </Select>
                    </template>
                </Column>

                <Column field="dueDate" header="Due Date" style="min-width: 8rem" sortable>
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-calendar text-gray-400"></i>
                            <span :class="{ 'text-red-500': isPastDue(data.dueDate) }">
                                {{ formatDate(data.dueDate) }}
                            </span>
                        </div>
                    </template>
                </Column>

                <Column field="commentCount" header="Comments" style="min-width: 6rem" sortable>
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-comments text-gray-400"></i>
                            <span>{{ data.commentCount || 0 }}</span>
                        </div>
                    </template>
                </Column>

                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="{ data }">
                        <!--<Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editTicket(data)" />-->
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteTicket(data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Create/Edit Ticket Dialog -->
        <Dialog v-model:visible="ticketDialog" :style="{ width: '650px' }" header="Ticket Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="title" class="block font-bold mb-3">Title</label>
                    <InputText id="title" v-model.trim="ticket.title" required="true" autofocus :invalid="submitted && !ticket.title" class="w-full" />
                    <small v-if="submitted && !ticket.title" class="text-red-500">Title is required.</small>
                </div>

                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model="ticket.description" required="true" rows="3" class="w-full" />
                </div>

                <!-- Fixed Category Select -->
                <div>
                    <label for="categoryName" class="block font-bold mb-3">Category</label>
                    <Dropdown id="categoryName" v-model="ticket.categoryName" :options="categories" optionLabel="label" optionValue="value" placeholder="Select a category" class="w-full" @change="onCategoryChange">
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center">
                                <span>{{ slotProps.value }}</span>
                            </div>
                            <span v-else>
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex flex-col p-2">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="font-medium">{{ slotProps.option.label }}</span>
                                    <Tag :value="slotProps.option.data.defaultPriority" :severity="getPriorityLabel(slotProps.option.data.defaultPriority)" size="small" />
                                </div>
                                <span class="text-sm text-gray-600">{{ slotProps.option.data.departmentName }}</span>
                                <span class="text-xs text-gray-500">Target: {{ slotProps.option.data.targetResolutionTime }}h</span>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div>
                    <label for="assignee" class="block font-bold mb-3">Assignee</label>
                    <Dropdown id="assignee" v-model="selectedAssignee" :options="users" optionLabel="name" placeholder="Select an assignee" class="w-full" filter :showClear="true">
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span class="text-sm font-medium text-blue-600"> {{ slotProps.value.firstName?.[0] }}{{ slotProps.value.lastName?.[0] }} </span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-medium">{{ slotProps.value.name }}</span>
                                    <span class="text-xs text-gray-500">{{ slotProps.value.departmentName }}</span>
                                </div>
                            </div>
                            <span v-else class="text-gray-400">
                                {{ slotProps.placeholder }}
                            </span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center gap-3 p-2">
                                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span class="text-sm font-medium text-blue-600"> {{ slotProps.option.firstName?.[0] }}{{ slotProps.option.lastName?.[0] }} </span>
                                </div>
                                <div class="flex flex-col flex-1">
                                    <span class="font-medium">{{ slotProps.option.name }}</span>
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-gray-500">{{ slotProps.option.departmentName }}</span>
                                        <span class="text-xs text-gray-400">{{ slotProps.option.role }}</span>
                                    </div>
                                    <span class="text-xs text-gray-400 truncate">{{ slotProps.option.email }}</span>
                                </div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div>
                    <label for="dueDate" class="block font-bold mb-3">Due Date</label>
                    <Calendar id="dueDate" v-model="ticket.dueDate" showIcon :minDate="new Date()" dateFormat="dd/mm/yy" class="w-full" />
                </div>

                <div>
                    <label for="priority" class="block font-bold mb-3">Priority</label>
                    <Select id="priority" v-model="ticket.priority" :options="['LOW', 'MEDIUM', 'HIGH', 'URGENT']" placeholder="Select priority" class="w-full">
                        <template #option="slotProps">
                            <Tag :value="transformPriorityAndStatus(slotProps.option)" :severity="getPriorityLabel(slotProps.option)" />
                        </template>
                    </Select>
                </div>

                <div>
                    <label for="tags" class="block font-bold mb-3">Tags</label>
                    <InputText id="tags" v-model="ticket.tags" class="w-full" placeholder="Enter tags separated by commas" />
                    <small class="text-gray-500">Separate tags with commas</small>
                </div>

                <div>
                    <label for="attachmentUrl" class="block font-bold mb-3">Attachment URL</label>
                    <InputText id="attachmentUrl" v-model="ticket.attachmentUrl" class="w-full" placeholder="Enter attachment URL" />
                    <small class="text-gray-500">Paste a URL to the attachment file</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveTicket" />
            </template>
        </Dialog>

        <!-- Delete Ticket Dialog -->
        <Dialog v-model:visible="deleteTicketDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="ticket">
                    Are you sure you want to delete ticket <b>{{ ticket.title }}</b
                    >?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteTicketDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteTicket" />
            </template>
        </Dialog>

        <!-- Delete Multiple Tickets Dialog -->
        <Dialog v-model:visible="deleteTicketsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span>Are you sure you want to delete the selected tickets?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteTicketsDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedTickets" />
            </template>
        </Dialog>

        <!-- Ticket Details Drawer -->
        <div class="card flex justify-center items-center">
            <Drawer v-model:visible="ticketDetailsDialog" position="right" class="!w-full md:!w-[50rem] lg:!w-[50rem]" :blockScroll="true">
                <template #header>
                    <div class="flex flex-row justify-between items-center">
                        <div class="flex items-center gap-2">
                            <Tag :value="transformPriorityAndStatus(ticket.status)" :severity="getStatusLabel(ticket.status)" />
                            <span class="font-bold text-lg">{{ ticket.title }}</span>
                        </div>
                        <div class="flex items-center">
                            <Button icon="pi pi-pencil" text size="small" label="Edit" @click="editTicket(ticket)" />
                            <Button icon="pi pi-share-alt" text size="small" label="Share" />
                        </div>
                    </div>
                </template>

                <template #default>
                    <div class="flex flex-col">
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2 capitalize">
                            {{ ticket.title }}
                        </h1>

                        <div class="flex items-center gap-6 mb-2">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-clock text-gray-400"></i>
                                <span class="text-sm" :class="{ 'text-red-500': isPastDue(ticket.dueDate) }">
                                    {{ isPastDue(ticket.dueDate) ? 'Late by ' : 'Due in ' }}
                                    {{ Math.abs(getDaysUntilDue(ticket.dueDate)) }}
                                    {{ Math.abs(getDaysUntilDue(ticket.dueDate)) === 1 ? 'day' : 'days' }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-flag-fill text-red-500"></i>
                                <span class="text-sm">{{ transformPriorityAndStatus(ticket.priority) }} Priority</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i class="pi pi-comments text-gray-400"></i>
                                <span class="text-sm">{{ ticket.commentCount || 0 }} comments</span>
                            </div>
                        </div>
                    </div>

                    <Tabs value="0">
                        <TabList>
                            <Tab value="0">Details</Tab>
                            <Tab value="1">Comments</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel value="0">
                                <div class="flex flex-col gap-6">
                                    <div class="space-y-3">
                                        <h2 class="text-lg font-semibold">Ticket Information</h2>
                                        <div class="flex flex-col gap-3 text-sm">
                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Created</span>
                                                <div class="flex items-center gap-2">
                                                    <i class="pi pi-calendar text-gray-400"></i>
                                                    <span>{{ formatDate(ticket.createdAt) }}</span>
                                                </div>
                                            </div>

                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Assignee</span>
                                                <div class="flex items-center gap-2">
                                                    <template v-if="editingAssignee">
                                                        <Dropdown v-model="selectedAssignee" :options="users" optionLabel="name" placeholder="Select an Assignee" class="w-full md:w-56" filter>
                                                            <template #value="slotProps">
                                                                <div v-if="slotProps.value" class="flex items-center gap-2">
                                                                    <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                                        <span class="text-xs font-medium text-blue-600"> {{ slotProps.value.firstName?.[0] }}{{ slotProps.value.lastName?.[0] }} </span>
                                                                    </div>
                                                                    <div class="flex flex-col">
                                                                        <span class="font-medium">{{ slotProps.value.name }}</span>
                                                                        <span class="text-xs text-gray-500">{{ slotProps.value.departmentName }}</span>
                                                                    </div>
                                                                </div>
                                                                <span v-else class="text-gray-400">
                                                                    {{ slotProps.placeholder }}
                                                                </span>
                                                            </template>
                                                            <template #option="slotProps">
                                                                <div class="flex items-center gap-2 p-2">
                                                                    <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                                        <span class="text-xs font-medium text-blue-600"> {{ slotProps.option.firstName?.[0] }}{{ slotProps.option.lastName?.[0] }} </span>
                                                                    </div>
                                                                    <div class="flex flex-col">
                                                                        <span class="font-medium">{{ slotProps.option.name }}</span>
                                                                        <span class="text-xs text-gray-500">{{ slotProps.option.departmentName }}</span>
                                                                    </div>
                                                                </div>
                                                            </template>
                                                        </Dropdown>
                                                        <Button icon="pi pi-check" size="small" outlined severity="success" @click="saveAssignee" />
                                                        <Button icon="pi pi-times" size="small" outlined severity="secondary" @click="cancelEdit" />
                                                    </template>
                                                    <template v-else>
                                                        <div class="flex items-center gap-3">
                                                            <div v-if="ticket.assignedUserName" class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <span class="text-sm font-medium text-blue-600">
                                                                    {{ getEmployeeDetails(ticket.assignedUserName)?.firstName?.[0] || 'U' }}{{ getEmployeeDetails(ticket.assignedUserName)?.lastName?.[0] || '' }}
                                                                </span>
                                                            </div>
                                                            <div v-else class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                                <i class="pi pi-user text-gray-400 text-sm"></i>
                                                            </div>
                                                            <div class="flex flex-col">
                                                                <span class="font-medium">{{ ticket.assignedUserName || 'Unassigned' }}</span>
                                                                <div v-if="ticket.assignedUserEmail || getEmployeeDetails(ticket.assignedUserName)" class="flex items-center gap-2 text-xs text-gray-500">
                                                                    <span v-if="ticket.assignedUserEmail">{{ ticket.assignedUserEmail }}</span>
                                                                    <span v-if="getEmployeeDetails(ticket.assignedUserName)?.departmentName">• {{ getEmployeeDetails(ticket.assignedUserName).departmentName }}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button class="text-gray-400 hover:text-gray-600 focus:outline-none ml-2" @click="editAssignee" title="Reassign">
                                                            <i class="pi pi-user-edit text-sm"></i>
                                                        </button>
                                                    </template>
                                                </div>
                                            </div>

                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Due Date</span>
                                                <div class="flex items-center gap-2">
                                                    <template v-if="editingDueDate">
                                                        <Calendar v-model="selectedDueDate" showIcon :minDate="new Date()" dateFormat="dd/mm/yy" class="w-full md:w-14rem" />
                                                        <Button icon="pi pi-check" size="small" outlined severity="success" @click="saveDueDate" />
                                                        <Button icon="pi pi-times" size="small" outlined severity="secondary" @click="cancelDueDateEdit" />
                                                    </template>
                                                    <template v-else>
                                                        <i class="pi pi-calendar text-gray-400"></i>
                                                        <span :class="{ 'text-red-500': isPastDue(ticket.dueDate) }">
                                                            {{ formatDate(ticket.dueDate) }}
                                                        </span>
                                                        <button class="text-gray-400 hover:text-gray-600 focus:outline-none ml-2" @click="editDueDate" title="Change due date">
                                                            <i class="pi pi-pencil text-sm"></i>
                                                        </button>
                                                    </template>
                                                </div>
                                            </div>

                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Category</span>
                                                <div class="flex flex-col">
                                                    <span class="font-medium">{{ ticket.categoryName }}</span>
                                                    <span v-if="getCategoryDetails(ticket.categoryName)" class="text-xs text-gray-500">
                                                        {{ getCategoryDetails(ticket.categoryName).departmentName }} • Target: {{ getCategoryDetails(ticket.categoryName).targetResolutionTime }}h
                                                    </span>
                                                </div>
                                            </div>

                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Status</span>
                                                <div class="flex items-center gap-2">
                                                    <template v-if="editingStatus">
                                                        <Dropdown v-model="selectedStatus" :options="['OPEN', 'ONGOING', 'RESOLVED', 'CLOSED']" placeholder="Select Status" class="w-full md:w-40">
                                                            <template #value="slotProps">
                                                                <div v-if="slotProps.value" class="flex items-center">
                                                                    <Tag :value="transformPriorityAndStatus(slotProps.value)" :severity="getStatusLabel(slotProps.value)" />
                                                                </div>
                                                                <span v-else class="text-gray-400">
                                                                    {{ slotProps.placeholder }}
                                                                </span>
                                                            </template>
                                                            <template #option="slotProps">
                                                                <div class="flex items-center p-2">
                                                                    <Tag :value="transformPriorityAndStatus(slotProps.option)" :severity="getStatusLabel(slotProps.option)" />
                                                                </div>
                                                            </template>
                                                        </Dropdown>
                                                        <Button icon="pi pi-check" size="small" outlined severity="success" @click="saveStatus" />
                                                        <Button icon="pi pi-times" size="small" outlined severity="secondary" @click="cancelStatusEdit" />
                                                    </template>
                                                    <template v-else>
                                                        <Tag :value="transformPriorityAndStatus(ticket.status)" :severity="getStatusLabel(ticket.status)" />
                                                        <button class="text-gray-400 hover:text-gray-600 focus:outline-none ml-2" @click="editStatus" title="Change status">
                                                            <i class="pi pi-pencil text-sm"></i>
                                                        </button>
                                                    </template>
                                                </div>
                                            </div>

                                            <div class="flex items-center">
                                                <span class="text-gray-500 min-w-[120px]">Priority</span>
                                                <Tag :value="transformPriorityAndStatus(ticket.priority)" :severity="getPriorityLabel(ticket.priority)" />
                                            </div>
                                        </div>
                                    </div>

                                    <div class="space-y-4" v-if="ticket.tags">
                                        <h2 class="text-sm font-semibold">Tags</h2>
                                        <div class="flex flex-wrap gap-2">
                                            <Tag v-for="tag in ticket.tags.split(',')" :key="tag.trim()" :value="tag.trim()" severity="info" />
                                        </div>
                                    </div>

                                    <div class="flex-grow">
                                        <div class="mb-6">
                                            <h2 class="text-lg font-semibold mb-2">Description</h2>
                                            <p class="text-sm text-gray-600 leading-relaxed">{{ ticket.description }}</p>
                                        </div>

                                        <!-- Fixed: Single attachment display -->
                                        <div class="mb-6" v-if="ticket.attachmentUrl">
                                            <h2 class="text-lg font-semibold mb-2">Attachment</h2>
                                            <Card class="p-2 shadow-lg rounded-xl cursor-pointer max-w-xs">
                                                <template #content>
                                                    <div class="flex items-center gap-2" @click="viewFile(ticket.attachmentUrl)">
                                                        <div class="p-2 rounded-lg bg-gray-100">
                                                            <i class="pi pi-file text-xl text-gray-500"></i>
                                                        </div>
                                                        <div class="flex-1">
                                                            <p class="truncate text-md font-medium">Attachment</p>
                                                            <p class="text-sm text-gray-500">View File</p>
                                                        </div>
                                                    </div>
                                                </template>
                                            </Card>
                                        </div>
                                    </div>

                                    <!-- Activities Timeline -->
                                    <div v-if="ticket.activities && ticket.activities.length > 0">
                                        <p class="text-lg font-semibold mb-4">Activity Timeline</p>
                                        <Timeline :value="ticket.activities" class="w-full md:w-80" align="alternate">
                                            <template #opposite="slotProps">
                                                <small class="text-surface-500 dark:text-surface-400">{{ formatDate(slotProps.item.timestamp) }}</small>
                                            </template>
                                            <template #content="slotProps">
                                                <div class="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                                    <p class="text-md font-medium">{{ slotProps.item.activity }}</p>
                                                </div>
                                            </template>
                                        </Timeline>
                                    </div>
                                </div>
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
                                        <p class="text-sm mt-2" :class="{ 'italic text-gray-400': comment.visibility == 'private' }">
                                            {{ comment.comment }}
                                            <span v-if="comment.visibility == 'private'">(Private)</span>
                                        </p>
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
