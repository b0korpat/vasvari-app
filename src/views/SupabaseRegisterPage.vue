<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Register</ion-title>
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
      <ion-item>
        <ion-label position="floating">Username</ion-label>
        <ion-input v-model="username" type="text"></ion-input>
      </ion-item>
      <ion-button expand="full" @click="register">Register</ion-button>
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
const username = ref('');
const router = useRouter();

const register = async () => {
  const { data, error } = await supabase.auth.signUp({ email: email.value, password: password.value });
  if (error) {
    console.error('Error registering:', error.message);
  } else {
    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase
        .from('usernames')
        .insert([{ userid: user.id, username: username.value }]);
      if (insertError) {
        console.error('Error inserting username:', insertError.message);
      } else {
        router.push('/login');
      }
    }
  }
};
</script>
