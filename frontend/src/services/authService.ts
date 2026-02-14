// src/services/authService.ts

// Define the shape of the user object we expect from the API
export interface ApiUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

// Define the shape of the successful authentication response
export interface AuthResponse {
    user: ApiUser;
    token: string;
    refreshToken: string;
}

/**
 * Simulates a login API call.
 * In a real app, this would be a fetch or axios call to your backend.
 */
export const login = async (username: string, password?: string): Promise<AuthResponse> => {
    console.log('Attempting login with:', { username, password });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success or failure
    if (username === 'test' && password === 'password') {
        const mockUser: ApiUser = {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            avatar: `https://ui-avatars.com/api/?name=Test+User&background=random`,
        };
        return {
            user: mockUser,
            token: 'mock_jwt_token_string',
            refreshToken: 'mock_refresh_token_string',
        };
    } else {
        // Simulate an API error
        throw new Error('Invalid username or password');
    }
};

/**
 * Simulates a register API call.
 */
export const register = async (
    username: string,
    email: string,
    password?: string,
    avatar?: File | null
): Promise<ApiUser> => {
    console.log('Registering new user:', { username, email, password, avatar });

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real application, you'd probably use FormData to send the avatar file
    // and the backend would return the newly created user object.
    const newUser: ApiUser = {
        id: Date.now().toString(),
        name: username,
        email: email,
        avatar: avatar ? URL.createObjectURL(avatar) : `https://ui-avatars.com/api/?name=${username}&background=random`,
    };

    // Simulate success
    return newUser;
};

/**
 * Simulates a call to refresh a token.
 * In a real app, this would send the refreshToken to an endpoint like /api/auth/refresh
 */
export const refreshToken = async (currentRefreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    console.log('Refreshing token:', currentRefreshToken);

    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate getting a new pair of tokens
    return {
        token: 'new_mock_jwt_token_string',
        refreshToken: 'new_mock_refresh_token_string',
    };
};
