<script setup>
import { useAuthStore } from '@/stores/AuthStore';
import { useLeaveStore } from '@/stores/LeaveStore';
import { useUserStore } from '@/stores/UserStore';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';

// PrimeVue Components
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Rating from 'primevue/rating';
import TabMenu from 'primevue/tabmenu';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';

const toast = useToast();
const confirm = useConfirm();
const userStore = useUserStore();
const leaveStore = useLeaveStore();
const authStore = useAuthStore();

// Reactive state
const activeTab = ref(0);
const showFileUpload = ref(false);
const showLeaveDialog = ref(false);
const uploading = ref(false);
const selectedFile = ref(null);
const uploadPreview = ref(null);
const loading = ref(false);

// Form data
const editProfile = ref({
    firstName: '',
    lastName: '',
    otherName: '',
    phoneNumber: '',
    gender: '',
    branch: '',
    address: '',
    dateOfBirth: null,
    nationality: '',
    emergencyContact: '',
    emergencyPhone: ''
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
    { label: 'Vacation Leave', value: 'VACATION' },
    { label: 'Sick Leave', value: 'SICK' },
    { label: 'Personal Leave', value: 'PERSONAL' },
    { label: 'Maternity Leave', value: 'MATERNITY' },
    { label: 'Paternity Leave', value: 'PATERNITY' },
    { label: 'Bereavement Leave', value: 'BEREAVEMENT' },
    { label: 'Study Leave', value: 'STUDY' },
    { label: 'Compassionate Leave', value: 'COMPASSIONATE' },
    { label: 'Unpaid Leave', value: 'UNPAID' }
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
    { label: 'Edit Profile', icon: 'pi pi-pencil' },
    { label: 'Performance', icon: 'pi pi-chart-line' },
    { label: 'Leave', icon: 'pi pi-calendar' },
    { label: 'Settings', icon: 'pi pi-cog' }
];

// Computed properties
const profilePicture = computed(() => userStore.getProfilePicture || '/default-avatar.png');
const fullName = computed(() => userStore.getFullName);
const performanceStats = computed(() => userStore.getPerformanceStats);
const leaveHistory = computed(() => userStore.getLeaveHistory);
const pendingLeaves = computed(() => userStore.getPendingLeaves);
const pendingLeavesCount = computed(() => pendingLeaves.value?.length || 0);
const canViewPerformance = computed(() => ['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(authStore.role));

const minLeaveDate = computed(() => new Date());
const maxBirthDate = computed(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
});

const isLeaveFormValid = computed(() => {
    return newLeave.value.leaveType && newLeave.value.startDate && newLeave.value.endDate && newLeave.value.endDate >= newLeave.value.startDate;
});

const leaveBalances = computed(() => [
    { type: 'Vacation', available: 15, used: 5, total: 20, color: 'text-blue-600' },
    { type: 'Sick', available: 10, used: 2, total: 12, color: 'text-green-600' },
    { type: 'Personal', available: 5, used: 1, total: 6, color: 'text-orange-600' },
    { type: 'Maternity', available: 90, used: 0, total: 90, color: 'text-pink-600' }
]);

const recentSessions = computed(() => [
    { id: 1, device: 'Chrome on Windows', location: 'New York, US', lastActive: new Date(), status: 'Active' },
    { id: 2, device: 'Safari on iPhone', location: 'Los Angeles, US', lastActive: new Date(Date.now() - 3600000), status: 'Active' },
    { id: 3, device: 'Firefox on Mac', location: 'London, UK', lastActive: new Date(Date.now() - 86400000), status: 'Expired' }
]);

// Chart data
const performanceChartData = ref({
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
});

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                usePointStyle: true
            }
        }
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(0, 0, 0, 0.1)'
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(0, 0, 0, 0.1)'
            }
        }
    }
});

// Lifecycle hooks
onMounted(async () => {
    await loadProfileData();

    if (authStore.requirePasswordChange) {
        activeTab.value = 4;
        toast.add({
            severity: 'warn',
            summary: 'Password Change Required',
            detail: 'Your password has expired. Please change it to continue.',
            life: 5000
        });
    }
});

// Methods
const loadProfileData = async () => {
    loading.value = true;
    try {
        await Promise.all([userStore.fetchProfile(), userStore.fetchPerformanceStats(), userStore.fetchLeaveHistory()]);

        // Initialize edit form
        if (userStore.profile) {
            editProfile.value = {
                firstName: userStore.profile.firstName || '',
                lastName: userStore.profile.lastName || '',
                otherName: userStore.profile.otherName || '',
                phoneNumber: userStore.profile.phoneNumber || '',
                gender: userStore.profile.gender || '',
                branch: userStore.profile.branch || '',
                address: userStore.profile.address || '',
                dateOfBirth: userStore.profile.dateOfBirth ? new Date(userStore.profile.dateOfBirth) : null,
                nationality: userStore.profile.nationality || '',
                emergencyContact: userStore.profile.emergencyContact || '',
                emergencyPhone: userStore.profile.emergencyPhone || ''
            };
        }

        // Update chart data with actual performance stats
        updateChartData();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load profile data. Please try again.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const refreshAllData = async () => {
    await loadProfileData();
    toast.add({
        severity: 'success',
        summary: 'Refreshed',
        detail: 'Profile data has been updated',
        life: 2000
    });
};

const updateChartData = () => {
    if (performanceStats.value?.monthlyData) {
        const months = performanceStats.value.monthlyData.map((m) => m.month);
        const tickets = performanceStats.value.monthlyData.map((m) => m.ticketsResolved);

        performanceChartData.value.labels = months;
        performanceChartData.value.datasets[0].data = tickets;
    }
};

const validateProfileForm = () => {
    errors.value = {};

    if (!editProfile.value.firstName?.trim()) {
        errors.value.firstName = 'First name is required';
    }

    if (!editProfile.value.lastName?.trim()) {
        errors.value.lastName = 'Last name is required';
    }

    if (!editProfile.value.phoneNumber?.trim()) {
        errors.value.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(editProfile.value.phoneNumber.replace(/\D/g, ''))) {
        errors.value.phoneNumber = 'Please enter a valid phone number';
    }

    return Object.keys(errors.value).length === 0;
};

const handleProfileUpdate = async () => {
    if (!validateProfileForm()) {
        toast.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please correct the errors in the form',
            life: 3000
        });
        return;
    }

    try {
        await userStore.updateProfile(editProfile.value);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile updated successfully',
            life: 3000
        });
        activeTab.value = 0;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to update profile',
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
        passwordErrors.value.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.value.newPassword)) {
        passwordErrors.value.newPassword = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!passwordData.value.confirmPassword) {
        passwordErrors.value.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        passwordErrors.value.confirmPassword = 'Passwords do not match';
    }

    return Object.keys(passwordErrors.value).length === 0;
};

