<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <TopBar />
      <div class="page-load-animation">
        <div class="calendar-header">
          <div class="week-navigator">
            <ion-button fill="clear" class="nav-button" @click="prevWeek">
              <ion-icon :icon="arrowBackOutline" size="small"></ion-icon>
            </ion-button>
            <div class="week-display">
              <ion-icon :icon="calendarOutline" class="calendar-icon"></ion-icon>
              <span>{{ currentWeek }}</span>
            </div>
            <ion-button fill="clear" class="nav-button" @click="nextWeek">
              <ion-icon :icon="arrowForwardOutline" size="small"></ion-icon>
            </ion-button>
          </div>

          <div class="days-carousel">
            <div
                v-for="(day, index) in daysOfWeek"
                :key="day"
                :class="['day-item', { 'selected-day': selectedDayIndex === index }]"
                @click="goToSlide(index)"
            >
              <div class="day-wrapper">
                <div :class="['day-badge', { 'today': isCurrentDay(day) }]">
                  {{ getDayAbbreviation(new Date(day).getDay()) }}
                </div>
                <div class="date-number">{{ new Date(day).getDate() }}</div>
              </div>
            </div>
          </div>
        </div>

        <swiper
            :initial-slide="selectedDayIndex"
            :slides-per-view="1"
            :resistance-ratio="0"
            @slideChange="onSlideChange"
            @swiper="onSwiperInit"
        >
          <swiper-slide v-for="day in daysOfWeek" :key="day">
            <ion-content class="lessons-container">
              <ion-refresher slot="fixed" @ionRefresh="doRefresh">
                <ion-refresher-content />
              </ion-refresher>

              <div v-if="lessonStore.loading" class="lessons-skeleton-container">
                <div v-for="i in 6" :key="i" class="skeleton-lesson-item">
                  <div class="skeleton-time">
                    <div class="skeleton-number pulse"></div>
                    <div class="skeleton-times pulse"></div>
                  </div>
                  <div class="skeleton-content">
                    <div class="skeleton-name pulse"></div>
                    <div class="skeleton-room pulse"></div>
                    <div class="skeleton-teacher pulse"></div>
                  </div>
                </div>
              </div>

              <ion-card v-else-if="isHoliday(day)" class="holiday-card">
                <ion-card-header>
                  <ion-card-title>
                    <ion-icon :icon="sunnyOutline"></ion-icon>
                    Szünet
                  </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  {{ getHolidayName(day) }}
                </ion-card-content>
              </ion-card>

              <div v-else-if="!filteredLessons(day).length" class="no-lessons">
                <ion-icon :icon="calendarOutline" class="no-lessons-icon"></ion-icon>
                <p>Nincsenek órák ezen a napon</p>
              </div>

              <div v-else class="lessons-list">
                <div
                  v-for="lesson in filteredLessons(day)"
                  :key="lesson.id"
                  :class="['lesson-item', getLessonClass(lesson), { 'current-lesson': isCurrentLesson(lesson, day) }]"
                  @click="openLessonDetails(lesson)"
              >
                <div v-if="isRegularLesson(lesson)" class="room-pill" v-show="lesson.room">
                  {{ lesson.shortroom }}
                </div>

                <div v-if="isRegularLesson(lesson)" class="time-indicator">
                  <div class="lesson-number">{{ getLessonNumber(day, lesson.id) }}</div>
                  <div class="lesson-time">
                    <span>{{ lesson.starttime }}</span>
                    <span>{{ lesson.endtime }}</span>
                  </div>
                </div>

                <div v-if="isRegularLesson(lesson)" class="lesson-content">
                  <div class="lesson-name">{{ lesson.displayName }}</div>
                  <div v-if="lesson.teachername" class="lesson-teacher">{{ lesson.teachername }}</div>
                </div>

                <div v-else class="break-content">
                  <ion-icon :icon="timeOutline" class="break-icon"></ion-icon>
                  <div>{{ lesson.name }}</div>
                </div>
              </div>
              </div>
            </ion-content>
          </swiper-slide>
        </swiper>
      </div>
    </ion-content>

    <ion-modal
        :is-open="isModalOpen"
        class="lesson-details-modal"
        @didDismiss="isModalOpen = false"
        :swipe-to-close="true"
    >
      <div class="modal-content">
        <div class="modal-header" :class="{'current-lesson-header': isCurrentLesson(selectedLesson, selectedLesson?.date)}">
          <div class="header-top">
            <ion-buttons>
              <ion-button @click="isModalOpen = false">
                <ion-icon :icon="closeOutline" size="large"></ion-icon>
              </ion-button>
            </ion-buttons>
          </div>

          <h1 class="subject-title">{{ selectedLesson?.subjectName }}</h1>
        </div>

        <ion-content class="modal-inner-content">
          <div v-if="selectedLesson" class="lesson-details">
            <div class="detail-section">
              <div class="detail-row">
                <ion-icon :icon="timeOutline" color="primary"></ion-icon>
                <div>
                  <h3>Időpont</h3>
                  <p>{{ selectedLesson.starttime }} - {{ selectedLesson.endtime }}</p>
                  <p class="detail-secondary">{{ selectedLesson.date }}</p>
                </div>
              </div>

              <div class="detail-row">
                <ion-icon :icon="locationOutline" color="primary"></ion-icon>
                <div>
                  <h3>Terem</h3>
                  <p>{{ selectedLesson.room }}</p>
                </div>
              </div>

              <div class="detail-row">
                <ion-icon :icon="personOutline" color="primary"></ion-icon>
                <div>
                  <h3>Tanár</h3>
                  <p>{{ selectedLesson.teachername }}</p>
                </div>
              </div>

              <div class="detail-row">
                <ion-icon :icon="peopleOutline" color="primary"></ion-icon>
                <div>
                  <h3>Osztály</h3>
                  <p>{{ selectedLesson.studentGroupName }}</p>
                </div>
              </div>
            </div>
          </div>
        </ion-content>
      </div>
    </ion-modal>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue';
