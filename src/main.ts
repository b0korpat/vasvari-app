import { createApp } from "vue";
import { createPinia } from "pinia";
import { IonicVue } from "@ionic/vue";
import App from "./App.vue";
import router from "./router";
import { useUserStore } from "@/stores/user";
import { fetchUser, refreshToken} from "@/components/Utils/AuthFunctions";
import { applyTheme } from "@/components/Utils/themeChange";

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
  const wasLoggedOut = localStorage.getItem("loggedOut") === "true";

  console.log(`Navigating to: ${to.path}, From: ${from.path}, Auth: ${isAuthenticated}, Online: ${isOnline}, LoggedOut: ${wasLoggedOut}`);

  // Simple offline handling - avoid complex logic
  if (!isOnline) {
    const hasStoredCredentials = localStorage.getItem("firstName") &&
        localStorage.getItem("lastName") &&
        localStorage.getItem("email");

    if (hasStoredCredentials && !wasLoggedOut) {
      // Restore user from localStorage
      userStore.setUser({
        firstName: localStorage.getItem("firstName") || "",
        lastName: localStorage.getItem("lastName") || "",
        email: localStorage.getItem("email") || "",
        uid: localStorage.getItem("uid") || ""
      });

      if (to.path === '/login' || to.path === '/register') {
        next(DEFAULT_PAGE_PATH);
      } else {
        next();
      }
    } else {
      // Note: For offline with no credentials, we'll let the App.vue handle it with fallback UI
      // This prevents routing issues causing blank screens
      next();
    }
    return;
  }

  // Online mode handling below
  if (isPublicPath) {
    if (isAuthenticated && !wasLoggedOut && (to.path === '/login' || to.path === '/register')) {
      console.log("Already authenticated, redirecting from public auth page to default page");
      next(DEFAULT_PAGE_PATH);
    } else {
      next();
    }
    return;
  }

  // Protected routes handling when online
  try {
    await refreshToken();
    const user = await fetchUser();
    if (user) {
      console.log("Online: User authenticated via fetchUser");
      localStorage.removeItem("loggedOut");
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
});

const handleOnlineStatus = async () => {
  if (navigator.onLine) {
    console.log("Application came online. Re-validating session...");
    const wasLoggedOut = localStorage.getItem("loggedOut") === "true";
    if (!wasLoggedOut) {
      try {
        await refreshToken();
        await fetchUser();
      } catch (error) {
        console.error("Error re-validating session after coming online:", error);
      }
    }
    // App.vue will handle the reload
  } else {
    console.log("Application went offline.");
    // App.vue will handle offline fallback UI
  }
};

window.addEventListener("online", handleOnlineStatus);
window.addEventListener("offline", handleOnlineStatus);

router.isReady().then(() => {
  console.log("Router is ready. Mounting app...");
  app.mount("#app");
});