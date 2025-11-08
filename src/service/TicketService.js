import axios from '@/plugins/axios';
import { useAuthStore } from '@/stores/AuthStore';

export const TicketService = {
    // Get all tickets
    async getTickets(page = 1, size = 10) {
        try {
            const authStore = useAuthStore();
            console.log('Token:', authStore.token);
            const response = await axios.get(`/tickets?page=${page}&size=${size}`);
            console.log('Tickets:', response.data);
            console.log('Status:', response);
            return response.data;
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw error;
        }
    },

    // Create a new ticket
    async createTicket(ticketData) {
        try {
            const response = await axios.post('/tickets', ticketData);
            return response.data;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
    },

    // Delete tickets (bulk delete)
    async deleteTickets(ticketIds) {
        try {
            const response = await axios.delete('/tickets', {
                data: { ticketIds }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting tickets:', error);
            throw error;
        }
    },

    // Get a specific ticket by ID
    async getTicketById(ticketId) {
        try {
            const response = await axios.get(`/tickets/${ticketId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching ticket:', error);
            throw error;
        }
    },

    // Reassign a ticket
    async reassignTicket(ticketId, reassignData) {
        try {
            const response = await axios.post(`/tickets/${ticketId}/reassign`, reassignData);
            return response.data;
        } catch (error) {
            console.error('Error reassigning ticket:', error);
            throw error;
        }
    },

    // Add feedback to a ticket
    async addTicketFeedback(ticketId, feedbackData) {
        try {
            const response = await axios.post(`/tickets/${ticketId}/feedback`, feedbackData);
            return response.data;
        } catch (error) {
            console.error('Error adding feedback:', error);
            throw error;
        }
    },

    // Get comments for a ticket
    async getTicketComments(ticketId) {
        try {
            const response = await axios.get(`/tickets/${ticketId}/comments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    },

    // Add a comment to a ticket
    async addTicketComment(ticketId, commentData) {
        try {
            const response = await axios.post(`/tickets/${ticketId}/comments`, commentData);
            return response.data;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    // Add attachment to a ticket
    async addTicketAttachment(ticketId, attachmentData) {
        try {
            const response = await axios.post(`/tickets/${ticketId}/attachments`, attachmentData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error adding attachment:', error);
            throw error;
        }
    },

    // Update ticket status
    async updateTicketStatus(ticketId, statusData) {
        try {
            const response = await axios.patch(`/tickets/${ticketId}/status`, statusData);
            return response.data;
        } catch (error) {
            console.error('Error updating ticket status:', error);
            throw error;
        }
    },

    // Get ticket history
    async getTicketHistory(ticketId) {
        try {
            const response = await axios.get(`/tickets/${ticketId}/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching ticket history:', error);
            throw error;
        }
    },

    // Get tickets by user ID
    async getTicketsByUserId(userId, params = {}) {
        try {
            const response = await axios.get(`/tickets/users/${userId}`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching user tickets:', error);
            throw error;
        }
    },

    // Get ticket status counts
    async getTicketStatusCounts(params = {}) {
        try {
            const response = await axios.get('/tickets/status-counts', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching status counts:', error);
            throw error;
        }
    },

    // Search tickets
    async searchTickets(searchParams) {
        try {
            const response = await axios.get('/tickets/search', {
                params: searchParams
            });
            return response.data;
        } catch (error) {
            console.error('Error searching tickets:', error);
            throw error;
        }
    },

    // Get overdue tickets
    async getOverdueTickets(params = {}) {
        try {
            const response = await axios.get('/tickets/overdue', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching overdue tickets:', error);
            throw error;
        }
    },

    // Get tickets by department ID
    async getTicketsByDepartmentId(departmentId, params = {}) {
        try {
            const response = await axios.get(`/tickets/departments/${departmentId}`, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching department tickets:', error);
            throw error;
        }
    }
};

// export const TicketService = {
//     getData() {
//         return [
//             {
//                 id: 'b71b5f23-0fa5-4d3b-b3de-5db39d4509b1',
//                 organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
//                 user_id: '9fa7d3b1-c4c8-482b-9df1-df1ef72d5a67',
//                 code: 'TICK-001',
//                 title: 'Cannot access email server',
//                 description: 'User reports inability to access corporate email server via webmail.',
//                 status: 'open',
//                 priority: 'high',
//                 category: 'email_communication',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-16T12:34:56',
//                 updated_at: '2024-08-16T12:34:56',
//                 due_date: '2024-08-23T12:34:56',
//                 assignee: 'john.doe@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-16T12:34:56',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-16T13:00:00',
//                         activity: 'Assigned to John Doe'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/file1.pdf', 'https://example.com/attachments/image1.png']
//             },
//             {
//                 id: '88e9e4c6-1c1f-42c7-94fe-b6e47b46a7db',
//                 organization_id: '9b3ddbbd-64a3-4a0e-8fc5-cb9d77f2d0f4',
//                 user_id: '748b6a5c-f934-45da-9260-6f99e517cd6c',
//                 code: 'TICK-002',
//                 title: 'VPN not connecting',
//                 description: 'Unable to establish a connection to the company VPN from remote location.',
//                 status: 'ongoing',
//                 priority: 'urgent',
//                 category: 'security_access',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-12T09:12:34',
//                 updated_at: '2024-08-14T11:15:44',
//                 due_date: '2024-08-19T09:12:34',
//                 assignee: 'jane.smith@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-12T09:12:34',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-12T10:00:00',
//                         activity: 'Assigned to Jane Smith'
//                     },
//                     {
//                         timestamp: '2024-08-14T11:15:44',
//                         activity: 'Status updated to ongoing'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/vpn_logs.txt']
//             },
//             {
//                 id: '76f67bdb-5a3f-4fbc-97fd-b434b3f83bc8',
//                 organization_id: 'ba82694f-8ff3-4f8d-8611-ef91c23f4213',
//                 user_id: 'deac7d13-4c58-4b68-a8cb-56f597ec2d8b',
//                 code: 'TICK-003',
//                 title: 'Software crash during operation',
//                 description: 'Application crashes when processing large files.',
//                 status: 'resolved',
//                 priority: 'medium',
//                 category: 'software_applications',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-07-20T14:45:12',
//                 updated_at: '2024-07-22T10:11:23',
//                 due_date: '2024-07-27T14:45:12',
//                 assignee: 'alice.johnson@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-07-20T14:45:12',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-07-20T15:00:00',
//                         activity: 'Assigned to Alice Johnson'
//                     },
//                     {
//                         timestamp: '2024-07-22T10:11:23',
//                         activity: 'Status updated to resolved'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/crash_report.pdf']
//             },
//             {
//                 id: '937efcc1-5a16-4cf2-9c3b-4b041a60fcd7',
//                 organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
//                 user_id: 'd487fd16-14a9-4c81-8f6f-f72d1fadb382',
//                 code: 'TICK-004',
//                 title: 'Printer not responding',
//                 description: 'The office printer is not responding to print commands.',
//                 status: 'open',
//                 priority: 'low',
//                 category: 'hardware_devices',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-10T13:21:45',
//                 updated_at: '2024-08-10T13:21:45',
//                 due_date: '2024-08-17T13:21:45',
//                 assignee: 'bob.miller@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-10T13:21:45',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-10T14:00:00',
//                         activity: 'Assigned to Bob Miller'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/printer_logs.txt']
//             },
//             {
//                 id: 'd41e024f-ff75-4d82-9096-4f1c95d91276',
//                 organization_id: '7e49bf44-1a1a-40a4-9c22-c80dddbb3e61',
//                 user_id: '0c4ae617-e5e2-4d3a-b507-2c79dfcae527',
//                 code: 'TICK-005',
//                 title: 'Slow internet connection',
//                 description: 'Internet speed in the office is significantly slower than usual.',
//                 status: 'ongoing',
//                 priority: 'medium',
//                 category: 'network_connectivity',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-05T16:04:33',
//                 updated_at: '2024-08-06T10:12:22',
//                 due_date: '2024-08-12T16:04:33',
//                 assignee: 'sarah.lee@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-05T16:04:33',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-05T17:00:00',
//                         activity: 'Assigned to Sarah Lee'
//                     },
//                     {
//                         timestamp: '2024-08-06T10:12:22',
//                         activity: 'Status updated to ongoing'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/network_logs.txt']
//             },
//             {
//                 id: '22f7a9ba-8c1d-4f43-989e-5e68e4c7d1c8',
//                 organization_id: 'f7f44e1f-d1b8-42ae-94e3-18e54d798c92',
//                 user_id: '0d2ba95d-f9de-4783-9be9-cd56b3458eaf',
//                 code: 'TICK-006',
//                 title: 'Database synchronization issue',
//                 description: 'The regional databases are not syncing with the main database.',
//                 status: 'open',
//                 priority: 'urgent',
//                 category: 'data_backup',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-15T08:34:12',
//                 updated_at: '2024-08-15T08:34:12',
//                 due_date: '2024-08-22T08:34:12',
//                 assignee: 'michael.brown@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-15T08:34:12',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-15T09:00:00',
//                         activity: 'Assigned to Michael Brown'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/db_logs.txt']
//             },
//             {
//                 id: '41c98a1d-949e-4b19-9bb2-063580b0c732',
//                 organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
//                 user_id: '9fa7d3b1-c4c8-482b-9df1-df1ef72d5a67',
//                 code: 'TICK-007',
//                 title: 'Unable to upload files',
//                 description: "File upload fails with a 'file too large' error despite being within the limit.",
//                 status: 'open',
//                 priority: 'medium',
//                 category: 'web_online_services',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-16T11:23:45',
//                 updated_at: '2024-08-16T11:23:45',
//                 due_date: '2024-08-23T11:23:45',
//                 assignee: 'emily.wilson@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-16T11:23:45',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-16T12:00:00',
//                         activity: 'Assigned to Emily Wilson'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/upload_error_logs.txt']
//             },
//             {
//                 id: 'fe121c02-80c7-4a2f-9f6f-fb1e68dcd29e',
//                 organization_id: '51a6e487-3ab7-44c2-9e9d-d2b0dd204635',
//                 user_id: 'f4bfb9c2-97c8-4e3e-8b8b-c4169bfc7b54',
//                 code: 'TICK-008',
//                 title: 'Email filters not working',
//                 description: 'User reports that email filters are no longer sorting emails correctly.',
//                 status: 'resolved',
//                 priority: 'low',
//                 category: 'email_communication',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-07-25T10:45:56',
//                 updated_at: '2024-07-28T14:12:12',
//                 due_date: '2024-08-01T10:45:56',
//                 assignee: 'david.martinez@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-07-25T10:45:56',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-07-25T11:00:00',
//                         activity: 'Assigned to David Martinez'
//                     },
//                     {
//                         timestamp: '2024-07-28T14:12:12',
//                         activity: 'Status updated to resolved'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/email_filter_logs.txt']
//             },
//             {
//                 id: '8d4e0489-9a29-474b-8503-e3bc1ab20f3f',
//                 organization_id: '9b3ddbbd-64a3-4a0e-8fc5-cb9d77f2d0f4',
//                 user_id: 'aa91a53f-b197-4b76-9c96-9412032645ef',
//                 code: 'TICK-009',
//                 title: 'File server inaccessible',
//                 description: 'Employees cannot access the shared file server.',
//                 status: 'ongoing',
//                 priority: 'high',
//                 category: 'security_access',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-14T09:22:12',
//                 updated_at: '2024-08-15T12:34:09',
//                 due_date: '2024-08-21T09:22:12',
//                 assignee: 'laura.garcia@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-14T09:22:12',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-14T10:00:00',
//                         activity: 'Assigned to Laura Garcia'
//                     },
//                     {
//                         timestamp: '2024-08-15T12:34:09',
//                         activity: 'Status updated to ongoing'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/file_server_logs.txt']
//             },
//             {
//                 id: 'c9b453fa-0a95-4ac7-88f2-cc43ff4b8658',
//                 organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
//                 user_id: '9fa7d3b1-c4c8-482b-9df1-df1ef72d5a67',
//                 code: 'TICK-010',
//                 title: 'Unable to reset password',
//                 description: 'The password reset link is not functioning properly.',
//                 status: 'open',
//                 priority: 'urgent',
//                 category: 'security_access',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-16T15:01:34',
//                 updated_at: '2024-08-16T15:01:34',
//                 due_date: '2024-08-23T15:01:34',
//                 assignee: 'ryan.taylor@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-16T15:01:34',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-16T16:00:00',
//                         activity: 'Assigned to Ryan Taylor'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/password_reset_logs.txt']
//             },
//             {
//                 id: 'd3e16e4e-bb38-45eb-85a7-82d15c16fc79',
//                 organization_id: 'f4a0d0d0-36e4-4b9a-bf2e-7c1ef9f32f58',
//                 user_id: 'a4f29d0c-bc84-45c8-8b3e-5423d5c5e123',
//                 code: 'TICK-011',
//                 title: 'Login page not loading',
//                 description: 'The login page for the internal portal is not loading.',
//                 status: 'open',
//                 priority: 'high',
//                 category: 'security_access',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-17T10:30:00',
//                 updated_at: '2024-08-17T10:30:00',
//                 due_date: '2024-08-24T10:30:00',
//                 assignee: 'sophia.clark@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-17T10:30:00',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-17T11:00:00',
//                         activity: 'Assigned to Sophia Clark'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/login_error_logs.txt']
//             },
//             {
//                 id: '6f4bb205-c0cf-47b6-9c52-234c3d6a5a4a',
//                 organization_id: 'a1e2f3g4-h567-890i-jklm-456nop789qrs',
//                 user_id: 'e1b3c4d5-6789-0abc-def1-234567890ghi',
//                 code: 'TICK-012',
//                 title: 'Software update failing',
//                 description: 'Automated software update is failing with an error message.',
//                 status: 'ongoing',
//                 priority: 'medium',
//                 category: 'performance_optimization',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-18T11:45:23',
//                 updated_at: '2024-08-19T14:22:18',
//                 due_date: '2024-08-25T11:45:23',
//                 assignee: 'oliver.wilson@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-18T11:45:23',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-18T12:00:00',
//                         activity: 'Assigned to Oliver Wilson'
//                     },
//                     {
//                         timestamp: '2024-08-19T14:22:18',
//                         activity: 'Status updated to ongoing'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/update_error_logs.txt']
//             },
//             {
//                 id: '8b45c1e7-5d5c-4c98-ae2b-2b36f5c8c1e5',
//                 organization_id: 'd4c4e6a7-1234-5678-9101-112131415161',
//                 user_id: 'b2a4c5d6-7890-12ab-cd34-ef56789g123h',
//                 code: 'TICK-013',
//                 title: 'System overheating',
//                 description: 'Main server room temperature is higher than usual, potential overheating issue.',
//                 status: 'resolved',
//                 priority: 'high',
//                 category: 'hardware_devices',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-20T08:30:55',
//                 updated_at: '2024-08-22T16:15:30',
//                 due_date: '2024-08-27T08:30:55',
//                 assignee: 'emma.thompson@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-20T08:30:55',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-20T09:00:00',
//                         activity: 'Assigned to Emma Thompson'
//                     },
//                     {
//                         timestamp: '2024-08-22T16:15:30',
//                         activity: 'Status updated to resolved'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/server_temp_logs.txt']
//             },
//             {
//                 id: 'b2d4c8e3-2d14-4a6a-982e-b1f9c8b4c3d6',
//                 organization_id: 'e1f2g3h4-5678-90ij-klmn-1234567890op',
//                 user_id: 'a1b2c3d4-5678-90ab-cd12-34567890efgh',
//                 code: 'TICK-014',
//                 title: 'Network printer offline',
//                 description: 'Network printer is showing as offline and cannot be accessed from any workstation.',
//                 status: 'open',
//                 priority: 'medium',
//                 category: 'hardware_devices',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-21T09:12:34',
//                 updated_at: '2024-08-21T09:12:34',
//                 due_date: '2024-08-28T09:12:34',
//                 assignee: 'noah.martinez@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-21T09:12:34',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-21T10:00:00',
//                         activity: 'Assigned to Noah Martinez'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/printer_logs.txt']
//             },
//             {
//                 id: 'c7f1b3c5-df5c-4b3a-918a-4b61c76d4e67',
//                 organization_id: 'b1e2f3g4-5678-90hi-jklm-234567890nop',
//                 user_id: 'e3d4c5b6-7890-12ab-cd34-ef56789g123h',
//                 code: 'TICK-015',
//                 title: 'Account permissions issue',
//                 description: 'User reports missing permissions for accessing specific shared folders.',
//                 status: 'ongoing',
//                 priority: 'high',
//                 category: 'security_access',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-22T10:25:44',
//                 updated_at: '2024-08-22T10:25:44',
//                 due_date: '2024-08-29T10:25:44',
//                 assignee: 'ava.hernandez@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-22T10:25:44',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-22T11:00:00',
//                         activity: 'Assigned to Ava Hernandez'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/permission_logs.txt']
//             },
//             {
//                 id: 'e2f4b6c8-8b5e-4b5b-9f7d-c8d2a9b0c8f4',
//                 organization_id: 'f5a6b7c8-9d0e-12fg-3456-7890hi1j2klm',
//                 user_id: 'c1d2e3f4-5678-90ab-cd12-34567890efgh',
//                 code: 'TICK-016',
//                 title: 'Website downtime',
//                 description: 'Company website is down and showing a 500 error.',
//                 status: 'resolved',
//                 priority: 'urgent',
//                 category: 'web_online_services',
//                 image_url: 'https://via.placeholder.com/150',
//                 created_at: '2024-08-23T12:34:56',
//                 updated_at: '2024-08-24T08:45:12',
//                 due_date: '2024-08-30T12:34:56',
//                 assignee: 'liam.rodriguez@example.com',
//                 activities: [
//                     {
//                         timestamp: '2024-08-23T12:34:56',
//                         activity: 'Ticket created'
//                     },
//                     {
//                         timestamp: '2024-08-23T13:00:00',
//                         activity: 'Assigned to Liam Rodriguez'
//                     },
//                     {
//                         timestamp: '2024-08-24T08:45:12',
//                         activity: 'Status updated to resolved'
//                     }
//                 ],
//                 attachments: ['https://example.com/attachments/website_error_logs.txt']
//             }
//         ];
//     },

//     getTicketsSmall() {
//         return Promise.resolve(this.getData().slice(0, 10));
//     },

//     getTicketsMedium() {
//         return Promise.resolve(this.getData().slice(0, 50));
//     },

//     getTicketsLarge() {
//         return Promise.resolve(this.getData().slice(0, 200));
//     },

//     getTicketsXLarge() {
//         return Promise.resolve(this.getData());
//     },

//     getTickets() {
//         return Promise.resolve(this.getData());
//     }
// };
