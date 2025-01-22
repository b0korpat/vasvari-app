<template>
  <ion-content ref="content">
    <div>
      <div class="news-list">
        <div v-for="newsItem in news" :key="newsItem.id" class="news-box">
          <h3>{{ newsItem.title }}</h3>
          <p>{{ newsItem.description }}</p>
          <small>{{ new Date(newsItem.postdate).toLocaleDateString() }}</small>
        </div>
      </div>
    </div>
    <ion-button expand="block" @click="scrollToTop()">Scroll to Top</ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonButton, IonContent } from '@ionic/vue';
import { supabase } from '@/supabase';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  postdate: string;
}

const news = ref<NewsItem[]>([]);

const fetchNews = async () => {
  try {
    console.log('Fetching news from Supabase...');
    const { data, error } = await supabase
      .from('news')
      .select('id, title, description, postdate');
    if (error) {
      console.error('Error fetching news:', error);
    } else {
      news.value = data;
      console.log('News fetched successfully:', data);
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
};

const scrollToBottom = () => {
  const content = document.querySelector('ion-content');
  if (content) {
    content.scrollToBottom(500);
  }
};

const scrollToTop = () => {
  const content = document.querySelector('ion-content');
  if (content) {
    content.scrollToTop(500);
  }
};

onMounted(() => {
  fetchNews();
});
</script>

<style scoped>
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
</style>