<script setup>
import { useCategoryStore } from '@/stores/CategoryStore';
import { useDepartmentStore } from '@/stores/DepartmentStore';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const activeTab = ref(0);
const loading = ref(true);
const categoryStore = useCategoryStore();
const departmentStore = useDepartmentStore();

// Category Management
const categories = ref([]);
const selectedCategory = ref(null);
const categoryDialog = ref(false);
const deleteCategoryDialog = ref(false);
const categorySubmitted = ref(false);
const categoryForm = ref({
    id: null,
    name: '',
    description: '',
    departmentId: null,
    maxResolutionTime: 24, // in hours
    priority: 'medium',
    isActive: true,
    requiresApproval: false,
    tags: []
});

// Department Management
const departments = ref([]);
const selectedDepartment = ref(null);
const departmentDialog = ref(false);
const deleteDepartmentDialog = ref(false);
const departmentSubmitted = ref(false);
const departmentForm = ref({
    id: null,
    name: '',
    description: '',
    managerId: null,
    isActive: true,
    email: '',
    employees: []
});

// Employee Management (for department assignment)
const employees = ref([]);
const selectedEmployees = ref([]);
const availableEmployees = computed(() => {
    return employees.value.filter((e) => !departmentForm.value.employees.some((de) => de.id === e.id));
});

// Priority options for categories
const priorityOptions = [
    { name: 'Low', value: 'low' },
    { name: 'Medium', value: 'medium' },
    { name: 'High', value: 'high' },
    { name: 'Urgent', value: 'urgent' }
];

// Resolution time presets
const resolutionTimePresets = [
    { name: '1 hour', value: 1 },
    { name: '4 hours', value: 4 },
    { name: '8 hours (1 day)', value: 8 },
    { name: '24 hours (1 day)', value: 24 },
    { name: '48 hours (2 days)', value: 48 },
    { name: '72 hours (3 days)', value: 72 },
    { name: '168 hours (1 week)', value: 168 }
];

// Load data
onMounted(async () => {
    try {
        loading.value = true;
        await categoryStore.fetchCategories();
        await departmentStore.fetchDepartments();
        console.log('Categories and Departments loaded successfully');
        console.log('Categories:', categoryStore.categories);
        console.log('Departments:', departmentStore.departments);
        // Simulate API calls
        setTimeout(() => {
            // Sample data
            departments.value = [
                {
                    id: 1,
                    name: 'IT Support',
                    description: 'Technical support and infrastructure management',
                    managerId: 1,
                    isActive: true,
                    email: 'it-support@company.com',
                    employees: [
                        { id: 1, name: 'John Smith', email: 'john.smith@company.com', role: 'IT Manager' },
                        { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'IT Specialist' }
                    ]
                },
                {
                    id: 2,
                    name: 'Customer Service',
                    description: 'Customer inquiries and account support',
                    managerId: 3,
                    isActive: true,
                    email: 'customer-service@company.com',
                    employees: [
                        { id: 3, name: 'Michael Brown', email: 'michael.brown@company.com', role: 'CS Manager' },
                        { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com', role: 'CS Representative' }
                    ]
                },
                {
                    id: 3,
                    name: 'Operations',
                    description: 'Back-office operations and processing',
                    managerId: 5,
                    isActive: true,
                    email: 'operations@company.com',
                    employees: [
                        { id: 5, name: 'Robert Wilson', email: 'robert.wilson@company.com', role: 'Operations Director' },
                        { id: 6, name: 'Jennifer Lee', email: 'jennifer.lee@company.com', role: 'Operations Specialist' }
                    ]
                }
            ];

            categories.value = [
                { id: 1, name: 'Hardware Issues', description: 'Problems with physical equipment', departmentId: 1, maxResolutionTime: 48, priority: 'medium', isActive: true, requiresApproval: false, tags: ['hardware', 'equipment', 'physical'] },
                {
                    id: 2,
                    name: 'Software Issues',
                    description: 'Problems with applications and systems',
                    departmentId: 1,
                    maxResolutionTime: 24,
                    priority: 'high',
                    isActive: true,
                    requiresApproval: false,
                    tags: ['software', 'applications', 'systems']
                },
                {
                    id: 3,
                    name: 'Network Issues',
                    description: 'Connectivity and network related problems',
                    departmentId: 1,
                    maxResolutionTime: 8,
                    priority: 'urgent',
                    isActive: true,
                    requiresApproval: false,
                    tags: ['network', 'connectivity', 'internet']
                },
                { id: 4, name: 'Account Access', description: 'Account access and password resets', departmentId: 2, maxResolutionTime: 4, priority: 'high', isActive: true, requiresApproval: false, tags: ['account', 'password', 'access'] },
                { id: 5, name: 'Transaction Inquiries', description: 'Questions about transactions', departmentId: 2, maxResolutionTime: 24, priority: 'medium', isActive: true, requiresApproval: false, tags: ['transaction', 'payment', 'inquiry'] },
                { id: 6, name: 'Document Processing', description: 'Document processing requests', departmentId: 3, maxResolutionTime: 72, priority: 'low', isActive: true, requiresApproval: true, tags: ['document', 'processing', 'paperwork'] }
            ];

            employees.value = [
                { id: 1, name: 'John Smith', email: 'john.smith@company.com', role: 'IT Manager', departmentId: 1 },
                { id: 2, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'IT Specialist', departmentId: 1 },
                { id: 3, name: 'Michael Brown', email: 'michael.brown@company.com', role: 'CS Manager', departmentId: 2 },
                { id: 4, name: 'Emily Davis', email: 'emily.davis@company.com', role: 'CS Representative', departmentId: 2 },
                { id: 5, name: 'Robert Wilson', email: 'robert.wilson@company.com', role: 'Operations Director', departmentId: 3 },
                { id: 6, name: 'Jennifer Lee', email: 'jennifer.lee@company.com', role: 'Operations Specialist', departmentId: 3 },
                { id: 7, name: 'David Martin', email: 'david.martin@company.com', role: 'IT Specialist', departmentId: 1 },
                { id: 8, name: 'Jessica Taylor', email: 'jessica.taylor@company.com', role: 'CS Representative', departmentId: 2 },
                { id: 9, name: 'Thomas Anderson', email: 'thomas.anderson@company.com', role: 'Operations Analyst', departmentId: 3 },
                { id: 10, name: 'Amanda Clark', email: 'amanda.clark@company.com', role: 'HR Specialist', departmentId: null }
            ];

            loading.value = false;
        }, 800);
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 3000 });
        loading.value = false;
    }
});

