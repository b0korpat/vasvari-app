<template>
  <div class="page-load-animation">

    <div v-if="newsStore.loading" class="news-skeleton-container">
      <div v-for="i in 5" :key="'skeleton-' + i" class="skeleton-news-card">
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

      <transition-group name="list-anim" tag="div" class="news-list-container" appear>
        <ion-card
            v-for="(item, index) in newsStore.news"
            :key="item.id" class="news-card"
            @click="openModal(item)"
            :style="{ '--i': index }" >
          <div class="news-layout">
            <div v-if="item.image" class="news-image-container">
              <img :src="item.image" alt="News Image" class="news-thumbnail" loading="lazy"/> </div>
            <div :class="{ 'with-image': item.image }" class="news-content">
              <div class="news-title">{{ item.title }}</div>
              <p class="news-preview">{{ truncateContent(item.content) }}</p>
              <div class="info-item">
                <ion-icon :icon="calendarOutline" class="info-icon"></ion-icon>
                <p class="news-date">{{
                    new Date(item.date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
                  }}</p>
              </div>
            </div>
          </div>
        </ion-card>
      </transition-group>
    </div>

    <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
      <ion-content class="modal-content">
        <div v-if="selectedNewsItem?.image" class="modal-image-container">
          <img :src="selectedNewsItem.image" alt="News Image" class="modal-image" loading="lazy"/>
          <div class="modal-close-button">
            <ion-button fill="clear" @click="closeModal">
              <ion-icon slot="icon-only" :icon="arrowBack"></ion-icon>
            </ion-button>
          </div>
        </div>
        <div v-else class="modal-header">
          <div class="modal-close-button no-image"> <ion-button fill="clear" @click="closeModal">
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

const truncateContent = (content: string, maxLength: number = 90): string => {
  if (!content) return '';
  const strippedContent = content.replace(/<[^>]*>/g, '');
  if (strippedContent.length <= maxLength) {
    return strippedContent;
  }
  const truncated = strippedContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
};


const doRefresh = async (event: CustomEvent) => {
  try {
    await newsStore.fetchNews(true);
  } catch (error) {
    console.error("Error during refresh:", error);
  } finally {
    if (event && event.target && typeof (event.target as HTMLIonRefresherElement).complete === 'function') {
      await (event.target as HTMLIonRefresherElement).complete();
    }
  }
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border-left: 4px solid var(--ion-color-primary);
  height: auto;
  min-height: 110px;
  background-color: var(--ion-card-background);
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
}
.news-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
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
  background-color: rgba(var(--ion-color-medium-rgb), 0.1);
}

.news-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.news-card:hover .news-thumbnail {
  transform: scale(1.05);
}


.news-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 15px;
  overflow: hidden;
}


.news-title {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--ion-text-color);
  margin-bottom: 6px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-preview {
  margin: 0 0 10px 0;
  color: var(--ion-color-medium-shade);
  line-height: 1.4;
  font-size: 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  min-height: calc(1.4em * 2);
}

.info-item {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.info-icon {
  font-size: 0.9rem;
  margin-right: 6px;
  color: var(--ion-color-medium);
  flex-shrink: 0;
}

.news-date {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.8rem;
  white-space: nowrap;
}

.news-skeleton-container {
  padding: 1px 0;
}

.skeleton-news-card {
  margin: 12px 10px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 110px;
  background-color: var(--ion-card-background);
  border-left: 4px solid rgba(var(--ion-color-medium-rgb), 0.2);
  opacity: 0.8;
}

.skeleton-news-layout {
  display: flex;
  height: 100%;
}

.skeleton-image-container {
  width: 100px;
  min-width: 100px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.1);
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background-color: rgba(var(--ion-color-medium-rgb), 0.15);
}

.skeleton-news-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 15px;
  justify-content: space-between;
}
.skeleton-news-content > div {
  margin-bottom: 8px;
}
.skeleton-news-content > div:last-child {
  margin-bottom: 0;
}


.skeleton-title {
  height: 20px;
  width: 75%;
  border-radius: 4px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.15);
  margin-bottom: 8px;
}

.skeleton-preview {
  height: 14px;
  width: 95%;
  border-radius: 4px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.15);
  margin-bottom: 4px;
}
.skeleton-preview::after {
  content: '';
  display: block;
  height: 14px;
  width: 85%;
  border-radius: 4px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.15);
  margin-top: 6px;
}


.skeleton-info {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.skeleton-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.15);
}

.skeleton-date {
  width: 90px;
  height: 14px;
  border-radius: 4px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.15);
}


.modal-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  background-color: var(--ion-background-color);
}

.modal-image-container {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-radius: 0 0 16px 16px;
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.modal-header {
  height: 60px;
  position: relative;
  width: 100%;
}

.modal-close-button {
  position: absolute;
  top: calc(var(--ion-safe-area-top, 0px) + 10px);
  left: 15px;
  z-index: 10;
}

.modal-close-button ion-button {
  --color: white;
  --background: rgba(0, 0, 0, 0.4);
  --background-hover: rgba(0, 0, 0, 0.6);
  --border-radius: 50%;
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  width: 36px;
  height: 36px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.modal-close-button.no-image ion-button {
  --color: #666;
  --background: rgba(var(--ion-color-medium-rgb), 0.1);
  --background-hover: rgba(var(--ion-color-medium-rgb), 0.2);
}


.modal-text-content {
  padding: 20px;
  opacity: 0;
}

.modal-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--ion-text-color);
  margin: 0 0 16px 0;
  line-height: 1.3;
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
  font-size: 1.1rem; /* Adjust size */
  margin-right: 10px;
}
.date-container .news-date {
  font-size: 0.9rem;
  color: var(--ion-color-medium-shade);
}

.content-container {
  background-color: var(--ion-card-background);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.news-full-content {

  line-height: 1.7;

  font-size: 1rem;

  color: var(--ion-text-color);

  white-space: pre-line;

  margin: 0;

}



.list-anim-enter-active {
  transition: all 0.5s ease-out;
  transition-delay: calc(0.08s* var(--i));
}
.list-anim-leave-active {
  transition: all 0.25s ease-in;
  position: absolute;
  width: calc(100% - 20px);
  opacity: 0;
}
.list-anim-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.list-anim-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes modalContentFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-text-content {
  animation: modalContentFadeIn 0.4s ease-out 0.15s forwards;
  opacity: 0;
}


.pulse {
  animation: pulse 1.8s infinite ease-in-out;
}
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.news-list-container {
  padding: 1px 0;
}

</style>