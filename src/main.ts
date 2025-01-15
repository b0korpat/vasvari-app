import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia'; // Ensure this import is correct

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.class.css';
import '@ionic/vue/css/palettes/high-contrast.class.css';
const theme = localStorage.getItem('theme') || 'system';

function applyTheme(theme: string) {
  if (theme === 'dark') {
    document.documentElement.classList.toggle('ion-palette-dark', true);
    document.documentElement.classList.toggle('ion-palette-high-contrast', false);
  } else if (theme === 'light') {
    document.documentElement.classList.toggle('ion-palette-dark', false);
    document.documentElement.classList.toggle('ion-palette-high-contrast', true);
  } else if (theme === 'system') {
    const isLightMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isLightMode) {
      document.documentElement.classList.toggle('ion-palette-dark', true);
      document.documentElement.classList.toggle('ion-palette-high-contrast', false);
    } else {
      document.documentElement.classList.toggle('ion-palette-dark', false);
      document.documentElement.classList.toggle('ion-palette-high-contrast', true);
    }
  }
}

applyTheme(theme);

if (theme === 'system') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    location.reload();
  });
}

/* Theme variables */
import './theme/variables.css';


const app = createApp(App)
  .use(IonicVue)
  .use(router);

const pinia = createPinia();
app.use(pinia);

router.isReady().then(() => {
  app.mount('#app');
});
