<script setup>
import { useAuthStore } from '@/stores/AuthStore';
import { useUserStore } from '@/stores/UserStore';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// PrimeVue Components
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import ProgressSpinner from 'primevue/progressspinner';
import TabMenu from 'primevue/tabmenu';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';

// Import Chart component directly instead of async for now
import Chart from 'primevue/chart';

const toast = useToast();
const confirm = useConfirm();
const userStore = useUserStore();
const authStore = useAuthStore();

// Reactive state
const activeTab = ref(0);
const showFileUpload = ref(false);
const showLeaveDialog = ref(false);
const uploading = ref(false);
const selectedFile = ref(null);
const uploadPreview = ref(null);
const loading = ref(false);
const isMobile = ref(false);

// Form data
const editProfile = ref({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    gender: '',
    department: '',
    address: ''
});

const errors = ref({});

const passwordData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const passwordErrors = ref({});

const newLeave = ref({
    startDate: null,
    endDate: null,
    leaveType: '',
    reason: ''
});

const securitySettings = ref({
    twoFactorEnabled: false,
    emailNotifications: true,
    sessionTimeout: 30
});

// Enums and options
const genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
    { label: 'Other', value: 'OTHER' },
    { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' }
];

const leaveTypes = [
    { label: 'Vacation', value: 'VACATION' },
    { label: 'Sick', value: 'SICK' },
    { label: 'Personal', value: 'PERSONAL' },
    { label: 'Maternity', value: 'MATERNITY' },
    { label: 'Paternity', value: 'PATERNITY' },
    { label: 'Bereavement', value: 'BEREAVEMENT' }
];

const sessionTimeoutOptions = [
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '4 hours', value: 240 }
];

const tabItems = [
    { label: 'Profile', icon: 'pi pi-user' },
    { label: 'Edit', icon: 'pi pi-pencil' },
    { label: 'Performance', icon: 'pi pi-chart-line' },
    { label: 'Leave', icon: 'pi pi-calendar' },
    { label: 'Settings', icon: 'pi pi-cog' }
];

// Computed properties
const profilePicture = computed(() => userStore.getProfilePicture || '/default-avatar.png');
const fullName = computed(() => userStore.getFullName || 'User Name');
const performanceStats = computed(() => userStore.getPerformanceStats);
const leaveHistory = computed(() => userStore.getLeaveHistory || []);
const canViewPerformance = computed(() => ['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(authStore.role));

const isLeaveFormValid = computed(() => {
    return newLeave.value.leaveType && newLeave.value.startDate && newLeave.value.endDate && newLeave.value.endDate >= newLeave.value.startDate;
});

// Chart data - initialize lazily
const performanceChartData = ref(null);
const chartOptions = ref(null);

// Lifecycle hooks
onMounted(async () => {
    checkMobile();
    window.addEventListener('resize', checkMobile);

    await loadEssentialData();

    if (authStore.requirePasswordChange) {
        activeTab.value = 4;
        toast.add({
            severity: 'warn',
            summary: 'Password Change Required',
            detail: 'Your password has expired. Please change it.',
            life: 3000
        });
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkMobile);
});

// Methods
const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
};

const loadEssentialData = async () => {
    loading.value = true;
    try {
        await userStore.fetchProfile();

        if (userStore.profile) {
            editProfile.value = {
                firstName: userStore.profile.firstName || '',
                lastName: userStore.profile.lastName || '',
                phoneNumber: userStore.profile.phoneNumber || '',
                email: userStore.profile.email || '',
                gender: userStore.profile.gender || '',
                department: userStore.profile.departmentName || '',
                address: userStore.profile.address || ''
            };
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load profile data',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const loadTabData = async (tabIndex) => {
    try {
        switch (tabIndex) {
            case 2: // Performance
                if (!performanceStats.value) {
                    await userStore.fetchPerformanceStats();
                    initializeChartData();
                }
                break;
            case 3: // Leave
                if (leaveHistory.value.length === 0) {
                    await userStore.fetchLeaveHistory();
                }
                break;
        }
    } catch (error) {
        console.error('Failed to load tab data:', error);
    }
};

const initializeChartData = () => {
    if (!performanceChartData.value) {
        performanceChartData.value = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Tickets Resolved',
                    data: [45, 52, 48, 55, 60, 58, 62],
                    fill: true,
                    backgroundColor: 'rgba(66, 165, 245, 0.1)',
                    borderColor: '#42A5F5',
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        };

        chartOptions.value = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        font: {
                            size: isMobile.value ? 10 : 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    ticks: { font: { size: isMobile.value ? 10 : 12 } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    ticks: { font: { size: isMobile.value ? 10 : 12 } }
                }
            }
        };
    }
};

const refreshAllData = async () => {
    try {
        await userStore.fetchProfile();
        toast.add({
            severity: 'success',
            summary: 'Refreshed',
            detail: 'Data updated',
            life: 2000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Refresh failed',
            life: 3000
        });
    }
};

// Watch for tab changes to load data on demand
watch(activeTab, (newTab) => {
    loadTabData(newTab);
});

// Form validation
const validateProfileForm = () => {
    errors.value = {};
    let isValid = true;

    if (!editProfile.value?.firstName?.trim()) {
        errors.value.firstName = 'First name is required';
        isValid = false;
    }

    if (!editProfile.value?.lastName?.trim()) {
        errors.value.lastName = 'Last name is required';
        isValid = false;
    }

    if (editProfile.value?.phoneNumber && !/^[\d\s\-\+\(\)]{10,}$/.test(editProfile.value.phoneNumber.replace(/\s/g, ''))) {
        errors.value.phoneNumber = 'Valid phone number required';
        isValid = false;
    }

    return isValid;
};

const handleProfileUpdate = async () => {
    if (!validateProfileForm()) return;

    try {
        await userStore.updateProfile(editProfile.value);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile updated',
            life: 3000
        });
        activeTab.value = 0;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Update failed',
            life: 3000
        });
    }
};

