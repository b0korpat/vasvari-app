<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <TopBar />

      <div class="page-content page-load-animation">
        <ProfileCard
            :firstName="userStore.firstName"
            :lastName="userStore.lastName"
            :email="userStore.email"
        />

        <SettingsCard
            :selectedTheme="selectedTheme"
            :defaultPage="defaultPage"
            :showBreaks="showBreaksBetweenLessons"
            :dynamicLessonNumber="isDynamicLessonNumber"
            :notificationsEnabled="isNotificationsEnabled"
            @showThemeOptions="presentThemeActionSheet"
            @showDefaultPageOptions="presentDefaultPageActionSheet"
            @toggleBreaks="toggleBreaksDisplay"
            @toggleDynamicLessonNumber="toggleDynamicLessonNumber"
            @toggleNotifications="toggleNotifications"
        />

        <ion-button expand="block" color="danger" class="logout-button" @click="goLogout">
          <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
          Kijelentkezés
        </ion-button>
        <div class="version-number">{{ currentVersion }}</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { actionSheetController, IonButton, IonContent, IonIcon, IonPage } from '@ionic/vue';
import { ref, onMounted, version } from 'vue';
import { useRouter } from 'vue-router';
import {
  calendarOutline,
  close,
  homeOutline,
  logOutOutline,
  moon,
  phonePortrait,
  sunny
} from 'ionicons/icons';
import { useUserStore } from '@/stores/user';
import { logout } from '@/components/Utils/AuthFunctions';
import { disablePushNotifications, sendFmcToServer, setupPushNotifications } from '@/components/Utils/setupPushNotifications';
import TopBar from "@/components/TopBar.vue";
import ProfileCard from "@/components/ProfileComponents/ProfileCard.vue";
import SettingsCard from "@/components/ProfileComponents/SettingsCard.vue";
import { applyTheme } from "@/components/Utils/themeChange";

const currentVersion = localStorage.getItem('currentVersion') || version;
const userStore = useUserStore();
const router = useRouter();

const selectedTheme = ref(localStorage.getItem('theme') || 'system');
const defaultPage = ref(localStorage.getItem('defaultPage') || 'home');
const isDynamicLessonNumber = ref(localStorage.getItem('isDynamicLessonNumber') === 'true');
const isNotificationsEnabled = ref(localStorage.getItem('notificationsEnabled') === 'true');
const showBreaksBetweenLessons = ref(localStorage.getItem('showBreaksBetweenLessons') === 'true');

onMounted(async () => {
  if (isNotificationsEnabled.value) {
    await setupPushNotifications();
    await sendFmcToServer();
  }
});

const toggleBreaksDisplay = (event: { detail: { checked: boolean } }) => {
  const isEnabled = event.detail.checked;
  showBreaksBetweenLessons.value = isEnabled;
  localStorage.setItem('showBreaksBetweenLessons', isEnabled.toString());
};

const toggleDynamicLessonNumber = (event: { detail: { checked: boolean } }) => {
  const isEnabled = event.detail.checked;
  isDynamicLessonNumber.value = isEnabled;
  localStorage.setItem('isDynamicLessonNumber', isEnabled.toString());
};

const toggleNotifications = async (event: { detail: { checked: boolean } }) => {
  const isEnabled = event.detail.checked;
  isNotificationsEnabled.value = isEnabled;
  localStorage.setItem('notificationsEnabled', isEnabled.toString());

  if (isEnabled) {
    await setupPushNotifications();
    await sendFmcToServer();
  } else {
    await disablePushNotifications();
  }
};

const presentThemeActionSheet = async () => {
  const actionSheet = await actionSheetController.create({
    header: 'Válassz témát',
    buttons: [
      { text: 'Rendszer', icon: phonePortrait, handler: () => changeTheme('system') },
      { text: 'Világos', icon: sunny, handler: () => changeTheme('light') },
      { text: 'Sötét', icon: moon, handler: () => changeTheme('dark') },
      { text: 'Mégse', role: 'cancel', icon: close },
    ],
  });
  await actionSheet.present();
};

const presentDefaultPageActionSheet = async () => {
  const actionSheet = await actionSheetController.create({
    header: 'Válassz alapértelmezett oldalt',
    buttons: [
      { text: 'Kezdőlap', icon: homeOutline, handler: () => changeDefaultPage('home') },
      { text: 'Órarend', icon: calendarOutline, handler: () => changeDefaultPage('timetable') },
      { text: 'Mégse', role: 'cancel', icon: close },
    ],
  });
  await actionSheet.present();
};

const changeTheme = (theme: string) => {
  selectedTheme.value = theme;
  localStorage.setItem('theme', theme);
  applyTheme(theme);
};

const changeDefaultPage = (page: string) => {
  defaultPage.value = page;
  localStorage.setItem('defaultPage', page);

  const currentRoute = router.currentRoute.value;
  if (currentRoute.path === '/tabs/home' && page === 'timetable') {
    router.replace('/tabs/timetable');
  } else if (currentRoute.path === '/tabs/timetable' && page === 'home') {
    router.replace('/tabs/home');
  }
};

const goLogout = async () => {
  await logout();
};
</script>

<style scoped>
.page-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.logout-button {
  margin: 16px 0;
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
}

.version-number {
  text-align: center;
  font-size: 0.8rem;
  color: #7a7a7a;
  margin-top: 8px;
}
</style>