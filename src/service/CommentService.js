export const CommentService = {
    getData() {
        return [
            {
                ticketId: 'b71b5f23-0fa5-4d3b-b3de-5db39d4509b1',
                comments: [
                    {
                        commentId: 'c1',
                        timestamp: '2024-08-16T13:30:00',
                        comment: 'Investigating the email server issue.',
                        visibility: 'public',
                        author: 'john.doe@example.com'
                    },
                    {
                        commentId: 'c2',
                        timestamp: '2024-08-16T14:00:00',
                        comment: 'Found a misconfiguration in the server settings.',
                        visibility: 'private',
                        author: 'john.doe@example.com'
                    }
                ]
            },
            {
                ticketId: '88e9e4c6-1c1f-42c7-94fe-b6e47b46a7db',
                comments: [
                    {
                        commentId: 'c3',
                        timestamp: '2024-08-12T10:30:00',
                        comment: 'Checking VPN logs for errors.',
                        visibility: 'public',
                        author: 'jane.smith@example.com'
                    }
                ]
            }
        ];
    },

    getComments() {
        return Promise.resolve(this.getData());
    }
};
