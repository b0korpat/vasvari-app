<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, alertController } from '@ionic/vue';
import { onMounted } from 'vue';


const UPDATE_CHECK_URL = "https://b0korpat.github.io/mobil_dist/update.json";
const CURRENT_APP_VERSION = `v0.1.2`;

onMounted(async () => {
  console.log(`App version ${CURRENT_APP_VERSION} loaded, checking for updates...`);
  localStorage.setItem("currentVersion", CURRENT_APP_VERSION);
  await checkForUpdates();
});

const checkForUpdates = async () => {
  try {
    const response = await fetch(UPDATE_CHECK_URL);

    if (!response.ok) {
      console.error(`Update check failed: ${response.status} ${response.statusText} when fetching ${UPDATE_CHECK_URL}`);
      return;
    }

    const updateInfo = await response.json();
    console.log("Update info received:", updateInfo);

    if (!updateInfo || !updateInfo.latest_version || !updateInfo.download_url) {
      console.error("Invalid update information received from server:", updateInfo);
      return;
    }

    const latestVersion = updateInfo.latest_version;
    const downloadUrl = updateInfo.download_url;

    if (CURRENT_APP_VERSION !== latestVersion) {
      console.log(`New version available: ${latestVersion}. Current: ${CURRENT_APP_VERSION}`);
      await showUpdateAlert(latestVersion, downloadUrl);
    } else {
      console.log("App is up to date.");
    }

  } catch (error) {
    console.error("Error during update check:", error);
  }
};

const showUpdateAlert = async (newVersion: string, downloadUrl: string) => {
  const alert = await alertController.create({
    header: "Frissítés elérhető",
    message: `Egy új verió (${newVersion}) a VasváriAppnak elérhető. Kérlek frissítsd.`,
    backdropDismiss: false,
    buttons: [
      {
        text: "Később",
        role: "cancel",
        handler: () => {
          console.log("Update postponed by user.");
        }
      },
      {
        text: "Frissítés",
        handler: () => {
          console.log(`User chose to update. Opening download URL: ${downloadUrl}`);
          openDownloadLink(downloadUrl);
        }
      }
    ]
  });
  await alert.present();
};

const openDownloadLink = (url: string) => {
  window.open(url, '_blank');
};
</script>

