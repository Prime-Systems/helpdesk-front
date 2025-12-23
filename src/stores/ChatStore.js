import { ChatService } from '@/service/ChatService';
import { useAuthStore } from '@/stores/AuthStore';
import { defineStore } from 'pinia';

export const useChatStore = defineStore('chat', {
    state: () => ({
        rooms: [],
        currentRoom: null,
        messages: [],
        users: [],
        loading: false,
        error: null,
        unreadCount: 0,
        typingUsers: new Set(),
        isConnected: false,
        socket: null
    }),

    actions: {
        async fetchChatRooms() {
            this.loading = true;
            this.error = null;
            try {
                const response = await ChatService.getChatRooms();
                this.rooms = response;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async selectRoom(roomId) {
            this.loading = true;
            try {
                this.currentRoom = this.rooms.find((r) => r.id === roomId);
                const response = await ChatService.getRoomMessages(roomId);
                this.messages = response;

                // Mark messages as read
                this.messages.filter((m) => !m.isRead && m.senderId !== this.currentUserId).forEach((m) => this.markAsRead(m.id));
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async sendMessage(content, type = 'TEXT', file = null) {
            if (!this.currentRoom) return;

            try {
                let fileUrl = null;
                let fileSize = null;

                if (file) {
                    const uploadResponse = await ChatService.uploadFile(file);
                    fileUrl = uploadResponse.url;
                    fileSize = uploadResponse.size;
                }

                const messageData = {
                    roomId: this.currentRoom.id,
                    content,
                    type,
                    fileUrl,
                    fileSize
                };

                const message = await ChatService.sendMessage(messageData);

                // Add to local messages immediately for instant feedback
                this.messages.push({
                    ...message,
                    status: 'SENDING'
                });

                // WebSocket will update when confirmed
                return message;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async markAsRead(messageId) {
            try {
                await ChatService.markMessageAsRead(messageId);

                // Update local state
                const message = this.messages.find((m) => m.id === messageId);
                if (message) {
                    message.isRead = true;
                    message.status = 'READ';
                }

                // Update room unread count
                const room = this.rooms.find((r) => r.id === message?.roomId);
                if (room && room.unreadCount > 0) {
                    room.unreadCount--;
                }
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        },

        async fetchUnreadCount() {
            try {
                const count = await ChatService.getUnreadCount();
                this.unreadCount = count;
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            }
        },

        // In ChatStore.js - update connectWebSocket method
        connectWebSocket() {
            const authStore = useAuthStore();
            const userId = authStore.userId;
            const token = authStore.token; // Assuming you have token in auth store

            // Correct WebSocket URL - matches your backend WebSocket configuration
            // Note: You need to add WebSocket configuration in your backend
            this.socket = new WebSocket(`ws://localhost:8285/ws?token=${token}`);
            //this.socket = new WebSocket(`${getWebSocketUrl()}?token=${token}`);

            this.socket.onopen = () => {
                this.isConnected = true;
                console.log('WebSocket connected');

                // Send initial connection message
                const connectData = {
                    type: 'CONNECT',
                    payload: { userId }
                };
                this.socket.send(JSON.stringify(connectData));
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.socket.onclose = () => {
                this.isConnected = false;
                console.log('WebSocket disconnected');
                // Attempt reconnect after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        },

        // Add this new method to handle sending WebSocket messages
        sendWebSocketMessage(type, payload) {
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                console.error('WebSocket not connected');
                return;
            }

            const message = { type, payload };
            this.socket.send(JSON.stringify(message));
        },

        // Update sendTypingStatus to use new method
        sendTypingStatus(isTyping) {
            if (!this.currentRoom) return;

            const typingData = {
                roomId: this.currentRoom.id,
                userId: this.currentUserId,
                isTyping
            };

            this.sendWebSocketMessage('TYPING_STATUS', typingData);
        },

        // Update handleWebSocketMessage to handle new message types
        handleWebSocketMessage(data) {
            switch (data.type) {
                case 'NEW_MESSAGE':
                    this.handleNewMessage(data.payload);
                    break;
                case 'MESSAGE_READ':
                    this.handleMessageRead(data.payload);
                    break;
                case 'TYPING_STATUS':
                    this.handleTypingStatus(data.payload);
                    break;
                case 'USER_STATUS':
                    this.handleUserStatus(data.payload);
                    break;
                case 'MESSAGE_EDIT':
                    this.handleMessageEdit(data.payload);
                    break;
                case 'MESSAGE_DELETE':
                    this.handleMessageDelete(data.payload);
                    break;
                case 'REACTION':
                    this.handleReaction(data.payload);
                    break;
            }
        },

        // Add new handlers
        handleMessageEdit(updatedMessage) {
            const index = this.messages.findIndex((m) => m.id === updatedMessage.id);
            if (index !== -1) {
                this.messages[index] = updatedMessage;
            }
        },

        handleMessageDelete(deleteData) {
            if (deleteData.deletedForAll) {
                this.messages = this.messages.filter((m) => m.id !== deleteData.messageId);
            }
        },

        handleReaction(reactionData) {
            const message = this.messages.find((m) => m.id === reactionData.messageId);
            if (message) {
                if (!message.reactions) {
                    message.reactions = {};
                }

                if (reactionData.action === 'ADD') {
                    if (!message.reactions[reactionData.emoji]) {
                        message.reactions[reactionData.emoji] = [];
                    }
                    message.reactions[reactionData.emoji].push(reactionData.userId);
                } else if (reactionData.action === 'REMOVE') {
                    if (message.reactions[reactionData.emoji]) {
                        message.reactions[reactionData.emoji] = message.reactions[reactionData.emoji].filter((id) => id !== reactionData.userId);
                    }
                }
            }
        },

        handleNewMessage(message) {
            // Add message to appropriate room
            if (this.currentRoom?.id === message.roomId) {
                this.messages.push(message);

                // If not from current user and room is active, mark as read
                if (message.senderId !== this.currentUserId) {
                    this.markAsRead(message.id);
                }
            }

            // Update room's last message
            const room = this.rooms.find((r) => r.id === message.roomId);
            if (room) {
                room.lastMessage = message;
                if (!this.currentRoom || this.currentRoom.id !== message.roomId) {
                    room.unreadCount++;
                    this.unreadCount++;
                }
            }
        },

        handleTypingStatus(data) {
            if (data.roomId === this.currentRoom?.id) {
                if (data.isTyping) {
                    this.typingUsers.add(data.userId);
                } else {
                    this.typingUsers.delete(data.userId);
                }
            }
        },

        sendTypingStatus(isTyping) {
            if (!this.socket || !this.currentRoom) return;

            const typingData = {
                type: 'TYPING_STATUS',
                payload: {
                    roomId: this.currentRoom.id,
                    userId: this.currentUserId,
                    isTyping
                }
            };

            this.socket.send(JSON.stringify(typingData));
        },

        disconnectWebSocket() {
            if (this.socket) {
                this.socket.close();
                this.socket = null;
            }
        },

        // Add these methods to ChatStore.js
        async addReaction(messageId, emoji) {
            try {
                const response = await ChatService.addReaction(messageId, emoji);
                // Update local message with reaction
                const message = this.messages.find((m) => m.id === messageId);
                if (message) {
                    message.reactions = response.reactions;
                }
                return response;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async editMessage(messageId, newContent) {
            try {
                const response = await ChatService.editMessage(messageId, newContent);
                // Update local message
                const index = this.messages.findIndex((m) => m.id === messageId);
                if (index !== -1) {
                    this.messages[index] = response;
                }
                return response;
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },

        async deleteMessage(messageId, deleteForAll = false) {
            try {
                await ChatService.deleteMessage(messageId, deleteForAll);
                // Update local messages
                if (deleteForAll) {
                    this.messages = this.messages.filter((m) => m.id !== messageId);
                }
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        }
    },

    getters: {
        getRooms: (state) => state.rooms,
        getCurrentRoom: (state) => state.currentRoom,
        getMessages: (state) => state.messages,
        getUnreadCount: (state) => state.unreadCount,
        getTypingUsers: (state) => Array.from(state.typingUsers),
        isLoading: (state) => state.loading,
        getError: (state) => state.error,

        // Get sorted rooms by last message timestamp
        getSortedRooms: (state) => {
            return [...state.rooms].sort((a, b) => {
                return new Date(b.lastActivity) - new Date(a.lastActivity);
            });
        },

        // Filter rooms by search
        searchRooms: (state) => (searchTerm) => {
            if (!searchTerm) return state.rooms;
            return state.rooms.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()) || room.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())));
        }
    },

    getWebSocketUrl() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws`;
    }
});
