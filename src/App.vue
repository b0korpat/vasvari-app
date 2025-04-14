<template>
  <ion-app>
    <div v-if="showFallback" class="offline-fallback">
        <img class="offline-icon" src="../assets/no-wifi.png" alt="no internet">
      <h2>Nincs Internet kapcsolat!</h2>
      <p>A profil adatok nem elérhetőek. Kérjük, csatlakozz az internethez és jelentkezz be újra az alkalmazás offline használatához!</p>
    </div>

    <ion-router-outlet v-else></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, alertController } from '@ionic/vue';
import { onMounted, ref } from 'vue';

const UPDATE_CHECK_URL = "https://b0korpat.github.io/mobil_dist/update.json";
const CURRENT_APP_VERSION = `v0.1.2`;
const showFallback = ref(false);

onMounted(async () => {
  console.log(`App version ${CURRENT_APP_VERSION} loaded`);
  localStorage.setItem("currentVersion", CURRENT_APP_VERSION);

  if (!navigator.onLine) {
    const hasUserData = localStorage.getItem("firstName") &&
        localStorage.getItem("lastName") &&
        localStorage.getItem("email");

    if (!hasUserData) {
      console.log("Offline with no credentials - showing fallback UI");
      showFallback.value = true;
    }
  }

  if (navigator.onLine) {
    await checkForUpdates();
  }

  window.addEventListener('online', () => {
    showFallback.value = false;
    location.reload();
  });

  window.addEventListener('offline', () => {
    const hasUserData = localStorage.getItem("firstName") &&
        localStorage.getItem("lastName") &&
        localStorage.getItem("email");

    if (!hasUserData) {
      showFallback.value = true;
    }
  });
});

const checkForUpdates = async () => {
  if (!navigator.onLine) {
    console.log("Skipping update check - offline");
    return;
  }

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

<style scoped>
.offline-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.offline-icon {
  height: 250px;
  margin-bottom: 2rem;
}

.offline-fallback h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.offline-fallback p {
  font-size: 1rem;
  color: #666;
}
</style>