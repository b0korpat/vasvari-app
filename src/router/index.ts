import {createRouter, createWebHistory} from '@ionic/vue-router';
import {RouteRecordRaw} from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import LogInPage from '../views/LoginPage.vue';

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
                component: () => import('@/views/HomePage.vue')
            },
            {
                path: 'profile',
                component: () => import('@/views/ProfilePage.vue')
            },
            {
                path: 'timetable',
                component: () => import('@/views/TimetablePage.vue')
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