<template>
  <div class="page-load-animation">
    <div v-if="newsStore.loading" class="news-skeleton-container">
      <div v-for="i in 5" :key="i" class="skeleton-news-card">
        <div class="skeleton-news-layout">
          <div class="skeleton-image-container">
            <div class="skeleton-image pulse"></div>
          </div>
          <div class="skeleton-news-content">
            <div class="skeleton-title pulse"></div>
            <div class="skeleton-preview pulse"></div>
            <div class="skeleton-info">
              <div class="skeleton-icon pulse"></div>
              <div class="skeleton-date pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>

      <ion-refresher slot="fixed" @ionRefresh="doRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-card
          v-for="(item) in newsStore.news"
          :key="item.id"
          class="news-card"
          @click="openModal(item)">
        <div class="news-layout">
          <div v-if="item.image" class="news-image-container">
            <img :src="item.image" alt="News Image" class="news-thumbnail"/>
          </div>
          <div :class="{ 'with-image': item.image }" class="news-content">
            <div class="news-title">{{ item.title }}</div>
            <p class="news-preview">{{ truncateContent(item.content) }}</p>
            <div class="info-item">
              <ion-icon :icon="calendarOutline" class="info-icon"></ion-icon>
              <p class="news-date">{{ new Date(item.date).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </ion-card>
    </div>

    <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
      <ion-content class="modal-content">
        <div v-if="selectedNewsItem?.image" class="modal-image-container">
          <img :src="selectedNewsItem.image" alt="News Image" class="modal-image"/>
          <div class="modal-close-button">
            <ion-button fill="clear" @click="closeModal">
              <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
            </ion-button>
          </div>
        </div>
        <div v-else class="modal-header">
          <div class="modal-close-button">
            <ion-button fill="clear" @click="closeModal">
              <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
            </ion-button>
          </div>
        </div>

        <div class="modal-text-content">
          <h2 class="modal-title">{{ selectedNewsItem?.title }}</h2>

          <div class="date-container">
            <ion-icon :icon="calendarOutline" class="date-icon"></ion-icon>
            <span class="news-date">{{
                new Date(selectedNewsItem?.date ?? '').toLocaleDateString('hu-HU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              }}</span>
          </div>

          <div class="content-container">
            <p class="news-full-content">{{ selectedNewsItem?.content }}</p>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import {IonButton, IonCard, IonContent, IonIcon, IonModal, IonRefresher, IonRefresherContent} from '@ionic/vue';
import {arrowBack, calendarOutline} from 'ionicons/icons';
import {useNewsStore} from '@/stores/news';

interface NewsItem {
  id: number;
  title: string;
  image: string;
  content: string;
  date: string;
}

const newsStore = useNewsStore();
const isModalOpen = ref(false);
const selectedNewsItem = ref<NewsItem | null>(null);

const truncateContent = (content: string) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
};

const doRefresh = async (event: CustomEvent) => {
  await newsStore.fetchNews();
  await (event.target as HTMLIonRefresherElement).complete();
};

const openModal = (item: NewsItem) => {
  selectedNewsItem.value = item;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

onMounted(async () => {
  await newsStore.initialize();
});
</script>

<style scoped>
.news-card {
  margin: 12px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid var(--ion-color-primary);
  height: auto;
  min-height: 110px;
  background-color: var(--ion-card-background);
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;

  }
  to {
    opacity: 1;

  }
}

.skeleton-news-card {
  margin: 12px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 110px;
  background-color: var(--ion-card-background);
  border-left: 4px solid rgba(var(--ion-color-primary-rgb), 0.3);
}

.skeleton-news-layout {
  display: flex;
  height: 100%;
}

.skeleton-image-container {
  width: 100px;
  min-width: 100px;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background-color: rgba(var(--ion-color-medium-rgb), 0.2);
}

.skeleton-news-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 15px;
}

.skeleton-title {
  height: 18px;
  width: 70%;
  border-radius: 4px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.2);
  margin-bottom: 12px;
}

.skeleton-preview {
  height: 36px;
  width: 90%;
  border-radius: 4px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.2);
  margin-bottom: 10px;
}

.skeleton-info {
  display: flex;
  align-items: center;
}

.skeleton-icon {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.2);
}

.skeleton-date {
  width: 80px;
  height: 12px;
  border-radius: 4px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.2);
}

.pulse {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
}


.news-card {
  margin: 12px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid var(--ion-color-primary);
  height: auto;
  min-height: 110px;
  background-color: var(--ion-card-background);
}



.news-layout {
  display: flex;
  height: 100%;
}

.news-image-container {
  width: 100px;
  min-width: 100px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.news-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 15px;
}

.news-content.with-image {
  padding-left: 15px;
}

.news-title {
  font-weight: bold;
  font-size: 1rem;
  color: var(--ion-text-color);
  margin-bottom: 5px;
}

.news-preview {
  margin: 0 0 10px 0;
  width: 95%;
  color: var(--ion-text-color);
  line-height: 1.4;
  font-size: 0.85rem;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-item {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.info-icon {
  font-size: 1rem;
  margin-right: 5px;
  color: var(--ion-color-medium);
}

.news-date {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.8rem;
}

.modal-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
}

.modal-image-container {
  position: relative;
  width: 100%;
}

.modal-header {
  height: 40px;

  position: relative;
}

.modal-close-button {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 100;
}

.news-card:active {
  transform: translateY(10px) scale(0.98);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }



.modal-close-button ion-button {
  --color: white;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.56);
  --padding-start: 8px;
  --padding-end: 8px;
}

.modal-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  display: block;
  border-radius: 0 0 12px 12px;
}

.modal-text-content {
  padding: 16px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ion-text-color);
  margin-bottom: 12px;
}

.date-container {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: rgba(var(--ion-color-primary-rgb), 0.1);
  border-radius: 8px;
}

.date-icon {
  color: var(--ion-color-primary);
  font-size: 1.2rem;
  margin-right: 8px;
}

.content-container {
  background-color: var(--ion-card-background);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.news-full-content {
  line-height: 1.6;
  font-size: 1rem;
  color: var(--ion-text-color);
  white-space: pre-line;
  margin: 0;
}

</style>