// Category Methods
const openNewCategory = () => {
    categoryForm.value = {
        id: null,
        name: '',
        description: '',
        departmentId: null,
        maxResolutionTime: 24, // in hours
        priority: 'medium',
        isActive: true,
        requiresApproval: false,
        tags: []
    };
    categorySubmitted.value = false;
    categoryDialog.value = true;
};

const editCategory = (category) => {
    categoryForm.value = { ...category };
    categoryDialog.value = true;
};

const saveCategory = () => {
    categorySubmitted.value = true;

    if (categoryForm.value.name.trim() && categoryForm.value.departmentId) {
        if (categoryForm.value.id) {
            // Update existing category
            const index = categories.value.findIndex((c) => c.id === categoryForm.value.id);
            if (index !== -1) {
                categories.value[index] = { ...categoryForm.value };
                toast.add({ severity: 'success', summary: 'Success', detail: 'Category Updated', life: 3000 });
            }
        } else {
            // Create new category
            categoryForm.value.id = generateId();
            categories.value.push({ ...categoryForm.value });
            toast.add({ severity: 'success', summary: 'Success', detail: 'Category Created', life: 3000 });
        }

        categoryDialog.value = false;
        categoryForm.value = {
            id: null,
            name: '',
            description: '',
            departmentId: null,
            maxResolutionTime: 24,
            priority: 'medium',
            isActive: true,
            requiresApproval: false,
            tags: []
        };
    }
};

const confirmDeleteCategory = (category) => {
    selectedCategory.value = category;
    deleteCategoryDialog.value = true;
};

const deleteCategory = () => {
    categories.value = categories.value.filter((c) => c.id !== selectedCategory.value.id);
    deleteCategoryDialog.value = false;
    toast.add({ severity: 'success', summary: 'Success', detail: 'Category Deleted', life: 3000 });
    selectedCategory.value = null;
};

