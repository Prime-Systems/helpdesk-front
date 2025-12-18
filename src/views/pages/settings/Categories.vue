<script setup>
import { useBranchStore } from '@/stores/BranchStore';
import { useCategoryStore } from '@/stores/CategoryStore';
import { useDepartmentStore } from '@/stores/departmentStore';
import { useEmployeeStore } from '@/stores/EmployeeStore';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const toast = useToast();
const activeTab = ref(0);
const loading = ref(true);
const categoryStore = useCategoryStore();
const departmentStore = useDepartmentStore();
const employeeStore = useEmployeeStore();
const branchStore = useBranchStore();

// Category Management
const categories = computed(() => categoryStore.categories || []);
const selectedCategory = ref(null);
const categoryDialog = ref(false);
const deleteCategoryDialog = ref(false);
const categoryDetailDialog = ref(false);
const categorySubmitted = ref(false);
const categoryForm = ref({
    id: null,
    name: '',
    description: '',
    departmentId: null,
    maxResolutionTime: 24,
    priority: 'medium',
    isActive: true,
    requiresApproval: false,
    tags: []
});

// Department Management
const departments = computed(() => departmentStore.departments || []);
const selectedDepartment = ref(null);
const departmentDialog = ref(false);
const deleteDepartmentDialog = ref(false);
const departmentDetailDialog = ref(false);
const departmentSubmitted = ref(false);
const departmentForm = ref({
    id: null,
    name: '',
    description: '',
    departmentManager: null,
    status: 'ACTIVE',
    contactEmail: '',
    teamMembers: []
});

// Branch Management
const branches = computed(() => branchStore.branches || []);
const selectedBranch = ref(null);
const branchDialog = ref(false);
const deleteBranchDialog = ref(false);
const branchDetailDialog = ref(false);
const branchSubmitted = ref(false);
const branchForm = ref({
    id: null,
    name: '',
    address: '',
    contactEmail: '',
    branchManagerId: null,
    status: 'ACTIVE'
});

// Employee Management
const employees = computed(() => employeeStore.employees || []);
const selectedEmployees = ref([]);
const availableEmployees = computed(() => {
    return employees.value.filter((employee) => {
        const isAlreadyInTeam = departmentForm.value.teamMembers?.some((member) => member.id === employee.id);
        return !isAlreadyInTeam;
    });
});

const formatEmployeeName = (employee) => {
    if (!employee) return '';
    return `${employee.firstName} ${employee.lastName}`;
};

// Priority options for categories
const priorityOptions = [
    { name: 'Low', value: 'LOW' },
    { name: 'Medium', value: 'MEDIUM' },
    { name: 'High', value: 'HIGH' },
    { name: 'Urgent', value: 'URGENT' }
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
        await Promise.all([categoryStore.fetchCategories(), departmentStore.fetchDepartments(), employeeStore.fetchEmployees(), branchStore.fetchBranches()]);

        loading.value = false;

        departmentStore.$subscribe((mutation, state) => {
            if (state.departments) {
                state.departments.forEach((department) => {
                    if (!department.teamMembers) department.teamMembers = [];
                    if (!department.departmentManager) department.departmentManager = { id: null };
                });
            }
        });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data', life: 3000 });
        loading.value = false;
    }
});

// ============ CATEGORY METHODS ============
const openNewCategory = () => {
    categoryForm.value = {
        id: null,
        name: '',
        description: '',
        departmentId: null,
        maxResolutionTime: 24,
        priority: 'MEDIUM',
        isActive: true,
        requiresApproval: false,
        tags: []
    };
    categorySubmitted.value = false;
    categoryDialog.value = true;
};

const editCategory = (category) => {
    const tagsArray = category.tags ? category.tags.split(',').map((tag) => tag.trim()) : [];
    categoryForm.value = {
        id: category.id,
        name: category.name,
        description: category.description,
        departmentId: category.departmentId,
        maxResolutionTime: category.targetResolutionTime,
        priority: category.defaultPriority,
        isActive: category.status === 'ACTIVE',
        requiresApproval: category.requiresApproval,
        tags: tagsArray
    };
    categoryDialog.value = true;
};

