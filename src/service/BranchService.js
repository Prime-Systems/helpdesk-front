export const BranchService = {
    getBranches() {
        return Promise.resolve([
            { id: 1, name: 'Accra Main', manager: 'Kwame Osei', activeTickets: 45, resolvedTickets: 120, satisfaction: 4.8 },
            { id: 2, name: 'Kumasi', manager: 'Ama Mensah', activeTickets: 32, resolvedTickets: 98, satisfaction: 4.6 },
            { id: 3, name: 'Takoradi', manager: 'Kofi Boateng', activeTickets: 28, resolvedTickets: 85, satisfaction: 4.7 },
            { id: 4, name: 'Tamale', manager: 'Abena Antwi', activeTickets: 15, resolvedTickets: 42, satisfaction: 4.5 }
        ]);
    }
};