const validatePasswordForm = () => {
    passwordErrors.value = {};

    if (!passwordData.value.currentPassword) {
        passwordErrors.value.currentPassword = 'Current password is required';
    }

    if (!passwordData.value.newPassword) {
        passwordErrors.value.newPassword = 'New password is required';
    } else if (passwordData.value.newPassword.length < 8) {
        passwordErrors.value.newPassword = 'Password must be at least 8 characters';
    }

    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        passwordErrors.value.confirmPassword = 'Passwords do not match';
    }

    return Object.keys(passwordErrors.value).length === 0;
};

const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    try {
        await userStore.changePassword(passwordData.value);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password changed successfully',
            life: 3000
        });

        passwordData.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
        passwordErrors.value = {};

        if (authStore.requirePasswordChange) {
            authStore.setRequirePasswordChange(false);
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to change password',
            life: 3000
        });
    }
};

const onFileSelect = (event) => {
    const file = event.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.add({
            severity: 'error',
            summary: 'Invalid File',
            detail: 'Please select an image',
            life: 3000
        });
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        toast.add({
            severity: 'error',
            summary: 'File Too Large',
            detail: 'Maximum size is 2MB',
            life: 3000
        });
        return;
    }

    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => (uploadPreview.value = e.target.result);
    reader.readAsDataURL(file);
};

const clearFileSelection = () => {
    selectedFile.value = null;
    uploadPreview.value = null;
};

const uploadProfilePicture = async () => {
    if (!selectedFile.value) return;

    uploading.value = true;
    try {
        await userStore.uploadProfilePicture(selectedFile.value);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile picture updated',
            life: 3000
        });
        showFileUpload.value = false;
        clearFileSelection();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Upload failed',
            life: 3000
        });
    } finally {
        uploading.value = false;
    }
};

const handleLeaveApplication = async () => {
    if (!isLeaveFormValid.value) {
        toast.add({
            severity: 'warn',
            summary: 'Incomplete Form',
            detail: 'Please fill all required fields',
            life: 3000
        });
        return;
    }

    try {
        const leaveData = {
            ...newLeave.value,
            startDate: newLeave.value.startDate.toISOString().split('T')[0],
            endDate: newLeave.value.endDate.toISOString().split('T')[0]
        };

        await userStore.applyForLeave(leaveData);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Leave application submitted',
            life: 3000
        });

        newLeave.value = {
            startDate: null,
            endDate: null,
            leaveType: '',
            reason: ''
        };
        showLeaveDialog.value = false;
        await userStore.fetchLeaveHistory();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Submission failed',
            life: 3000
        });
    }
};

const confirmCancelLeave = (leave) => {
    confirm.require({
        message: `Cancel ${leave.leaveTypeDisplay} leave request?`,
        header: 'Confirm Cancellation',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await userStore.cancelLeave(leave.id);
                toast.add({
                    severity: 'success',
                    summary: 'Cancelled',
                    detail: 'Leave request cancelled',
                    life: 3000
                });
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Cancellation failed',
                    life: 3000
                });
            }
        }
    });
};

const refreshLeaveHistory = async () => {
    try {
        await userStore.fetchLeaveHistory();
        toast.add({
            severity: 'info',
            summary: 'Refreshed',
            detail: 'Leave history updated',
            life: 2000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to refresh',
            life: 3000
        });
    }
};

