<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <TopBar />

      <div class="page-content page-load-animation">
        <ion-card class="profile-card">
          <div class="profile-header">
            <ion-avatar class="profile-avatar" @click="showPhotoActionSheet">
              <img v-if="profileImage" :src="profileImage" alt="Profile" />
              <div v-else class="initials-avatar">{{ userInitials }}</div>
              <div class="edit-avatar-indicator">
                <ion-icon :icon="cameraOutline" class="edit-icon"></ion-icon>
              </div>
            </ion-avatar>
            <div class="user-info">
              <h2 class="user-name">{{ userStore.displayLastName }} {{ userStore.displayFirstName }}</h2>
              <p class="user-email">{{ userStore.email }}</p>
            </div>
          </div>
        </ion-card>

        <ion-card class="settings-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="settingsOutline" class="section-icon"></ion-icon>
              Beállítások
            </ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <ion-list lines="full">
              <ion-item @click="presentThemeActionSheet" detail>
                <ion-icon :icon="colorPalette" slot="start" class="item-icon"></ion-icon>
                <ion-label>Téma</ion-label>
                <ion-chip slot="end" class="theme-chip">{{ themeLabel }}</ion-chip>
              </ion-item>

              <ion-item @click="presentDefaultPageActionSheet" detail>
                <ion-icon :icon="homeOutline" slot="start" class="item-icon"></ion-icon>
                <ion-label>Alapértelmezett oldal</ion-label>
                <ion-chip slot="end" class="default-page-chip">{{ defaultPageLabel }}</ion-chip>
              </ion-item>

              <ion-item>
                <ion-icon :icon="timeOutline" slot="start" class="item-icon"></ion-icon>
                <ion-label>Szünetek megjelenítése órarenden</ion-label>
                <ion-toggle slot="end" :checked="showBreaksBetweenLessons" @ionChange="toggleBreaksDisplay"></ion-toggle>
              </ion-item>

              <ion-item>
                <ion-icon :icon="notificationsOutline" slot="start" class="item-icon"></ion-icon>
                <ion-label>Értesítések engedélyezése</ion-label>
                <ion-toggle slot="end" :checked="isNotificationsEnabled" @ionChange="toggleNotifications"></ion-toggle>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-button expand="block" color="danger" class="logout-button" @click="goLogout">
          <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
          Kijelentkezés
        </ion-button>
        <div class="version-number">{{currentVersion}}</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  actionSheetController,
  IonAvatar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToggle,
} from '@ionic/vue';
import {computed, onMounted, ref, version} from 'vue';
import {useRouter} from 'vue-router';
import {
  calendarOutline,
  camera,
  cameraOutline,
  close,
  colorPalette,
  home as homeOutline,
  image,
  logOutOutline,
  moon,
  notificationsOutline,
  phonePortrait,
  settingsOutline,
  sunny,
  timeOutline,
  trash
} from 'ionicons/icons';
import {useUserStore} from '@/stores/user';
import {logout} from '@/components/AuthFunctions';
import {disablePushNotifications, sendFmcToServer, setupPushNotifications} from '@/components/setupPushNotifications';
import TopBar from "@/components/TopBar.vue";
import {applyTheme} from "@/components/themeChange";
import {Camera, CameraResultType, CameraSource} from '@capacitor/camera';

const currentVersion = localStorage.getItem('currentVersion') || version;
const userStore = useUserStore();
const router = useRouter();
const selectedTheme = ref(localStorage.getItem('theme') || 'system');
const defaultPage = ref(localStorage.getItem('defaultPage') || 'home');
const isNotificationsEnabled = ref(localStorage.getItem('notificationsEnabled') === 'true');
const showBreaksBetweenLessons = ref(localStorage.getItem('showBreaksBetweenLessons') === 'true');
const profileImage = ref(localStorage.getItem('profileImage') || null);


const refreshProfileImage = () => {
  profileImage.value = localStorage.getItem('profileImage');
};

onMounted(async () => {
  if (isNotificationsEnabled.value) {
    await setupPushNotifications();
    await sendFmcToServer();
  }

  refreshProfileImage();
});
const userInitials = computed(() => {
  return userStore.lastName.charAt(0).toUpperCase()+userStore.firstName.charAt(0);
});

