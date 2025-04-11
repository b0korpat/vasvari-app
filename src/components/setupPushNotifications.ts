import {PushNotifications} from '@capacitor/push-notifications';


export async function setupPushNotifications() {
    const result = await PushNotifications.requestPermissions();
    if (result.receive === 'granted') {
        await PushNotifications.register();
        localStorage.setItem('notificationsEnabled', 'true');
    } else {
        localStorage.setItem('notificationsEnabled', 'false');
    }

    PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token:', token.value);
        localStorage.setItem('userDeviceToken', token.value);

    });

    PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed:', notification);
    });
}

export const sendFmcToServer = async () => {
    setTimeout(async () => {
        try {
            const response = await fetch("https://api.vasvariapp.hu/Auth/add-device-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify({
                    deviceToken: localStorage.getItem("userDeviceToken"),
                }),
            });
            if (response.ok) {
                console.log('Token sent successfully');
            } else {
                console.error('Failed to send token:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending token:', error);
        }
    }, 3000);
};


export async function disablePushNotifications() {
    try {
        await PushNotifications.unregister();
        await PushNotifications.removeAllListeners();
        console.log("Push notifications disabled.");
    } catch (error) {
        console.error("Error disabling push notifications:", error);
    }
}