import { createApp } from "vue";
import { createPinia } from "pinia";
import { IonicVue } from "@ionic/vue";
import App from "./App.vue";
import router from "./router";
import { useUserStore } from "@/stores/user";
import { fetchUser } from "@/components/AuthFunctions";
import { applyTheme } from "@/components/themeChange";

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


// Ionic CSS imports
import "@ionic/vue/css/palettes/dark.class.css";
import "@ionic/vue/css/palettes/high-contrast.class.css";


// Theme variables
import "./theme/variables.css";

const app = createApp(App);

app.use(IonicVue);
app.use(router);

const pinia = createPinia();
app.use(pinia);

const initialTheme = localStorage.getItem("theme") || "system";
applyTheme(initialTheme);

const DEFAULT_PAGE_PATH = `/tabs/${localStorage.getItem("defaultPage") || "home"}`;
const PUBLIC_PATHS = ["/login", "/register"]; // Routes accessible without login

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.isAuthenticated;
  const isPublicPath = PUBLIC_PATHS.includes(to.path);
  const isOnline = navigator.onLine;

  console.log(`Navigating to: ${to.path}, From: ${from.path}, Auth: ${isAuthenticated}, Online: ${isOnline}`);

  if (isPublicPath) {
    if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      console.log("Already authenticated, redirecting from public auth page to default page");
      next(DEFAULT_PAGE_PATH);
    } else {
      next();
    }
    return;
  }

  if (isOnline) {

    try {
      const user = await fetchUser();
      if (user) {
        console.log("Online: User authenticated via fetchUser");
        next();
      } else {
        console.log("Online: Authentication failed, redirecting to login");
        userStore.clearUser();
        next("/login");
      }
    } catch (error) {
      console.error("Online: Error during fetchUser:", error);
      userStore.clearUser();
      next("/login");
    }
  } else {
    console.log("Offline: Checking local state for navigation");
    if (isAuthenticated) {

      console.log("Offline: User data found in store, allowing navigation");
      next();
    } else {
      const firstName = localStorage.getItem("firstName");
      const lastName = localStorage.getItem("lastName");
      const email = localStorage.getItem("email");
      const uid = localStorage.getItem("uid") || "";

      if (firstName && lastName && email) {
        console.log("Offline: User data not in store, but found in localStorage. Restoring minimal session.");
        userStore.setUser({ firstName, lastName, email, uid });
        next();
      } else {
        console.log("Offline: No user data found, redirecting to login");
        next("/login");
      }
    }
  }
});

const handleOnlineStatus = async () => {
  if (navigator.onLine) {
    console.log("Application came online. Re-validating session...");
    try {
      await fetchUser();
    } catch (error) {
      console.error("Error re-validating session after coming online:", error);
    }
  } else {
    console.log("Application went offline.");
    location.reload();
  }
};

window.addEventListener("online", handleOnlineStatus);
window.addEventListener("offline", handleOnlineStatus);

router.isReady().then(() => {
  console.log("Router is ready. Mounting app...");
  app.mount("#app");
});