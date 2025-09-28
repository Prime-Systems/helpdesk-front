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

    async createTicket(ticketDto, file) {
        const formData = new FormData();
        formData.append('ticketDto', new Blob([JSON.stringify(ticketDto)], { type: 'application/json' }));
        if (file) {
            formData.append('file', file);
        }

        const response = await axios.post('/tickets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async deleteTicket(ticketId) {
        const response = await axios.delete(`/tickets/${ticketId}`);
        return response.data;
    },

    async reassignTicket(ticketId, newUserId) {
        const response = await axios.post(`/tickets/${ticketId}/reassign`, null, {
            params: { newUserId }
        });
        return response.data;
    },

    async addFeedback(ticketId, feedback) {
        // feedback: { userId, comment, rating }
        const response = await axios.post(`/tickets/${ticketId}/feedback`, feedback);
        return response.data;
    },

    async getComments(ticketId) {
        const response = await axios.get(`/tickets/${ticketId}/comments`);
        return response.data;
    },

    async addComment(ticketId, comment) {
        // comment: { comment, userId }
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
    }
};