// Department Methods
const openNewDepartment = () => {
    departmentForm.value = {
        id: null,
        name: '',
        description: '',
        managerId: null,
        isActive: true,
        email: '',
        employees: []
    };
    departmentSubmitted.value = false;
    departmentDialog.value = true;
};

const editDepartment = (department) => {
    departmentForm.value = { ...department };
    departmentDialog.value = true;
};

const saveDepartment = () => {
    departmentSubmitted.value = true;

    if (departmentForm.value.name.trim()) {
        if (departmentForm.value.id) {
            // Update existing department
            const index = departments.value.findIndex((d) => d.id === departmentForm.value.id);
            if (index !== -1) {
                departments.value[index] = { ...departmentForm.value };
                toast.add({ severity: 'success', summary: 'Success', detail: 'Department Updated', life: 3000 });
            }
        } else {
            // Create new department
            departmentForm.value.id = generateId();
            departments.value.push({ ...departmentForm.value });
            toast.add({ severity: 'success', summary: 'Success', detail: 'Department Created', life: 3000 });
        }

        departmentDialog.value = false;
        departmentForm.value = {
            id: null,
            name: '',
            description: '',
            managerId: null,
            isActive: true,
            email: '',
            employees: []
        };
    }
};

const confirmDeleteDepartment = (department) => {
    selectedDepartment.value = department;
    deleteDepartmentDialog.value = true;
};

const deleteDepartment = () => {
    departments.value = departments.value.filter((d) => d.id !== selectedDepartment.value.id);
    // Update categories that reference this department
    categories.value.forEach((category) => {
        if (category.departmentId === selectedDepartment.value.id) {
            category.departmentId = null;
        }
    });
    // Update employees that reference this department
    employees.value.forEach((employee) => {
        if (employee.departmentId === selectedDepartment.value.id) {
            employee.departmentId = null;
        }
    });
    deleteDepartmentDialog.value = false;
    toast.add({ severity: 'success', summary: 'Success', detail: 'Department Deleted', life: 3000 });
    selectedDepartment.value = null;
};

// Employee Management
const addEmployeeToDepartment = () => {
    if (selectedEmployees.value.length) {
        departmentForm.value.employees = [...departmentForm.value.employees, ...selectedEmployees.value];
        selectedEmployees.value = [];
    }
};

const removeEmployeeFromDepartment = (employee) => {
    departmentForm.value.employees = departmentForm.value.employees.filter((e) => e.id !== employee.id);
};

// Utils
const generateId = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

