import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { IonicVue } from "@ionic/vue";

// Ionic CSS imports
import "@ionic/vue/css/core.css";
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";
import "@ionic/vue/css/palettes/dark.class.css";
import "@ionic/vue/css/palettes/high-contrast.class.css";

// Theme variables
import "./theme/variables.css";

import { fetchUser } from "@/components/AuthFunctions";
import { useUserStore } from "@/stores/user";
import { applyTheme } from "@/components/themeChange";

const app = createApp(App)
    .use(IonicVue)
    .use(router);

const pinia = createPinia();
app.use(pinia);

const defaultPage = localStorage.getItem("defaultPage") || "home";
const publicPaths = ["/login", "/register"];

const theme = localStorage.getItem("theme") || "system";


applyTheme(theme);


function isOnline() {
  return navigator.onLine;
}

async function initializeApp() {
  const token = await fetchUser();
  const { path } = router.currentRoute.value;
  const userStore = useUserStore();

  if (publicPaths.includes(path)) {
    app.mount("#app");
    return;
  }

  if (isOnline() && token) {
    if (path !== `/tabs/${defaultPage}`) {
      await router.push(`/tabs/${defaultPage}`);
      location.reload();
    } else {
      app.mount("#app");
    }
    return;
  }

  if (!isOnline()) {
    const firstName = localStorage.getItem("firstName") || "";
    const lastName = localStorage.getItem("lastName") || "";
    const email = localStorage.getItem("email") || "";

    if (!firstName || !lastName || !email) {
      await router.push("/login");
      app.mount("#app");
      return;
    }

    userStore.setUser({
      firstName,
      lastName,
      email,
    });

    if (path !== `/tabs/${defaultPage}`) {
      await router.push(`/tabs/${defaultPage}`);
      location.reload();
    } else {

      app.mount("#app");
    }
    return;
  }

  await router.push("/login");
  app.mount("#app");
}

router.isReady().then(() => {
  initializeApp();

  window.addEventListener("online", () => {
    location.reload();
  });
});