const viewCategoryDetails = (category) => {
    selectedCategory.value = category;
    categoryDetailDialog.value = true;
};

const saveCategory = async () => {
    categorySubmitted.value = true;

    if (categoryForm.value.name.trim() && categoryForm.value.departmentId) {
        try {
            const categoryData = {
                id: categoryForm.value.id || generateId(),
                name: categoryForm.value.name,
                description: categoryForm.value.description,
                targetResolutionTime: categoryForm.value.maxResolutionTime,
                departmentName: getDepartmentName(categoryForm.value.departmentId),
                departmentId: categoryForm.value.departmentId,
                defaultPriority: categoryForm.value.priority,
                tags: categoryForm.value.tags.join(','),
                status: categoryForm.value.isActive ? 'ACTIVE' : 'INACTIVE',
                requiresApproval: categoryForm.value.requiresApproval
            };

            if (categoryForm.value.id) {
                await categoryStore.updateCategory(categoryData);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Category Updated', life: 3000 });
            } else {
                await categoryStore.addCategory(categoryData);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Category Created', life: 3000 });
            }

            categoryDialog.value = false;
            resetCategoryForm();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save category', life: 3000 });
        }
    }
};

const confirmDeleteCategory = (category) => {
    selectedCategory.value = category;
    deleteCategoryDialog.value = true;
};

const deleteCategory = async () => {
    try {
        await categoryStore.deleteCategory(selectedCategory.value.id);
        deleteCategoryDialog.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Category Deleted', life: 3000 });
        selectedCategory.value = null;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete category', life: 3000 });
    }
};

const resetCategoryForm = () => {
    categoryForm.value = {
        id: null,
        name: '',
        description: '',
        departmentId: null,
        maxResolutionTime: 24,
        priority: 'MEDIUM',
        isActive: true,
        requiresApproval: false,
        tags: []
    };
};

// ============ DEPARTMENT METHODS ============
const openNewDepartment = () => {
    departmentForm.value = {
        id: null,
        name: '',
        description: '',
        departmentManager: null,
        status: 'ACTIVE',
        contactEmail: '',
        teamMembers: []
    };
    departmentSubmitted.value = false;
    departmentDialog.value = true;
};

const editDepartment = (department) => {
    departmentForm.value = {
        id: department.id,
        name: department.name,
        description: department.description,
        contactEmail: department.contactEmail,
        status: department.status || 'ACTIVE',
        departmentManager: department.departmentManager
            ? {
                  id: department.departmentManager.id,
                  firstName: department.departmentManager.firstName,
                  lastName: department.departmentManager.lastName
              }
            : null,
        teamMembers:
            department.teamMembers?.map((member) => ({
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                role: member.role
            })) || []
    };
    departmentDialog.value = true;
};

const viewDepartmentDetails = (department) => {
    selectedDepartment.value = department;
    departmentDetailDialog.value = true;
};

const saveDepartment = async () => {
    departmentSubmitted.value = true;

    if (departmentForm.value.name.trim()) {
        try {
            const teamMembersData = departmentForm.value.teamMembers.map((member) => ({
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email || '',
                role: member.role || 'EMPLOYEE'
            }));

            const departmentData = {
                id: departmentForm.value.id || 0,
                name: departmentForm.value.name,
                description: departmentForm.value.description,
                contactEmail: departmentForm.value.contactEmail,
                status: typeof departmentForm.value.status === 'string' ? departmentForm.value.status : 'ACTIVE',
                teamSize: teamMembersData.length,
                departmentManager: departmentForm.value.departmentManager
                    ? {
                          id: departmentForm.value.departmentManager.id,
                          firstName: departmentForm.value.departmentManager.firstName,
                          lastName: departmentForm.value.departmentManager.lastName
                      }
                    : null,
                teamMembers: teamMembersData
            };

            if (departmentForm.value.id) {
                await departmentStore.updateDepartment(departmentData);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Department Updated', life: 3000 });
            } else {
                await departmentStore.addDepartment(departmentData);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Department Created', life: 3000 });
            }

            await departmentStore.fetchDepartments();
            departmentDialog.value = false;
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to save department: ' + (error.response?.data?.message || error.message),
                life: 5000
            });
        }
    }
};

