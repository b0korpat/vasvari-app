import {createRouter, createWebHistory} from '@ionic/vue-router';
import {RouteRecordRaw} from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import LogInPage from '../views/LoginPage.vue';
import HomePage from '../views/HomePage.vue';
import ProfilePage from '../views/ProfilePage.vue';
import TimetablePage from '../views/TimetablePage.vue';
import {useUserStore} from "@/stores/user";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/tabs/',
        component: TabsPage,
        children: [
            {
                path: '',
                redirect: () => getDefaultRoute()
            },
            {
                path: 'home',
                component: HomePage
            },
            {
                path: 'profile',
                component: ProfilePage
            },
            {
                path: 'timetable',
                component: TimetablePage
            },

        ]
    },
    {
        path: '/login',
        component: LogInPage
    },
    {
        path: '/',
        redirect: () => getDefaultRoute()
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: () => getDefaultRoute()
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

router.beforeResolve((to, from, next) => {
    // If navigating to an empty path, redirect to the default route
    if (to.matched.length === 0) {
        next(getDefaultRoute());
    } else {
        next();
    }
});

function getDefaultRoute() {
    const defaultPage = localStorage.getItem('defaultPage') || 'home';
    return `/tabs/${defaultPage}`;
}

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    // If not logged in, redirect to /login
    if (!userStore.isAuthenticated && to.path !== '/login') {
      next('/login');
    } else {
      next();
    }
  });

export default router;