<template>
  <ion-page>
    <TopBar :showMenuButton="true" :onMenuClick="openMenu" />


    <ion-content ref="contentElement" class="main-content" scroll-events @ionScroll="handleScroll">
      <ion-menu class="app-menu" content-id="main-content" type="overlay">
        <ion-content >
          <div class="menu-content">
            <ion-list lines="none">
              <ion-item
                  v-for="item in menuItems"
                  :key="item.type"
                  :class="['menu-item', { 'active-item': content === item.type }]"
                  button
                  @click="selectMenuItem(item.type)"
              >
                <ion-icon slot="start" :icon="item.icon" />
                <ion-label>{{ item.label }}</ion-label>
              </ion-item>
            </ion-list>
          </div>
        </ion-content>
      </ion-menu>

      <div id="main-content" class="page-content">
        <component :is="currentComponent" />
      </div>

      <transition name="fab-animation">
        <ion-fab v-show="showScrollButton" slot="fixed" horizontal="end" vertical="bottom">
          <ion-fab-button @click="scrollToTop">
            <ion-icon :icon="arrowUp" />
          </ion-fab-button>
        </ion-fab>
      </transition>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonPage,
  menuController,
} from '@ionic/vue';
import {
  arrowUp,
  informationCircleOutline,
  newspaperOutline,
  sunny
} from 'ionicons/icons';
import { defineAsyncComponent } from 'vue';

import { sendFmcToServer } from '@/components/setupPushNotifications';
import TopBar from "@/components/TopBar.vue";


const content = ref('news');
const showScrollButton = ref(false);
const contentElement = ref<InstanceType<typeof IonContent>>();

const NewsList = defineAsyncComponent(() => import('@/components/NewsList.vue'));
const ImportantInfos = defineAsyncComponent(() => import('@/components/ImportantInfos.vue'));
const Holidays = defineAsyncComponent(() => import('@/components/Holidays.vue'));

const menuItems = [
  { type: 'news', icon: newspaperOutline, label: 'Hírek' },
  { type: 'holidays', icon: sunny, label: 'Szünetek' },
  { type: 'important', icon: informationCircleOutline, label: 'Fontos információk' }
];

const currentComponent = computed(() => ({
  news: NewsList,
  important: ImportantInfos,
  holidays: Holidays,
}[content.value]));

const selectMenuItem = async (type: string) => {
  console.log('Selected menu item:', type);
  content.value = type;
  await menuController.close();
};

const handleScroll = ({ detail }: CustomEvent) => {
  showScrollButton.value = detail.scrollTop > 100;
};

const scrollToTop = () => {
  contentElement.value?.$el.scrollToTop(500);
};

const openMenu = async () => {
  await menuController.open();
};

onMounted(() => {
  sendFmcToServer();
});
</script>

<style scoped>
.menu-item {
  margin: 4px 12px;
  border-radius: 10px;
  --background: transparent;
  --background-activated: rgba(var(--ion-color-primary-rgb), 0.1);
  --background-focused: rgba(var(--ion-color-primary-rgb), 0.1);
  --background-hover: rgba(var(--ion-color-primary-rgb), 0.07);
  --ripple-color: rgba(var(--ion-color-primary-rgb), 0.1);
  transition: background-color 0.2s ease;
}

.active-item {
  --background: rgba(var(--ion-color-primary-rgb), 0.1);
  color: var(--ion-color-primary);
  font-weight: 600;
}

.active-item ion-icon {
  color: var(--ion-color-primary);
}

.main-content {
  position: relative;
  z-index: 1;
}

ion-fab {
  z-index: 100;
}

ion-fab-button {
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.fab-animation-enter-active,
.fab-animation-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0);
}

.fab-animation-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.fab-animation-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
</style>