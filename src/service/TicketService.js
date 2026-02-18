import axios from '@/plugins/axios';

export const TicketService = {
    async getTickets(page = 1, size = 10) {
        const response = await axios.get('/tickets', {
            params: { page, size }
        });
        return response.data;
    },

    async getTicketById(ticketId) {
        const response = await axios.get(`/tickets/${ticketId}`);
        return response.data;
    },

    async createTicket(ticketData, file) {
        const formData = new FormData();

        // Append individual fields as required by the backend
        formData.append('title', ticketData.title);
        formData.append('description', ticketData.description);
        formData.append('categoryId', ticketData.categoryId);
        if (ticketData.subCategoryId) {
            formData.append('subCategoryId', ticketData.subCategoryId);
        }
        formData.append('tags', ticketData.tags || '');
        formData.append('createdById', ticketData.createdById);

        if (file) {
            formData.append('attachment', file);
        }

        const response = await axios.post('/tickets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async updateTicket(ticketId, ticketData, file) {
        const formData = new FormData();

        // Append individual fields for update
        formData.append('title', ticketData.title);
        formData.append('description', ticketData.description);
        formData.append('categoryId', ticketData.categoryId);
        if (ticketData.subCategoryId) {
            formData.append('subCategoryId', ticketData.subCategoryId);
        }
        formData.append('tags', ticketData.tags || '');
        // Note: For update, you might need different parameters based on your backend

        if (file) {
            formData.append('attachment', file);
        }

        const response = await axios.put(`/tickets/${ticketId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async deleteTicket(ticketId) {
        const response = await axios.delete(`/tickets/${ticketId}`);
        return response.data;
    },

    async escalateTicket(ticketId, userId) {
        const response = await axios.post(`/tickets/${ticketId}/escalate`, null, {
            params: { userId }
        });
        return response.data;
    },

    async submitFeedback(trackingToken, feedbackData) {
        const response = await axios.post(`/tickets/track/${trackingToken}/feedback`, feedbackData);
        return response.data;
    },

    async reassignTicket(ticketId, newUserId) {
        const response = await axios.post(`/tickets/${ticketId}/reassign`, null, {
            params: { newUserId }
        });
        return response.data;
    },

    async addFeedback(ticketId, feedback) {
        const response = await axios.post(`/tickets/${ticketId}/feedback`, feedback);
        return response.data;
    },

    async getComments(ticketId) {
        const response = await axios.get(`/tickets/${ticketId}/comments`);
        return response.data;
    },

    async addComment(ticketId, comment) {
        const response = await axios.post(`/tickets/${ticketId}/comments`, comment);
        return response.data;
    },

    async addAttachment(ticketId, file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`/tickets/${ticketId}/attachments`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async updateStatus(ticketId, status, userId) {
        const response = await axios.patch(`/tickets/${ticketId}/status`, null, {
            params: { status, userId }
        });
        return response.data;
    },

    async getHistory(ticketId) {
        const response = await axios.get(`/tickets/${ticketId}/history`);
        return response.data;
    },

    async getTicketsByUser(userId) {
        const response = await axios.get(`/tickets/users/${userId}`);
        return response.data;
    },

    async getStatusCounts() {
        const response = await axios.get('/tickets/status-counts');
        return response.data;
    },

    async searchTickets({ status, category, tags }) {
        const response = await axios.get('/tickets/search', {
            params: { status, category, tags }
        });
        return response.data;
    },

    async getOverdueTickets() {
        const response = await axios.get('/tickets/overdue');
        return response.data;
    },

    async getTicketsByDepartment(departmentId, page = 1, size = 10) {
        const response = await axios.get(`/tickets/departments/${departmentId}`, {
            params: { page, size }
        });
        return response.data;
    },

    async updateDueDate(ticketId, dueDate) {
        const response = await axios.patch(`/tickets/${ticketId}/due-date`, null, {
            params: { dueDate }
        });
        return response.data;
    },

    // Customer Ticket Methods
    async createCustomerTicket(ticketData, file) {
        const formData = new FormData();

        // Append individual fields as required by the backend
        formData.append('title', ticketData.title);
        formData.append('description', ticketData.description);
        formData.append('categoryId', ticketData.categoryId);
        if (ticketData.subCategoryId) {
            formData.append('subCategoryId', ticketData.subCategoryId);
        }
        formData.append('tags', ticketData.tags || '');
        formData.append('customerName', ticketData.customerName);
        formData.append('customerEmail', ticketData.customerEmail);
        formData.append('customerPhone', ticketData.customerPhone || '');

        if (file) {
            formData.append('attachment', file);
        }

        const response = await axios.post('/tickets/customer', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async trackTicket(trackingToken) {
        const response = await axios.get(`/tickets/track/${trackingToken}`);
        return response.data;
    },

    async addCommentViaTracking(trackingToken, comment) {
        const response = await axios.post(`/tickets/track/${trackingToken}/comments`, comment);
        return response.data;
    },

    async getCommentsViaTracking(trackingToken) {
        const response = await axios.get(`/tickets/track/${trackingToken}/comments`);
        return response.data;
    }
};
