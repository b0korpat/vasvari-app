import {useUserStore} from '@/stores/user';

const API_BASE = 'https://backend-production-f2dd.up.railway.app/auth';

const handleError = (error: unknown, context: string): null => {
    console.error(`Error ${context}:`, error);
    return null;
};

export const fetchUser = async () => {
    const userStore = useUserStore();

    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };


        const response = await fetch(`${API_BASE}/me`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${userStore.token}`
            },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');

        const data = await response.json();
        if (!data?.claims || !data.email) throw new Error('Invalid user data');

        // Set user data
        userStore.setUser({
            firstName: data.claims.firstName,
            lastName: data.claims.lastName,
            email: data.email,
        });

        // Save new token if provided
        if (data.token && data.uid) {
            userStore.setAuthData({
                uid: data.uid,
                token: data.token
            });
        }

        return data;
    } catch (error) {
        return handleError(error, 'fetching user data');
    }
};

export const logout = async (): Promise<boolean | null> => {
    const userStore = useUserStore();

    try {
        const response = await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${userStore.token}`
            },
        });

        if (!response.ok) throw new Error('Logout failed');

        userStore.clearUser();
        console.log('Logout successful');
        return true;
    } catch (error) {
        userStore.clearUser();
        return handleError(error, 'during logout');
    }
};