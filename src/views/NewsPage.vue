<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="seamless-toolbar">
        <ion-buttons slot="start">
          <ion-label class="large-text">Szia, {{ first_name }}!</ion-label>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon slot="icon-only" :icon="notifications" class="large-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="content" scroll-events @ionScroll="onScroll">
      <div class="page-load-animation">
        <ion-refresher slot="fixed" @ionRefresh="doRefresh">
          <ion-refresher-content />
        </ion-refresher>
        <div v-if="!loading" class="news-list">
          <div v-for="newsItem in news" :key="newsItem.id" class="news-box">
            <h3>{{ newsItem.title }}</h3>
            <p>{{ newsItem.description }}</p>
            <small>{{ new Date(newsItem.postdate).toLocaleDateString() }}</small>
          </div>
        </div>
      </div>

      <transition name="fab">
        <ion-fab v-if="showFab" vertical="bottom" horizontal="end" slot="fixed">
          <ion-fab-button @click="top">
            <ion-icon :icon="arrowUpOutline"></ion-icon>
          </ion-fab-button>
        </ion-fab>
      </transition>

      <ion-spinner v-if="loading" class="loading-spinner"></ion-spinner>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonLabel, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonSpinner } from '@ionic/vue';
import { notifications, arrowUpOutline } from 'ionicons/icons';
import { first_name, fetchUser } from '@/components/AuthFunctions';
import { supabase } from '@/supabase';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  postdate: string;
}

const news = ref<NewsItem[]>([]);
const content = ref(null);
const loading = ref(true);
const showFab = ref(false);

const fetchNews = async () => {
  try {
    console.log('Fetching news from Supabase...');
    const { data, error } = await supabase
      .from('news')
      .select('id, title, description, postdate')
      .order('postdate', { ascending: false });
    if (error) {
      console.error('Error fetching news:', error);
    } else {
      news.value = data;
      console.log('News fetched successfully:', data);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 400);
  }
};

const doRefresh = (event: any) => {
  console.log('Begin async operation');
  setTimeout(async () => {
    await fetchNews();
    event.target.complete();
    console.log('Async operation has ended');
  }, 800);
};

function onScroll(event: any) {
  showFab.value = event.detail.scrollTop > 100;
}

const top = () => {
  const content = document.querySelector('ion-content');
  if (content) {
    content.scrollToTop(500);
  }
};

onMounted(() => {
  fetchUser();
  fetchNews();
});
</script>

<style scoped>
.seamless-toolbar {
  --background: transparent;
  --border-color: transparent;
  --ion-toolbar-background: transparent;
  --ion-toolbar-border-color: transparent;
  --box-shadow: none;
}
ion-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}
ion-content {
  --background: transparent;
}
.large-text {
  font-size: 1.4em;
}
.large-icon {
  font-size: 2em;
}
.page-load-animation {
  padding: 16px;
}
.news-box {
  border: 1px solid #ccc;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
}
.news-box h3 {
  margin: 0 0 8px;
}
.news-box p {
  margin: 0;
}
.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.fab-enter-active, .fab-leave-active {
  transition: transform 0.5s ease-out, opacity 0.5s ease-out;
}
.fab-enter-from, .fab-leave-to {
  transform: translateX(100%) rotate(0deg);
  opacity: 0;
}
.fab-enter-to, .fab-leave-from {
  transform: translateX(0) rotate(360deg);
  opacity: 1;
}
</style>