<template>
  <ion-page>
    <ion-tabs ref="tabs">
      <ion-router-outlet :key="$route.fullPath" />
      <ion-tab-bar slot="bottom" class="animated-tab-bar">
        <ion-tab-button tab="news" href="/tabs/news">
          <ion-icon aria-hidden="true" :icon="newspaper" />
          <ion-label>Hírek</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="timetable" href="/tabs/timetable">
          <ion-icon aria-hidden="true" :icon="calendarOutline" />
          <ion-label>Órarend</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon aria-hidden="true" :icon="person" />
          <ion-label>Profil</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon aria-hidden="true" :icon="square" />
          <ion-label>Tab 3</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
  createAnimation,
} from '@ionic/vue';
import { ellipse, square, triangle, calendarOutline, newspaper, person } from 'ionicons/icons';
import { onMounted } from 'vue';

// Animation setup for tab bar
onMounted(() => {
  const tabBar = document.querySelector('.animated-tab-bar');
  if(tabBar){
    const tabBarAnimation = createAnimation()
    .addElement(tabBar)
    .duration(500)
    .fromTo('transform', 'translateY(100%)', 'translateY(0)')
    .easing('ease-out');
    tabBarAnimation.play();
  }
  


});
</script>

<style>
/* Basic animation style for buttons */
.ion-tab-button {
  transition: transform 0.3s ease-in-out;
}
.ion-tab-button:hover {
  transform: scale(1.1);
}

/* Optional: Add a fade-in effect for the entire page */

</style>
