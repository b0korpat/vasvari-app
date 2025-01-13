// filepath: /C:/Users/kopa/Desktop/asd/teszt/src/views/NewsPage.vue
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-toolbar class="seamless-toolbar">
        <ion-buttons slot="start">
          <ion-label class="large-text">Szia, XY!</ion-label>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon slot="icon-only" :icon="notifications" class="large-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ExploreContainer name="NewsPage" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonToolbar, IonButtons, IonButton, IonIcon, IonLabel } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import { notifications } from 'ionicons/icons';
</script>

<style scoped>
.seamless-toolbar {
  --background: transparent;
  --border-color: transparent;
  --ion-toolbar-background: transparent;
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