<template>
  <ion-app>
    <ion-router-outlet></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, alertController } from '@ionic/vue';
import { onMounted } from 'vue';


const updateUrl = "https://b0korpat.github.io/mobil_dist/update.json";
const currentVersion = "v0.0.3";
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
    header: "Frissítés elérhető",
    message: "Egy új veriója a VasváriAppnak elérhető. Kérlek frissítsd.",
    buttons: [
      { text: "Késöbb", role: "cancel" },
      { text: "Frissítés", handler: () => downloadUpdate(downloadUrl) }
    ]
  });
  await alert.present();
};

const downloadUpdate = (url: string) => {
  window.open(url, "_system");
};
</script>

<style>
</style>
