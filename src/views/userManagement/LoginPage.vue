<template>
  <ion-page>
    <ion-content>
      <div class="title-container">
        <h1>Bejelentkezés</h1>
      </div>

      <!-- Email Input with Icon -->
      <ion-item class="input-item">
        <ion-input
          v-model="email"
          @input="validateEmailField"
          label-placement="stacked"
          label="Email"
          type="email"
          placeholder="email@domain.com"
        >
          <ion-icon slot="start" :icon="mailOutline" aria-hidden="true"></ion-icon>
        </ion-input>
      </ion-item>
      <div class="error-container">
        <transition name="fade">
          <div v-if="errorMessage.email" class="error-message">{{ errorMessage.email }}</div>
        </transition>
      </div>

      <!-- Password Input with Icon and Toggle -->
      <ion-item class="input-item">
        <ion-input
          v-model="password"
          @input="validatePasswordField"
          label-placement="stacked"
          label="Jelszó"
          type="password"
          placeholder="Jelszó"
        >
          <ion-icon slot="start" :icon="lockClosed" aria-hidden="true"></ion-icon>
          <ion-input-password-toggle slot="end"></ion-input-password-toggle>
        </ion-input>
      </ion-item>
      <div class="error-container">
        <transition name="fade">
          <div v-if="errorMessage.password" class="error-message">{{ errorMessage.password }}</div>
        </transition>
      </div>

      <!-- Login Button -->
      <div class="login-button">
        <ion-button expand="full" shape="round" @click="login">
          <template v-if="!isLoading">Bejelentkezés</template>
          <template v-else>
            <ion-spinner name="crescent"></ion-spinner>
          </template>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { mailOutline, lockClosed } from 'ionicons/icons';
import { IonInput, IonButton, IonContent, IonItem } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';

const isLoading = ref(false);

const email = ref('');
const password = ref('');
var confirmationMessage = ref('');
const errorMessage = ref({
  email: '',
  password: '',
});

const router = useRouter();

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateEmailField = () => {
  if (!email.value) {
    errorMessage.value.email = 'Az email mező kitöltése kötelező';
  } else if (!validateEmail(email.value)) {
    errorMessage.value.email = 'Érvénytelen email formátum';
  } else {
    errorMessage.value.email = '';
  }
};

const validatePasswordField = () => {
  if (!password.value) {
    errorMessage.value.password = 'A jelszó mező kitöltése kötelező';
  } else {
    errorMessage.value.password = '';
  }
};

const login = async () => {
  isLoading.value = true;
  validateEmailField();
  validatePasswordField();

  if (errorMessage.value.email || errorMessage.value.password) {
    isLoading.value = false;
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    errorMessage.value.password = 'Helytelen email vagy jelszó';
    isLoading.value = false;
  } else {
    router.push('/tabs/news');
    location.reload();
  }
};
</script>

<style scoped>
* {
  padding: 0px;
  margin: 0px;
}

.title-container {
  display: flex;
  justify-content: center;
  margin-top: 30vh;
}

.login-button {
  width: 60%;
  margin: auto;
  margin-top: 20px;
}

ion-button {
  height: 50px;
}

ion-item {
  margin: auto;
  margin-bottom: 10px;
  margin-top: 15px;
  width: 90%;
  --border-radius: 20px;
  --background: transparent;
}

ion-input {
  height: 60px;
}

.input-item {
  width: 90%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.error-container {
  min-height: 1em;
}

.error-message {
  color: red;
  font-size: 0.9rem;
  margin-left: 10%;
  width: 90%;
}

.confirmation-message {
  font-size: 0.9rem;
  margin-left: 21%;
  width: 90%;
}
.confirmation-message.success {
  color: green;
}
.confirmation-message.error {
  color: red;
}
.forgot-password-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>