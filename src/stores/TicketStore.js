import { TicketService } from '@/service/TicketService.js';
import { defineStore } from 'pinia';

export const useTicketStore = defineStore('ticket', {
    state: () => ({
        tickets: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchTickets() {
            this.loading = true;
            this.error = null;

            try {
                const response = await TicketService.getTickets();
                this.tickets = response.tickets ?? [];
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async addTicket(ticket) {
            this.loading = true;
            this.error = null;

            try {
                const createdTicket = await TicketService.createTicket(ticket);
                this.tickets.unshift(createdTicket);
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async updateTicket(ticket) {
            this.loading = true;
            this.error = null;

            try {
                const updatedTicket = await TicketService.updateTicket(ticket.id, ticket);
                const index = this.tickets.findIndex((t) => t.id === ticket.id);
                if (index !== -1) {
                    this.tickets[index] = updatedTicket;
                }
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async deleteTicket(id) {
            this.loading = true;
            this.error = null;

            try {
                await TicketService.deleteTicket(id);
                this.tickets = this.tickets.filter((ticket) => ticket.id !== id);
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        }
    }
});
