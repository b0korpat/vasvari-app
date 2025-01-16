<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Update Password</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-item>
        <ion-label position="floating">New Password</ion-label>
        <ion-input v-model="newPassword" type="password"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating">Confirm New Password</ion-label>
        <ion-input v-model="confirmNewPassword" type="password"></ion-input>
      </ion-item>
      <ion-button expand="full" @click="updatePassword">Update Password</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonInput, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';

const newPassword = ref('');
const confirmNewPassword = ref('');
const router = useRouter();

const updatePassword = async () => {
  if (newPassword.value !== confirmNewPassword.value) {
    console.error('Passwords do not match');
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword.value });
  if (error) {
    console.error('Error updating password:', error.message);
  } else {
    console.log('Password updated successfully');
    router.push('/login');
  }
};
</script>
