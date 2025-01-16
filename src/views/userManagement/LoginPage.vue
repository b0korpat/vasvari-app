<template>
  <ion-page>
    <ion-content>
      <div class="title-container">
        <h1>Login</h1>
      </div>

      <!-- Email Input with Icon -->
      <ion-item>
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
      <transition name="fade">
        <div v-if="errorMessage.email" class="error-message">{{ errorMessage.email }}</div>
      </transition>

      <!-- Password Input with Icon and Toggle -->
      <ion-item>
        <ion-input
          v-model="password"
          @input="validatePasswordField"
          label-placement="stacked"
          label="Jelszó"
          type="password"
          placeholder="Jelszó"
        >
          <ion-icon slot="start" :icon="lockClosed" aria-hidden="true"></ion-icon>
          <ion-button fill="clear" slot="end" aria-label="Show/hide">
            <ion-input-password-toggle slot="end"></ion-input-password-toggle>
          </ion-button>
        </ion-input>
      </ion-item>
      <transition name="fade">
        <div v-if="errorMessage.password" class="error-message">{{ errorMessage.password }}</div>
      </transition>

      <!-- Forgot Password Button -->
      <ion-button expand="full" fill="clear" @click="forgotPassword">Elfelejtetted a jelszavad?</ion-button>

      <!-- Confirmation Message -->
      <transition name="fade">
        <div v-if="confirmationMessage" :class="confirmationMessageClass">{{ confirmationMessage }}</div>
      </transition>

      <!-- Login Button -->
      <div class="login-button">
        <ion-button expand="full" shape="round" @click="login">Bejelentkezés</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { mailOutline, lockClosed } from 'ionicons/icons';
import { IonInput, IonButton, IonContent, IonItem } from '@ionic/vue';
import { ref, computed  } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';

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
  } else if (password.value.length < 6) {
    errorMessage.value.password = 'A jelszónak legalább 6 karakter hosszúnak kell lennie';
  } else {
    errorMessage.value.password = '';
  }
};

const login = async () => {
  validateEmailField();
  validatePasswordField();

  if (errorMessage.value.email || errorMessage.value.password) {
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });
  if (error) {
    errorMessage.value.password = 'Helytelen email vagy jelszó';
  } else {
    router.push('/tabs/news');
    location.reload();
  }
};

const forgotPassword = async () => {
  validateEmailField();

  if (errorMessage.value.email) {
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.value);
  if (error) {
    confirmationMessage.value = 'Hiba az email küldéssel: ' + error.message;
  } else {
    confirmationMessage.value = 'Jelszó helyreállító email elküldve';
  }
};

// Computed property to determine the confirmation message color
const confirmationMessageClass = computed(() => {
  return confirmationMessage.value && confirmationMessage.value.startsWith("Hiba")
    ? "confirmation-message error"
    : "confirmation-message success";
});

</script>

<style scoped>
.title-container {
  display: flex;
  justify-content: center;
  margin-top: 20vh;
  margin-bottom: 25px;
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

.error-message {
  color: red;
  font-size: 0.9rem;
  margin: auto auto auto 10%;
  width: 90%;
}

.confirmation-message {
  font-size: 0.9rem;
  margin: auto auto auto 10%;
  width: 90%;
}

.confirmation-message.success {
  color: green;
}

.confirmation-message.error {
  color: red;
}
</style>
