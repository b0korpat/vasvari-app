import { defineStore } from 'pinia';
import { ref } from 'vue';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import {useUserStore} from "@/stores/user";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  content: string;
  date: string;
}

export const useNewsStore = defineStore('news', () => {
  const news = ref<NewsItem[]>([]);
  const loading = ref(false);
  const connection = ref<HubConnection | null>(null);

  const LOCAL_STORAGE_KEY = 'newsData';

  const saveNewsToLocalStorage = (data: NewsItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving news to localStorage:', error);
    }
  };

  const loadNewsFromLocalStorage = (): NewsItem[] => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading news from localStorage:', error);
      return [];
    }
  };

  const fetchNews = async () => {
    loading.value = true;
    let userStore = useUserStore();
    try {
      const response = await fetch('https://backend-production-f2dd.up.railway.app/api/news',{
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }
      const data = await response.json();
      news.value = data;
      saveNewsToLocalStorage(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      const cachedNews = loadNewsFromLocalStorage();
      news.value = cachedNews;
    } finally {
      loading.value = false;
    }
  };

  const setupSignalR = () => {
    try {
      connection.value = new HubConnectionBuilder()
          .withUrl('https://backend-production-f2dd.up.railway.app/notificationHub')
          .build();

      connection.value.on('ReceiveMessage', (title: string, message: string) => {
        console.log(`Received message: ${title}: ${message}`);

        if (title === 'News') {
          fetchNews();
        }
      });

      connection.value
          .start()
          .then(() => console.log('Connected to the SignalR hub'))
          .catch((err) => console.error('Error connecting to the SignalR hub: ', err));
    } catch (error) {
      console.error('Error setting up SignalR:', error);
    }
  };

  const initialize = async () => {
    news.value = loadNewsFromLocalStorage();
    await fetchNews();
    setupSignalR();
  };

  return {
    news,
    loading,
    fetchNews,
    setupSignalR,
    initialize,
  };
});