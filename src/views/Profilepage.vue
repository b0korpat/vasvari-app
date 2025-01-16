<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-toolbar class="seamless-toolbar">
        <ion-buttons slot="start">
          <ion-label class="large-text">Szia, {{ first_name }}!</ion-label>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button @click="presentSettingsModal">
            <ion-icon slot="icon-only" :icon="settings" class="large-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <div class="page-load-animation">
        <div class="profile-info">
          <ion-icon :icon="personOutline" class="profile-icon"></ion-icon>
          <div class="user-details">
            <div class="user-name">{{ last_name }} {{ first_name }} </div>
            <div class="user-email">{{ email }}</div>
          </div>
        </div>
        <div class="logout-button" @click="goLogout">
          <ion-icon :icon="logOutOutline" class="logout-icon"></ion-icon>
          <span>Logout</span>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonToolbar, IonButtons, IonButton, IonIcon, IonLabel, modalController } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { settings, logOutOutline, personOutline } from 'ionicons/icons';
import { first_name, last_name, email, fetchUser, logout } from '@/components/AuthFunctions';
import SettingsPage from '@/views/SettingsPage.vue';

const router = useRouter();

const presentSettingsModal = async () => {
  const modal = await modalController.create({
    component: SettingsPage,
    cssClass: 'settings-modal',
    backdropDismiss: false // Prevent dismissing the modal by clicking the backdrop
  });

  // Add the inert attribute to the background content
  const ionRouterOutlet = document.querySelector('ion-router-outlet');
  if (ionRouterOutlet) {
    ionRouterOutlet.setAttribute('inert', 'true');
  }

  modal.onDidDismiss().then(() => {
    // Remove the inert attribute when the modal is dismissed
    if (ionRouterOutlet) {
      ionRouterOutlet.removeAttribute('inert');
    }
  });

  await modal.present();
};

const goLogout = () => {
  logout();
  router.push('/login');
};

onMounted(async () => {
  fetchUser();
});
</script>

<style scoped>
.seamless-toolbar {
  --background: transparent;
  --ion-toolbar-border-color: transparent;
  --box-shadow: none;
}
ion-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}
ion-content {
  --background: transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.large-text {
  font-size: 1.4em; /* Adjust the size as needed */
}
.large-icon {
  font-size: 2em; /* Adjust the size as needed */
}
.page-load-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.profile-info {
  display: flex;
  align-items: center;
  margin-top: 20px;
}
.profile-icon {
  font-size: 4em; /* Adjust the size as needed */
  margin-right: 16px;
}
.user-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.user-name {
  font-size: 1.2em;
  font-weight: bold;
}
.user-email {
  font-size: 1em;
  color: gray;
}
.logout-button {
  display: flex;
  align-items: center;
  color: red;
  cursor: pointer;
  font-size: 1.2em;
  margin-top: 20px;
}
.logout-icon {
  margin-right: 8px;
}
</style>