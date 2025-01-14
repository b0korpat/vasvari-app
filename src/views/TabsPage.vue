<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet :key="$route.fullPath"></ion-router-outlet>
      <ion-tab-bar slot="bottom">

        <ion-tab-button tab="news" href="/tabs/news">
          <ion-icon aria-hidden="true" :icon="newspaper" />
          <ion-label>Hírek</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="timetable" href="/tabs/timetable">
          <ion-icon aria-hidden="true" :icon="calendarOutline" />
          <ion-label>Órarend</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon aria-hidden="true" :icon="person"/>
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
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { ellipse, square, triangle, calendarOutline, newspaper, person } from 'ionicons/icons';
import Profilepage from './Profilepage.vue';
</script>