const showPhotoActionSheet = async () => {
  const buttons = [
    { text: 'Kamera', icon: camera, handler: () => takePhoto() },
    { text: 'Galéria', icon: image, handler: () => selectFromGallery() },
    { text: 'Profilkép eltávolítása', icon: trash, handler: () => removeProfileImage() },
    { text: 'Mégse', role: 'cancel', icon: close },
  ];

  const actionSheet = await actionSheetController.create({
    header: 'Profilkép választása',
    buttons: buttons,
  });
  await actionSheet.present();
};

const removeProfileImage = async () => {
  localStorage.removeItem('profileImage');
  profileImage.value = null;
};

const takePhoto = async () => {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      width: 300,
      height: 300,
    });

    if (photo.dataUrl) {
      localStorage.setItem('profileImage', photo.dataUrl);
      // Force refresh from localStorage to ensure UI consistency
      refreshProfileImage();
    }
  } catch (error) {
    console.error('Error taking photo', error);
  }
};

const selectFromGallery = async () => {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      width: 300,
      height: 300,
    });

    if (photo.dataUrl) {
      localStorage.setItem('profileImage', photo.dataUrl);
      // Force refresh from localStorage to ensure UI consistency
      refreshProfileImage();
    }
  } catch (error) {
    console.error('Error selecting photo', error);
  }
};

const toggleBreaksDisplay = (event: CustomEvent) => {
  const isEnabled = event.detail.checked;
  showBreaksBetweenLessons.value = isEnabled;
  localStorage.setItem('showBreaksBetweenLessons', isEnabled.toString());
};

const themeLabel = computed(() => {
  switch (selectedTheme.value) {
    case 'light':
      return 'Világos';
    case 'dark':
      return 'Sötét';
    default:
      return 'Rendszer';
  }
});

const defaultPageLabel = computed(() => {
  return defaultPage.value === 'home' ? 'Kezdőlap' : 'Órarend';
});

const toggleNotifications = async (event: CustomEvent) => {
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
  applyTheme(theme)
};

const changeDefaultPage = (page: string) => {
  defaultPage.value = page;
  localStorage.setItem('defaultPage', page);

  // Force the current route to match the default page if we're on the home route
  const currentRoute = router.currentRoute.value;
  if (currentRoute.path === '/tabs/home' && page === 'timetable') {
    router.replace('/tabs/timetable');
  } else if (currentRoute.path === '/tabs/timetable' && page === 'home') {
    router.replace('/tabs/home');
  }
};

const goLogout = () => {
  logout();

  userStore.clearUser();

  localStorage.clear();

  // Clear sessionStorage
  sessionStorage.clear();

  // Clear cookies
  document.cookie.split(';').forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.slice(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  });
  location.reload();
  router.push('/login');
};
</script>

<style scoped>
.page-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 0;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(to right, var(--ion-color-primary), var(--ion-color-primary-shade));
}

.profile-avatar {
  position: relative;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  margin-right: 20px;
  overflow: visible;
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 50% !important; /* Force circular shape */
  aspect-ratio: 1/1; /* Ensure perfect square */
}
.edit-avatar-indicator {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background-color: var(--ion-color-primary);
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.edit-icon {
  font-size: 14px;
  color: white;
}

.profile-avatar:active {
  transform: scale(0.95);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-icon {
  font-size: 42px;
  color: white;
}

.user-info {
  color: white;
}

.user-name {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.user-email {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
}

.settings-card {
  border-radius: 16px;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

ion-card-header {
  padding-bottom: 0;
}

ion-card-title {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.section-icon {
  margin-right: 10px;
  font-size: 1.3rem;
}

ion-list {
  padding: 0;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --background: transparent;
}

.item-icon {
  color: var(--ion-color-primary);
  margin-right: 16px;
  font-size: 1.3rem;
}

.theme-chip, .default-page-chip {
  font-size: 0.8rem;
  --background: rgba(var(--ion-color-primary-rgb), 0.1);
  --color: var(--ion-color-primary);
}

.logout-button {
  margin: 16px 0;
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
}
.initials-avatar {
  width: 100%;
  height: 100%;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ion-color-primary-tint);
  color: white;
  font-size: 1.8rem;
  font-weight: 500;
}
.version-number {
    text-align: center;
    font-size: 0.8rem;
    color: #7a7a7a;
    margin-top: 8px;
  }
</style>