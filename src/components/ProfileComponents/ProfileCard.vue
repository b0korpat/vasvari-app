<template>
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
        <h2 class="user-name">{{ lastName }} {{ firstName }}</h2>
        <p class="user-email">{{ email }}</p>
      </div>
    </div>
  </ion-card>
</template>

<script lang="ts" setup>
import { IonAvatar, IonCard, IonIcon, actionSheetController } from '@ionic/vue';
import { camera, cameraOutline, close, image, trash } from 'ionicons/icons';
import { computed, ref } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const props = defineProps<{
  firstName: string;
  lastName: string;
  email: string;
}>();

const profileImage = ref(localStorage.getItem('profileImage') || null);

const userInitials = computed(() => {
  return props.lastName.charAt(0).toUpperCase() + props.firstName.charAt(0);
});

const refreshProfileImage = () => {
  profileImage.value = localStorage.getItem('profileImage');
};

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
      refreshProfileImage();
    }
  } catch (error) {
    console.error('Error selecting photo', error);
  }
};
</script>

<style scoped>
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
  border-radius: 50% !important;
  aspect-ratio: 1/1;
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
</style>