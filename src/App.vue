<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, alertController } from '@ionic/vue';
import { onMounted } from 'vue';
import axios from 'axios';

// Define your update URL
const updateUrl = "https://b0korpat.github.io/mobil_dist/update.json";
const currentVersion = "1.0.0"; // Change this dynamically
localStorage.setItem("currentVersion", currentVersion);

onMounted(async () => {
  console.log("App loaded, checking for updates...");
  checkForUpdates();
});

const checkForUpdates = async () => {
  try {
    const response = await fetch(updateUrl);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    console.log("Update response:", data);

    const latestVersion = data.latest_version;
    const downloadUrl = data.download_url;

    if (currentVersion !== latestVersion) {
      showUpdateAlert(downloadUrl);
    }
  } catch (error) {
    console.error("Error checking updates:", error);
  }
};

const showUpdateAlert = async (downloadUrl: string) => {
  const alert = await alertController.create({
    header: "Update Available",
    message: "A new version is available. Would you like to update now?",
    buttons: [
      { text: "Later", role: "cancel" },
      { text: "Update", handler: () => downloadUpdate(downloadUrl) }
    ]
  });
  await alert.present();
};

const downloadUpdate = (url: string) => {
  window.open(url, "_system"); // Opens the APK download link in a browser
};
</script>

<style>
</style>
