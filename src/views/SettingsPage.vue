<template>
    <ion-page>
      <ion-header>
        <ion-toolbar style="--background: var(--ion-color-navbar-background); --color: var(--ion-color-navbar-text);">
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
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/vue';
  
  const selectedTheme = ref(localStorage.getItem('theme') || 'system');
  
  watch(selectedTheme, (newValue) => {
    localStorage.setItem('theme', newValue);
    location.reload();
  });

  
  </script>
  
  <style scoped>
  </style>