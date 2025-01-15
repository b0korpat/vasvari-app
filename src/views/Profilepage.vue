<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-toolbar class="seamless-toolbar">
        <ion-buttons slot="start">
          <ion-label class="large-text">Szia, {{ username }}!</ion-label>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button @click="goToSettings">
            <ion-icon slot="icon-only" :icon="settings" class="large-icon"></ion-icon>
          </ion-button>
          <ion-button @click="logout">Logout</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonToolbar, IonButtons, IonButton, IonIcon, IonLabel } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';
import { settings } from 'ionicons/icons';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const username = ref<string>(userStore.username);

const goToSettings = () => {
  router.push('/tabs/settings');
};

const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error.message);
  } else {
    userStore.clearUser();
    router.push('/login');
  }
};

onMounted(async () => {
  if (!userStore.username) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('usernames')
        .select('username')
        .eq('userid', user.id)
        .single();
      if (error) {
        console.error('Error fetching username:', error.message);
      } else {
        userStore.setUsername(data.username);
        username.value = data.username;
      }
    } else {
      console.error('No user is logged in');
    }
  }
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