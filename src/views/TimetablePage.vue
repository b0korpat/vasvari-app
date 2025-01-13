<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-toolbar class="seamless-toolbar">
        <ion-buttons slot="start">
          <ion-label class="large-text">Szia, XY!</ion-label>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon slot="icon-only" :icon="notifications" class="large-icon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <div class="week-selector">
        <ion-button @click="prevWeek" fill="clear" class="arrow-button">
          <ion-icon :icon="arrowBackOutline"></ion-icon>
        </ion-button>
        <ion-label>{{ currentWeek }}</ion-label>
        <ion-button @click="nextWeek" fill="clear" class="arrow-button">
          <ion-icon :icon="arrowForwardOutline"></ion-icon>
        </ion-button>
      </div>
      <div class="day-buttons">
        <ion-button
          v-for="(day, index) in daysOfWeek"
          :key="day"
          :fill="selectedDayIndex === index ? 'solid' : 'outline'"
          @click="selectDay(index)"
          class="day-button"
        >
          {{ getDayAbbreviation(new Date(day).getDay()) }}
        </ion-button>
      </div>
      <Carousel :itemsToShow="1" :modelValue="selectedDayIndex" @update:modelValue="updateSelectedDay">
        <Slide v-for="(day, index) in daysOfWeek" :key="day">
          <div class="day-container">
            <div>{{ day }}</div>
            <div v-for="lesson in lessonsByDay[day]" :key="lesson.id" class="lesson">
              <div>Lesson ID: {{ lesson.id }}</div>
              <div>Start Time: {{ new Date(lesson.startTime).toLocaleString() }}</div>
            </div>
          </div>
        </Slide>
      </Carousel>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, IonLabel } from '@ionic/vue';
import { arrowBackOutline, arrowForwardOutline, notifications } from 'ionicons/icons';
import { Carousel, Slide } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';

const currentWeek = ref('');
const daysOfWeek = ref<string[]>([]);
const selectedDayIndex = ref(0);
const lessonsByDay = ref<Record<string, any[]>>({});

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const getDayAbbreviation = (day: number) => {
  const days = ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Szo'];
  return days[day];
};

const getCurrentWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust when today is Sunday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  currentWeek.value = `${formatDate(monday)} - ${formatDate(sunday)}`;
  daysOfWeek.value = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return formatDate(day);
  });
};

const fetchLessons = async () => {
  try {
    const response = await fetch('https://localhost:7116/api/lesson');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const lessons = await response.json();
    const groupedLessons: Record<string, any[]> = {};
    daysOfWeek.value.forEach(day => {
      groupedLessons[day] = lessons.filter((lesson: any) => formatDate(new Date(lesson.startTime)) === day);
    });
    lessonsByDay.value = groupedLessons;
  } catch (error) {
    console.error('Error fetching lessons:', error);
  }
};

const prevWeek = () => {
  const [start, end] = currentWeek.value.split(' - ').map(date => new Date(date.replace(/\./g, '-')));
  start.setDate(start.getDate() - 7);
  end.setDate(end.getDate() - 7);
  currentWeek.value = `${formatDate(start)} - ${formatDate(end)}`;
  daysOfWeek.value = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return formatDate(day);
  });
  selectedDayIndex.value = 0;
  fetchLessons();
};

const nextWeek = () => {
  const [start, end] = currentWeek.value.split(' - ').map(date => new Date(date.replace(/\./g, '-')));
  start.setDate(start.getDate() + 7);
  end.setDate(end.getDate() + 7);
  currentWeek.value = `${formatDate(start)} - ${formatDate(end)}`;
  daysOfWeek.value = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return formatDate(day);
  });
  selectedDayIndex.value = 0;
  fetchLessons();
};

const selectDay = (index: number) => {
  selectedDayIndex.value = index;
};

const updateSelectedDay = (index: number) => {
  selectedDayIndex.value = index;
};

onMounted(() => {
  getCurrentWeek();
  fetchLessons();
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
  font-size: 1.4em; /* Adjust the size as needed */
}
.large-icon {
  font-size: 2em; /* Adjust the size as needed */
}
.week-selector {
  display: flex;
  align-items: center;
  justify-content: center;
}
.day-buttons {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
.day-button {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  padding: 0;
  text-align: center;
}
.day-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  border-radius: 8px;
  margin: 16px;
  padding: 16px;
  font-size: 1.2em;
}
.lesson {
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
  text-align: center;
}
</style>