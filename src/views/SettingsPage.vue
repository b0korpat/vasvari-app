<template>
  <ion-page class="modal-animation">
    <ion-header>
      <ion-toolbar style="--background: var(--ion-color-navbar-background); --color: var(--ion-color-navbar-text);">
        <ion-buttons slot="start">
          <ion-back-button @click="dismissModal" default-href="/" />
        </ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-item style="--background: var(--ion-item-background);">
        <ion-label>Theme</ion-label>
        <ion-select v-model="selectedTheme">
          <ion-select-option value="system">System</ion-select-option>
          <ion-select-option value="light">Light</ion-select-option>
          <ion-select-option value="dark">Dark</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonButtons, IonBackButton, modalController } from '@ionic/vue';


const selectedTheme = ref(localStorage.getItem('theme') || 'system');

watch(selectedTheme, (newValue) => {
  localStorage.setItem('theme', newValue);
  location.reload();
});

const dismissModal = async () => {
  await modalController.dismiss();
};
</script>

<style scoped>
.modal-animation {
  animation: flyUp 0.3s ease-out;
}

@keyframes flyUp {
  from {
    transform: translateY(10%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>