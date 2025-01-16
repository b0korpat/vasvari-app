<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-toolbar class="seamless-toolbar">
        <ion-buttons slot="start">
          <ion-label class="large-text">Szia, {{ first_name }}!</ion-label>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button @click="goToSettings">
            <ion-icon slot="icon-only" :icon="settings" class="large-icon"></ion-icon>
          </ion-button>
          <ion-button @click="goLogout">Logout</ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-button @click="gotoregister">Logout</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonToolbar, IonButtons, IonButton, IonIcon, IonLabel } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { settings } from 'ionicons/icons';
import {first_name, fetchFullName, logout} from '@/components/AuthFunctions'

const router = useRouter();

const goToSettings = () => {
  router.push('/tabs/settings');
};

const gotoregister = () => {
  router.push('/register');
};

const goLogout = () => {
  logout();
  router.push('/login');
};

onMounted(async () => {
  fetchFullName();
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
}
.large-text {
  font-size: 1.4em; /* Adjust the size as needed */
}

.large-icon {
  font-size: 2em; /* Adjust the size as needed */
}
</style>