import { onMounted, ref, nextTick } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.css';
import {
  arrowBackOutline,
  arrowForwardOutline,
  calendarOutline,
  closeOutline,
  locationOutline,
  peopleOutline,
  personOutline,
  sunnyOutline,
  timeOutline
} from 'ionicons/icons';

import TopBar from '@/components/TopBar.vue';
import { useLessonStore } from '@/stores/lessons';
import { useHolidayStore } from '@/stores/holiday';

const showBreaksBetweenLessons = ref(localStorage.getItem('showBreaksBetweenLessons') === 'true');
const lessonStore = useLessonStore();
const holidayStore = useHolidayStore();

const currentWeek = ref('');
const daysOfWeek = ref<string[]>([]);
const selectedDayIndex = ref(0);
const swiperRef = ref<any>(null);
const isModalOpen = ref(false);
const selectedLesson = ref<any>(null);

const filteredLessons = (day: string) => {
  return lessonStore.lessonsByDay[day]?.filter((lesson) => {
    if (lesson.name === 'Lyukasóra' || isRegularLesson(lesson)) return true;
    if (lesson.name?.startsWith('Szünet')) return showBreaksBetweenLessons.value;
    return false;
  }) || [];
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

const isCurrentDay = (day: string) => {
  const today = new Date();
  const targetDate = new Date(day.replace(/\./g, '-'));
  return (
      today.getDate() === targetDate.getDate() &&
      today.getMonth() === targetDate.getMonth() &&
      today.getFullYear() === targetDate.getFullYear()
  );
};

const isRegularLesson = (lesson: any) => {
  return lesson.name !== 'Lyukasóra' && !lesson.name?.startsWith('Szünet');
};

const getLessonClass = (lesson: any) => {
  if (lesson.name === 'Lyukasóra') return 'gap-lesson';
  if (lesson.name?.startsWith('Szünet')) return 'break-lesson';
  return 'regular-lesson';
};

const isCurrentLesson = (lesson: any, day: string) => {
  if (!isRegularLesson(lesson) || !isCurrentDay(day)) return false;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return lesson.starttime <= currentTime && currentTime <= lesson.endtime;
};

const isHoliday = (day: string) => {
  const dayDate = new Date(day.replace(/\./g, '-'));
  return holidayStore.holidays.some((holiday) => {
    const startDate = new Date(holiday.holiday_date);
    const endDate = new Date(holiday.end_date);
    return dayDate >= startDate && dayDate <= endDate;
  });
};

const getHolidayName = (day: string) => {
  const dayDate = new Date(day.replace(/\./g, '-'));
  const holiday = holidayStore.holidays.find((h) => {
    const startDate = new Date(h.holiday_date);
    const endDate = new Date(h.end_date);
    return dayDate >= startDate && dayDate <= endDate;
  });
  return holiday ? holiday.holiday_name : 'Iskolai szünet';
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

const prevWeek = () => {
  const [start, end] = currentWeek.value.split(' - ').map((date) => new Date(date.replace(/\./g, '-')));
  start.setDate(start.getDate() - 7);
  end.setDate(end.getDate() - 7);
  currentWeek.value = `${formatDate(start)} - ${formatDate(end)}`;
  daysOfWeek.value = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return formatDate(day);
  });
  updateSelectedDay();

  const hasLessonsForWeek = daysOfWeek.value.some((day) => lessonStore.lessonsByDay[day]);
  if (!hasLessonsForWeek) {
    lessonStore.fetchLessons(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0],
        true
    );
  }
};

