<template>
    <div class="leave-list-container">
        <div v-if="leaves.length === 0" class="text-center p-6">
            <i class="pi pi-inbox text-4xl text-color-secondary mb-3"></i>
            <p class="text-color-secondary">No leave records found</p>
        </div>

        <div v-else class="space-y-3">
            <div v-for="leave in leaves" :key="leave.id" class="p-3 border-round surface-card border-1 hover:surface-hover transition-all cursor-pointer" @click="$emit('view', leave)">
                <div class="flex justify-content-between align-items-center mb-2">
                    <div class="flex align-items-center gap-2">
                        <i class="pi pi-calendar text-primary"></i>
                        <span class="font-bold">{{ leave.leaveTypeDisplay }}</span>
                        <span class="text-xs text-color-secondary ml-2"> {{ leave.totalDays }} day(s) </span>
                    </div>
                    <div class="flex align-items-center gap-2">
                        <Tag :value="leave.statusDisplay" :severity="getStatusSeverity(leave.status)" :icon="getStatusIcon(leave.status)" />
                        <Button v-if="!readonly && (leave.status === 'PENDING' || leave.status === 'IN_REVIEW')" icon="pi pi-times" severity="danger" text rounded @click.stop="$emit('cancel', leave)" v-tooltip="'Cancel Leave'" />
                    </div>
                </div>

                <div class="text-sm text-color-secondary mb-2">{{ formatDate(leave.startDate) }} - {{ formatDate(leave.endDate) }}</div>

                <div v-if="leave.reason" class="text-sm line-clamp-2"><span class="font-medium">Reason:</span> {{ leave.reason }}</div>

                <div v-if="leave.comments" class="text-sm mt-1"><span class="font-medium">Comments:</span> {{ leave.comments }}</div>

                <div class="flex justify-content-between align-items-center mt-2">
                    <div class="text-xs text-color-secondary">Applied: {{ formatDateTime(leave.createdAt) }}</div>
                    <div v-if="leave.approvedBy" class="text-xs text-color-secondary">By: {{ leave.approvedBy }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { defineEmits, defineProps } from 'vue';

const props = defineProps({
    leaves: {
        type: Array,
        default: () => []
    },
    readonly: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['cancel', 'view']);

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
</script>

<style scoped>
.leave-list-container {
    max-height: 400px;
    overflow-y: auto;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

:deep(.p-tag) {
    border-radius: 20px;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
}
</style>
