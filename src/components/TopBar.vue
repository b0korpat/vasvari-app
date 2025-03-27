<template>
  <ion-toolbar class="seamless-toolbar">
    <ion-buttons slot="start">
      <transition v-if="showMenuButton" appear name="menu-button-animation">
        <div class="header-group">
          <ion-menu-button class="animated-menu-button" @click="handleMenuClick"/>
          <ion-label class="large-text">Szia, {{ userStore.displayFirstName }}!</ion-label>
        </div>
      </transition>
      <ion-label v-else class="large-text">Szia, {{ userStore.displayFirstName }}!</ion-label>
    </ion-buttons>
    <ion-buttons slot="end">
    </ion-buttons>
  </ion-toolbar>
</template>

<script lang="ts" setup>
import {IonButtons, IonLabel, IonMenuButton, IonToolbar} from "@ionic/vue";
import {useUserStore} from "@/stores/user";

const userStore = useUserStore();

const props = defineProps({
  showMenuButton: {
    type: Boolean,
    default: false
  },
  onMenuClick: {
    type: Function,
    default: () => {
    }
  }
});

const handleMenuClick = () => {
  props.onMenuClick();
};
</script>

<style scoped>
.seamless-toolbar {
  --background: transparent;
  --border-color: transparent;
  --ion-toolbar-background: transparent;
  --ion-toolbar-border-color: transparent;
  --box-shadow: none;
}

.large-text {
  margin-left: 12px;
  font-size: 1.4em;
}

.header-group {
  display: flex;
  align-items: center;
}

.animated-menu-button {
  margin-right: -12px;
  transform-origin: left center;
}

.menu-button-animation-enter-active {
  animation: slide-in-header 0.6s ease forwards;
}

.menu-button-animation-leave-active {
  animation: slide-out-header 0.5s ease forwards;
  position: absolute;
}

@keyframes slide-in-header {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out-header {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-30px);
  }
}
</style>