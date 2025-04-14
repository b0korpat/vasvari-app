import { useUserStore } from '@/stores/user';
import { CapacitorHttp } from '@capacitor/core';

const API_BASE = 'https://api.vasvariapp.hu/auth';

const handleError = (error: unknown, context: string): null => {
    console.error(`Error ${context}:`, error);
    return null;
};

// Fetch user details
export const fetchUser = async () => {
    const userStore = useUserStore();

    try {
        const options = {
            url: 'https://api.vasvariapp.hu/auth/me',
            headers: {
                'Content-Type': 'application/json',
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

// Logout function
export const logout = async () => {
    const userStore = useUserStore();

    try {
        // Use CapacitorHttp for logout request to ensure cookie handling
        const options = {
            url: `${API_BASE}/logout`,
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
        };

        const response = await CapacitorHttp.post(options);

        if (response.status >= 200 && response.status < 300) {
            userStore.clearUser();
            userStore.isAuthenticated = false;

            // Since cookies are automatically handled by CapacitorHttp, you don't need to manually clear them in this case.
            console.log('Logout successful');
            localStorage.setItem("loggedOut", "true");
            location.reload();  // Or you can handle routing/logout in another way without page reload
            return true;
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        userStore.clearUser();
        userStore.isAuthenticated = false;

        // Clear cookies manually if necessary (but CapacitorHttp should do this automatically)
        console.log("Logout failed:", error);
        localStorage.setItem("loggedOut", "true");
        location.reload();
        return handleError(error, 'during logout');
    }
};
