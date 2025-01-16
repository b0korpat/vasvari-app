<template>
  <ion-page>
    <ion-content>
      <div class="title-container">
        <h1>Registráció</h1>
      </div>
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

      <ion-item>
        <ion-input
          v-model="confirmPassword"
          @input="validateConfirmPasswordField"
          label-placement="stacked"
          label="Jelszó megerősítése"
          type="password"
          placeholder="Jelszó megerősítése"
        >
          <ion-icon slot="start" :icon="lockClosed" aria-hidden="true"></ion-icon>
        </ion-input>
      </ion-item>
      <transition name="fade">
        <div v-if="errorMessage.confirmPassword" class="error-message">{{ errorMessage.confirmPassword }}</div>
      </transition>

      <ion-item>
        <ion-input
          v-model="lastName"
          @input="validateLastNameField"
          label-placement="stacked"
          label="Vezetéknév"
          type="text"
          placeholder="Vezetéknév"
        >
          <ion-icon slot="start" :icon="personOutline" aria-hidden="true"></ion-icon>
        </ion-input>
      </ion-item>
      <transition name="fade">
        <div v-if="errorMessage.lastName" class="error-message">{{ errorMessage.lastName }}</div>
      </transition>

      <ion-item>
        <ion-input
          v-model="firstName"
          @input="validateFirstNameField"
          label-placement="stacked"
          label="Keresztnév"
          type="text"
          placeholder="Keresztnév"
        >
          <ion-icon slot="start" :icon="personOutline" aria-hidden="true"></ion-icon>
        </ion-input>
      </ion-item>
      <transition name="fade">
        <div v-if="errorMessage.firstName" class="error-message">{{ errorMessage.firstName }}</div>
      </transition>

      <div class="register-button">
        <ion-button expand="full" shape="round" @click="register">Regisztrálás</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonInput, IonButton, IonContent, IonPage, IonItem, IonIcon } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';
import { mailOutline, lockClosed, personOutline } from 'ionicons/icons';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const firstName = ref('');
const lastName = ref('');
const errorMessage = ref({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: ''
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

const validateConfirmPasswordField = () => {
  if (!confirmPassword.value) {
    errorMessage.value.confirmPassword = 'A jelszó megerősítése kötelező';
  } else if (password.value !== confirmPassword.value) {
    errorMessage.value.confirmPassword = 'A jelszavak nem egyeznek';
  } else {
    errorMessage.value.confirmPassword = '';
  }
};

const validateLastNameField = () => {
  if (!lastName.value) {
    errorMessage.value.lastName = 'A vezetéknév mező kitöltése kötelező';
  } else if (lastName.value.length < 3) {
    errorMessage.value.lastName = 'A vezetéknévnek legalább 3 karakter hosszúnak kell lennie';
  } else {
    errorMessage.value.lastName = '';
  }
};

const validateFirstNameField = () => {
  if (!firstName.value) {
    errorMessage.value.firstName = 'A keresztnév mező kitöltése kötelező';
  } else if (firstName.value.length < 3) {
    errorMessage.value.firstName = 'A keresztnévnek legalább 3 karakter hosszúnak kell lennie';
  } else {
    errorMessage.value.firstName = '';
  }
};

const register = async () => {
  validateEmailField();
  validatePasswordField();
  validateConfirmPasswordField();
  validateLastNameField();
  validateFirstNameField();

  if (Object.values(errorMessage.value).some(msg => msg)) {
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email: email.value, password: password.value });
  if (error) {
    errorMessage.value.email = 'Hiba történt a regisztráció során: ' + error.message;
  } else {
    const user = data.user;
    if (user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ first_name: firstName.value, last_name: lastName.value })
        .eq('id', user.id);
      if (updateError) {
        errorMessage.value.firstName = 'Hiba történt a felhasználói adatok frissítése során: ' + updateError.message;
      } else {
        router.push('/login');
      }
    }
  }
};
</script>

<style scoped>
.title-container {
  display: flex;
  justify-content: center;
  margin-top: 10vh;
  margin-bottom: 25px;
}

.register-button {
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
</style>
