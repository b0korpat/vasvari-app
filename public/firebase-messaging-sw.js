import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
    apiKey: "AIzaSyB3gjzatRFitc5OBSkwpJTxwaHH1fbdo5w",
    authDomain: "vasvari-app.firebaseapp.com",
    projectId: "vasvari-app",
    storageBucket: "vasvari-app.firebasestorage.app",
    messagingSenderId: "737554021841",
    appId: "1:737554021841:android:e7dafa4d160e304a0034f0"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
    console.log("Received background message:", payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});