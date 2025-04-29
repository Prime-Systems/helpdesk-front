const mockUsers = [
    {
        id: 1,
        email: 'john.doe@example.com',
        password: 'password123',
        name: 'John Doe'
    },
    {
        id: 2,
        email: 'jane.smith@example.com',
        password: 'mypassword',
        name: 'Jane Smith'
    }
];

export const AuthService = {
    login(email, password) {
        const user = mockUsers.find((u) => u.email === email && u.password === password);
        if (user) {
            const token = 'mock-jwt-token';
            return Promise.resolve({ token, user });
        } else {
            return Promise.reject(new Error('Invalid credentials'));
        }
    },

    logout() {
        return Promise.resolve();
    },

    getCurrentUser(token) {
        if (!token) {
            return Promise.reject(new Error('No token provided'));
        }
        return Promise.resolve(mockUsers[0]);
    }
};
