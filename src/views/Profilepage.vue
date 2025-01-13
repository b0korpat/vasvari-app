// filepath: /C:/Users/kopa/Desktop/asd/teszt/src/views/ProfilePage.vue
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="profile-container">
        <h1>Profile Page</h1>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}
</style>