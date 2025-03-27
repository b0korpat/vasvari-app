import {createRouter, createWebHistory} from '@ionic/vue-router';
import {RouteRecordRaw} from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import LogInPage from '../views/LoginPage.vue';
import HomePage from '../views/HomePage.vue';
import TimetablePage from '../views/TimetablePage.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/tabs/',
        component: TabsPage,
        children: [
            {
                path: '',
                redirect: '/tabs/home'
            },
            {
                path: 'home',
                component: HomePage
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
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;