const handlePasswordChange = async () => {
    if (!validatePasswordForm()) {
        return;
    }

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
    const file = event.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.add({
            severity: 'error',
            summary: 'Invalid File',
            detail: 'Please select an image file',
            life: 3000
        });
        return;
    }

    if (file.size > 2000000) {
        toast.add({
            severity: 'error',
            summary: 'File Too Large',
            detail: 'Maximum file size is 2MB',
            life: 3000
        });
        return;
    }

    selectedFile.value = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        uploadPreview.value = e.target.result;
    };
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
            detail: 'Profile picture updated successfully',
            life: 3000
        });
        showFileUpload.value = false;
        clearFileSelection();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Failed to upload profile picture',
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
            startDate: formatDateForApi(newLeave.value.startDate),
            endDate: formatDateForApi(newLeave.value.endDate)
        };

        await userStore.applyForLeave(leaveData);

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Leave application submitted successfully',
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
            detail: error.message || 'Failed to submit leave application',
            life: 3000
        });
    }
};

const confirmCancelLeave = (leave) => {
    confirm.require({
        message: `Are you sure you want to cancel your ${leave.leaveTypeDisplay.toLowerCase()} leave request?`,
        header: 'Confirm Cancellation',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await userStore.cancelLeave(leave.id);
                toast.add({
                    severity: 'success',
                    summary: 'Cancelled',
                    detail: 'Leave request has been cancelled',
                    life: 3000
                });
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to cancel leave request',
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
            detail: 'Leave history has been updated',
            life: 2000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to refresh leave history',
            life: 3000
        });
    }
};

const cancelEdit = () => {
    resetEditForm();
    activeTab.value = 0;
};

// Helper methods
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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

const formatDateForApi = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

const calculateTenure = (hireDate) => {
    if (!hireDate) return 'N/A';
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();

    if (months < 0) {
        return `${years - 1} years, ${months + 12} months`;
    }

    return `${years} years, ${months} months`;
};

const calculateLeaveDays = () => {
    if (!newLeave.value.startDate || !newLeave.value.endDate) return 0;

    const start = new Date(newLeave.value.startDate);
    const end = new Date(newLeave.value.endDate);
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    return Math.floor(dayDiff) + 1;
};

const getGenderDisplay = (gender) => {
    const option = genderOptions.find((g) => g.value === gender);
    return option ? option.label : 'N/A';
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'APPROVED':
            return 'success';
        case 'PENDING':
            return 'warning';
        case 'IN_REVIEW':
            return 'info';
        case 'REJECTED':
            return 'danger';
        case 'CANCELLED':
            return 'secondary';
        default:
            return 'info';
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'APPROVED':
            return 'pi pi-check';
        case 'PENDING':
            return 'pi pi-clock';
        case 'IN_REVIEW':
            return 'pi pi-eye';
        case 'REJECTED':
            return 'pi pi-times';
        case 'CANCELLED':
            return 'pi pi-ban';
        default:
            return '';
    }
};

const calculateRankingPercentage = () => {
    if (!performanceStats.value || !performanceStats.value.leaderboardPosition || !performanceStats.value.leaderboardTotal) {
        return 0;
    }
    const rank = performanceStats.value.leaderboardPosition;
    const total = performanceStats.value.leaderboardTotal;
    return ((total - rank + 1) / total) * 100;
};

const getRankingBadge = () => {
    const position = performanceStats.value?.leaderboardPosition;
    if (!position || position > 20) return 'Needs Improvement';
    if (position <= 3) return 'Top Performer';
    if (position <= 10) return 'High Performer';
    return 'Average';
};

const getRankingSeverity = () => {
    const position = performanceStats.value?.leaderboardPosition;
    if (!position || position > 20) return 'danger';
    if (position <= 3) return 'success';
    if (position <= 10) return 'info';
    return 'warning';
};

const resetEditForm = () => {
    if (userStore.profile) {
        editProfile.value = {
            firstName: userStore.profile.firstName || '',
            lastName: userStore.profile.lastName || '',
            otherName: userStore.profile.otherName || '',
            phoneNumber: userStore.profile.phoneNumber || '',
            gender: userStore.profile.gender || '',
            branch: userStore.profile.branch || '',
            address: userStore.profile.address || '',
            dateOfBirth: userStore.profile.dateOfBirth ? new Date(userStore.profile.dateOfBirth) : null,
            nationality: userStore.profile.nationality || '',
            emergencyContact: userStore.profile.emergencyContact || '',
            emergencyPhone: userStore.profile.emergencyPhone || ''
        };
    }
};