const confirmDeleteDepartment = (department) => {
    selectedDepartment.value = department;
    deleteDepartmentDialog.value = true;
};

const deleteDepartment = async () => {
    try {
        await departmentStore.deleteDepartment(selectedDepartment.value.id);
        deleteDepartmentDialog.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Department Deleted', life: 3000 });
        selectedDepartment.value = null;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete department', life: 3000 });
    }
};

const addEmployeeToDepartment = () => {
    if (selectedEmployees.value.length) {
        departmentForm.value.teamMembers = [...departmentForm.value.teamMembers, ...selectedEmployees.value];
        selectedEmployees.value = [];
    }
};

const removeEmployeeFromDepartment = (employee) => {
    departmentForm.value.teamMembers = departmentForm.value.teamMembers.filter((e) => e.id != employee.id);
    toast.add({
        severity: 'info',
        summary: 'Employee Removed',
        detail: `${employee.firstName} ${employee.lastName} will be removed from the department when saved`,
        life: 3000
    });
};

// ============ BRANCH METHODS ============
const openNewBranch = () => {
    branchForm.value = {
        id: null,
        name: '',
        address: '',
        contactEmail: '',
        branchManagerId: null,
        status: 'ACTIVE'
    };
    branchSubmitted.value = false;
    branchDialog.value = true;
};

const editBranch = (branch) => {
    branchForm.value = {
        id: branch.id,
        name: branch.name,
        address: branch.address,
        contactEmail: branch.contactEmail,
        branchManagerId: branch.branchManagerId,
        status: branch.status || 'ACTIVE'
    };
    branchDialog.value = true;
};

const viewBranchDetails = (branch) => {
    selectedBranch.value = branch;
    branchDetailDialog.value = true;
};

const saveBranch = async () => {
    branchSubmitted.value = true;

    if (branchForm.value.name.trim()) {
        try {
            const branchData = {
                id: branchForm.value.id,
                name: branchForm.value.name,
                address: branchForm.value.address,
                contactEmail: branchForm.value.contactEmail,
                branchManagerId: branchForm.value.branchManagerId,
                status: branchForm.value.status
            };

            if (branchForm.value.id) {
                await branchStore.updateBranch(branchData);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Branch Updated', life: 3000 });
            } else {
                await branchStore.addBranch(branchData);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Branch Created', life: 3000 });
            }

            branchDialog.value = false;
            resetBranchForm();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save branch', life: 3000 });
        }
    }
};

const confirmDeleteBranch = (branch) => {
    selectedBranch.value = branch;
    deleteBranchDialog.value = true;
};

const deleteBranch = async () => {
    try {
        await branchStore.deleteBranch(selectedBranch.value.id);
        deleteBranchDialog.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Branch Deleted', life: 3000 });
        selectedBranch.value = null;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete branch', life: 3000 });
    }
};

const resetBranchForm = () => {
    branchForm.value = {
        id: null,
        name: '',
        address: '',
        contactEmail: '',
        branchManagerId: null,
        status: 'ACTIVE'
    };
};

// ============ UTILS ============
const generateId = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

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
        case 'LOW':
            return 'pi pi-info-circle';
        case 'MEDIUM':
            return 'pi pi-exclamation-circle';
        case 'HIGH':
            return 'pi pi-exclamation-triangle';
        case 'URGENT':
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

const getEmployeeFullName = (employee) => {
    if (!employee) return 'Unassigned';
    return `${employee.firstName} ${employee.lastName}`;
};

