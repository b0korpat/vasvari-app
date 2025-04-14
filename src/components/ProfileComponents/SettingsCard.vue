<template>
  <ion-card class="settings-card">
    <ion-card-header>
      <ion-card-title>
        <ion-icon :icon="settingsOutline" class="section-icon"></ion-icon>
        Beállítások
      </ion-card-title>
    </ion-card-header>

    <ion-card-content>
      <ion-list lines="full">
        <ion-item @click="$emit('showThemeOptions')" detail>
          <ion-icon :icon="colorPalette" slot="start" class="item-icon"></ion-icon>
          <ion-label>Téma</ion-label>
          <ion-chip slot="end" class="theme-chip">{{ themeLabel }}</ion-chip>
        </ion-item>

        <ion-item @click="$emit('showDefaultPageOptions')" detail>
          <ion-icon :icon="homeOutline" slot="start" class="item-icon"></ion-icon>
          <ion-label>Alapértelmezett oldal</ion-label>
          <ion-chip slot="end" class="default-page-chip">{{ defaultPageLabel }}</ion-chip>
        </ion-item>

        <ion-item>
          <ion-icon :icon="timeOutline" slot="start" class="item-icon"></ion-icon>
          <ion-label>Szünetek megjelenítése órarenden</ion-label>
          <ion-toggle
              slot="end"
              :checked="showBreaks"
              @ionChange="$emit('toggleBreaks', $event)"
          ></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-icon :icon="list" slot="start" class="item-icon" />
          <ion-label>Dinamikus órarend számozás</ion-label>
          <ion-toggle
              slot="end"
              :checked="dynamicLessonNumber"
              @ionChange="$emit('toggleDynamicLessonNumber', $event)"
          ></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-icon :icon="notificationsOutline" slot="start" class="item-icon"></ion-icon>
          <ion-label>Értesítések engedélyezése</ion-label>
          <ion-toggle
              slot="end"
              :checked="notificationsEnabled"
              @ionChange="$emit('toggleNotifications', $event)"
          ></ion-toggle>
        </ion-item>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script lang="ts" setup>
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
} from '@ionic/vue';
import {
  colorPalette,
  homeOutline,
  list,
  notificationsOutline,
  settingsOutline,
  timeOutline,
} from 'ionicons/icons';
import { computed } from "vue";

const props = defineProps({
  selectedTheme: String,
  defaultPage: String,
  showBreaks: Boolean,
  dynamicLessonNumber: Boolean,
  notificationsEnabled: Boolean,
});

defineEmits([
  'showThemeOptions',
  'showDefaultPageOptions',
  'toggleBreaks',
  'toggleDynamicLessonNumber',
  'toggleNotifications',
]);

const themeLabel = computed(() => {
  switch (props.selectedTheme) {
    case 'light':
      return 'Világos';
    case 'dark':
      return 'Sötét';
    default:
      return 'Rendszer';
  }
});

const defaultPageLabel = computed(() => {
  return props.defaultPage === 'home' ? 'Kezdőlap' : 'Órarend';
});
</script>

<style scoped>
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
  --background: var(--ion-card-background);
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
</style>