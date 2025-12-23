import api from '@/plugins/axios';

export const ChatService = {
    async getChatRooms() {
        const response = await api.get('/chat/rooms');
        return response.data;
    },

    async getRoomMessages(roomId, page = 0, size = 50) {
        const response = await api.get(`/chat/rooms/${roomId}/messages`, {
            params: { page, size }
        });
        return response.data;
    },

    async sendMessage(messageData) {
        const response = await api.post('/chat/messages', messageData);
        return response.data;
    },

    async createChatRoom(roomData) {
        const response = await api.post('/chat/rooms', roomData);
        return response.data;
    },

    async markMessageAsRead(messageId) {
        await api.put(`/chat/messages/${messageId}/read`);
    },

    async getUnreadCount() {
        const response = await api.get('/chat/unread-count');
        return response.data;
    },

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/chat/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    async addReaction(messageId, emoji) {
        const response = await api.post(`/chat/messages/${messageId}/reactions`, { emoji });
        return response.data;
    },

    async editMessage(messageId, content) {
        const response = await api.put(`/chat/messages/${messageId}`, { content });
        return response.data;
    },

    async deleteMessage(messageId, deleteForAll = false) {
        await api.delete(`/chat/messages/${messageId}`, {
            params: { deleteForAll }
        });
    },

    async updateUserStatus(online) {
        await api.put('/chat/status', null, {
            params: { online }
        });
    },

    async searchUsers(query) {
        const response = await api.get('/chat/search/users', {
            params: { query }
        });
        return response.data;
    },

    async searchMessages(roomId, query) {
        const response = await api.get('/chat/search/messages', {
            params: { roomId, query }
        });
        return response.data;
    }
};
