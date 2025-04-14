import {defineStore} from 'pinia';
import {ref} from 'vue';
import {HubConnection, HubConnectionBuilder} from '@microsoft/signalr';
import { CapacitorHttp } from '@capacitor/core';

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
  const backgroundLoading = ref(false);
  const connection = ref<HubConnection | null>(null);
  const lastUpdated = ref<number>(0);

  const LOCAL_STORAGE_KEY = 'newsData';
  const TIMESTAMP_KEY = 'newsLastUpdated';

  const saveNewsToLocalStorage = (data: NewsItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      const timestamp = Date.now();
      localStorage.setItem(TIMESTAMP_KEY, timestamp.toString());
      lastUpdated.value = timestamp;
    } catch (error) {
      console.error('Error saving news to localStorage:', error);
    }
  };

  const loadNewsFromLocalStorage = (): NewsItem[] => {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      const timestamp = localStorage.getItem(TIMESTAMP_KEY);
      if (timestamp) {
        lastUpdated.value = parseInt(timestamp);
      }
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading news from localStorage:', error);
      return [];
    }
  };

  const fetchNews = async (isBackground = false) => {
    if (!isBackground) {
      loading.value = true;
    } else {
      backgroundLoading.value = true;
    }
  
    try {
      const options = {
        url: 'https://api.vasvariapp.hu/news',
        headers: {
          'Content-Type': 'application/json',
        },
        // CapacitorHttp handles cookies automatically
      };
  
      const response = await CapacitorHttp.get(options);
  
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }
  
      const data = response.data; // CapacitorHttp already parses JSON
  
      const dataChanged = JSON.stringify(data) !== JSON.stringify(news.value);
      if (dataChanged) {
        news.value = data;
        saveNewsToLocalStorage(data);
      }
  
      return dataChanged;
    } catch (error) {
      console.error('Error fetching news:', error);
      return false;
    } finally {
      if (!isBackground) {
        loading.value = false;
      } else {
        backgroundLoading.value = false;
      }
    }
  };

  const setupSignalR = () => {
    try {
      connection.value = new HubConnectionBuilder()
          .withUrl('https://api.vasvariapp.hu/notificationHub')
          .build();

      connection.value.on('ReceiveMessage', (title: string, message: string) => {
        console.log(`Received message: ${title}: ${message}`);

        if (title === 'News') {
          fetchNews(true);
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
    const cachedNews = loadNewsFromLocalStorage();
    if (cachedNews.length > 0) {
      news.value = cachedNews;
    }

    if (cachedNews.length > 0) {
      fetchNews(true);
    } else {
      await fetchNews(false);
    }

    setupSignalR();
  };

  return {
    news,
    loading,
    backgroundLoading,
    lastUpdated,
    fetchNews,
    setupSignalR,
    initialize,
  };
});