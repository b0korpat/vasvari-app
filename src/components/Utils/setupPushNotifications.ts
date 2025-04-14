import { CapacitorHttp } from '@capacitor/core';
import { Storage } from '@capacitor/storage';

export async function setupPushNotifications() {
    try {
        // Check if permission has already been granted
        const { value } = await Storage.get({ key: 'notificationsEnabled' });
        if (value === 'true') {
            console.log('Notifications are already enabled.');
            return;
        }

        const result = await PushNotifications.requestPermissions();
        if (result.receive === 'granted') {
            await PushNotifications.register();
            await Storage.set({ key: 'notificationsEnabled', value: 'true' });
            console.log('Push notifications granted and registered.');
        } else {
            await Storage.set({ key: 'notificationsEnabled', value: 'false' });
            console.log('Push notifications permission denied.');
        }

        // Add listeners for push notification events
        PushNotifications.addListener('registration', async (token) => {
            console.log('Push registration success, token:', token.value);
            await Storage.set({ key: 'userDeviceToken', value: token.value });
            sendFmcToServer(token.value);  // Send token as soon as it's received
        });

        PushNotifications.addListener('registrationError', (error) => {
            console.error('Push registration error:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push received:', notification);
            // Handle the notification (show a modal, update app state, etc.)
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push action performed:', notification);
            // Handle the action performed on the notification (e.g., navigate to a screen)
        });
    } catch (error) {
        console.error('Error setting up push notifications:', error);
    }
}

export const sendFmcToServer = async (deviceToken: string) => {
    try {
        const options = {
            url: 'https://api.vasvariapp.hu/Auth/add-device-token',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure cookies are included for iOS
            data: {
                deviceToken: deviceToken,
            },
        };

        const response = await CapacitorHttp.post(options);

        if (response.status === 200) {
            console.log('Token sent successfully');
        } else {
            console.error('Failed to send token:', response);
        }
    } catch (error) {
        console.error('Error sending token:', error);
    }
};

export async function disablePushNotifications() {
    try {
        await PushNotifications.unregister();
        await PushNotifications.removeAllListeners();
        await Storage.remove({ key: 'userDeviceToken' });
        await Storage.set({ key: 'notificationsEnabled', value: 'false' });
        console.log("Push notifications disabled.");
    } catch (error) {
        console.error("Error disabling push notifications:", error);
    }
}