const nextWeek = () => {
  const [start, end] = currentWeek.value.split(' - ').map((date) => new Date(date.replace(/\./g, '-')));
  start.setDate(start.getDate() + 7);
  end.setDate(end.getDate() + 7);
  currentWeek.value = `${formatDate(start)} - ${formatDate(end)}`;
  daysOfWeek.value = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return formatDate(day);
  });
  updateSelectedDay();

  const hasLessonsForWeek = daysOfWeek.value.some((day) => lessonStore.lessonsByDay[day]);
  if (!hasLessonsForWeek) {
    lessonStore.fetchLessons(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0],
        true
    );
  }
};

const updateSelectedDay = () => {
  const today = formatDate(new Date());
  const todayIndex = daysOfWeek.value.findIndex((day) => day === today);
  selectedDayIndex.value = todayIndex !== -1 ? todayIndex : 0;

  if (swiperRef.value) {
    swiperRef.value.slideTo(selectedDayIndex.value);
  }
};

const onSwiperInit = (swiperInstance: any) => {
  swiperRef.value = swiperInstance;
};

const goToSlide = (index: number) => {
  if (swiperRef.value) {
    swiperRef.value.slideTo(index);
    selectedDayIndex.value = index;
  }
};

const onSlideChange = (swiper: any) => {
  const previousIndex = selectedDayIndex.value;
  const newIndex = swiper.activeIndex;

  selectedDayIndex.value = newIndex;

  if (previousIndex === 0 && newIndex === 6) {
    prevWeek();
    nextTick(() => {
      if (swiperRef.value) {
        swiperRef.value.slideTo(6);
      }
    });
  }
  else if (previousIndex === 6 && newIndex === 0) {
    nextWeek();
    nextTick(() => {
      if (swiperRef.value) {
        swiperRef.value.slideTo(0);
      }
    });
  }
};


const doRefresh = async (event: any) => {
  try {
    const [start, end] = currentWeek.value.split(' - ').map((date) => date.replace(/\./g, '-'));
    await lessonStore.refreshLessons(start, end);
  } catch (error) {
    console.error('Error during refresh:', error);
  } finally {
    event.target.complete();
  }
};

