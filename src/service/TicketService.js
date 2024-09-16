export const TicketService = {
    getData() {
        return [
            {
                id: 'b71b5f23-0fa5-4d3b-b3de-5db39d4509b1',
                organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
                user_id: '9fa7d3b1-c4c8-482b-9df1-df1ef72d5a67',
                title: 'Cannot access email server',
                description: 'User reports inability to access corporate email server via webmail.',
                status: 'open',
                priority: 'high',
                created_at: '2024-08-16T12:34:56',
                updated_at: '2024-08-16T12:34:56'
            },
            {
                id: '88e9e4c6-1c1f-42c7-94fe-b6e47b46a7db',
                organization_id: '9b3ddbbd-64a3-4a0e-8fc5-cb9d77f2d0f4',
                user_id: '748b6a5c-f934-45da-9260-6f99e517cd6c',
                title: 'VPN not connecting',
                description: 'Unable to establish a connection to the company VPN from remote location.',
                status: 'in_progress',
                priority: 'urgent',
                created_at: '2024-08-12T09:12:34',
                updated_at: '2024-08-14T11:15:44'
            },
            {
                id: '76f67bdb-5a3f-4fbc-97fd-b434b3f83bc8',
                organization_id: 'ba82694f-8ff3-4f8d-8611-ef91c23f4213',
                user_id: 'deac7d13-4c58-4b68-a8cb-56f597ec2d8b',
                title: 'Software crash during operation',
                description: 'Application crashes when processing large files.',
                status: 'resolved',
                priority: 'medium',
                created_at: '2024-07-20T14:45:12',
                updated_at: '2024-07-22T10:11:23'
            },
            {
                id: '937efcc1-5a16-4cf2-9c3b-4b041a60fcd7',
                organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
                user_id: 'd487fd16-14a9-4c81-8f6f-f72d1fadb382',
                title: 'Printer not responding',
                description: 'The office printer is not responding to print commands.',
                status: 'open',
                priority: 'low',
                created_at: '2024-08-10T13:21:45',
                updated_at: '2024-08-10T13:21:45'
            },
            {
                id: 'd41e024f-ff75-4d82-9096-4f1c95d91276',
                organization_id: '7e49bf44-1a1a-40a4-9c22-c80dddbb3e61',
                user_id: '0c4ae617-e5e2-4d3a-b507-2c79dfcae527',
                title: 'Slow internet connection',
                description: 'Internet speed in the office is significantly slower than usual.',
                status: 'in_progress',
                priority: 'medium',
                created_at: '2024-08-05T16:04:33',
                updated_at: '2024-08-06T10:12:22'
            },
            {
                id: '22f7a9ba-8c1d-4f43-989e-5e68e4c7d1c8',
                organization_id: 'f7f44e1f-d1b8-42ae-94e3-18e54d798c92',
                user_id: '0d2ba95d-f9de-4783-9be9-cd56b3458eaf',
                title: 'Database synchronization issue',
                description: 'The regional databases are not syncing with the main database.',
                status: 'open',
                priority: 'urgent',
                created_at: '2024-08-15T08:34:12',
                updated_at: '2024-08-15T08:34:12'
            },
            {
                id: '41c98a1d-949e-4b19-9bb2-063580b0c732',
                organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
                user_id: '9fa7d3b1-c4c8-482b-9df1-df1ef72d5a67',
                title: 'Unable to upload files',
                description: "File upload fails with a 'file too large' error despite being within the limit.",
                status: 'open',
                priority: 'medium',
                created_at: '2024-08-16T11:23:45',
                updated_at: '2024-08-16T11:23:45'
            },
            {
                id: 'fe121c02-80c7-4a2f-9f6f-fb1e68dcd29e',
                organization_id: '51a6e487-3ab7-44c2-9e9d-d2b0dd204635',
                user_id: 'f4bfb9c2-97c8-4e3e-8b8b-c4169bfc7b54',
                title: 'Email filters not working',
                description: 'User reports that email filters are no longer sorting emails correctly.',
                status: 'resolved',
                priority: 'low',
                created_at: '2024-07-25T10:45:56',
                updated_at: '2024-07-28T14:12:12'
            },
            {
                id: '8d4e0489-9a29-474b-8503-e3bc1ab20f3f',
                organization_id: '9b3ddbbd-64a3-4a0e-8fc5-cb9d77f2d0f4',
                user_id: 'aa91a53f-b197-4b76-9c96-9412032645ef',
                title: 'File server inaccessible',
                description: 'Employees cannot access the shared file server.',
                status: 'in_progress',
                priority: 'high',
                created_at: '2024-08-14T09:22:12',
                updated_at: '2024-08-15T12:34:09'
            },
            {
                id: 'c9b453fa-0a95-4ac7-88f2-cc43ff4b8658',
                organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
                user_id: '9fa7d3b1-c4c8-482b-9df1-df1ef72d5a67',
                title: 'Unable to reset password',
                description: 'The password reset link is not functioning properly.',
                status: 'closed',
                priority: 'low',
                created_at: '2024-06-30T10:30:34',
                updated_at: '2024-07-02T08:12:56'
            },
            {
                id: '789d8547-1b4e-45b9-834d-e349a0c1c720',
                organization_id: '7e49bf44-1a1a-40a4-9c22-c80dddbb3e61',
                user_id: '0c4ae617-e5e2-4d3a-b507-2c79dfcae527',
                title: 'New hire account creation request',
                description: 'Request to create user accounts for new hires.',
                status: 'open',
                priority: 'medium',
                created_at: '2024-08-14T14:22:18',
                updated_at: '2024-08-14T14:22:18'
            },
            {
                id: '5e3f4a8e-f765-4866-b7f4-f23cdb1f5f8e',
                organization_id: '51a6e487-3ab7-44c2-9e9d-d2b0dd204635',
                user_id: 'ec65ba9d-6c89-4b80-9d76-1b29ff8ff732',
                title: 'Browser extension not working',
                description: "User-reported issues with the company's browser extension malfunctioning on Chrome.",
                status: 'open',
                priority: 'low',
                created_at: '2024-08-12T09:45:56',
                updated_at: '2024-08-12T09:45:56'
            },
            {
                id: '0461a439-f8c4-40fb-b31c-4fa3b88a9e46',
                organization_id: 'f7f44e1f-d1b8-42ae-94e3-18e54d798c92',
                user_id: 'ad9e6b77-2ac4-4d32-bb3c-72389e392a95',
                title: 'Antivirus not detecting malware',
                description: 'The antivirus software failed to detect malware on the system.',
                status: 'in_progress',
                priority: 'urgent',
                created_at: '2024-08-15T10:11:12',
                updated_at: '2024-08-15T10:11:12'
            },
            {
                id: 'b165c5f6-24b3-42f1-81a7-09c02d585dcf',
                organization_id: '9b3ddbbd-64a3-4a0e-8fc5-cb9d77f2d0f4',
                user_id: '748b6a5c-f934-45da-9260-6f99e517cd6c',
                title: 'System performance issues',
                description: 'Slow performance across multiple workstations after recent update.',
                status: 'resolved',
                priority: 'high',
                created_at: '2024-08-11T13:32:44',
                updated_at: '2024-08-12T09:45:34'
            },
            {
                id: 'ba71f689-97df-4f99-a302-891fe15dfd13',
                organization_id: 'a9e7cf56-c32d-4c56-a11c-d13fe6adbd23',
                user_id: '9fa7d3b1-c4c8-482b-9df1-df1ef72d5a67',
                title: 'Unable to save files',
                description: 'Saving documents on the shared drive throws an error.',
                status: 'open',
                priority: 'medium',
                created_at: '2024-08-15T12:12:45',
                updated_at: '2024-08-15T12:12:45'
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
    }
};
