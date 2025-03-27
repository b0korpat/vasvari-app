<template>
  <ion-page>
    <ion-tabs ref="tabs">
      <ion-router-outlet :key="$route.fullPath"/>
      <ion-tab-bar slot="bottom" class="animated-tab-bar">
        <ion-tab-button href="/tabs/home" tab="home" class="custom-tab-button">
          <div class="tab-button-content">
            <ion-icon :icon="home" aria-hidden="true"/>
            <ion-label>Főoldal</ion-label>
          </div>
        </ion-tab-button>

        <ion-tab-button href="/tabs/timetable" tab="timetable" class="custom-tab-button">
          <div class="tab-button-content">
            <ion-icon :icon="calendarOutline" aria-hidden="true"/>
            <ion-label>Órarend</ion-label>
          </div>
        </ion-tab-button>

        <ion-tab-button href="/tabs/profile" tab="profile" class="custom-tab-button">
          <div class="tab-button-content">
            <ion-icon :icon="personOutline" aria-hidden="true"/>
            <ion-label>Profil</ion-label>
          </div>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  createAnimation,
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/vue';
import {
  calendarOutline,
  home,
  personOutline,
} from 'ionicons/icons';
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

onMounted(() => {
  const tabBar = document.querySelector('.animated-tab-bar');
  if (tabBar) {
    const tabBarAnimation = createAnimation()
        .addElement(tabBar)
        .duration(500)
        .fromTo('transform', 'translateY(100%)', 'translateY(0)')
        .fromTo('opacity', '0.6', '1')
        .easing('cubic-bezier(0.34, 1.56, 0.64, 1)');
    tabBarAnimation.play();
  }

  highlightActiveTab(route.path);
});

watch(() => route.path, (newPath) => {
  highlightActiveTab(newPath);
});

const highlightActiveTab = (path: string) => {
  const tabs = document.querySelectorAll('.custom-tab-button');
  tabs.forEach(tab => {
    const href = tab.getAttribute('href');
    if (href && path.includes(href.split('/tabs/')[1])) {
      tab.classList.add('tab-selected');
    } else {
      tab.classList.remove('tab-selected');
    }
  });
};
</script>

<style scoped>
.animated-tab-bar {
  --background: var(--ion-background-color);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  padding: 8px 15px;
  margin: 0 0 -1px 0;
  border-bottom: none;
  z-index: 100;
}

.custom-tab-button {
  height: 65px;
  position: relative;
  overflow: visible;
  border-radius: 12px;
  transition: all 0.3s ease-in-out;
  --color: var(--ion-color-medium);
  --color-selected: var(--ion-color-primary);
  padding: 0;

}

.tab-button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease-out;
}

.custom-tab-button ion-icon {
  font-size: 22px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.custom-tab-button ion-label {
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.custom-tab-button:hover .tab-button-content {
  transform: translateY(-3px);
}

.tab-selected {
  --color: var(--ion-color-primary);
  background-color: rgba(var(--ion-color-primary-rgb), 0.1);
}

.tab-selected::before {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 50%;
  width: 20px;
  height: 3px;
  background-color: var(--ion-color-primary);
  border-radius: 3px;
  transform: translateX(-50%);
}
</style>