const getLessonNumber = (day: string, currentLessonId: string) => {
  const isDinamicLessonNumbers = localStorage.getItem('isDynamicLessonNumber') === 'true';

  if (!isDinamicLessonNumbers) {
    const lesson = lessonStore.lessonsByDay[day]?.find(l => l.id === currentLessonId);
    if (lesson && lesson.starttime) {
      const standardTimes = [
        { time: '7:10', num: 0 },
        { time: '8:00', num: 1 },
        { time: '8:55', num: 2 },
        { time: '9:55', num: 3 },
        { time: '10:50', num: 4 },
        { time: '11:45', num: 5 },
        { time: '12:45', num: 6 },
        { time: '13:40', num: 7 },
        { time: '14:30', num: 8 },
        { time: '15:20', num: 9 },
      ];


      const exactMatch = standardTimes.find(st => st.time === lesson.starttime);
      if (exactMatch) return exactMatch.num;

      const [lessonHours, lessonMinutes] = lesson.starttime.split(':').map(Number);
      const lessonTotalMinutes = lessonHours * 60 + lessonMinutes;

      let closestTime = standardTimes[0];
      let minDifference = Infinity;

      for (const standardTime of standardTimes) {
        const [stdHours, stdMinutes] = standardTime.time.split(':').map(Number);
        const stdTotalMinutes = stdHours * 60 + stdMinutes;
        const difference = Math.abs(lessonTotalMinutes - stdTotalMinutes);

        if (difference < minDifference) {
          minDifference = difference;
          closestTime = standardTime;
        }
      }

      return closestTime.num;
    }
    return 1;
  }

  if (!lessonStore.lessonsByDay[day]) return 1;
  let count = 0;
  for (const lesson of lessonStore.lessonsByDay[day]) {
    if (lesson.id === currentLessonId) {
      return count + 1;
    }
    if (isRegularLesson(lesson)) {
      count++;
    }
  }
  return count + 1;
};

const openLessonDetails = (lesson: any) => {
  selectedLesson.value = lesson;
  isModalOpen.value = true;
};

onMounted(async () => {
  getCurrentWeek();
  updateSelectedDay();

  await holidayStore.fetchHolidays();
  lessonStore.loadFromLocalStorage();
  await lessonStore.refreshLessons();


  await nextTick();
});
</script>

<style scoped>
.room-pill {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--ion-color-primary);
  color: white;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.current-day {
  color: var(--ion-color-primary);
  font-weight: bold;
}

.lessons-container {
  height: calc(100vh - 280px);
  padding: 0 10px;
  background-color: var(--ion-background-color);
}

.lesson-item {
  display: flex;
  margin: 12px 10px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  position: relative;
}

.lesson-item:active {
    transform: scale(0.98);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

.regular-lesson {
  display: flex;
  background-color: var(--ion-card-background);
  border-left: 4px solid var(--ion-color-primary);
  height: 70px;
}

.gap-lesson {
  height: 50px;
  background-color: rgba(255, 255, 255, 0.05);
  justify-content: center;
  align-items: center;
  opacity: 0.8;
}

.break-lesson {
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
}

.current-lesson {
  border-left: 4px solid var(--ion-color-success);
  background-color: rgba(var(--ion-color-success-rgb), 0.15);
  box-shadow: 0 4px 12px rgba(var(--ion-color-success-rgb), 0.3);
}
.current-lesson .room-pill {
  background-color: var(--ion-color-success);
}

.time-indicator {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 60px;
  background-color: rgba(var(--ion-color-primary-rgb), 0.2);
  padding: 0 8px;
}

.lesson-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--ion-color-primary);
}

.lesson-time {
  display: flex;
  flex-direction: column;
  font-size: 0.7rem;
  color: var(--ion-color-medium);
}

.lesson-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 15px;
}

