export const TicketService = {
    getData() {
        return [
            {
                id: 'b71b5f23-0fa5-4d3b-b3de-5db39d4509b1',
                organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
                user_id: '9fa7d3b1-c4c8-482b-9df1-df1ef72d5a67',
                code: 'TICK-001',
                title: 'Cannot access email server',
                description: 'User reports inability to access corporate email server via webmail.',
                status: 'open',
                priority: 'high',
                category: 'email_communication',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-16T12:34:56',
                updated_at: '2024-08-16T12:34:56'
            },
            {
                id: '88e9e4c6-1c1f-42c7-94fe-b6e47b46a7db',
                organization_id: '9b3ddbbd-64a3-4a0e-8fc5-cb9d77f2d0f4',
                user_id: '748b6a5c-f934-45da-9260-6f99e517cd6c',
                code: 'TICK-002',
                title: 'VPN not connecting',
                description: 'Unable to establish a connection to the company VPN from remote location.',
                status: 'in_progress',
                priority: 'urgent',
                category: 'security_access',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-12T09:12:34',
                updated_at: '2024-08-14T11:15:44'
            },
            {
                id: '76f67bdb-5a3f-4fbc-97fd-b434b3f83bc8',
                organization_id: 'ba82694f-8ff3-4f8d-8611-ef91c23f4213',
                user_id: 'deac7d13-4c58-4b68-a8cb-56f597ec2d8b',
                code: 'TICK-003',
                title: 'Software crash during operation',
                description: 'Application crashes when processing large files.',
                status: 'resolved',
                priority: 'medium',
                category: 'software_applications',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-07-20T14:45:12',
                updated_at: '2024-07-22T10:11:23'
            },
            {
                id: '937efcc1-5a16-4cf2-9c3b-4b041a60fcd7',
                organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
                user_id: 'd487fd16-14a9-4c81-8f6f-f72d1fadb382',
                code: 'TICK-004',
                title: 'Printer not responding',
                description: 'The office printer is not responding to print commands.',
                status: 'open',
                priority: 'low',
                category: 'hardware_devices',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-10T13:21:45',
                updated_at: '2024-08-10T13:21:45'
            },
            {
                id: 'd41e024f-ff75-4d82-9096-4f1c95d91276',
                organization_id: '7e49bf44-1a1a-40a4-9c22-c80dddbb3e61',
                user_id: '0c4ae617-e5e2-4d3a-b507-2c79dfcae527',
                code: 'TICK-005',
                title: 'Slow internet connection',
                description: 'Internet speed in the office is significantly slower than usual.',
                status: 'in_progress',
                priority: 'medium',
                category: 'network_connectivity',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-05T16:04:33',
                updated_at: '2024-08-06T10:12:22'
            },
            {
                id: '22f7a9ba-8c1d-4f43-989e-5e68e4c7d1c8',
                organization_id: 'f7f44e1f-d1b8-42ae-94e3-18e54d798c92',
                user_id: '0d2ba95d-f9de-4783-9be9-cd56b3458eaf',
                code: 'TICK-006',
                title: 'Database synchronization issue',
                description: 'The regional databases are not syncing with the main database.',
                status: 'open',
                priority: 'urgent',
                category: 'data_backup',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-15T08:34:12',
                updated_at: '2024-08-15T08:34:12'
            },
            {
                id: '41c98a1d-949e-4b19-9bb2-063580b0c732',
                organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
                user_id: '9fa7d3b1-c4c8-482b-9df1-df1ef72d5a67',
                code: 'TICK-007',
                title: 'Unable to upload files',
                description: "File upload fails with a 'file too large' error despite being within the limit.",
                status: 'open',
                priority: 'medium',
                category: 'web_online_services',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-16T11:23:45',
                updated_at: '2024-08-16T11:23:45'
            },
            {
                id: 'fe121c02-80c7-4a2f-9f6f-fb1e68dcd29e',
                organization_id: '51a6e487-3ab7-44c2-9e9d-d2b0dd204635',
                user_id: 'f4bfb9c2-97c8-4e3e-8b8b-c4169bfc7b54',
                code: 'TICK-008',
                title: 'Email filters not working',
                description: 'User reports that email filters are no longer sorting emails correctly.',
                status: 'resolved',
                priority: 'low',
                category: 'email_communication',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-07-25T10:45:56',
                updated_at: '2024-07-28T14:12:12'
            },
            {
                id: '8d4e0489-9a29-474b-8503-e3bc1ab20f3f',
                organization_id: '9b3ddbbd-64a3-4a0e-8fc5-cb9d77f2d0f4',
                user_id: 'aa91a53f-b197-4b76-9c96-9412032645ef',
                code: 'TICK-009',
                title: 'File server inaccessible',
                description: 'Employees cannot access the shared file server.',
                status: 'in_progress',
                priority: 'high',
                category: 'security_access',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-14T09:22:12',
                updated_at: '2024-08-15T12:34:09'
            },
            {
                id: 'c9b453fa-0a95-4ac7-88f2-cc43ff4b8658',
                organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
                user_id: '9fa7d3b1-c4c8-482b-9df1-df1ef72d5a67',
                code: 'TICK-010',
                title: 'Unable to reset password',
                description: 'The password reset link is not functioning properly.',
                status: 'open',
                priority: 'urgent',
                category: 'security_access',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-16T15:01:34',
                updated_at: '2024-08-16T15:01:34'
            },
            {
                id: 'd3e16e4e-bb38-45eb-85a7-82d15c16fc79',
                organization_id: 'f4a0d0d0-36e4-4b9a-bf2e-7c1ef9f32f58',
                user_id: 'a4f29d0c-bc84-45c8-8b3e-5423d5c5e123',
                code: 'TICK-011',
                title: 'Login page not loading',
                description: 'The login page for the internal portal is not loading.',
                status: 'open',
                priority: 'high',
                category: 'security_access',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-17T10:30:00',
                updated_at: '2024-08-17T10:30:00'
            },
            {
                id: '6f4bb205-c0cf-47b6-9c52-234c3d6a5a4a',
                organization_id: 'a1e2f3g4-h567-890i-jklm-456nop789qrs',
                user_id: 'e1b3c4d5-6789-0abc-def1-234567890ghi',
                code: 'TICK-012',
                title: 'Software update failing',
                description: 'Automated software update is failing with an error message.',
                status: 'in_progress',
                priority: 'medium',
                category: 'performance_optimization',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-18T11:45:23',
                updated_at: '2024-08-19T14:22:18'
            },
            {
                id: '8b45c1e7-5d5c-4c98-ae2b-2b36f5c8c1e5',
                organization_id: 'd4c4e6a7-1234-5678-9101-112131415161',
                user_id: 'b2a4c5d6-7890-12ab-cd34-ef56789g123h',
                code: 'TICK-013',
                title: 'System overheating',
                description: 'Main server room temperature is higher than usual, potential overheating issue.',
                status: 'resolved',
                priority: 'high',
                category: 'hardware_devices',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-20T08:30:55',
                updated_at: '2024-08-22T16:15:30'
            },
            {
                id: 'b2d4c8e3-2d14-4a6a-982e-b1f9c8b4c3d6',
                organization_id: 'e1f2g3h4-5678-90ij-klmn-1234567890op',
                user_id: 'a1b2c3d4-5678-90ab-cd12-34567890efgh',
                code: 'TICK-014',
                title: 'Network printer offline',
                description: 'Network printer is showing as offline and cannot be accessed from any workstation.',
                status: 'open',
                priority: 'medium',
                category: 'hardware_devices',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-21T09:12:34',
                updated_at: '2024-08-21T09:12:34'
            },
            {
                id: 'c7f1b3c5-df5c-4b3a-918a-4b61c76d4e67',
                organization_id: 'b1e2f3g4-5678-90hi-jklm-234567890nop',
                user_id: 'e3d4c5b6-7890-12ab-cd34-ef56789g123h',
                code: 'TICK-015',
                title: 'Account permissions issue',
                description: 'User reports missing permissions for accessing specific shared folders.',
                status: 'in_progress',
                priority: 'high',
                category: 'security_access',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-22T10:25:44',
                updated_at: '2024-08-22T10:25:44'
            },
            {
                id: 'e2f4b6c8-8b5e-4b5b-9f7d-c8d2a9b0c8f4',
                organization_id: 'f5a6b7c8-9d0e-12fg-3456-7890hi1j2klm',
                user_id: 'c1d2e3f4-5678-90ab-cd12-34567890efgh',
                code: 'TICK-016',
                title: 'Website downtime',
                description: 'Company website is down and showing a 500 error.',
                status: 'resolved',
                priority: 'urgent',
                category: 'web_online_services',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-23T12:34:56',
                updated_at: '2024-08-24T08:45:12'
            },
            {
                id: 'a7c2e5b4-9f4a-4f35-bd3e-9a3b4c6d7f80',
                organization_id: 'c9d0e1f2-3456-78ab-cd90-1234567890ef',
                user_id: 'b4a5c6d7-8901-23ef-gh45-67890ijklmno',
                code: 'TICK-017',
                title: 'Hardware malfunction',
                description: 'Critical hardware failure in the main server causing service interruption.',
                status: 'in_progress',
                priority: 'urgent',
                category: 'hardware_devices',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-24T15:22:18',
                updated_at: '2024-08-24T15:22:18'
            },
            {
                id: 'b8d1e9c3-5f7a-4c2d-a8d9-0e6f5g7h8i9j',
                organization_id: 'e2f3g4h5-6789-01ij-klmn-234567890pqr',
                user_id: 'c7d8e9f0-1234-56ab-cd78-90123456789s',
                code: 'TICK-018',
                title: 'Database access denied',
                description: 'Unable to access the company database due to permission errors.',
                status: 'open',
                priority: 'high',
                category: 'data_backup',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-25T11:35:29',
                updated_at: '2024-08-25T11:35:29'
            },
            {
                id: 'd5f8b3c2-4d5e-6f7a-8c9d-0123456789ef',
                organization_id: 'a9b0c1d2-3456-78ef-gh90-1234567890ij',
                user_id: 'd9e0f1g2-3456-78ab-cd90-1234567890kl',
                code: 'TICK-019',
                title: 'Network congestion',
                description: 'Network congestion issues causing slow data transfer and connectivity problems.',
                status: 'resolved',
                priority: 'medium',
                category: 'network_connectivity',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-26T14:44:56',
                updated_at: '2024-08-27T09:15:34'
            },
            {
                id: 'e3f6a1b9-8c2d-4e5f-6a78-901234b5c6d7',
                organization_id: 'b1c2d3e4-5678-90fg-hi12-345678901jkl',
                user_id: 'f4g5h6i7-8901-23ab-cd45-67890efghij',
                code: 'TICK-020',
                title: 'Software license expired',
                description: 'License for critical software has expired, causing application functionality issues.',
                status: 'in_progress',
                priority: 'high',
                category: 'software_applications',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-27T10:22:30',
                updated_at: '2024-08-27T10:22:30'
            },
            {
                id: 'f6g7h8i9-0a1b-2c3d-4e5f-6789012345ab',
                organization_id: 'c1d2e3f4-5678-90gh-ijkl-1234567890mn',
                user_id: 'a2b3c4d5-6789-01ef-gh23-456789012345',
                code: 'TICK-021',
                title: 'Lost access to shared drive',
                description: 'User is unable to access a shared drive due to an unknown error.',
                status: 'open',
                priority: 'medium',
                category: 'security_access',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-28T16:35:44',
                updated_at: '2024-08-28T16:35:44'
            },
            {
                id: 'a5b6c7d8-9e0f-1a2b-3c4d-567890e1f2g3',
                organization_id: 'd1e2f3g4-5678-90hi-jklm-1234567890op',
                user_id: 'c4d5e6f7-8901-23ab-cd45-67890efghij',
                code: 'TICK-022',
                title: 'User account lockout',
                description: 'User account is locked out after multiple unsuccessful login attempts.',
                status: 'resolved',
                priority: 'low',
                category: 'security_access',
                image_url: 'https://via.placeholder.com/150',
                created_at: '2024-08-29T13:22:18',
                updated_at: '2024-08-29T13:22:18'
            }
        ];
    },

    getTicketsSmall() {
        return Promise.resolve(this.getData().slice(0, 10));
    },

    getTicketsMedium() {
        return Promise.resolve(this.getData().slice(0, 50));
    },

    getTicketsLarge() {
        return Promise.resolve(this.getData().slice(0, 200));
    },

    getTicketsXLarge() {
        return Promise.resolve(this.getData());
    },

    getTickets() {
        return Promise.resolve(this.getData());
    }
};