// Display helpers
const getPriorityClass = (priority) => {
    switch (priority) {
        case 'low':
            return 'bg-blue-100 text-blue-800';
        case 'medium':
            return 'bg-green-100 text-green-800';
        case 'high':
            return 'bg-orange-100 text-orange-800';
        case 'urgent':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getPriorityIcon = (priority) => {
    switch (priority) {
        case 'low':
            return 'pi pi-info-circle';
        case 'medium':
            return 'pi pi-exclamation-circle';
        case 'high':
            return 'pi pi-exclamation-triangle';
        case 'urgent':
            return 'pi pi-ban';
        default:
            return 'pi pi-info-circle';
    }
};

const formatTime = (hours) => {
    if (hours < 24) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
    } else {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return remainingHours === 0 ? `${days} day${days === 1 ? '' : 's'}` : `${days} day${days === 1 ? '' : 's'}, ${remainingHours} hour${remainingHours === 1 ? '' : 's'}`;
    }
};

const getDepartmentName = (departmentId) => {
    const department = departments.value.find((d) => d.id === departmentId);
    return department ? department.name : 'Unassigned';
};

const getEmployeeName = (employeeId) => {
    const employee = employees.value.find((e) => e.id === employeeId);
    return employee ? employee.name : 'Unassigned';
};

const getManagerOptions = computed(() => {
    return employees.value.map((e) => ({
        label: e.name,
        value: e.id
    }));
});
</script>

<template>
    <div class="card">
        <h1 class="text-3xl font-semibold mb-4">Categories & Departments Management</h1>

        <TabView v-model:activeIndex="activeTab">
            <!-- Categories Tab -->
            <TabPanel header="Categories">
                <div class="flex justify-between mb-4">
                    <h2 class="text-xl font-semibold">Ticket Categories</h2>
                    <Button label="Add Category" icon="pi pi-plus" @click="openNewCategory" />
                </div>

                <div v-if="loading" class="flex justify-center py-8">
                    <ProgressSpinner />
                </div>

                <DataTable v-else :value="categories" dataKey="id" :paginator="true" :rows="10" :rowHover="true" stripedRows responsiveLayout="scroll" class="p-datatable-sm">
                    <Column field="name" header="Category Name" sortable>
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.name }}</div>
                            <div class="text-xs text-gray-500 mt-1">{{ data.description }}</div>
                        </template>
                    </Column>

                    <Column field="departmentId" header="Department" sortable>
                        <template #body="{ data }">
                            {{ getDepartmentName(data.departmentId) }}
                        </template>
                    </Column>

                    <Column field="maxResolutionTime" header="Resolution Time" sortable>
                        <template #body="{ data }">
                            {{ formatTime(data.maxResolutionTime) }}
                        </template>
                    </Column>

                    <Column field="priority" header="Priority" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.priority.charAt(0).toUpperCase() + data.priority.slice(1)" :class="getPriorityClass(data.priority)">
                                <i :class="[getPriorityIcon(data.priority), 'mr-1']"></i>
                                {{ data.priority.charAt(0).toUpperCase() + data.priority.slice(1) }}
                            </Tag>
                        </template>
                    </Column>

                    <Column field="isActive" header="Status" sortable>
                        <template #body="{ data }">
                            <Tag :severity="data.isActive ? 'success' : 'danger'">
                                {{ data.isActive ? 'Active' : 'Inactive' }}
                            </Tag>
                        </template>
                    </Column>

                    <Column field="requiresApproval" header="Approval">
                        <template #body="{ data }">
                            <i v-if="data.requiresApproval" class="pi pi-check-circle text-green-500 text-xl"></i>
                            <i v-else class="pi pi-times-circle text-gray-400 text-xl"></i>
                        </template>
                    </Column>

                    <Column header="Actions" :exportable="false">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" rounded outlined @click="editCategory(data)" />
                                <Button icon="pi pi-trash" rounded outlined severity="danger" @click="confirmDeleteCategory(data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>

            <!-- Departments Tab -->
            <TabPanel header="Departments">
                <div class="flex justify-between mb-4">
                    <h2 class="text-xl font-semibold">Departments</h2>
                    <Button label="Add Department" icon="pi pi-plus" @click="openNewDepartment" />
                </div>

                <div v-if="loading" class="flex justify-center py-8">
                    <ProgressSpinner />
                </div>

                <DataTable v-else :value="departments" dataKey="id" :paginator="true" :rows="10" :rowHover="true" stripedRows responsiveLayout="scroll" class="p-datatable-sm">
                    <Column field="name" header="Department Name" sortable>
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.name }}</div>
                            <div class="text-xs text-gray-500 mt-1">{{ data.description }}</div>
                        </template>
                    </Column>

                    <Column field="email" header="Contact Email" sortable>
                        <template #body="{ data }">
                            <a :href="`mailto:${data.email}`" class="text-primary hover:underline">{{ data.email }}</a>
                        </template>
                    </Column>

                    <Column field="managerId" header="Manager" sortable>
                        <template #body="{ data }">
                            {{ getEmployeeName(data.managerId) }}
                        </template>
                    </Column>

                    <Column field="employees" header="Team Size" sortable>
                        <template #body="{ data }"> {{ data.employees.length }} employee{{ data.employees.length !== 1 ? 's' : '' }} </template>
                    </Column>

                    <Column field="isActive" header="Status" sortable>
                        <template #body="{ data }">
                            <Tag :severity="data.isActive ? 'success' : 'danger'">
                                {{ data.isActive ? 'Active' : 'Inactive' }}
                            </Tag>
                        </template>
                    </Column>

                    <Column header="Actions" :exportable="false">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" rounded outlined @click="editDepartment(data)" />
                                <Button icon="pi pi-trash" rounded outlined severity="danger" @click="confirmDeleteDepartment(data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabView>

        <!-- Category Dialog -->
        <Dialog v-model:visible="categoryDialog" :header="categoryForm.id ? 'Edit Category' : 'Add Category'" :modal="true" class="p-fluid" :style="{ width: '550px' }">
            <div class="grid grid-cols-1 gap-4">
                <div class="field">
                    <label for="name" class="font-medium mb-2 block">Name</label>
                    <InputText id="name" v-model.trim="categoryForm.name" required autofocus :class="{ 'p-invalid': categorySubmitted && !categoryForm.name }" />
                    <small v-if="categorySubmitted && !categoryForm.name" class="p-error">Category name is required.</small>
                </div>

                <div class="field">
                    <label for="description" class="font-medium mb-2 block">Description</label>
                    <Textarea id="description" v-model="categoryForm.description" rows="3" />
                </div>

                <div class="field">
                    <label for="department" class="font-medium mb-2 block">Department</label>
                    <Dropdown
                        id="department"
                        v-model="categoryForm.departmentId"
                        :options="departments"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select a Department"
                        :class="{ 'p-invalid': categorySubmitted && !categoryForm.departmentId }"
                    />
                    <small v-if="categorySubmitted && !categoryForm.departmentId" class="p-error">Department is required.</small>
                </div>

                <div class="field">
                    <label for="maxResolutionTime" class="font-medium mb-2 block">Target Resolution Time</label>
                    <div class="flex items-center gap-2">
                        <Dropdown id="maxResolutionTime" v-model="categoryForm.maxResolutionTime" :options="resolutionTimePresets" optionLabel="name" optionValue="value" placeholder="Select Time" class="flex-grow" />
                        <div class="text-sm bg-gray-100 p-2 rounded">{{ formatTime(categoryForm.maxResolutionTime) }}</div>
                    </div>
                </div>

                <div class="field">
                    <label for="priority" class="font-medium mb-2 block">Default Priority</label>
                    <Dropdown id="priority" v-model="categoryForm.priority" :options="priorityOptions" optionLabel="name" optionValue="value" placeholder="Select Priority">
                        <template #value="slotProps">
                            <div v-if="slotProps.value" class="flex items-center">
                                <Tag :class="getPriorityClass(slotProps.value)">
                                    <i :class="[getPriorityIcon(slotProps.value), 'mr-1']"></i>
                                    {{ slotProps.value.charAt(0).toUpperCase() + slotProps.value.slice(1) }}
                                </Tag>
                            </div>
                            <span v-else>{{ slotProps.placeholder }}</span>
                        </template>
                        <template #option="slotProps">
                            <div class="flex items-center">
                                <Tag :class="getPriorityClass(slotProps.option.value)">
                                    <i :class="[getPriorityIcon(slotProps.option.value), 'mr-1']"></i>
                                    {{ slotProps.option.name }}
                                </Tag>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="field">
                    <label for="tags" class="font-medium mb-2 block">Tags</label>
                    <Chips v-model="categoryForm.tags" separator="," />
                    <small class="text-gray-500">Enter tags separated by commas</small>
                </div>

                <div class="flex items-center gap-4">
                    <div class="field-checkbox mb-0">
                        <Checkbox id="isActive" v-model="categoryForm.isActive" :binary="true" />
                        <label for="isActive" class="ml-2">Active</label>
                    </div>

                    <div class="field-checkbox mb-0">
                        <Checkbox id="requiresApproval" v-model="categoryForm.requiresApproval" :binary="true" />
                        <label for="requiresApproval" class="ml-2">Requires Approval</label>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" outlined @click="categoryDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="saveCategory" />
            </template>
        </Dialog>

        <!-- Delete Category Dialog -->
        <Dialog v-model:visible="deleteCategoryDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3 text-xl text-yellow-500" />
                <span v-if="selectedCategory"
                    >Are you sure you want to delete <b>{{ selectedCategory.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" outlined @click="deleteCategoryDialog = false" />
                <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteCategory" />
            </template>
        </Dialog>

        <!-- Department Dialog -->
        <Dialog v-model:visible="departmentDialog" :header="departmentForm.id ? 'Edit Department' : 'Add Department'" :modal="true" class="p-fluid" :style="{ width: '750px' }">
            <TabView>
                <TabPanel header="Basic Information">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="field">
                            <label for="dept-name" class="font-medium mb-2 block">Name</label>
                            <InputText id="dept-name" v-model.trim="departmentForm.name" required autofocus :class="{ 'p-invalid': departmentSubmitted && !departmentForm.name }" />
                            <small v-if="departmentSubmitted && !departmentForm.name" class="p-error">Department name is required.</small>
                        </div>

                        <div class="field">
                            <label for="dept-description" class="font-medium mb-2 block">Description</label>
                            <Textarea id="dept-description" v-model="departmentForm.description" rows="3" />
                        </div>

                        <div class="field">
                            <label for="dept-email" class="font-medium mb-2 block">Contact Email</label>
                            <InputText id="dept-email" v-model.trim="departmentForm.email" type="email" />
                        </div>

                        <div class="field">
                            <label for="dept-manager" class="font-medium mb-2 block">Department Manager</label>
                            <Dropdown id="dept-manager" v-model="departmentForm.managerId" :options="getManagerOptions" optionLabel="label" optionValue="value" placeholder="Select a Manager" />
                        </div>

                        <div class="field-checkbox">
                            <Checkbox id="dept-isActive" v-model="departmentForm.isActive" :binary="true" />
                            <label for="dept-isActive" class="ml-2">Active</label>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Team Members">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="field mb-4">
                            <label class="font-medium mb-2 block">Current Team Members</label>
                            <div v-if="departmentForm.employees.length === 0" class="text-gray-500 text-center py-4 border rounded">No employees currently assigned to this department</div>
                            <div v-else class="border rounded overflow-hidden">
                                <DataTable :value="departmentForm.employees" dataKey="id" class="p-datatable-sm">
                                    <Column field="name" header="Name"></Column>
                                    <Column field="email" header="Email"></Column>
                                    <Column field="role" header="Role"></Column>
                                    <Column header="Actions" style="width: 100px">
                                        <template #body="{ data }">
                                            <Button icon="pi pi-times" outlined rounded severity="danger" size="small" @click="removeEmployeeFromDepartment(data)" />
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </div>

                        <Divider />

                        <div class="field mb-0">
                            <label class="font-medium mb-2 block">Add Team Members</label>
                            <div class="grid grid-cols-1 gap-4">
                                <div class="field">
                                    <MultiSelect v-model="selectedEmployees" :options="availableEmployees" optionLabel="name" placeholder="Select Employees" display="chip" class="w-full">
                                        <template #option="slotProps">
                                            <div class="flex align-items-center">
                                                <div>
                                                    <div>{{ slotProps.option.name }}</div>
                                                    <div class="text-xs text-gray-500">{{ slotProps.option.email }} • {{ slotProps.option.role }}</div>
                                                </div>
                                            </div>
                                        </template>
                                    </MultiSelect>
                                </div>

                                <div class="flex justify-end">
                                    <Button label="Add to Department" icon="pi pi-user-plus" @click="addEmployeeToDepartment" :disabled="!selectedEmployees.length" />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" outlined @click="departmentDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="saveDepartment" />
            </template>
        </Dialog>

        <!-- Delete Department Dialog -->
        <Dialog v-model:visible="deleteDepartmentDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3 text-xl text-yellow-500" />
                <span v-if="selectedDepartment">
                    Are you sure you want to delete <b>{{ selectedDepartment.name }}</b
                    >?
                    <div class="mt-2 text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                        <i class="pi pi-info-circle text-yellow-500 mr-2"></i>
                        <span>This will remove department associations from all related categories and employees.</span>
                    </div>
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" outlined @click="deleteDepartmentDialog = false" />
                <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteDepartment" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.p-chips {
    @apply w-full;
}

.field {
    @apply mb-4;
}

/* Custom styling for PrimeVue components */
:deep(.p-tabview-nav) {
    @apply bg-gray-50 border-b border-gray-200;
}

:deep(.p-tabview-nav li.p-highlight .p-tabview-nav-link) {
    @apply border-primary text-primary;
}

:deep(.p-dialog-content) {
    @apply pb-0;
}

:deep(.p-divider.p-divider-horizontal) {
    @apply my-4;
}

:deep(.p-inputtext.p-invalid) {
    @apply border-red-500;
}

:deep(.p-chips .p-chips-multiple-container) {
    @apply py-1.5 px-3;
}

:deep(.p-dropdown) {
    @apply w-full;
}

/* PrimeVue DataTable Styling */
:deep(.p-datatable .p-datatable-thead > tr > th) {
    @apply bg-gray-50 py-3 px-3;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
    @apply py-3 px-3;
}

:deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
    @apply bg-gray-50;
}

:deep(.p-tag) {
    @apply text-xs font-medium;
}
</style>