.lesson-name {
  font-weight: bold;
  font-size: 1rem;
  color: var(--ion-text-color);
}

.lesson-room {
  font-size: 0.8rem;
  color: var(--ion-color-medium-shade);
}

.lesson-teacher {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
}

.break-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--ion-color-medium);
}

.break-icon {
  font-size: 1.2rem;
}

.no-lessons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ion-color-medium);
}

.no-lessons-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.holiday-card {
  margin: 16px;
  border-left: 4px solid var(--ion-color-warning);
  background-color: rgba(var(--ion-color-warning-rgb), 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.lesson-details-modal {
  --width: 90%;
  --max-width: 500px;
  --border-radius: 16px;
  --max-height: 500px;
  --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
  color: white;
  padding: 20px;
  border-radius: 16px 16px 0 0;
}

.current-lesson-header {
  background: linear-gradient(135deg, var(--ion-color-success), var(--ion-color-success-shade));
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subject-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 10px 0 5px;
}

.modal-inner-content {
  --padding-start: 0;
  --padding-end: 0;
}

.lesson-details {
  padding: 0 16px;
}

.detail-section {
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 16px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row ion-icon {
  font-size: 24px;
  margin-top: 3px;
}

.detail-row h3 {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  font-weight: 500;
}

.detail-row p {
  margin: 0;
  font-size: 1.1rem;
  color: var(--ion-text-color);
  font-weight: 500;
}

.detail-secondary {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  margin-top: 4px !important;
}

.skeleton-lesson-item {
  display: flex;
  margin: 12px 10px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 70px;
  background-color: var(--ion-card-background);
  border-left: 4px solid rgba(var(--ion-color-primary-rgb), 0.3);
}

.skeleton-time {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 60px;
  background-color: rgba(var(--ion-color-primary-rgb), 0.1);
  padding: 8px;
}

.skeleton-number {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.2);
  margin-bottom: 6px;
}

.skeleton-times {
  width: 40px;
  height: 12px;
  border-radius: 2px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.2);
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 15px;
  gap: 6px;
}

.skeleton-name {
  width: 70%;
  height: 16px;
  border-radius: 4px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.2);
}

.skeleton-room {
  width: 30%;
  height: 12px;
  border-radius: 4px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.2);
}

.skeleton-teacher {
  width: 50%;
  height: 10px;
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

.calendar-header {
  padding: 16px 12px;
  background-color: var(--ion-background-color);
  border-bottom: 1px solid rgba(var(--ion-color-medium-rgb), 0.2);
}

.week-navigator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.nav-button {
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
  height: 36px;
}

.week-display {
  display: flex;
  align-items: center;
  background-color: rgba(var(--ion-color-primary-rgb), 0.1);
  border-radius: 18px;
  padding: 8px 16px;
  font-weight: 500;
  color: var(--ion-color-primary);
  font-size: 0.9rem;
}

.calendar-icon {
  margin-right: 6px;
  font-size: 1.1rem;
}

.days-carousel {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  margin: 0 -4px;
  padding: 4px 4px;
}

.days-carousel::-webkit-scrollbar {
  display: none;
}

.day-item {
  flex: 0 0 14.28%;
  padding: 0 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.day-item:active {
  transform: scale(0.95);
}

.day-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.day-badge {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(var(--ion-color-medium-rgb), 0.1);
  color: var(--ion-color-medium);
  font-weight: 500;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.selected-day .day-badge {
  background-color: var(--ion-color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(var(--ion-color-primary-rgb), 0.4);
}

.today .day-badge {
  border: 2px solid var(--ion-color-primary);
}

.selected-day.today .day-badge {
  border: none;
}

.date-number {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  font-weight: 500;
}

.selected-day .date-number {
  color: var(--ion-color-primary);
  font-weight: bold;
}

.day-badge.today + .date-number {
  color: var(--ion-color-primary);
  font-weight: bold;
}
</style>