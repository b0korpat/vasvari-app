<template>
  <ion-page>
    <ion-content :fullscreen="true">
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
        <div v-for="(day, index) in daysOfWeek" :key="day" class="day-button-container">
          <ion-button
            :fill="selectedDayIndex === index ? 'solid' : 'outline'"
            @click="goToSlide(index)"
            class="day-button"
          >
            {{ getDayAbbreviation(new Date(day).getDay()) }}
          </ion-button>
          <div
            class="day-number"
            :class="{'current-day': isCurrentDay(day)}"
          >
            {{ new Date(day).getDate() }}
          </div>
        </div>
      </div>

      <swiper
        :slides-per-view="1"
        :initial-slide="selectedDayIndex"
        @slideChange="onSlideChange"
        @swiper="onSwiperInit"
      >
        <swiper-slide v-for="(day, index) in daysOfWeek" :key="day">
          <div class="day-container">
            <div>{{ day }}</div>
            <div class="lessons-container">
              <div
                v-for="lesson in lessonsByDay[day]"
                :key="lesson.id"
                class="lesson-box"
              >
                <div>Subject: {{ lesson.subjectName }}</div>
                <div>Teacher: {{ lesson.teacherName }}</div>
                <div>Classroom: {{ lesson.classroomName }}</div>
                <div>Start Time: {{ new Date(lesson.date).toLocaleString() }}</div>
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.css';
import { arrowBackOutline, arrowForwardOutline, notifications } from 'ionicons/icons';
import {first_name, fetchFullName} from '@/components/AuthFunctions'



const currentWeek = ref('');
const daysOfWeek = ref<string[]>([]);
const selectedDayIndex = ref(0);
const lessonsByDay = ref<Record<string, any[]>>({});
const swiperRef = ref<any>(null); // Ref for Swiper instance

const isCurrentDay = (day: string) => {
  const today = new Date();
  const dayOfMonth = new Date(day).getDate();
  return today.getDate() === dayOfMonth && today.getMonth() === new Date(day).getMonth() && today.getFullYear() === new Date(day).getFullYear();
};

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
  monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
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
    const [lessonsResponse, subjectsResponse, teachersResponse, classroomsResponse] =
      await Promise.all([
        fetch('https://779f-188-157-38-153.ngrok-free.app/Lesson'),
        fetch('https://779f-188-157-38-153.ngrok-free.app/Subject'),
        fetch('https://779f-188-157-38-153.ngrok-free.app/Teacher'),
        fetch('https://779f-188-157-38-153.ngrok-free.app/ClassRoom'),
      ]);

    if (
      !lessonsResponse.ok ||
      !subjectsResponse.ok ||
      !teachersResponse.ok ||
      !classroomsResponse.ok
    ) {
      throw new Error('Network response was not ok');
    }

    const lessons = await lessonsResponse.json();
    const subjects = await subjectsResponse.json();
    const teachers = await teachersResponse.json();
    const classrooms = await classroomsResponse.json();

    const subjectsMap = Object.fromEntries(
      subjects.map((subject: any) => [subject.id, subject.name])
    );
    const teachersMap = Object.fromEntries(
      teachers.map((teacher: any) => [teacher.id, teacher.name])
    );
    const classroomsMap = Object.fromEntries(
      classrooms.map((classroom: any) => [classroom.id, classroom.name])
    );

    const groupedLessons: Record<string, any[]> = {};
    daysOfWeek.value.forEach((day) => {
      groupedLessons[day] = lessons
        .filter((lesson: any) => formatDate(new Date(lesson.date)) === day)
        .map((lesson: any) => ({
          ...lesson,
          subjectName: subjectsMap[lesson.subjectId],
          teacherName: teachersMap[lesson.teacherId],
          classroomName: classroomsMap[lesson.classroomId],
        }));
    });
    lessonsByDay.value = groupedLessons;
    console.log('Lessons by day:', lessonsByDay.value);
  } catch (error) {
    console.error('Error fetching lessons:', error);
  }
};

const prevWeek = () => {
  const [start, end] = currentWeek.value
    .split(' - ')
    .map((date) => new Date(date.replace(/\./g, '-')));
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
  goToSlide(0); // Navigate to Monday
};

const nextWeek = () => {
  const [start, end] = currentWeek.value
    .split(' - ')
    .map((date) => new Date(date.replace(/\./g, '-')));
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
  goToSlide(0); // Navigate to Monday
};

const onSwiperInit = (swiperInstance: any) => {
  swiperRef.value = swiperInstance; // Capture Swiper instance
};

const goToSlide = (index: number) => {
  if (swiperRef.value) {
    swiperRef.value.slideTo(index); // Navigate to the corresponding slide
    selectedDayIndex.value = index;
  }
};

const onSlideChange = (swiper: any) => {
  selectedDayIndex.value = swiper.activeIndex;
};

onMounted(async () => {
  fetchFullName();
  getCurrentWeek();
  fetchLessons();
  const today = new Date();
  const dayOfWeek = today.getDay();
  selectedDayIndex.value = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Sunday being 0
  goToSlide(selectedDayIndex.value);
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

.day-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 4px;
}

.day-number {
  font-size: 0.8em;
  margin-top: 4px;
  color: #666; /* Default color */
}
.current-day {
  color: var(--ion-color-primary); /* Highlight current day in ionic primary color */
  font-weight: bold; /* Optional: Make the text bold for better visibility */
}

.day-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  border-radius: 8px;
  margin: 16px;
  padding: 16px;
  font-size: 1.2em;
}
.lessons-container {
  max-height: 60vh; /* Adjust the height as needed */
  overflow-y: auto;
  width: 100%;
}
.lesson-box {
  margin-top: 8px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>