const openFileUpload = () => {
    showFileUpload.value = true;
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

// Watch for profile changes
watch(
    () => userStore.profile,
    (newProfile) => {
        if (newProfile) {
            updateChartData();
        }
    },
    { immediate: true }
);

watch(
    () => [newLeave.value.startDate, newLeave.value.endDate],
    () => {
        if (newLeave.value.startDate && newLeave.value.endDate && newLeave.value.endDate < newLeave.value.startDate) {
            newLeave.value.endDate = newLeave.value.startDate;
        }
    }
);
</script>

<template>
    <div class="p-4 md:p-6">
        <Toast />
        <ConfirmDialog />

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-content-center align-items-center min-h-30rem">
            <ProgressSpinner />
        </div>

        <!-- Main Content -->
        <div v-else class="grid">
            <!-- Left Sidebar - User Summary -->
            <div class="col-12 lg:col-4 xl:col-3">
                <Card class="h-full shadow-3 border-round-xl">
                    <template #title>
                        <div class="flex flex-column align-items-center text-center gap-3">
                            <!-- Profile Picture -->
                            <div class="relative" @click="openFileUpload">
                                <Avatar
                                    :image="profilePicture"
                                    size="xlarge"
                                    shape="circle"
                                    class="border-3 border-primary cursor-pointer transition-all transition-duration-300 hover:scale-105"
                                    @error="(e) => (e.target.src = '/default-avatar.png')"
                                />
                                <div class="absolute bottom-0 right-0 bg-primary border-circle p-1 border-2 border-white">
                                    <i class="pi pi-camera text-sm text-white"></i>
                                </div>
                            </div>

                            <div>
                                <h2 class="m-0 text-900 font-bold text-lg md:text-xl line-clamp-2">{{ fullName || 'User Name' }}</h2>
                                <p class="text-color-secondary m-0 mt-1 text-sm">{{ userStore.profile?.role || 'Employee' }}</p>
                                <Badge :value="userStore.profile?.isActive ? 'Active' : 'Inactive'" :severity="userStore.profile?.isActive ? 'success' : 'danger'" class="mt-2" />
                            </div>
                        </div>
                    </template>

                    <template #content>
                        <div class="flex flex-column gap-3">
                            <!-- Contact Information -->
                            <div class="space-y-2">
                                <div class="flex align-items-center gap-2 p-2 hover:surface-hover transition-colors border-round">
                                    <i class="pi pi-id-card text-primary text-sm"></i>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs text-color-secondary">Employee ID</div>
                                        <div class="font-semibold truncate">{{ userStore.profile?.employeeId || 'N/A' }}</div>
                                    </div>
                                </div>

                                <div class="flex align-items-center gap-2 p-2 hover:surface-hover transition-colors border-round">
                                    <i class="pi pi-building text-primary text-sm"></i>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs text-color-secondary">Department</div>
                                        <div class="font-semibold truncate">{{ userStore.profile?.departmentName || 'N/A' }}</div>
                                    </div>
                                </div>

                                <div class="flex align-items-center gap-2 p-2 hover:surface-hover transition-colors border-round">
                                    <i class="pi pi-map-marker text-primary text-sm"></i>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs text-color-secondary">Branch</div>
                                        <div class="font-semibold truncate">{{ userStore.profile?.branch || 'N/A' }}</div>
                                    </div>
                                </div>

                                <div class="flex align-items-center gap-2 p-2 hover:surface-hover transition-colors border-round">
                                    <i class="pi pi-calendar text-primary text-sm"></i>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs text-color-secondary">Joined On</div>
                                        <div class="font-semibold truncate">{{ formatDate(userStore.profile?.hireDate) }}</div>
                                    </div>
                                </div>

                                <div class="flex align-items-center gap-2 p-2 hover:surface-hover transition-colors border-round">
                                    <i class="pi pi-envelope text-primary text-sm"></i>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs text-color-secondary">Email</div>
                                        <div class="font-semibold truncate">{{ userStore.profile?.email || 'N/A' }}</div>
                                    </div>
                                </div>

                                <div class="flex align-items-center gap-2 p-2 hover:surface-hover transition-colors border-round">
                                    <i class="pi pi-phone text-primary text-sm"></i>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs text-color-secondary">Phone</div>
                                        <div class="font-semibold truncate">{{ userStore.profile?.phoneNumber || 'N/A' }}</div>
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            <!-- Performance Stats -->
                            <div class="grid">
                                <div class="col-6">
                                    <div class="text-center p-3 border-round surface-card border-1 hover:surface-hover transition-all cursor-pointer" @click="activeTab = 2">
                                        <div class="text-xl font-bold text-primary">{{ performanceStats?.ticketsResolved || 0 }}</div>
                                        <div class="text-xs text-color-secondary mt-1">Resolved</div>
                                        <i class="pi pi-check-circle text-primary mt-2 text-sm"></i>
                                    </div>
                                </div>

                                <div class="col-6">
                                    <div class="text-center p-3 border-round surface-card border-1 hover:surface-hover transition-all cursor-pointer" @click="activeTab = 2">
                                        <div class="text-xl font-bold text-green-600">{{ performanceStats?.customerSatisfactionScore?.toFixed(1) || '0.0' }}</div>
                                        <div class="text-xs text-color-secondary mt-1">Avg Rating</div>
                                        <i class="pi pi-star text-green-600 mt-2 text-sm"></i>
                                    </div>
                                </div>

                                <div class="col-6 mt-2">
                                    <div class="text-center p-3 border-round surface-card border-1 hover:surface-hover transition-all cursor-pointer" @click="activeTab = 2">
                                        <div class="text-xl font-bold text-orange-600">#{{ performanceStats?.leaderboardPosition || '-' }}</div>
                                        <div class="text-xs text-color-secondary mt-1">Ranking</div>
                                        <i class="pi pi-chart-line text-orange-600 mt-2 text-sm"></i>
                                    </div>
                                </div>

                                <div class="col-6 mt-2">
                                    <div class="text-center p-3 border-round surface-card border-1 hover:surface-hover transition-all cursor-pointer" @click="activeTab = 2">
                                        <div class="text-xl font-bold text-blue-600">{{ performanceStats?.openTickets || 0 }}</div>
                                        <div class="text-xs text-color-secondary mt-1">Open</div>
                                        <i class="pi pi-inbox text-blue-600 mt-2 text-sm"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #footer>
                        <div class="flex flex-wrap gap-2">
                            <Button icon="pi pi-envelope" label="Email" severity="secondary" size="small" outlined @click="sendEmail" class="flex-1" />
                            <Button icon="pi pi-phone" label="Call" severity="secondary" size="small" outlined @click="makeCall" class="flex-1" />
                            <Button v-if="canViewPerformance" icon="pi pi-chart-line" label="Performance" severity="info" size="small" @click="activeTab = 2" class="flex-1" />
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Main Content -->
            <div class="col-12 lg:col-8 xl:col-9 mt-4 lg:mt-0">
                <Card class="shadow-3 border-round-xl">
                    <template #title>
                        <div class="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-3">
                            <div class="flex align-items-center gap-2">
                                <h1 class="text-xl md:text-2xl font-bold m-0">Profile Dashboard</h1>
                                <Badge v-if="authStore.requirePasswordChange" value="Password Change Required" severity="danger" class="text-xs" />
                            </div>

                            <div class="flex gap-2">
                                <Button icon="pi pi-refresh" text rounded @click="refreshAllData" :loading="userStore.loading" v-tooltip="'Refresh Data'" size="small" />
                                <Button v-if="activeTab !== 1" icon="pi pi-pencil" label="Edit Profile" @click="activeTab = 1" size="small" />
                                <Button v-else icon="pi pi-times" label="Cancel" severity="secondary" @click="cancelEdit" size="small" />
                            </div>
                        </div>
                    </template>

                    <template #content>
                        <!-- Tab Navigation -->
                        <TabMenu v-model:activeIndex="activeTab" :model="tabItems" class="mb-4" />

                        <!-- Profile View -->
                        <div v-if="activeTab === 0">
                            <div class="grid">
                                <!-- Personal Information -->
                                <div class="col-12">
                                    <Card class="mb-4">
                                        <template #title>
                                            <div class="flex align-items-center gap-2">
                                                <i class="pi pi-user text-primary"></i>
                                                <span>Personal Information</span>
                                            </div>
                                        </template>
                                        <template #content>
                                            <div class="grid">
                                                <div class="col-12 md:col-6 lg:col-4">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 text-color-secondary text-sm">First Name</label>
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ userStore.profile?.firstName || 'N/A' }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12 md:col-6 lg:col-4">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 text-color-secondary text-sm">Last Name</label>
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ userStore.profile?.lastName || 'N/A' }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12 md:col-6 lg:col-4">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 text-color-secondary text-sm">Other Name</label>
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ userStore.profile?.otherName || 'N/A' }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12 md:col-6 lg:col-4">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 text-color-secondary text-sm">Gender</label>
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ getGenderDisplay(userStore.profile?.gender) }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12 md:col-6 lg:col-4">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 text-color-secondary text-sm">Date of Birth</label>
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ formatDate(userStore.profile?.dateOfBirth) }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12 md:col-6 lg:col-4">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 text-color-secondary text-sm">Nationality</label>
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ userStore.profile?.nationality || 'N/A' }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>

                                <!-- Contact Information -->
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
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ userStore.profile?.email || 'N/A' }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12 md:col-6">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 text-color-secondary text-sm">Phone Number</label>
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ userStore.profile?.phoneNumber || 'N/A' }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 text-color-secondary text-sm">Address</label>
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ userStore.profile?.address || 'N/A' }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12 md:col-6">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 text-color-secondary text-sm">Emergency Contact</label>
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ userStore.profile?.emergencyContact || 'N/A' }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-12 md:col-6">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 text-color-secondary text-sm">Emergency Phone</label>
                                                        <div class="p-3 border-1 surface-border border-round bg-surface-50">
                                                            {{ userStore.profile?.emergencyPhone || 'N/A' }}
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
                                    <div class="col-12">
                                        <Card class="mb-4">
                                            <template #title>Edit Personal Information</template>
                                            <template #content>
                                                <div class="grid">
                                                    <div class="col-12 mb-4">
                                                        <div class="flex flex-column align-items-center gap-3">
                                                            <Avatar :image="uploadPreview || profilePicture" size="xlarge" shape="circle" class="border-3 border-primary" @error="(e) => (e.target.src = '/default-avatar.png')" />
                                                            <Button icon="pi pi-camera" label="Change Photo" severity="secondary" outlined size="small" @click="openFileUpload" />
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
                                                            <label class="font-bold block mb-2 text-sm">Other Name</label>
                                                            <InputText v-model="editProfile.otherName" class="w-full" placeholder="Enter other name" />
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
                                                            <label class="font-bold block mb-2 text-sm">Date of Birth</label>
                                                            <Calendar v-model="editProfile.dateOfBirth" dateFormat="yy-mm-dd" :maxDate="maxBirthDate" class="w-full" showIcon placeholder="Select date of birth" />
                                                        </div>
                                                    </div>
                                                    <div class="col-12 md:col-6">
                                                        <div class="field">
                                                            <label class="font-bold block mb-2 text-sm">Nationality</label>
                                                            <InputText v-model="editProfile.nationality" class="w-full" placeholder="Enter nationality" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                        </Card>
                                    </div>

                                    <div class="col-12">
                                        <Card>
                                            <template #title>Edit Contact Information</template>
                                            <template #content>
                                                <div class="grid">
                                                    <div class="col-12 md:col-6">
                                                        <div class="field">
                                                            <label class="font-bold block mb-2 required text-sm">Phone Number</label>
                                                            <InputText v-model="editProfile.phoneNumber" class="w-full" :class="{ 'p-invalid': errors.phoneNumber }" placeholder="Enter phone number" required />
                                                            <small v-if="errors.phoneNumber" class="p-error text-xs">{{ errors.phoneNumber }}</small>
                                                        </div>
                                                    </div>
                                                    <div class="col-12 md:col-6">
                                                        <div class="field">
                                                            <label class="font-bold block mb-2 text-sm">Branch</label>
                                                            <InputText v-model="editProfile.branch" class="w-full" placeholder="Enter branch" />
                                                        </div>
                                                    </div>
                                                    <div class="col-12">
                                                        <div class="field">
                                                            <label class="font-bold block mb-2 text-sm">Address</label>
                                                            <Textarea v-model="editProfile.address" rows="3" class="w-full" placeholder="Enter your full address" />
                                                        </div>
                                                    </div>
                                                    <div class="col-12 md:col-6">
                                                        <div class="field">
                                                            <label class="font-bold block mb-2 text-sm">Emergency Contact Name</label>
                                                            <InputText v-model="editProfile.emergencyContact" class="w-full" placeholder="Enter emergency contact name" />
                                                        </div>
                                                    </div>
                                                    <div class="col-12 md:col-6">
                                                        <div class="field">
                                                            <label class="font-bold block mb-2 text-sm">Emergency Contact Phone</label>
                                                            <InputText v-model="editProfile.emergencyPhone" class="w-full" placeholder="Enter emergency contact phone" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                        </Card>
                                    </div>

                                    <div class="col-12 mt-4">
                                        <div class="flex justify-content-end gap-2">
                                            <Button label="Cancel" icon="pi pi-times" severity="secondary" outlined size="small" @click="cancelEdit" />
                                            <Button label="Save Changes" icon="pi pi-check" type="submit" :loading="userStore.loading" size="small" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <!-- Performance Analytics -->
                        <div v-else-if="activeTab === 2">
                            <div class="grid">
                                <div class="col-12">
                                    <Card class="mb-4">
                                        <template #title>Performance Overview</template>
                                        <template #content>
                                            <div class="grid">
                                                <div class="col-12 lg:col-8">
                                                    <div class="h-20rem">
                                                        <Chart type="line" :data="performanceChartData" :options="chartOptions" class="h-full w-full" />
                                                    </div>
                                                </div>
                                                <div class="col-12 lg:col-4">
                                                    <div class="flex flex-column gap-3">
                                                        <div class="text-center p-3 border-round surface-card border-1">
                                                            <div class="text-3xl font-bold text-primary">#{{ performanceStats?.leaderboardPosition || '-' }}</div>
                                                            <div class="text-sm text-color-secondary mt-1">Current Rank</div>
                                                            <ProgressBar :value="calculateRankingPercentage()" class="mt-2 h-1" />
                                                            <Tag :value="getRankingBadge()" :severity="getRankingSeverity()" class="mt-2" />
                                                        </div>
                                                        <div class="text-center p-3 border-round surface-card border-1">
                                                            <div class="text-2xl font-bold text-green-600">
                                                                {{ performanceStats?.customerSatisfactionScore?.toFixed(1) || '0.0' }}
                                                            </div>
                                                            <div class="text-sm text-color-secondary mt-1">Avg. Customer Rating</div>
                                                            <div class="flex justify-content-center mt-1">
                                                                <Rating :modelValue="performanceStats?.customerSatisfactionScore || 0" :readonly="true" :cancel="false" :stars="5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>

                                <div class="col-12 md:col-6">
                                    <Card class="h-full">
                                        <template #title>Key Metrics</template>
                                        <template #content>
                                            <div class="space-y-3">
                                                <div class="flex justify-content-between align-items-center p-3 hover:surface-hover border-round transition-colors">
                                                    <div class="flex align-items-center gap-2">
                                                        <i class="pi pi-clock text-blue-600 text-sm"></i>
                                                        <div>
                                                            <div class="font-medium text-sm">Avg Resolution Time</div>
                                                            <div class="text-xs text-color-secondary">Last 30 days</div>
                                                        </div>
                                                    </div>
                                                    <div class="font-bold text-sm">{{ performanceStats?.resolutionTimeAverage?.toFixed(1) || '0.0' }} min</div>
                                                </div>
                                                <div class="flex justify-content-between align-items-center p-3 hover:surface-hover border-round transition-colors">
                                                    <div class="flex align-items-center gap-2">
                                                        <i class="pi pi-reply text-green-600 text-sm"></i>
                                                        <div>
                                                            <div class="font-medium text-sm">Avg Response Time</div>
                                                            <div class="text-xs text-color-secondary">First response</div>
                                                        </div>
                                                    </div>
                                                    <div class="font-bold text-sm">{{ performanceStats?.firstResponseTimeAverage?.toFixed(1) || '0.0' }} min</div>
                                                </div>
                                                <div class="flex justify-content-between align-items-center p-3 hover:surface-hover border-round transition-colors">
                                                    <div class="flex align-items-center gap-2">
                                                        <i class="pi pi-ticket text-orange-600 text-sm"></i>
                                                        <div>
                                                            <div class="font-medium text-sm">Tickets Handled</div>
                                                            <div class="text-xs text-color-secondary">This month</div>
                                                        </div>
                                                    </div>
                                                    <div class="font-bold text-sm">
                                                        {{ performanceStats?.ticketsResolvedThisMonth || 0 }}
                                                    </div>
                                                </div>
                                                <div class="flex justify-content-between align-items-center p-3 hover:surface-hover border-round transition-colors">
                                                    <div class="flex align-items-center gap-2">
                                                        <i class="pi pi-check-circle text-purple-600 text-sm"></i>
                                                        <div>
                                                            <div class="font-medium text-sm">Resolution Rate</div>
                                                            <div class="text-xs text-color-secondary">Success rate</div>
                                                        </div>
                                                    </div>
                                                    <div class="font-bold text-sm">{{ performanceStats?.resolutionRate?.toFixed(1) || '0.0' }}%</div>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>

                                <div class="col-12 md:col-6">
                                    <Card class="h-full">
                                        <template #title>Recent Achievements</template>
                                        <template #content>
                                            <div v-if="performanceStats?.achievements?.length" class="space-y-2">
                                                <div v-for="achievement in performanceStats.achievements.slice(0, 3)" :key="achievement.id" class="p-3 border-round surface-card border-1 hover:surface-hover transition-all">
                                                    <div class="flex align-items-center gap-2">
                                                        <Avatar :label="achievement.emoji" size="normal" shape="circle" />
                                                        <div class="flex-1 min-w-0">
                                                            <div class="font-bold text-sm truncate">{{ achievement.title }}</div>
                                                            <div class="text-xs text-color-secondary truncate">{{ achievement.description }}</div>
                                                            <div class="text-xs text-color-secondary mt-1">
                                                                {{ formatDate(achievement.earnedDate) }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-else class="text-center p-4">
                                                <i class="pi pi-trophy text-3xl text-color-secondary mb-2"></i>
                                                <p class="text-color-secondary text-sm">No achievements yet</p>
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <!-- Leave Management -->
                        <div v-else-if="activeTab === 3">
                            <div class="grid">
                                <!-- Leave Stats & Balance -->
                                <div class="col-12 lg:col-4">
                                    <Card class="mb-4">
                                        <template #title>Leave Balance</template>
                                        <template #content>
                                            <div class="space-y-3">
                                                <div v-for="balance in leaveBalances" :key="balance.type" class="p-3 border-round surface-card border-1">
                                                    <div class="flex justify-content-between align-items-center">
                                                        <div>
                                                            <div class="font-bold text-sm">{{ balance.type }}</div>
                                                            <div class="text-xs text-color-secondary">Available</div>
                                                        </div>
                                                        <div class="text-xl font-bold" :class="balance.color">
                                                            {{ balance.available }}
                                                        </div>
                                                    </div>
                                                    <ProgressBar :value="(balance.available / balance.total) * 100" class="mt-2 h-1" />
                                                    <div class="text-xs text-color-secondary mt-1">{{ balance.used }} used of {{ balance.total }} total days</div>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>

                                    <Card>
                                        <template #title>Quick Actions</template>
                                        <template #content>
                                            <div class="flex flex-column gap-2">
                                                <Button label="Apply for Leave" icon="pi pi-plus" @click="showLeaveDialog = true" class="w-full" size="small" />
                                                <Button label="Leave History" icon="pi pi-history" severity="secondary" outlined @click="refreshLeaveHistory" class="w-full" size="small" />
                                            </div>
                                        </template>
                                    </Card>
                                </div>

                                <!-- Main Leave Content -->
                                <div class="col-12 lg:col-8">
                                    <Card>
                                        <template #title>
                                            <div class="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-2">
                                                <span class="font-bold">Leave Applications</span>
                                                <div class="flex gap-2">
                                                    <Button icon="pi pi-refresh" text rounded size="small" @click="refreshLeaveHistory" />
                                                    <Button label="Apply Leave" icon="pi pi-plus" @click="showLeaveDialog = true" size="small" />
                                                </div>
                                            </div>
                                        </template>
                                        <template #content>
                                            <div v-if="leaveHistory.length > 0" class="space-y-3">
                                                <div v-for="leave in leaveHistory" :key="leave.id" class="p-3 border-round surface-card border-1 hover:surface-hover">
                                                    <div class="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-2 mb-2">
                                                        <div class="flex-1 min-w-0">
                                                            <div class="flex align-items-center gap-2">
                                                                <span class="font-bold truncate">{{ leave.leaveTypeDisplay }}</span>
                                                                <span class="text-xs text-color-secondary"> {{ leave.totalDays }} day(s) </span>
                                                            </div>
                                                            <div class="text-xs text-color-secondary truncate">{{ formatDate(leave.startDate) }} - {{ formatDate(leave.endDate) }}</div>
                                                        </div>
                                                        <div class="flex align-items-center gap-2">
                                                            <Tag :value="leave.statusDisplay" :severity="getStatusSeverity(leave.status)" :icon="getStatusIcon(leave.status)" size="small" />
                                                            <Button v-if="leave.status === 'PENDING' || leave.status === 'IN_REVIEW'" icon="pi pi-times" severity="danger" text rounded size="small" @click="confirmCancelLeave(leave)" />
                                                        </div>
                                                    </div>
                                                    <div v-if="leave.reason" class="text-xs text-color-secondary line-clamp-2"><span class="font-medium">Reason:</span> {{ leave.reason }}</div>
                                                    <div v-if="leave.comments" class="text-xs text-color-secondary mt-1"><span class="font-medium">Comments:</span> {{ leave.comments }}</div>
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

                        <!-- Account Settings -->
                        <div v-else-if="activeTab === 4">
                            <div class="grid">
                                <div class="col-12 lg:col-6">
                                    <Card class="mb-4">
                                        <template #title>Change Password</template>
                                        <template #content>
                                            <form @submit.prevent="handlePasswordChange">
                                                <div class="space-y-3">
                                                    <div class="field">
                                                        <label class="font-bold block mb-2 required text-sm">Current Password</label>
                                                        <Password
                                                            v-model="passwordData.currentPassword"
                                                            :feedback="false"
                                                            toggleMask
                                                            class="w-full"
                                                            inputClass="w-full"
                                                            :class="{ 'p-invalid': passwordErrors.currentPassword }"
                                                            placeholder="Enter current password"
                                                            required
                                                        />
                                                        <small v-if="passwordErrors.currentPassword" class="p-error text-xs">{{ passwordErrors.currentPassword }}</small>
                                                    </div>

                                                    <div class="field">
                                                        <label class="font-bold block mb-2 required text-sm">New Password</label>
                                                        <Password v-model="passwordData.newPassword" toggleMask class="w-full" inputClass="w-full" :class="{ 'p-invalid': passwordErrors.newPassword }" placeholder="Enter new password" required />
                                                        <small class="text-color-secondary text-xs block mt-1"> Password must contain at least 8 characters with uppercase, lowercase, and numbers. </small>
                                                        <small v-if="passwordErrors.newPassword" class="p-error text-xs">{{ passwordErrors.newPassword }}</small>
                                                    </div>

                                                    <div class="field">
                                                        <label class="font-bold block mb-2 required text-sm">Confirm New Password</label>
                                                        <Password
                                                            v-model="passwordData.confirmPassword"
                                                            :feedback="false"
                                                            toggleMask
                                                            class="w-full"
                                                            inputClass="w-full"
                                                            :class="{ 'p-invalid': passwordErrors.confirmPassword }"
                                                            placeholder="Confirm new password"
                                                            required
                                                        />
                                                        <small v-if="passwordErrors.confirmPassword" class="p-error text-xs">{{ passwordErrors.confirmPassword }}</small>
                                                    </div>

                                                    <Button label="Change Password" icon="pi pi-key" type="submit" class="w-full" :loading="userStore.loading" />
                                                </div>
                                            </form>
                                        </template>
                                    </Card>
                                </div>

                                <div class="col-12 lg:col-6">
                                    <Card class="mb-4">
                                        <template #title>Security Settings</template>
                                        <template #content>
                                            <div class="space-y-3">
                                                <div class="flex justify-content-between align-items-center p-3 border-round surface-card border-1">
                                                    <div>
                                                        <div class="font-bold text-sm">Two-Factor Authentication</div>
                                                        <div class="text-xs text-color-secondary">Add an extra layer of security</div>
                                                    </div>
                                                    <InputSwitch v-model="securitySettings.twoFactorEnabled" />
                                                </div>

                                                <div class="flex justify-content-between align-items-center p-3 border-round surface-card border-1">
                                                    <div>
                                                        <div class="font-bold text-sm">Email Notifications</div>
                                                        <div class="text-xs text-color-secondary">Receive email updates</div>
                                                    </div>
                                                    <InputSwitch v-model="securitySettings.emailNotifications" />
                                                </div>

                                                <div class="flex justify-content-between align-items-center p-3 border-round surface-card border-1">
                                                    <div>
                                                        <div class="font-bold text-sm">Session Timeout</div>
                                                        <div class="text-xs text-color-secondary">Auto-logout after inactivity</div>
                                                    </div>
                                                    <Dropdown v-model="securitySettings.sessionTimeout" :options="sessionTimeoutOptions" optionLabel="label" optionValue="value" class="w-full md:w-8rem" />
                                                </div>
                                            </div>
                                        </template>
                                    </Card>

                                    <Card>
                                        <template #title>Login Activity</template>
                                        <template #content>
                                            <div class="space-y-2">
                                                <div v-for="session in recentSessions" :key="session.id" class="p-2 border-round surface-card border-1">
                                                    <div class="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-1">
                                                        <div class="flex-1 min-w-0">
                                                            <div class="font-bold text-sm truncate">{{ session.device }}</div>
                                                            <div class="text-xs text-color-secondary truncate">{{ session.location }}</div>
                                                        </div>
                                                        <div class="text-right">
                                                            <div class="text-xs">{{ formatDateTime(session.lastActive) }}</div>
                                                            <Tag :value="session.status" :severity="session.status === 'Active' ? 'success' : 'secondary'" size="small" class="mt-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- File Upload Dialog -->
        <Dialog v-model:visible="showFileUpload" header="Upload Profile Picture" :modal="true" :style="{ width: '90vw', maxWidth: '500px' }">
            <div class="flex flex-column align-items-center gap-4">
                <div class="relative">
                    <Avatar :image="uploadPreview || profilePicture" size="xlarge" shape="circle" class="border-3 border-primary" @error="(e) => (e.target.src = '/default-avatar.png')" />
                </div>

                <FileUpload mode="basic" accept="image/*" :maxFileSize="2000000" chooseLabel="Choose Image" @select="onFileSelect" :auto="true" class="w-full">
                    <template #content v-if="selectedFile">
                        <div class="flex align-items-center gap-2 p-3 border-round surface-border">
                            <img :src="uploadPreview" alt="Preview" class="w-2rem h-2rem border-round" @error="(e) => (e.target.src = '/default-avatar.png')" />
                            <div class="flex-1 min-w-0">
                                <div class="font-medium truncate">{{ selectedFile.name }}</div>
                                <div class="text-xs text-color-secondary">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</div>
                            </div>
                            <Button icon="pi pi-times" text rounded severity="danger" size="small" @click="clearFileSelection" />
                        </div>
                    </template>
                </FileUpload>

                <small class="text-color-secondary text-center text-xs"> Recommended: Square image, max 2MB. JPG, PNG, or GIF formats. </small>
            </div>

            <template #footer>
                <div class="flex justify-content-end gap-2">
                    <Button label="Cancel" icon="pi pi-times" @click="showFileUpload = false" severity="secondary" outlined size="small" />
                    <Button label="Upload" icon="pi pi-upload" @click="uploadProfilePicture" :disabled="!selectedFile" :loading="uploading" size="small" />
                </div>
            </template>
        </Dialog>

        <!-- Leave Application Dialog -->
        <Dialog v-model:visible="showLeaveDialog" header="Apply for Leave" :modal="true" :style="{ width: '90vw', maxWidth: '500px' }">
            <form @submit.prevent="handleLeaveApplication">
                <div class="space-y-3">
                    <div class="field">
                        <label class="font-bold block mb-2 required text-sm">Leave Type</label>
                        <Dropdown v-model="newLeave.leaveType" :options="leaveTypes" optionLabel="label" optionValue="value" placeholder="Select Leave Type" class="w-full" required />
                    </div>

                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label class="font-bold block mb-2 required text-sm">Start Date</label>
                                <Calendar v-model="newLeave.startDate" dateFormat="yy-mm-dd" class="w-full" :minDate="minLeaveDate" showIcon placeholder="Select start date" required />
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label class="font-bold block mb-2 required text-sm">End Date</label>
                                <Calendar v-model="newLeave.endDate" dateFormat="yy-mm-dd" class="w-full" :minDate="newLeave.startDate || minLeaveDate" showIcon placeholder="Select end date" required />
                            </div>
                        </div>
                    </div>

                    <div class="field">
                        <label class="font-bold block mb-2 text-sm">Duration</label>
                        <div class="p-2 border-1 surface-border border-round bg-surface-50 text-sm">{{ calculateLeaveDays() }} day(s)</div>
                    </div>

                    <div class="field">
                        <label class="font-bold block mb-2 text-sm">Reason</label>
                        <Textarea v-model="newLeave.reason" rows="3" class="w-full" placeholder="Please provide details for your leave request..." :maxlength="500" />
                        <small class="text-color-secondary text-xs">{{ newLeave.reason?.length || 0 }}/500 characters</small>
                    </div>
                </div>
            </form>

            <template #footer>
                <div class="flex justify-content-end gap-2">
                    <Button label="Cancel" icon="pi pi-times" @click="showLeaveDialog = false" severity="secondary" outlined size="small" />
                    <Button label="Submit Application" icon="pi pi-send" @click="handleLeaveApplication" :loading="userStore.loading" :disabled="!isLeaveFormValid" size="small" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.user-profile-container {
    min-height: calc(100vh - 4rem);
}

:deep(.p-card) {
    border-radius: 12px;
}

:deep(.p-card-title) {
    font-size: 1.1rem;
    font-weight: 600;
}

:deep(.p-tabmenu-nav) {
    border: none;
    background: transparent;
}

:deep(.p-tabmenuitem) {
    margin-right: 0.5rem;
}

:deep(.p-tabmenuitem .p-menuitem-link) {
    border-radius: 8px;
    border: none;
    background: transparent;
    transition: all 0.3s ease;
}

:deep(.p-tabmenuitem.p-highlight .p-menuitem-link) {
    background: var(--primary-color);
    color: white;
}

:deep(.p-tabmenuitem:not(.p-highlight):hover .p-menuitem-link) {
    background: var(--surface-hover);
}

:deep(.p-button) {
    border-radius: 8px;
    font-weight: 500;
}

.field {
    margin-bottom: 1rem;
}

.field label.required::after {
    content: ' *';
    color: var(--red-500);
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

/* Responsive adjustments */
@media (max-width: 768px) {
    :deep(.p-card) {
        margin-bottom: 1rem;
    }

    :deep(.p-tabmenu-nav) {
        flex-wrap: wrap;
    }

    :deep(.p-tabmenuitem) {
        margin-bottom: 0.5rem;
    }
}

@media (max-width: 576px) {
    :deep(.p-button-label) {
        font-size: 0.875rem;
    }

    .field {
        margin-bottom: 0.75rem;
    }
}

/* Animation classes */
.transition-all {
    transition: all 0.3s ease;
}

.transition-colors {
    transition:
        background-color 0.2s ease,
        border-color 0.2s ease;
}

.hover\:surface-hover:hover {
    background-color: var(--surface-hover);
}

.hover\:scale-105:hover {
    transform: scale(1.05);
}

.cursor-pointer {
    cursor: pointer;
}

/* Chart container */
:deep(.p-chart) {
    width: 100% !important;
    height: 100% !important;
}

/* Avatar fallback */
:deep(.p-avatar-image) {
    object-fit: cover;
}

/* Form validation styles */
:deep(.p-invalid) {
    border-color: var(--red-500) !important;
}

.p-error {
    color: var(--red-500);
    font-size: 0.75rem;
    margin-top: 0.25rem;
    display: block;
}
</style>
