<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-item>
        <ion-label position="floating">Email</ion-label>
        <ion-input v-model="email" type="email"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="floating">Password</ion-label>
        <ion-input v-model="password" type="password"></ion-input>
      </ion-item>
      <ion-button expand="full" @click="login">Login</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonInput, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';

const email = ref('');
const password = ref('');
const router = useRouter();

const login = async () => {
  const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });
  if (error) {
    console.error('Error logging in:', error.message);
  } else {
    router.push('/tabs/news');
  }
};
</script>
