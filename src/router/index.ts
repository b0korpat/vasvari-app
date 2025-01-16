import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import LogInPage from '../views/userManagement/LoginPage.vue';
import RegisterPage from '../views/userManagement/RegisterPage.vue';
import UpdatePasswordPage from '../views/userManagement/UpdatePasswordPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/news'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/news'
      },
      {
        path: 'news',
        component: () => import('@/views/NewsPage.vue')
      },
      {
        path: 'profile',
        component: () => import('@/views/Profilepage.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      },
      {
        path: 'timetable',
        component: () => import('@/views/TimetablePage.vue')
      },
      {
        path: 'settings',
        component: () => import('@/views/SettingsPage.vue')
      }

    ]
  },
  {
    path: '/login',
    component: LogInPage
  },
  {
    path: '/register',
    component: RegisterPage
  },
  {
    path: '/update-password',
    component: UpdatePasswordPage
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;