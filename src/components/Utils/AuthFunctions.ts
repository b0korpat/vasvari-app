import {useUserStore} from '@/stores/user';


const API_BASE = 'https://api.vasvariapp.hu/auth';

const handleError = (error: unknown, context: string): null => {
    console.error(`Error ${context}:`, error);
    return null;
};

// Import CapacitorHttp in AuthFunctions.ts
import { CapacitorHttp} from '@capacitor/core';

export const fetchUser = async () => {
    const userStore = useUserStore();

    try {
        const options = {
            url: 'https://api.vasvariapp.hu/auth/me',
            headers: {
                'Content-Type': 'application/json'
            },

        };

        const response = await CapacitorHttp.get(options);

        if (response.status >= 200 && response.status < 300 && response.data) {
            const data = response.data;

            if (data.claims && data.email) {
                localStorage.setItem("loggedOut", "false");
                userStore.isAuthenticated = true;
                userStore.setUser({
                    firstName: data.claims.firstName,
                    lastName: data.claims.lastName,
                    email: data.email,
                    uid: data.uid,
                });



                return data;
            }
        }
        throw new Error("Failed to fetch user data");
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

export const refreshToken = async (): Promise<boolean> => {
    console.log("Attempting to refresh token...");
    try {
        const options = {
            url: `${API_BASE}/refresh`,
            headers: {
                'Content-Type': 'application/json'
            },
        };

        const response = await CapacitorHttp.post(options);

        if (response.status >= 200 && response.status < 300) {
            console.log("Token refreshed successfully.");

            return true;
        } else {
            console.error(`Token refresh failed with status: ${response.status}`);
            const userStore = useUserStore();
            userStore.clearUser();
            userStore.isAuthenticated = false;
            localStorage.setItem("loggedOut", "true");
            location.reload();
            return false;
        }
    } catch (error) {
        console.error("Error during token refresh:", error);
        const userStore = useUserStore();
        userStore.clearUser();
        userStore.isAuthenticated = false;
        localStorage.setItem("loggedOut", "true");
        location.reload();
        return false;
    }
};

export const logout =  async () => {
    const userStore = useUserStore();
    try {
        const options = {
            url: `${API_BASE}/logout`,
            headers: {
                'Content-Type': 'application/json'
            },
        };

        const response = await CapacitorHttp.post(options);

        if (response.status < 200 || response.status >= 300) throw new Error('Logout failed');

        userStore.clearUser();
        userStore.isAuthenticated = false;



        document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        });
        console.log('Logout successful');
        localStorage.setItem("loggedOut", "true");
        location.reload();
        return true;
    } catch (error) {
        userStore.clearUser();
        userStore.isAuthenticated = false;
        document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        });
        localStorage.setItem("loggedOut", "true");
        location.reload();
        return handleError(error, 'during logout');
    }
};