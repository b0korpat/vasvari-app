<template>
  <ion-page>
    <ion-content class="center-content">
      <div class="login-container">
        <div class="logo-container">
          <img src="../../assets/icon.png" alt="Logo" class="app-logo" />
        </div>

        <h1 class="login-title">Bejelentkezés</h1>

        <form class="login-form" @submit.prevent="login">
          <ion-item class="input-item">
            <ion-icon
              slot="start"
              :icon="mailOutline"
              class="input-icon"
            ></ion-icon>
            <ion-input
              v-model="email"
              label="Email"
              label-placement="floating"
              placeholder="email@domain.com"
              type="email"
              @input="validateEmailField"
              required
            />
          </ion-item>
          <transition name="fade">
            <div v-if="errorMessage.email" class="error-message">
              <ion-icon
                :icon="alertCircleOutline"
                class="error-icon"
              ></ion-icon>
              {{ errorMessage.email }}
            </div>
          </transition>

          <ion-item class="input-item">
            <ion-icon
              slot="start"
              :icon="lockClosed"
              class="input-icon"
            ></ion-icon>
            <ion-input
              v-model="password"
              label="Jelszó"
              label-placement="floating"
              placeholder="Jelszó"
              :type="passwordVisible ? 'text' : 'password'"
              @input="validatePasswordField"
              required
            >
            </ion-input>
            <ion-button
              slot="end"
              fill="clear"
              @click="togglePasswordVisibility"
            >
              <ion-icon :icon="passwordVisible ? eyeOff : eye"></ion-icon>
            </ion-button>
          </ion-item>
          <transition name="fade">
            <div v-if="errorMessage.password" class="error-message">
              <ion-icon
                :icon="alertCircleOutline"
                class="error-icon"
              ></ion-icon>
              {{ errorMessage.password }}
            </div>
          </transition>

          <ion-button
            expand="block"
            type="submit"
            :disabled="isLoading"
            class="login-btn"
          >
            <template v-if="!isLoading">Bejelentkezés</template>
            <ion-spinner v-else name="crescent"></ion-spinner>
          </ion-button>

          <div class="forgot-password">
            <ion-button fill="clear" size="small" @click="forgotPassword">
              Elfelejtetted a jelszavad?
            </ion-button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonPage,
  IonSpinner,
} from "@ionic/vue";
import {
  alertCircleOutline,
  lockClosed,
  mailOutline,
  eye,
  eyeOff,
} from "ionicons/icons";
import { setupPushNotifications } from "@/components/setupPushNotifications";
import { fetchUser } from "@/components/AuthFunctions";
import { toastController } from "@ionic/vue";

const isLoading = ref(false);
const email = ref("");
const password = ref("");

const errorMessage = ref({
  email: "",
  password: "",
});

const router = useRouter();

const passwordVisible = ref(false);

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateEmailField = () => {
  if (!email.value) {
    errorMessage.value.email = "Az email mező kitöltése kötelező";
  } else if (!validateEmail(email.value)) {
    errorMessage.value.email = "Érvénytelen email formátum";
  } else {
    errorMessage.value.email = "";
  }
};

const validatePasswordField = () => {
  if (!password.value) {
    errorMessage.value.password = "A jelszó mező kitöltése kötelező";
  } else {
    errorMessage.value.password = "";
  }
};

const login = async () => {
  validateEmailField();
  validatePasswordField();

  if (errorMessage.value.email || errorMessage.value.password) {
    return;
  }

  isLoading.value = true;

  try {
    const response = await fetch(
        "https://api.vasvariapp.hu/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          }),
        }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("Sikeres bejelentkezés:", data);

      try {
        await setupPushNotifications();
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
      await fetchUser();
      await router.push("/tabs/home");
    } else {
      console.error("Sikertelen bejelentkezés:", data);
      errorMessage.value.password = "Hibás email cím vagy jelszó";
    }
  } catch (error) {
    console.error("Network error:", error);
    const toast = await toastController.create({
      message:
          "Hiba történt a bejelentkezés során. Ellenőrizd az internetkapcsolatot.",
      duration: 3000,
      position: "bottom",
      color: "danger",
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const sendPasswordResetEmail = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(
      "https://api.vasvariapp.hu/Auth/forgotpassword",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.value,
        }),
      }
    );

    if (response.ok) {
      const toast = await toastController.create({
        message: "Jelszó helyreállítás elküldve, nézd meg az emaileidet",
        duration: 3000,
        position: "bottom",
        color: "success",
      });
      await toast.present();
    } else {
      const errorData = await response.json();
      const toast = await toastController.create({
        message: errorData.message || "Sikertelen jelszó helyreállítás",
        duration: 3000,
        position: "bottom",
        color: "danger",
      });
      await toast.present();
    }
  } catch (error) {
    console.error("Error:", error);
    const toast = await toastController.create({
      message: "Hiba történt a kérés során",
      duration: 3000,
      position: "bottom",
      color: "danger",
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const forgotPassword = () => {
  if (!email.value) {
    errorMessage.value.email = "Kérlek add meg az emailcímed";
  } else if (!validateEmail(email.value)) {
    errorMessage.value.email = "Érvénytelen email formátum";
  } else {
    sendPasswordResetEmail();
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  max-width: 400px;
  margin: auto;
  height: 100%;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.app-logo {
  width: 100px;
  height: auto;
}

.login-title {
  text-align: center;
  font-weight: 600;
  font-size: 24px;
  margin-bottom: 24px;
}

.login-form {
  width: 100%;
}

.input-item {
  --border-radius: 12px;
  --border-color: transparent;
  --background: var(--ion-card-background, transparent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0);
  margin-bottom: 12px;
}

.input-icon {
  font-size: 1.2rem;
  color: var(--ion-color-medium);
}

.error-message {
  display: flex;
  align-items: center;
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin-top: 4px;
  padding-left: 8px;
  padding-bottom: 8px;
}

.error-icon {
  margin-right: 6px;
}

.login-btn {
  margin-top: 24px;
  height: 48px;
  --border-radius: 24px;
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.4);
}

.forgot-password {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
