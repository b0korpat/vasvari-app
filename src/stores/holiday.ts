import { defineStore } from 'pinia';
import { ref } from 'vue';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import {useUserStore} from "@/stores/user";

export interface Holiday {
  id: number;
  holiday_name: string;
  holiday_date: string;
  end_date: string;  // Added end date
}

export const useHolidayStore = defineStore('holiday', () => {
  const holidays = ref<Holiday[]>([]);
  const loading = ref(true);
  const countdown = ref<{ [key: number]: { days: number } }>({});
  const loadingCountdown = ref<{ [key: number]: boolean }>({});
  const connection = ref<HubConnection | null>(null);

  const LOCAL_STORAGE_KEY = 'holidaysData';

  const fetchHolidays = async () => {
    let userStore = useUserStore();
    try {
      const response = await fetch('https://backend-production-f2dd.up.railway.app/api/Break', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userStore.token}`
        },
      });

      if (!response.ok) throw new Error('Failed to fetch holiday data');

      const data = await response.json();
      holidays.value = data.map((item: any) => ({
        id: item.id,
        holiday_name: item.name,
        holiday_date: item.startDate,
        end_date: item.endDate || calculateEndDate(item.startDate)
      }));

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(holidays.value));
      startCountdown();
      console.log('Holidays fetched successfully:', holidays.value);
    } catch (err) {
      console.error('Fetch error:', err);
      const storedHolidays = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedHolidays) {
        holidays.value = JSON.parse(storedHolidays);
      }
    } finally {
      loading.value = false;
    }
  };

  const calculateEndDate = (startDate: string) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 7);
    return date.toISOString();
  };

  const setupSignalR = () => {
    connection.value = new HubConnectionBuilder()
        .withUrl('https://backend-production-f2dd.up.railway.app/notificationHub')
        .build();

    connection.value.on('ReceiveMessage', (title: string, message: string) => {
      console.log(`Received message: ${title}: ${message}`);

      if (title === 'Break') {
        fetchHolidays();
      }
    });

    connection.value
        .start()
        .then(() => console.log('Connected to the SignalR hub'))
        .catch((err) => console.error('Error connecting to the SignalR hub: ', err));
  };

  const startCountdown = () => {
    holidays.value.forEach((holiday) => {
      loadingCountdown.value[holiday.id] = true;
    });

    setInterval(() => {
      holidays.value.forEach((holiday) => {
        countdown.value[holiday.id] = calculateTimeLeft(holiday.holiday_date);
        loadingCountdown.value[holiday.id] = false;
      });
    }, 1000);
  };

  const calculateTimeLeft = (date: string) => {
    const holidayDate = new Date(date).getTime();
    const now = new Date().getTime();
    const timeDiff = holidayDate - now;

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return { days };
  };

  const calculateProgress = (date: string) => {
    const holidayDate = new Date(date).getTime();
    const now = new Date().getTime();
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
    return ((now - startOfYear) / (holidayDate - startOfYear)) * 100;
  };

  const calculateDuration = (holiday: Holiday) => {
    const startDate = new Date(holiday.holiday_date).getTime();
    const endDate = new Date(holiday.end_date).getTime();
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))+1;
  };

  const initialize = async () => {
    await fetchHolidays();
    setupSignalR();
  };

  return {
    holidays,
    loading,
    countdown,
    loadingCountdown,
    fetchHolidays,
    setupSignalR,
    startCountdown,
    calculateTimeLeft,
    calculateProgress,
    calculateDuration,
    initialize,
  };
});