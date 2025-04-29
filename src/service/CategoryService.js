export const CategoryService = {
    getData() {
        return [
            {
                id: 'c1',
                name: 'Network Issues',
                description: 'Problems related to network connectivity and performance.',
                department_id: 'd1',
                max_resolution_time: 24,
                priority: 'high',
                is_active: true,
                requires_approval: false,
                created_at: '2024-08-01T10:00:00',
                updated_at: '2024-08-01T10:00:00'
            },
            {
                id: 'c2',
                name: 'Software Bugs',
                description: 'Issues related to software functionality and bugs.',
                department_id: 'd2',
                max_resolution_time: 48,
                priority: 'medium',
                is_active: true,
                requires_approval: true,
                created_at: '2024-08-01T10:00:00',
                updated_at: '2024-08-01T10:00:00'
            },
            {
                id: 'c3',
                name: 'Hardware Failures',
                description: 'Issues related to hardware malfunctions and failures.',
                department_id: 'd3',
                max_resolution_time: 72,
                priority: 'urgent',
                is_active: true,
                requires_approval: false,
                created_at: '2024-08-01T10:00:00',
                updated_at: '2024-08-01T10:00:00'
            }
        ];
    },

    getCategories() {
        return Promise.resolve(this.getData());
    }
};
