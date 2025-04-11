import {useUserStore} from '@/stores/user';


const API_BASE = 'https://api.vasvariapp.hu/auth';

const handleError = (error: unknown, context: string): null => {
    console.error(`Error ${context}:`, error);
    return null;
};

export const fetchUser = async () => {
    const userStore = useUserStore();

    try {
        const response = await fetch(`${API_BASE}/me`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch user data');

        const data = await response.json();
        if (!data?.claims || !data.email) throw new Error('Invalid user data');

        userStore.isAuthenticated = true;
        userStore.setUser({
            firstName: data.claims.firstName,
            lastName: data.claims.lastName,
            email: data.email,
            uid: data.uid,
        });

        return data;
    } catch (error) {
        return handleError(error, 'fetching user data');
    }
};

export const logout =  async () => {
    const userStore = useUserStore();

    try {
        const response = await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Logout failed');

        userStore.clearUser();
        userStore.isAuthenticated = false;


        document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        });
        console.log('Logout successful');
        location.reload();
        return true;
    } catch (error) {
        return handleError(error, 'during logout');
    }
};