// Helper functions
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getStatusSeverity = (status) => {
    const map = {
        APPROVED: 'success',
        PENDING: 'warning',
        REJECTED: 'danger',
        CANCELLED: 'secondary'
    };
    return map[status] || 'info';
};

const calculateLeaveDays = () => {
    if (!newLeave.value.startDate || !newLeave.value.endDate) return 0;
    const diff = new Date(newLeave.value.endDate) - new Date(newLeave.value.startDate);
    return Math.floor(diff / (1000 * 3600 * 24)) + 1;
};

const getGenderDisplay = (gender) => {
    const option = genderOptions.find((g) => g.value === gender);
    return option ? option.label : 'N/A';
};

const sendEmail = () => {
    if (userStore.profile?.email) {
        window.location.href = `mailto:${userStore.profile.email}`;
    }
};

const makeCall = () => {
    if (userStore.profile?.phoneNumber) {
        window.location.href = `tel:${userStore.profile.phoneNumber}`;
    }
};
</script>

<template>
    <div class="user-profile">
        <Toast position="top-right" />
        <ConfirmDialog />

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <ProgressSpinner />
            <p class="mt-3 text-color-secondary">Loading profile...</p>
        </div>

        <!-- Main Content -->
        <div v-else class="profile-layout">
            <!-- Mobile Header -->
            <div v-if="isMobile" class="mobile-header p-3 surface-0 shadow-1">
                <div class="flex align-items-center gap-3">
                    <Avatar :image="profilePicture" size="large" shape="circle" />
                    <div class="flex-1 min-w-0">
                        <h2 class="m-0 text-900 font-bold text-base truncate">{{ fullName }}</h2>
                        <p class="m-0 text-xs text-color-secondary truncate">{{ userStore.profile?.role || 'Employee' }}</p>
                    </div>
                    <Button icon="pi pi-ellipsis-v" text rounded @click="refreshAllData" />
                </div>
            </div>

            <!-- Desktop Layout -->
            <div class="profile-grid">
                <!-- Sidebar - Desktop only -->
                <aside v-if="!isMobile" class="profile-sidebar">
                    <Card class="h-full border-round-lg">
                        <template #content>
                            <div class="flex flex-column align-items-center text-center p-3">
                                <Avatar :image="profilePicture" size="xlarge" shape="circle" class="border-2 border-primary mb-3 cursor-pointer hover:scale-105 transition-all" @click="showFileUpload = true" />
                                <h3 class="m-0 text-lg font-bold truncate w-full">{{ fullName }}</h3>
                                <p class="text-sm text-color-secondary m-0 mt-1">{{ userStore.profile?.role || 'Employee' }}</p>

                                <Badge :value="userStore.profile?.isActive ? 'Active' : 'Inactive'" :severity="userStore.profile?.isActive ? 'success' : 'danger'" class="mt-2" />
                            </div>

                            <Divider />

                            <!-- Quick Stats -->
                            <div class="quick-stats">
                                <div class="stat-item">
                                    <i class="pi pi-id-card text-sm text-color-secondary"></i>
                                    <div class="stat-content">
                                        <div class="text-xs text-color-secondary">ID</div>
                                        <div class="font-medium text-sm truncate">{{ userStore.profile?.employeeId || 'N/A' }}</div>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <i class="pi pi-building text-sm text-color-secondary"></i>
                                    <div class="stat-content">
                                        <div class="text-xs text-color-secondary">Dept</div>
                                        <div class="font-medium text-sm truncate">{{ userStore.profile?.departmentName || 'N/A' }}</div>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <i class="pi pi-envelope text-sm text-color-secondary"></i>
                                    <div class="stat-content">
                                        <div class="text-xs text-color-secondary">Email</div>
                                        <div class="font-medium text-sm truncate">{{ userStore.profile?.email || 'N/A' }}</div>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <i class="pi pi-phone text-sm text-color-secondary"></i>
                                    <div class="stat-content">
                                        <div class="text-xs text-color-secondary">Phone</div>
                                        <div class="font-medium text-sm truncate">{{ userStore.profile?.phoneNumber || 'N/A' }}</div>
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <!-- Quick Actions -->
                            <div class="quick-actions">
                                <Button label="Email" icon="pi pi-envelope" severity="secondary" outlined class="w-full mb-2" size="small" @click="sendEmail" />
                                <Button label="Call" icon="pi pi-phone" severity="secondary" outlined class="w-full" size="small" @click="makeCall" />
                            </div>
                        </template>
                    </Card>
                </aside>

                <!-- Main Content -->
                <main class="profile-main">
                    <Card class="h-full border-round-lg">
                        <!-- Header -->
                        <template #title>
                            <div class="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-2">
                                <div>
                                    <h1 class="text-xl sm:text-2xl font-bold m-0">Profile Dashboard</h1>
                                    <Badge v-if="authStore.requirePasswordChange" value="Change Password" severity="danger" class="mt-1" />
                                </div>
                                <div class="flex gap-2">
                                    <Button icon="pi pi-refresh" text rounded size="small" @click="refreshAllData" :loading="userStore.loading" />
                                    <Button v-if="activeTab === 1" icon="pi pi-times" label="Cancel" severity="secondary" size="small" @click="activeTab = 0" />
                                </div>
                            </div>
                        </template>

                        <!-- Tab Navigation -->
                        <template #subtitle>
                            <TabMenu v-model:activeIndex="activeTab" :model="tabItems" class="border-none w-full" />
                        </template>

                        <!-- Content -->
                        <template #content>
                            <div class="tab-content">
                                <!-- Profile View -->
                                <div v-if="activeTab === 0">
                                    <div class="grid">
                                        <div class="col-12">
                                            <Card class="mb-3">
                                                <template #title>
                                                    <div class="flex align-items-center gap-2">
                                                        <i class="pi pi-user text-primary"></i>
                                                        <span>Personal Information</span>
                                                    </div>
                                                </template>
                                                <template #content>
                                                    <div class="grid">
                                                        <div class="col-12 sm:col-6 md:col-4">
                                                            <div class="field">
                                                                <label class="font-bold block mb-2 text-color-secondary text-sm">First Name</label>
                                                                <div class="p-2 border-1 surface-border border-round bg-surface-50">
                                                                    {{ userStore.profile?.firstName || 'N/A' }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-12 sm:col-6 md:col-4">
                                                            <div class="field">
                                                                <label class="font-bold block mb-2 text-color-secondary text-sm">Last Name</label>
                                                                <div class="p-2 border-1 surface-border border-round bg-surface-50">
                                                                    {{ userStore.profile?.lastName || 'N/A' }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-12 sm:col-6 md:col-4">
                                                            <div class="field">
                                                                <label class="font-bold block mb-2 text-color-secondary text-sm">Gender</label>
                                                                <div class="p-2 border-1 surface-border border-round bg-surface-50">
                                                                    {{ getGenderDisplay(userStore.profile?.gender) }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-12 sm:col-6 md:col-4">
                                                            <div class="field">
                                                                <label class="font-bold block mb-2 text-color-secondary text-sm">Date of Birth</label>
                                                                <div class="p-2 border-1 surface-border border-round bg-surface-50">
                                                                    {{ formatDate(userStore.profile?.dateOfBirth) }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-12 sm:col-6 md:col-4">
                                                            <div class="field">
                                                                <label class="font-bold block mb-2 text-color-secondary text-sm">Nationality</label>
                                                                <div class="p-2 border-1 surface-border border-round bg-surface-50">
                                                                    {{ userStore.profile?.nationality || 'N/A' }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </template>
                                            </Card>
                                        </div>

                                        <div class="col-12">
                                            <Card>
                                                <template #title>
                                                    <div class="flex align-items-center gap-2">
                                                        <i class="pi pi-address-book text-primary"></i>
                                                        <span>Contact Information</span>
                                                    </div>
                                                </template>
                                                <template #content>
                                                    <div class="grid">
                                                        <div class="col-12 md:col-6">
                                                            <div class="field">
                                                                <label class="font-bold block mb-2 text-color-secondary text-sm">Email Address</label>
                                                                <div class="p-2 border-1 surface-border border-round bg-surface-50">
                                                                    {{ userStore.profile?.email || 'N/A' }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-12 md:col-6">
                                                            <div class="field">
                                                                <label class="font-bold block mb-2 text-color-secondary text-sm">Phone Number</label>
                                                                <div class="p-2 border-1 surface-border border-round bg-surface-50">
                                                                    {{ userStore.profile?.phoneNumber || 'N/A' }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-12">
                                                            <div class="field">
                                                                <label class="font-bold block mb-2 text-color-secondary text-sm">Address</label>
                                                                <div class="p-2 border-1 surface-border border-round bg-surface-50">
                                                                    {{ userStore.profile?.address || 'N/A' }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </template>
                                            </Card>
                                        </div>
                                    </div>
                                </div>

                                <!-- Edit Profile -->
                                <div v-else-if="activeTab === 1">
                                    <form @submit.prevent="handleProfileUpdate">
                                        <div class="grid">
                                            <div class="col-12 mb-4">
                                                <div class="flex flex-column align-items-center gap-3">
                                                    <Avatar :image="uploadPreview || profilePicture" size="xlarge" shape="circle" class="border-3 border-primary cursor-pointer hover:scale-105 transition-all" @click="showFileUpload = true" />
                                                    <Button icon="pi pi-camera" label="Change Photo" severity="secondary" outlined size="small" @click="showFileUpload = true" />
                                                </div>
                                            </div>

                                            <div class="col-12 md:col-6">
                                                <div class="field">
                                                    <label class="font-bold block mb-2 required text-sm">First Name</label>
                                                    <InputText v-model="editProfile.firstName" class="w-full" :class="{ 'p-invalid': errors.firstName }" placeholder="Enter first name" required />
                                                    <small v-if="errors.firstName" class="p-error text-xs">{{ errors.firstName }}</small>
                                                </div>
                                            </div>
                                            <div class="col-12 md:col-6">
                                                <div class="field">
                                                    <label class="font-bold block mb-2 required text-sm">Last Name</label>
                                                    <InputText v-model="editProfile.lastName" class="w-full" :class="{ 'p-invalid': errors.lastName }" placeholder="Enter last name" required />
                                                    <small v-if="errors.lastName" class="p-error text-xs">{{ errors.lastName }}</small>
                                                </div>
                                            </div>
                                            <div class="col-12 md:col-6">
                                                <div class="field">
                                                    <label class="font-bold block mb-2 text-sm">Gender</label>
                                                    <Dropdown v-model="editProfile.gender" :options="genderOptions" optionLabel="label" optionValue="value" placeholder="Select Gender" class="w-full" />
                                                </div>
                                            </div>
                                            <div class="col-12 md:col-6">
                                                <div class="field">
                                                    <label class="font-bold block mb-2 required text-sm">Phone Number</label>
                                                    <InputText v-model="editProfile.phoneNumber" class="w-full" :class="{ 'p-invalid': errors.phoneNumber }" placeholder="Enter phone number" required />
                                                    <small v-if="errors.phoneNumber" class="p-error text-xs">{{ errors.phoneNumber }}</small>
                                                </div>
                                            </div>
                                            <div class="col-12">
                                                <div class="field">
                                                    <label class="font-bold block mb-2 text-sm">Address</label>
                                                    <Textarea v-model="editProfile.address" rows="2" class="w-full" placeholder="Enter your address" />
                                                </div>
                                            </div>

                                            <div class="col-12 mt-4">
                                                <div class="flex justify-content-end gap-2">
                                                    <Button label="Cancel" icon="pi pi-times" severity="secondary" outlined size="small" @click="activeTab = 0" />
                                                    <Button label="Save Changes" icon="pi pi-check" type="submit" :loading="userStore.loading" size="small" />
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <!-- Performance -->
                                <div v-else-if="activeTab === 2">
                                    <div v-if="canViewPerformance">
                                        <div class="grid">
                                            <div class="col-12 lg:col-8">
                                                <Card class="mb-3">
                                                    <template #title>Performance Overview</template>
                                                    <template #content>
                                                        <div class="h-15rem sm:h-20rem">
                                                            <Chart v-if="performanceChartData" type="line" :data="performanceChartData" :options="chartOptions" class="h-full w-full" />
                                                            <div v-else class="flex justify-content-center align-items-center h-full">
                                                                <ProgressSpinner />
                                                            </div>
                                                        </div>
                                                    </template>
                                                </Card>
                                            </div>
                                            <div class="col-12 lg:col-4">
                                                <Card class="h-full">
                                                    <template #title>Key Metrics</template>
                                                    <template #content>
                                                        <div class="space-y-3">
                                                            <div class="metric-item">
                                                                <div class="metric-label">Tickets Resolved</div>
                                                                <div class="metric-value">{{ performanceStats?.ticketsResolved || 0 }}</div>
                                                            </div>
                                                            <div class="metric-item">
                                                                <div class="metric-label">Avg Rating</div>
                                                                <div class="metric-value">{{ performanceStats?.customerSatisfactionScore?.toFixed(1) || '0.0' }}</div>
                                                            </div>
                                                            <div class="metric-item">
                                                                <div class="metric-label">Response Time</div>
                                                                <div class="metric-value">{{ performanceStats?.firstResponseTimeAverage?.toFixed(1) || '0.0' }}min</div>
                                                            </div>
                                                            <div class="metric-item">
                                                                <div class="metric-label">Current Rank</div>
                                                                <div class="metric-value">#{{ performanceStats?.leaderboardPosition || '-' }}</div>
                                                            </div>
                                                        </div>
                                                    </template>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="access-denied">
                                        <i class="pi pi-lock text-4xl text-color-secondary mb-3"></i>
                                        <h3 class="text-lg font-bold">Access Restricted</h3>
                                        <p class="text-color-secondary">Performance analytics are only available to managers and supervisors.</p>
                                    </div>
                                </div>

                                <!-- Leave Management -->
                                <div v-else-if="activeTab === 3">
                                    <div class="grid">
                                        <div class="col-12 lg:col-4">
                                            <Card class="mb-3">
                                                <template #title>Quick Actions</template>
                                                <template #content>
                                                    <div class="flex flex-column gap-2">
                                                        <Button label="Apply for Leave" icon="pi pi-plus" @click="showLeaveDialog = true" class="w-full" size="small" />
                                                        <Button label="Refresh History" icon="pi pi-refresh" severity="secondary" outlined @click="refreshLeaveHistory" class="w-full" size="small" />
                                                    </div>
                                                </template>
                                            </Card>
                                        </div>

                                        <div class="col-12 lg:col-8">
                                            <Card>
                                                <template #title>
                                                    <div class="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-2">
                                                        <span class="font-bold">Leave History</span>
                                                        <Button label="Apply Leave" icon="pi pi-plus" @click="showLeaveDialog = true" size="small" />
                                                    </div>
                                                </template>
                                                <template #content>
                                                    <div v-if="leaveHistory.length > 0" class="space-y-2">
                                                        <div v-for="leave in leaveHistory.slice(0, 5)" :key="leave.id" class="leave-item p-2 border-round surface-card border-1">
                                                            <div class="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-1 mb-1">
                                                                <div class="flex-1 min-w-0">
                                                                    <div class="font-bold text-sm truncate">{{ leave.leaveTypeDisplay }}</div>
                                                                    <div class="text-xs text-color-secondary truncate">{{ formatDate(leave.startDate) }} - {{ formatDate(leave.endDate) }}</div>
                                                                </div>
                                                                <div class="flex align-items-center gap-1">
                                                                    <Tag :value="leave.statusDisplay" :severity="getStatusSeverity(leave.status)" size="small" />
                                                                    <Button v-if="leave.status === 'PENDING'" icon="pi pi-times" severity="danger" text rounded size="small" @click="confirmCancelLeave(leave)" />
                                                                </div>
                                                            </div>
                                                            <div v-if="leave.reason" class="text-xs text-color-secondary line-clamp-1">
                                                                {{ leave.reason }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-else class="text-center p-4">
                                                        <i class="pi pi-calendar text-3xl text-color-secondary mb-2"></i>
                                                        <p class="text-color-secondary text-sm">No leave records found</p>
                                                    </div>
                                                </template>
                                            </Card>
                                        </div>
                                    </div>
                                </div>

                                <!-- Settings -->
                                <div v-else-if="activeTab === 4">
                                    <div class="grid">
                                        <div class="col-12 lg:col-6">
                                            <Card class="mb-3">
                                                <template #title>Change Password</template>
                                                <template #content>
                                                    <form @submit.prevent="handlePasswordChange">
                                                        <div class="space-y-3">
                                                            <div class="field">
                                                                <label class="font-bold block mb-2 required text-sm">Current Password</label>
                                                                <Password
                                                                    v-model="passwordData.currentPassword"
                                                                    toggleMask
                                                                    class="w-full"
                                                                    inputClass="w-full"
                                                                    :class="{ 'p-invalid': passwordErrors.currentPassword }"
                                                                    placeholder="Enter current password"
                                                                    required
                                                                />
                                                                <small v-if="passwordErrors.currentPassword" class="p-error text-xs">
                                                                    {{ passwordErrors.currentPassword }}
                                                                </small>
                                                            </div>

                                                            <div class="field">
                                                                <label class="font-bold block mb-2 required text-sm">New Password</label>
                                                                <Password
                                                                    v-model="passwordData.newPassword"
                                                                    toggleMask
                                                                    class="w-full"
                                                                    inputClass="w-full"
                                                                    :class="{ 'p-invalid': passwordErrors.newPassword }"
                                                                    placeholder="Enter new password"
                                                                    required
                                                                />
                                                                <small v-if="passwordErrors.newPassword" class="p-error text-xs">
                                                                    {{ passwordErrors.newPassword }}
                                                                </small>
                                                            </div>

                                                            <div class="field">
                                                                <label class="font-bold block mb-2 required text-sm">Confirm Password</label>
                                                                <Password
                                                                    v-model="passwordData.confirmPassword"
                                                                    toggleMask
                                                                    class="w-full"
                                                                    inputClass="w-full"
                                                                    :class="{ 'p-invalid': passwordErrors.confirmPassword }"
                                                                    placeholder="Confirm new password"
                                                                    required
                                                                />
                                                                <small v-if="passwordErrors.confirmPassword" class="p-error text-xs">
                                                                    {{ passwordErrors.confirmPassword }}
                                                                </small>
                                                            </div>

                                                            <Button label="Change Password" icon="pi pi-key" type="submit" class="w-full" :loading="userStore.loading" />
                                                        </div>
                                                    </form>
                                                </template>
                                            </Card>
                                        </div>

                                        <div class="col-12 lg:col-6">
                                            <Card>
                                                <template #title>Security Settings</template>
                                                <template #content>
                                                    <div class="space-y-3">
                                                        <div class="security-item">
                                                            <div>
                                                                <div class="font-bold text-sm">Two-Factor Auth</div>
                                                                <div class="text-xs text-color-secondary">Extra security layer</div>
                                                            </div>
                                                            <InputSwitch v-model="securitySettings.twoFactorEnabled" />
                                                        </div>
                                                        <div class="security-item">
                                                            <div>
                                                                <div class="font-bold text-sm">Email Notifications</div>
                                                                <div class="text-xs text-color-secondary">Receive email updates</div>
                                                            </div>
                                                            <InputSwitch v-model="securitySettings.emailNotifications" />
                                                        </div>
                                                        <div class="security-item">
                                                            <div>
                                                                <div class="font-bold text-sm">Session Timeout</div>
                                                                <div class="text-xs text-color-secondary">Auto-logout after inactivity</div>
                                                            </div>
                                                            <Dropdown v-model="securitySettings.sessionTimeout" :options="sessionTimeoutOptions" optionLabel="label" optionValue="value" class="w-full sm:w-10rem" />
                                                        </div>
                                                    </div>
                                                </template>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </main>
            </div>
        </div>

        <!-- File Upload Dialog -->
        <Dialog v-model:visible="showFileUpload" header="Profile Picture" :modal="true" :breakpoints="{ '960px': '75vw', '640px': '90vw' }" :style="{ width: '400px' }" :draggable="false">
            <div class="upload-dialog">
                <div class="flex justify-content-center mb-4">
                    <Avatar :image="uploadPreview || profilePicture" size="xlarge" shape="circle" class="border-3 border-primary" />
                </div>

                <FileUpload mode="basic" accept="image/*" :maxFileSize="2000000" chooseLabel="Choose Image" @select="onFileSelect" :auto="true" />

                <small class="text-xs text-color-secondary block text-center mt-3"> Max 2MB • JPG, PNG, GIF </small>
            </div>

            <template #footer>
                <div class="flex flex-wrap justify-content-end gap-2">
                    <Button label="Cancel" icon="pi pi-times" severity="secondary" outlined @click="showFileUpload = false" class="w-full sm:w-auto" />
                    <Button label="Upload" icon="pi pi-upload" :disabled="!selectedFile" :loading="uploading" @click="uploadProfilePicture" class="w-full sm:w-auto" />
                </div>
            </template>
        </Dialog>

        <!-- Leave Application Dialog -->
        <Dialog v-model:visible="showLeaveDialog" header="Apply for Leave" :modal="true" :breakpoints="{ '960px': '75vw', '640px': '95vw' }" :style="{ width: '500px' }" :draggable="false">
            <div class="leave-dialog">
                <form @submit.prevent="handleLeaveApplication">
                    <div class="grid">
                        <div class="col-12">
                            <div class="field">
                                <label class="font-bold block mb-2 required text-sm">Leave Type</label>
                                <Dropdown v-model="newLeave.leaveType" :options="leaveTypes" optionLabel="label" optionValue="value" placeholder="Select Leave Type" class="w-full" required />
                            </div>
                        </div>
                        <div class="col-12 sm:col-6">
                            <div class="field">
                                <label class="font-bold block mb-2 required text-sm">Start Date</label>
                                <Calendar v-model="newLeave.startDate" dateFormat="yy-mm-dd" placeholder="Select start date" class="w-full" :touchUI="isMobile" :minDate="new Date()" />
                            </div>
                        </div>
                        <div class="col-12 sm:col-6">
                            <div class="field">
                                <label class="font-bold block mb-2 required text-sm">End Date</label>
                                <Calendar v-model="newLeave.endDate" dateFormat="yy-mm-dd" placeholder="Select end date" class="w-full" :touchUI="isMobile" :minDate="newLeave.startDate" />
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="field">
                                <label class="font-bold block mb-2 text-sm">Duration</label>
                                <div class="duration-display">{{ calculateLeaveDays() }} day(s)</div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="field">
                                <label class="font-bold block mb-2 text-sm">Reason</label>
                                <Textarea v-model="newLeave.reason" rows="3" class="w-full" placeholder="Please provide details for your leave request..." :maxlength="500" />
                                <small class="text-color-secondary text-xs"> {{ newLeave.reason?.length || 0 }}/500 characters </small>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <template #footer>
                <div class="flex flex-wrap justify-content-end gap-2">
                    <Button label="Cancel" icon="pi pi-times" severity="secondary" outlined @click="showLeaveDialog = false" class="w-full sm:w-auto" />
                    <Button label="Submit" icon="pi pi-send" :disabled="!isLeaveFormValid" @click="handleLeaveApplication" class="w-full sm:w-auto" :loading="userStore.loading" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.user-profile {
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

.profile-layout {
    padding: 1rem;
}

.mobile-header {
    position: sticky;
    top: 0;
    z-index: 10;
    margin: -1rem -1rem 1rem -1rem;
}

.profile-grid {
    display: grid;
    gap: 1.5rem;
}

@media (min-width: 992px) {
    .profile-grid {
        grid-template-columns: 300px 1fr;
    }
}

.profile-sidebar {
    position: sticky;
    top: 1rem;
    height: fit-content;
}

.profile-main {
    min-height: calc(100vh - 2rem);
}

.quick-stats {
    display: grid;
    gap: 0.75rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background-color 0.2s;
    cursor: default;
}

.stat-item:hover {
    background: var(--surface-hover);
}

.stat-content {
    flex: 1;
    min-width: 0;
}

.quick-actions {
    display: grid;
    gap: 0.5rem;
}

.tab-content {
    min-height: 400px;
}

.access-denied {
    text-align: center;
    padding: 3rem 1rem;
}

.upload-dialog,
.leave-dialog {
    padding: 1rem 0;
}

.duration-display {
    padding: 0.75rem;
    background: var(--surface-50);
    border-radius: 6px;
    text-align: center;
    font-weight: 500;
    font-size: 0.875rem;
}

.field {
    margin-bottom: 1rem;
}

.field:last-child {
    margin-bottom: 0;
}

.metric-item {
    padding: 0.75rem;
    border-radius: 8px;
    background: var(--surface-50);
    transition: background-color 0.2s;
}

.metric-item:hover {
    background: var(--surface-100);
}

.metric-label {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.metric-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-top: 0.25rem;
}

.leave-item {
    transition:
        transform 0.2s,
        background-color 0.2s;
}

.leave-item:hover {
    transform: translateY(-1px);
    background: var(--surface-hover);
}

.security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border-radius: 8px;
    background: var(--surface-50);
    transition: background-color 0.2s;
}

.security-item:hover {
    background: var(--surface-100);
}

.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Mobile optimizations */
@media (max-width: 768px) {
    .profile-layout {
        padding: 0.5rem;
    }

    .mobile-header {
        margin: -0.5rem -0.5rem 0.5rem -0.5rem;
    }

    :deep(.p-tabmenu-nav) {
        flex-wrap: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        padding-bottom: 2px;
    }

    :deep(.p-tabmenu-nav::-webkit-scrollbar) {
        display: none;
    }

    :deep(.p-tabmenuitem) {
        flex-shrink: 0;
    }

    :deep(.p-tabmenuitem .p-menuitem-link) {
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
    }

    :deep(.p-button) {
        min-height: 2.5rem;
        font-size: 0.875rem;
    }

    :deep(.p-card .p-card-content) {
        padding: 1rem;
    }

    :deep(.p-dropdown) {
        font-size: 0.875rem;
    }

    :deep(.p-inputtext) {
        font-size: 0.875rem;
    }
}

/* Touch target improvements */
:deep(.p-button) {
    min-height: 2.75rem;
}

:deep(.p-dropdown) {
    min-height: 2.75rem;
}

:deep(.p-inputtext) {
    min-height: 2.75rem;
}

:deep(.p-calendar) {
    width: 100%;
}

/* Smooth transitions */
.hover\:scale-105:hover {
    transform: scale(1.05);
}

.transition-all {
    transition: all 0.3s ease;
}

/* Required field indicator */
.field label.required::after {
    content: ' *';
    color: var(--red-500);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .user-profile {
        background: var(--surface-900);
    }

    .stat-item,
    .metric-item,
    .security-item,
    .leave-item {
        background: var(--surface-800);
    }

    .stat-item:hover,
    .metric-item:hover,
    .security-item:hover,
    .leave-item:hover {
        background: var(--surface-700);
    }
}

/* Performance optimizations */
:deep(.p-chart) {
    contain: content;
}

:deep(.p-card) {
    contain: layout style paint;
}
</style>