const getEmployeeById = (employeeId) => {
    return employees.value.find((e) => e.id === employeeId);
};

const getManagerOptions = computed(() => {
    return employees.value.map((e) => ({
        label: `${e.firstName} ${e.lastName}`,
        value: e.id
    }));
});
</script>

<template>
    <div class="card">
        <h1 class="text-3xl font-semibold mb-4">Categories, Departments & Branches Management</h1>

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
                            {{ formatTime(data.targetResolutionTime) }}
                        </template>
                    </Column>

                    <Column field="priority" header="Priority" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.defaultPriority.charAt(0).toUpperCase() + data.defaultPriority.slice(1)" :class="getPriorityClass(data.defaultPriority)">
                                <i :class="[getPriorityIcon(data.defaultPriority), 'mr-1']"></i>
                                {{ data.defaultPriority.charAt(0).toUpperCase() + data.defaultPriority.slice(1) }}
                            </Tag>
                        </template>
                    </Column>

                    <Column field="isActive" header="Status" sortable>
                        <template #body="{ data }">
                            <Tag :severity="data.isActive ? 'success' : 'danger'">
                                {{ data.isActive ? 'ACTIVE' : 'INACTIVE' }}
                            </Tag>
                        </template>
                    </Column>

                    <Column header="Actions" :exportable="false">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" rounded outlined severity="info" @click="viewCategoryDetails(data)" />
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

                    <Column field="contactEmail" header="Contact Email" sortable>
                        <template #body="{ data }">
                            <a :href="`mailto:${data.contactEmail}`" class="text-primary hover:underline">{{ data.contactEmail }}</a>
                        </template>
                    </Column>

                    <Column field="departmentManager" header="Manager" sortable>
                        <template #body="{ data }">
                            <div v-if="data.departmentManager">
                                {{ getEmployeeFullName(data.departmentManager) }}
                            </div>
                            <div v-else class="text-gray-500">Unassigned</div>
                        </template>
                    </Column>

                    <Column field="teamMembers" header="Team Size" sortable>
                        <template #body="{ data }"> {{ data.teamMembers?.length || 0 }} employee{{ (data.teamMembers?.length || 0) !== 1 ? 's' : '' }} </template>
                    </Column>

                    <Column field="status" header="Status" sortable>
                        <template #body="{ data }">
                            <Tag :severity="data.status === 'ACTIVE' ? 'success' : 'danger'">
                                {{ data.status }}
                            </Tag>
                        </template>
                    </Column>

                    <Column header="Actions" :exportable="false">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" rounded outlined severity="info" @click="viewDepartmentDetails(data)" />
                                <Button icon="pi pi-pencil" rounded outlined @click="editDepartment(data)" />
                                <Button icon="pi pi-trash" rounded outlined severity="danger" @click="confirmDeleteDepartment(data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>

            <!-- Branches Tab -->
            <TabPanel header="Branches">
                <div class="flex justify-between mb-4">
                    <h2 class="text-xl font-semibold">Branches</h2>
                    <Button label="Add Branch" icon="pi pi-plus" @click="openNewBranch" />
                </div>

                <div v-if="loading" class="flex justify-center py-8">
                    <ProgressSpinner />
                </div>

                <DataTable v-else :value="branches" dataKey="id" :paginator="true" :rows="10" :rowHover="true" stripedRows responsiveLayout="scroll" class="p-datatable-sm">
                    <Column field="name" header="Branch Name" sortable>
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.name }}</div>
                            <div class="text-xs text-gray-500 mt-1">{{ data.address }}</div>
                        </template>
                    </Column>

                    <Column field="contactEmail" header="Contact Email" sortable>
                        <template #body="{ data }">
                            <a :href="`mailto:${data.contactEmail}`" class="text-primary hover:underline">{{ data.contactEmail }}</a>
                        </template>
                    </Column>

                    <Column field="branchManagerId" header="Manager" sortable>
                        <template #body="{ data }">
                            <div v-if="data.branchManagerId">
                                {{ getEmployeeFullName(getEmployeeById(data.branchManagerId)) }}
                            </div>
                            <div v-else class="text-gray-500">Unassigned</div>
                        </template>
                    </Column>

                    <Column field="status" header="Status" sortable>
                        <template #body="{ data }">
                            <Tag :severity="data.status === 'ACTIVE' ? 'success' : 'danger'">
                                {{ data.status }}
                            </Tag>
                        </template>
                    </Column>

                    <Column header="Actions" :exportable="false">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" rounded outlined severity="info" @click="viewBranchDetails(data)" />
                                <Button icon="pi pi-pencil" rounded outlined @click="editBranch(data)" />
                                <Button icon="pi pi-trash" rounded outlined severity="danger" @click="confirmDeleteBranch(data)" />
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

        <!-- Category Detail Dialog -->
        <Dialog v-model:visible="categoryDetailDialog" header="Category Details" :modal="true" :style="{ width: '600px' }">
            <div v-if="selectedCategory" class="grid grid-cols-1 gap-4">
                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Name:</label>
                    <div class="mt-1">{{ selectedCategory.name }}</div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Description:</label>
                    <div class="mt-1">{{ selectedCategory.description || 'N/A' }}</div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Department:</label>
                    <div class="mt-1">{{ getDepartmentName(selectedCategory.departmentId) }}</div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Target Resolution Time:</label>
                    <div class="mt-1">{{ formatTime(selectedCategory.targetResolutionTime) }}</div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Default Priority:</label>
                    <div class="mt-1">
                        <Tag :class="getPriorityClass(selectedCategory.defaultPriority)">
                            <i :class="[getPriorityIcon(selectedCategory.defaultPriority), 'mr-1']"></i>
                            {{ selectedCategory.defaultPriority }}
                        </Tag>
                    </div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Status:</label>
                    <div class="mt-1">
                        <Tag :severity="selectedCategory.isActive ? 'success' : 'danger'">
                            {{ selectedCategory.isActive ? 'ACTIVE' : 'INACTIVE' }}
                        </Tag>
                    </div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Requires Approval:</label>
                    <div class="mt-1">
                        <i v-if="selectedCategory.requiresApproval" class="pi pi-check-circle text-green-500 text-xl"></i>
                        <i v-else class="pi pi-times-circle text-gray-400 text-xl"></i>
                    </div>
                </div>

                <div v-if="selectedCategory.tags" class="detail-item">
                    <label class="font-semibold text-gray-700">Tags:</label>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <Tag v-for="tag in selectedCategory.tags.split(',')" :key="tag" :value="tag.trim()" class="bg-blue-100 text-blue-800" />
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Close" icon="pi pi-times" outlined @click="categoryDetailDialog = false" />
                <Button
                    label="Edit"
                    icon="pi pi-pencil"
                    @click="
                        categoryDetailDialog = false;
                        editCategory(selectedCategory);
                    "
                />
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
                            <InputText id="dept-email" v-model.trim="departmentForm.contactEmail" type="email" />
                        </div>

                        <div class="field">
                            <label for="dept-manager" class="font-medium mb-2 block">Department Manager</label>
                            <Dropdown id="dept-manager" v-model="departmentForm.departmentManager" :options="employees" optionLabel="firstName" placeholder="Select a Manager">
                                <template #value="slotProps">
                                    <div v-if="slotProps.value">{{ slotProps.value.firstName }} {{ slotProps.value.lastName }}</div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                                <template #option="slotProps">
                                    <div>
                                        {{ slotProps.option.firstName }} {{ slotProps.option.lastName }}
                                        <div class="text-xs text-gray-500">{{ slotProps.option.email }}</div>
                                    </div>
                                </template>
                            </Dropdown>
                        </div>

                        <div class="field-checkbox">
                            <Checkbox id="dept-isActive" v-model="departmentForm.status" :binary="false" :true-value="'ACTIVE'" :false-value="'INACTIVE'" />
                            <label for="dept-isActive" class="ml-2">Active</label>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Team Members">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="field mb-4">
                            <label class="font-medium mb-2 block">Current Team Members</label>
                            <div v-if="!departmentForm.teamMembers?.length" class="text-gray-500 text-center py-4 border rounded">No employees currently assigned to this department</div>
                            <div v-else class="border rounded overflow-hidden">
                                <DataTable :value="departmentForm.teamMembers" dataKey="id" class="p-datatable-sm">
                                    <Column field="firstName" header="First Name"></Column>
                                    <Column field="lastName" header="Last Name"></Column>
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
                                    <MultiSelect v-model="selectedEmployees" :options="availableEmployees" optionLabel="firstName" placeholder="Select Employees" display="chip" class="w-full">
                                        <template #option="slotProps">
                                            <div class="flex align-items-center">
                                                <div>
                                                    <div>{{ slotProps.option.firstName }} {{ slotProps.option.lastName }}</div>
                                                    <div class="text-xs text-gray-500">{{ slotProps.option.email }} • {{ slotProps.option.role }}</div>
                                                </div>
                                            </div>
                                        </template>
                                        <template #chip="slotProps"> {{ slotProps.value.firstName }} {{ slotProps.value.lastName }} </template>
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

        <!-- Department Detail Dialog -->
        <Dialog v-model:visible="departmentDetailDialog" header="Department Details" :modal="true" :style="{ width: '700px' }">
            <div v-if="selectedDepartment" class="grid grid-cols-1 gap-4">
                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Name:</label>
                    <div class="mt-1 text-lg">{{ selectedDepartment.name }}</div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Description:</label>
                    <div class="mt-1">{{ selectedDepartment.description || 'N/A' }}</div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Contact Email:</label>
                    <div class="mt-1">
                        <a :href="`mailto:${selectedDepartment.contactEmail}`" class="text-primary hover:underline">{{ selectedDepartment.contactEmail }}</a>
                    </div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Department Manager:</label>
                    <div class="mt-1">
                        <div v-if="selectedDepartment.departmentManager" class="flex items-center gap-2">
                            <i class="pi pi-user text-primary"></i>
                            <span>{{ getEmployeeFullName(selectedDepartment.departmentManager) }}</span>
                        </div>
                        <span v-else class="text-gray-500">Unassigned</span>
                    </div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Status:</label>
                    <div class="mt-1">
                        <Tag :severity="selectedDepartment.status === 'ACTIVE' ? 'success' : 'danger'">
                            {{ selectedDepartment.status }}
                        </Tag>
                    </div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Team Members ({{ selectedDepartment.teamMembers?.length || 0 }}):</label>
                    <div v-if="selectedDepartment.teamMembers?.length" class="mt-2 border rounded overflow-hidden">
                        <DataTable :value="selectedDepartment.teamMembers" dataKey="id" class="p-datatable-sm">
                            <Column field="firstName" header="First Name"></Column>
                            <Column field="lastName" header="Last Name"></Column>
                            <Column field="email" header="Email"></Column>
                            <Column field="role" header="Role"></Column>
                        </DataTable>
                    </div>
                    <div v-else class="mt-2 text-gray-500">No team members assigned</div>
                </div>
            </div>

            <template #footer>
                <Button label="Close" icon="pi pi-times" outlined @click="departmentDetailDialog = false" />
                <Button
                    label="Edit"
                    icon="pi pi-pencil"
                    @click="
                        departmentDetailDialog = false;
                        editDepartment(selectedDepartment);
                    "
                />
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

        <!-- Branch Dialog -->
        <Dialog v-model:visible="branchDialog" :header="branchForm.id ? 'Edit Branch' : 'Add Branch'" :modal="true" class="p-fluid" :style="{ width: '550px' }">
            <div class="grid grid-cols-1 gap-4">
                <div class="field">
                    <label for="branch-name" class="font-medium mb-2 block">Name</label>
                    <InputText id="branch-name" v-model.trim="branchForm.name" required autofocus :class="{ 'p-invalid': branchSubmitted && !branchForm.name }" />
                    <small v-if="branchSubmitted && !branchForm.name" class="p-error">Branch name is required.</small>
                </div>

                <div class="field">
                    <label for="branch-address" class="font-medium mb-2 block">Address</label>
                    <Textarea id="branch-address" v-model="branchForm.address" rows="3" />
                </div>

                <div class="field">
                    <label for="branch-email" class="font-medium mb-2 block">Contact Email</label>
                    <InputText id="branch-email" v-model.trim="branchForm.contactEmail" type="email" />
                </div>

                <div class="field">
                    <label for="branch-manager" class="font-medium mb-2 block">Branch Manager</label>
                    <Dropdown id="branch-manager" v-model="branchForm.branchManagerId" :options="employees" optionValue="id" placeholder="Select a Manager">
                        <template #value="slotProps">
                            <div v-if="slotProps.value">{{ getEmployeeFullName(getEmployeeById(slotProps.value)) }}</div>
                            <span v-else>{{ slotProps.placeholder }}</span>
                        </template>
                        <template #option="slotProps">
                            <div>
                                {{ slotProps.option.firstName }} {{ slotProps.option.lastName }}
                                <div class="text-xs text-gray-500">{{ slotProps.option.email }}</div>
                            </div>
                        </template>
                    </Dropdown>
                </div>

                <div class="field-checkbox">
                    <Checkbox id="branch-isActive" v-model="branchForm.status" :binary="false" :true-value="'ACTIVE'" :false-value="'INACTIVE'" />
                    <label for="branch-isActive" class="ml-2">Active</label>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" outlined @click="branchDialog = false" />
                <Button label="Save" icon="pi pi-check" @click="saveBranch" />
            </template>
        </Dialog>

        <!-- Branch Detail Dialog -->
        <Dialog v-model:visible="branchDetailDialog" header="Branch Details" :modal="true" :style="{ width: '600px' }">
            <div v-if="selectedBranch" class="grid grid-cols-1 gap-4">
                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Name:</label>
                    <div class="mt-1 text-lg">{{ selectedBranch.name }}</div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Address:</label>
                    <div class="mt-1">{{ selectedBranch.address || 'N/A' }}</div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Contact Email:</label>
                    <div class="mt-1">
                        <a :href="`mailto:${selectedBranch.contactEmail}`" class="text-primary hover:underline">{{ selectedBranch.contactEmail }}</a>
                    </div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Branch Manager:</label>
                    <div class="mt-1">
                        <div v-if="selectedBranch.branchManagerId" class="flex items-center gap-2">
                            <i class="pi pi-user text-primary"></i>
                            <span>{{ getEmployeeFullName(getEmployeeById(selectedBranch.branchManagerId)) }}</span>
                        </div>
                        <span v-else class="text-gray-500">Unassigned</span>
                    </div>
                </div>

                <div class="detail-item">
                    <label class="font-semibold text-gray-700">Status:</label>
                    <div class="mt-1">
                        <Tag :severity="selectedBranch.status === 'ACTIVE' ? 'success' : 'danger'">
                            {{ selectedBranch.status }}
                        </Tag>
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Close" icon="pi pi-times" outlined @click="branchDetailDialog = false" />
                <Button
                    label="Edit"
                    icon="pi pi-pencil"
                    @click="
                        branchDetailDialog = false;
                        editBranch(selectedBranch);
                    "
                />
            </template>
        </Dialog>

        <!-- Delete Branch Dialog -->
        <Dialog v-model:visible="deleteBranchDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle mr-3 text-xl text-yellow-500" />
                <span v-if="selectedBranch">
                    Are you sure you want to delete <b>{{ selectedBranch.name }}</b
                    >?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" outlined @click="deleteBranchDialog = false" />
                <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteBranch" />
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

.detail-item {
    @apply p-3 bg-gray-50 rounded;
}

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
