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
            :resistance-ratio="0.5"
            @slideChange="onSlideChange"
            @swiper="onSwiperInit"
            :touchReleaseOnEdges="true"
            :resistance="true"
            :edgeSwipeDetection="true"
            :edgeSwipeThreshold="30"
            :watchSlidesProgress="true"
        >
          <swiper-slide v-for="day in daysOfWeek" :key="day">
            <ion-content class="lessons-container">
              <ion-refresher slot="fixed" @ionRefresh="doRefresh">
                <ion-refresher-content />
              </ion-refresher>

              <div v-if="showSkeletonForDay(day)" class="lessons-skeleton-container">
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

              <template v-else>
                <transition name="fade" mode="out-in">
                  <ion-card v-if="isHoliday(day)" class="holiday-card" :key="'holiday-' + day">
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

                  <div v-else-if="!filteredLessons(day).length" class="no-lessons" :key="'no-lessons-' + day">
                    <ion-icon :icon="calendarOutline" class="no-lessons-icon"></ion-icon>
                    <p>Nincsenek órák ezen a napon</p>
                  </div>

                  <div v-else :key="'lessons-' + day">
                    <transition-group name="list-anim" tag="div" class="lessons-list" appear>
                      <div
                          v-for="(lesson, index) in filteredLessons(day)"
                          :key="lesson.id"
                          :class="['lesson-item', getLessonClass(lesson), { 'current-lesson': isCurrentLesson(lesson, day) }]"
                          @click="openLessonDetails(lesson)"
                          :style="{ '--i': index }" >
                        <div v-if="isRegularLesson(lesson)" class="room-pill" v-show="lesson.shortroom">
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
                    </transition-group>
                  </div>
                </transition>
              </template>
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
import { onMounted, ref, nextTick, computed } from 'vue';
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
const initialLoadComplete = ref(false);

const isSwiping = ref(false);
const touchStartX = ref(0);
const edgeSwipeThreshold = 50;

const isSwipingToChangeWeek = ref(false);

const onTouchEnd = (swiper: any, event: TouchEvent) => {
  if (!isSwiping.value) return;
  isSwiping.value = false;

  const touchEndX = event.changedTouches[0].clientX;
  const deltaX = touchEndX - touchStartX.value;

  if (swiper.isBeginning && deltaX > edgeSwipeThreshold) {
    isSwipingToChangeWeek.value = true;
    prevWeek();
  } else if (swiper.isEnd && deltaX < -edgeSwipeThreshold) {
    isSwipingToChangeWeek.value = true;
    nextWeek();
  }
};

const onSlideChange = (swiper: any) => {
  if (isSwipingToChangeWeek.value) {
    isSwipingToChangeWeek.value = false;
    return;
  }

  const newIndex = swiper.activeIndex;

  if (selectedDayIndex.value !== newIndex) {
    selectedDayIndex.value = newIndex;
  }
};

const goToSlide = (index: number) => {
  if (selectedDayIndex.value !== index) {
    selectedDayIndex.value = index;
    if (swiperRef.value) {
      swiperRef.value.slideTo(index);
    }
  }
};

const prevWeek = () => {
  const [startStr, endStr] = currentWeek.value.split(' - ');
  const start = new Date(startStr.replace(/\./g, '-'));
  const end = new Date(endStr.replace(/\./g, '-'));
  start.setDate(start.getDate() - 7);
  end.setDate(end.getDate() - 7);

  updateWeekAndDays(start, end);

  selectedDayIndex.value = 6;

  fetchLessonsForCurrentWeek(start, end);

  nextTick(() => {
    if (swiperRef.value) {
      swiperRef.value.slideTo(6, 0);
    }
  });
};


const nextWeek = () => {
  const [startStr, endStr] = currentWeek.value.split(' - ');
  const start = new Date(startStr.replace(/\./g, '-'));
  const end = new Date(endStr.replace(/\./g, '-'));
  start.setDate(start.getDate() + 7);
  end.setDate(end.getDate() + 7);

  updateWeekAndDays(start, end);

  selectedDayIndex.value = 0;

  fetchLessonsForCurrentWeek(start, end);

  nextTick(() => {
    if (swiperRef.value) {
      swiperRef.value.slideTo(0, 0);
    }
  });
};


const updateWeekAndDays = (start: Date, end: Date) => {
  currentWeek.value = `${formatDate(start)} - ${formatDate(end)}`;
  daysOfWeek.value = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return formatDate(day);
  });
};

const fetchLessonsForCurrentWeek = (start: Date, end: Date) => {
  const startISO = start.toISOString().split('T')[0];
  const endISO = end.toISOString().split('T')[0];
  const hasLessonsForWeek = daysOfWeek.value.some((day) => lessonStore.lessonsByDay[day]);

  lessonStore.refreshLessons(
      startISO,
      endISO,
      !hasLessonsForWeek
  );
};


const updateSelectedDay = () => {
  const today = formatDate(new Date());
  const todayIndex = daysOfWeek.value.findIndex((day) => day === today);

  let targetIndex = 0;
  if (todayIndex !== -1) {
    targetIndex = todayIndex;
  }

  if (selectedDayIndex.value !== targetIndex || !swiperRef.value?.initialized) {
    selectedDayIndex.value = targetIndex;
    if (swiperRef.value) {
      swiperRef.value.slideTo(targetIndex, 0);
    }
  }
};



const onSwiperInit = (swiperInstance: any) => {
  swiperRef.value = swiperInstance;

  swiperInstance.el.addEventListener('touchstart', (e: TouchEvent) => {
    touchStartX.value = e.touches[0].clientX;
    isSwiping.value = true;
  });

  swiperInstance.el.addEventListener('touchend', (e: TouchEvent) => {
    onTouchEnd(swiperInstance, e);
  });

  updateSelectedDay();
};


const hasCachedDataForWeek = computed(() => {
  return daysOfWeek.value.some(day => lessonStore.lessonsByDay[day]?.length > 0);
});

const showSkeletonForDay = (day: string) => {
  return lessonStore.loading && (!lessonStore.lessonsByDay[day] || lessonStore.lessonsByDay[day]?.length === 0);
};

const filteredLessons = (day: string) => {
  return lessonStore.lessonsByDay[day]?.filter((lesson) => {
    if (isRegularLesson(lesson) || lesson.name === 'Lyukasóra') return true;
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
  return formatDate(today) === day;
};

const isRegularLesson = (lesson: any) => {
  return lesson.name !== 'Lyukasóra' && !lesson.name?.startsWith('Szünet');
};

const getLessonClass = (lesson: any) => {
  if (lesson.name === 'Lyukasóra') return 'gap-lesson';
  if (lesson.name?.startsWith('Szünet')) return 'break-lesson';
  return 'regular-lesson';
};

const isCurrentLesson = (lesson: any, day: string | undefined) => {
  if (!lesson || !day || !isRegularLesson(lesson) || !isCurrentDay(day)) return false;

  try {
    const now = new Date();
    const lessonStartStr = `${day.replace(/\./g, '-')}T${lesson.starttime}:00`;
    const lessonEndStr = `${day.replace(/\./g, '-')}T${lesson.endtime}:00`;

    const lessonStartDate = new Date(lessonStartStr);
    const lessonEndDate = new Date(lessonEndStr);

    if (isNaN(lessonStartDate.getTime()) || isNaN(lessonEndDate.getTime())) {
      console.error("Invalid date created for lesson:", lesson);
      return false;
    }

    return now >= lessonStartDate && now <= lessonEndDate;

  } catch (e) {
    console.error("Error parsing lesson time:", e, lesson, day);
    return false;
  }
};


const isHoliday = (day: string) => {
  const dayDate = new Date(day.replace(/\./g, '-'));
  dayDate.setHours(12, 0, 0, 0);
  return holidayStore.holidays.some((holiday) => {
    const startDate = new Date(holiday.holiday_date);
    const endDate = new Date(holiday.end_date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return dayDate >= startDate && dayDate <= endDate;
  });
};

const getHolidayName = (day: string) => {
  const dayDate = new Date(day.replace(/\./g, '-'));
  dayDate.setHours(12, 0, 0, 0);
  const holiday = holidayStore.holidays.find((h) => {
    const startDate = new Date(h.holiday_date);
    const endDate = new Date(h.end_date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return dayDate >= startDate && dayDate <= endDate;
  });
  return holiday ? holiday.holiday_name : 'Iskolai szünet';
};

const getCurrentWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  updateWeekAndDays(monday, sunday);
};


const doRefresh = async (event: any) => {
  try {
    const [startStr, endStr] = currentWeek.value.split(' - ');
    const start = new Date(startStr.replace(/\./g, '-'));
    const end = new Date(endStr.replace(/\./g, '-'));
    const startISO = start.toISOString().split('T')[0];
    const endISO = end.toISOString().split('T')[0];
    await lessonStore.refreshLessons(startISO, endISO, true);
    await holidayStore.fetchHolidays();
  } catch (error) {
    console.error('Error during refresh:', error);
  } finally {
    if (event && event.target && typeof event.target.complete === 'function') {
      event.target.complete();
    }
  }
};


const getLessonNumber = (day: string, currentLessonId: string) => {
  const isDinamicLessonNumbers = localStorage.getItem('isDynamicLessonNumber') === 'true';

  if (!isDinamicLessonNumbers) {
    const lesson = lessonStore.lessonsByDay[day]?.find(l => l.id === currentLessonId);
    if (lesson && lesson.starttime) {
      const standardTimes: { [key: string]: number } = {
        '07:10': 0, '07:15': 0,
        '08:00': 1,
        '08:55': 2, '09:00': 2,
        '09:50': 3, '09:55': 3,
        '10:45': 4, '10:50': 4,
        '11:40': 5, '11:45': 5,
        '12:35': 6, '12:40': 6, '12:45': 6,
        '13:30': 7, '13:35': 7, '13:40': 7,
        '14:25': 8, '14:30': 8,
        '15:20': 9, '15:25': 9,
        '16:15': 10,'16:20': 10,
      };
      if (standardTimes[lesson.starttime] !== undefined) {
        return standardTimes[lesson.starttime];
      }
      console.warn(`Lesson start time ${lesson.starttime} not found in standard times.`);
      const hour = parseInt(lesson.starttime.split(':')[0], 10);
      if (hour >= 7 && hour <= 17) return hour - 7;
      return '?';
    }
    return '?';
  }

  if (!lessonStore.lessonsByDay[day]) return 1;
  let count = 0;
  for (const lesson of lessonStore.lessonsByDay[day]) {
    if (isRegularLesson(lesson)) {
      count++;
      if (lesson.id === currentLessonId) {
        return count;
      }
    }
  }
  const targetLesson = lessonStore.lessonsByDay[day].find(l => l.id === currentLessonId);
  if(targetLesson && !isRegularLesson(targetLesson)) return '-';

  return count + 1;
};


const openLessonDetails = (lesson: any) => {
  const dayOfLesson = daysOfWeek.value[selectedDayIndex.value];
  selectedLesson.value = { ...lesson, date: dayOfLesson };
  isModalOpen.value = true;
};

onMounted(async () => {
  lessonStore.loadFromLocalStorage();


  getCurrentWeek();
  updateSelectedDay();


  holidayStore.fetchHolidays();

  const [startStr, endStr] = currentWeek.value.split(' - ');
  const start = new Date(startStr.replace(/\./g, '-'));
  const end = new Date(endStr.replace(/\./g, '-'));

  const showLoading = !daysOfWeek.value.some(day => lessonStore.lessonsByDay[day]?.length > 0);

  await lessonStore.refreshLessons(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
      showLoading
  );

  initialLoadComplete.value = true;

  nextTick(() => {
    if (swiperRef.value) {
      swiperRef.value.slideTo(selectedDayIndex.value, 0);
    }
  });

});
</script>

<style scoped>


.lessons-container {
  height: calc(100vh - 270px); /* Adjust this value as needed */
  overflow-y: auto; /* Ensure scrolling within the container */
  padding: 0; /* Swiper slide usually handles padding */
  background-color: var(--ion-background-color);
}

.swiper-slide ion-content.lessons-container {
  /* Override potential Ionic content padding */
  --padding-start: 0px;
  --padding-end: 0px;
  --padding-top: 10px; /* Add some space at the top */
  --padding-bottom: 10px; /* Add some space at the bottom */
}


.lesson-item {
  display: flex;
  margin: 10px 15px; /* Slightly more horizontal margin */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15); /* Softer shadow */
  cursor: pointer;
  position: relative;
  background-color: var(--ion-card-background); /* Ensure background */
  /* Animation transition */
  transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
}

.lesson-item:active {
  transform: scale(0.97); /* Kisebb nyomás effekt */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.regular-lesson {
  border-left: 5px solid var(--ion-color-primary);
  min-height: 75px; /* Slightly taller */
}

.gap-lesson {
  min-height: 50px;
  background-color: transparent; /* Less prominent */
  border: 1px dashed rgba(var(--ion-color-medium-rgb), 0.3); /* Dashed border */
  box-shadow: none;
  justify-content: center;
  align-items: center;
  color: var(--ion-color-medium);
  font-style: italic;
  opacity: 0.8;
}

.break-lesson {
  min-height: 35px; /* Shorter breaks */
  background-color: rgba(var(--ion-color-medium-rgb), 0.08);
  box-shadow: none;
  border-left: 5px solid transparent; /* No border */
  justify-content: center; /* Center break content */
  align-items: center;
  padding: 5px 15px;
}

.current-lesson {
  border-left-color: var(--ion-color-success); /* Use border color */
  box-shadow: 0 4px 10px rgba(var(--ion-color-success-rgb), 0.25); /* More pronounced shadow */
}
/* Keep background subtle */
.current-lesson::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(var(--ion-color-success-rgb), 0.1);
  border-radius: 12px; /* Match parent */
  z-index: -1; /* Place behind content */
  opacity: 0.6;
}


.current-lesson .room-pill {
  background-color: var(--ion-color-success);
}

.time-indicator {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 65px; /* Slightly wider */
  background-color: rgba(var(--ion-color-primary-rgb), 0.1); /* Subtler background */
  padding: 8px 4px;
  border-right: 1px solid rgba(var(--ion-color-medium-rgb), 0.1); /* Separator */
}

.current-lesson .time-indicator {
  background-color: rgba(var(--ion-color-success-rgb), 0.15);
}

.lesson-number {
  font-size: 1.3rem; /* Larger number */
  font-weight: 600; /* Slightly bolder */
  color: var(--ion-color-primary);
  line-height: 1.1;
}

.current-lesson .lesson-number {
  color: var(--ion-color-success);
}


.lesson-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.7rem;
  color: var(--ion-color-medium-shade);
  margin-top: 2px;
}
.lesson-time span:last-child {
  opacity: 0.8;
}

.lesson-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 15px; /* Consistent padding */
  overflow: hidden; /* Prevent text overflow issues */
}

.lesson-name {
  font-weight: 600; /* Bolder name */
  font-size: 1rem;
  color: var(--ion-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Add ellipsis if name is too long */
}

.lesson-teacher {
  font-size: 0.8rem; /* Slightly larger teacher name */
  color: var(--ion-color-medium);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-pill {
  position: absolute;
  right: 12px; /* Consistent spacing */
  top: 27px; /* Position top right */
  /* transform: translateY(-50%); */ /* Removed transform */
  background-color: var(--ion-color-primary);
  color: white;
  font-size: 0.7rem; /* Smaller text */
  font-weight: 500;
  padding: 3px 7px; /* Adjust padding */
  border-radius: 10px; /* Pill shape */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 1;
}


.break-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--ion-color-medium);
  font-size: 0.85rem;
}

.break-icon {
  font-size: 1.1rem; /* Slightly smaller */
  opacity: 0.8;
}

.no-lessons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* Ensure it takes some space */
  padding: 40px 20px;
  text-align: center;
  color: var(--ion-color-medium);
}

.no-lessons-icon {
  font-size: 3.5rem; /* Larger icon */
  margin-bottom: 16px;
  opacity: 0.4; /* More subtle */
}
.no-lessons p {
  font-size: 1rem;
}

.holiday-card {
  margin: 16px;
  border-left: 5px solid var(--ion-color-warning);
  background-color: rgba(var(--ion-color-warning-rgb), 0.08); /* Subtler background */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}
.holiday-card ion-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-warning);
}
.holiday-card ion-card-content {
  font-size: 0.95rem;
  padding-top: 0;
}


/* --- Modal Styles --- */
.lesson-details-modal {
  --width: 90%;
  --max-width: 500px;
  --border-radius: 20px; /* More rounded */
  --max-height: 60vh; /* Limit height */
  --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* Softer shadow */
}

.modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--ion-background-color); /* Ensure background */
  border-radius: 20px; /* Match modal */
  overflow: hidden; /* Needed for child border-radius */
}

.modal-header {
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-tint)); /* Lighter gradient */
  color: var(--ion-color-primary-contrast); /* Ensure contrast */
  padding: 15px 20px; /* Adjust padding */
  /* Removed border radius here, applied to modal-content */
}

.current-lesson-header {
  background: linear-gradient(135deg, var(--ion-color-success), var(--ion-color-success-tint));
  color: var(--ion-color-success-contrast);
}

.header-top {
  display: flex;
  /* justify-content: space-between; - Removed as only close button is here */
  justify-content: flex-end; /* Align close button to the right */
  align-items: center;
  margin-bottom: 5px; /* Space before title */
}

.header-top ion-button {
  --color: var(--ion-color-primary-contrast); /* Ensure button icon is visible */
}
.current-lesson-header .header-top ion-button {
  --color: var(--ion-color-success-contrast);
}


.subject-title {
  font-size: 1.5rem; /* Adjust size */
  font-weight: 600; /* Bold but not extra bold */
  margin: 0 0 10px 0; /* Adjusted margin */
  line-height: 1.3;
}

.modal-inner-content {
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 20px; /* Space at bottom */
}

.lesson-details {
  padding: 0 20px; /* Match header padding */
}

.detail-section {
  /* Removed background and border-radius, looks cleaner */
  padding: 16px 0; /* Vertical padding */
  margin: 0; /* No extra margin */
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 16px; /* Standard gap */
  margin-bottom: 20px; /* More space between rows */
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(var(--ion-color-medium-rgb), 0.1); /* Subtle separator */
}

.detail-row:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.detail-row ion-icon {
  font-size: 22px; /* Slightly smaller icon */
  margin-top: 4px;
  flex-shrink: 0; /* Prevent icon shrinking */
  color: var(--ion-color-primary); /* Consistent color */
}

.detail-row h3 {
  margin: 0 0 5px 0;
  font-size: 0.8rem; /* Smaller label */
  color: var(--ion-color-medium-shade);
  font-weight: 500;
  text-transform: uppercase; /* Uppercase label */
  letter-spacing: 0.5px;
}

.detail-row p {
  margin: 0;
  font-size: 1rem; /* Standard text size */
  color: var(--ion-text-color);
  font-weight: 500;
  line-height: 1.4;
}

p.detail-secondary {
  font-size: 0.85rem !important; /* Ensure override */
  color: var(--ion-color-medium);
  margin-top: 4px !important;
}


/* --- Skeleton Styles --- */
.lessons-skeleton-container {
  padding: 0 10px; /* Match lesson list container */
}

.skeleton-lesson-item {
  display: flex;
  margin: 12px 5px; /* Match lesson item margin */
  border-radius: 12px;
  overflow: hidden;
  height: 75px; /* Match regular lesson height */
  background-color: var(--ion-card-background); /* Match lesson background */
  border-left: 5px solid rgba(var(--ion-color-medium-rgb), 0.2); /* Dimmed border */
  opacity: 0.7; /* Make skeleton slightly transparent */
}

.skeleton-time {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 65px; /* Match time indicator */
  background-color: rgba(var(--ion-color-medium-rgb), 0.05);
  padding: 8px 4px;
  border-right: 1px solid rgba(var(--ion-color-medium-rgb), 0.08);
}

.skeleton-number, .skeleton-times, .skeleton-name, .skeleton-room, .skeleton-teacher {
  background-color: rgba(var(--ion-color-medium-rgb), 0.15); /* Base color for pulse */
}


.skeleton-number {
  width: 25px; /* Slightly larger */
  height: 25px;
  border-radius: 4px;
  margin-bottom: 8px; /* More space */
}

.skeleton-times {
  width: 40px;
  height: 14px; /* Taller */
  border-radius: 3px;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 15px;
  gap: 8px; /* Increased gap */
}

.skeleton-name {
  width: 75%; /* Wider */
  height: 18px; /* Taller */
  border-radius: 4px;
}

.skeleton-room { /* Combined room/teacher placeholder */
  width: 45%;
  height: 14px;
  border-radius: 3px;
}
.skeleton-teacher { /* No need for separate teacher skeleton */
  display: none;
}


/* --- Calendar Header Styles --- */
.calendar-header {
  padding: 12px 10px 10px 10px; /* Adjusted padding */
  border-bottom: 1px solid var(--ion-border-color, rgba(var(--ion-color-medium-rgb), 0.2));
  position: sticky; /* Make header sticky */
  z-index: 10; /* Ensure it's above content */

}

.week-navigator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px; /* Less margin */
}

.nav-button {
  --padding-start: 6px;
  --padding-end: 6px;
  margin: 0;
  height: 32px; /* Smaller buttons */
  --color: var(--ion-color-primary); /* Ensure color */
}
.nav-button ion-icon {
  font-size: 20px; /* Adjust icon size */
}

.week-display {
  display: flex;
  align-items: center;
  background-color: rgba(var(--ion-color-primary-rgb), 0.08); /* Subtler */
  border-radius: 16px;
  padding: 6px 12px; /* Adjust padding */
  font-weight: 500;
  color: var(--ion-color-primary);
  font-size: 0.85rem; /* Smaller font */
}

.calendar-icon {
  margin-right: 6px;
  font-size: 1rem; /* Adjust size */
}

.days-carousel {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* Equal width columns */
  padding: 4px 0; /* Vertical padding only */
  width: 100%; /* Ensure full width */
}

.day-item {
  width: 100%;
  min-width: 0;
}

.day-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 2px; /* Reduced horizontal padding */
}

.day-badge {
  width: 32px; /* Slightly smaller */
  height: 32px;
  font-size: 0.8rem; /* Smaller text for narrow screens */
}

.date-number {
  font-size: 0.7rem;
  font-weight: 500;
}

.day-item {
  min-width: 40px; /* Minimum width */
  margin: 0 3px; /* Gap between items */
  padding: 0;
  cursor: pointer;
  /* Removed transition here, handled by child */
}

.day-item:active .day-wrapper {
  transform: scale(0.95); /* Apply scale on wrapper */
}

.day-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 0; /* Padding inside wrapper */
  border-radius: 8px; /* Rounded wrapper */
  transition: transform 0.15s ease-out, background-color 0.3s ease; /* Add background transition */
}

.day-badge {
  width: 36px; /* Smaller badge */
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent; /* Transparent background */
  color: var(--ion-color-medium-shade);
  font-weight: 600; /* Bolder */
  font-size: 0.9rem;
  margin-bottom: 3px;
  border: 2px solid transparent; /* Placeholder for border */
  /* Transition added via CSS below */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Refined animation timing */
}

.date-number {
  font-size: 0.7rem; /* Smaller date */
  color: var(--ion-color-medium);
  font-weight: 500;
  transition: color 0.3s ease;
}

/* --- Selected and Today States --- */
.selected-day .day-wrapper {
  background-color: rgba(var(--ion-color-primary-rgb), 0.1); /* Highlight wrapper */
}

.selected-day .day-badge {
  background-color: var(--ion-color-primary);
  color: white;
  border-color: var(--ion-color-primary);
  transform: scale(1.05); /* Refined scale */
}

.today .day-badge {
  border: 2px solid var(--ion-color-primary); /* Border for today */
  color: var(--ion-color-primary); /* Color for today */
}

.selected-day .date-number,
.today .date-number {
  color: var(--ion-color-primary);
  font-weight: 600; /* Bold date number */
}

.selected-day.today .day-badge {
  /* Already styled by .selected-day .day-badge */
}


/* --- Animation Definitions --- */

/* General Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* List Item Animation (Staggered Fade-in-up) */
.list-anim-enter-active {
  transition: all 0.4s ease-out;
  transition-delay: calc(0.05s * var(--i)); /* Staggering effect */
}
.list-anim-leave-active {
  transition: all 0.2s ease-in;
  position: absolute; /* Important for transition-group leave animation */
  width: calc(100% - 30px); /* Match lesson item margin (15px each side) */
  opacity: 0; /* Fade out immediately */
}
.list-anim-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-anim-leave-to {
  opacity: 0;
  transform: translateX(30px); /* Slide out effect */
}




.lesson-details-modal .lesson-details {
  animation: modalContentFadeIn 0.4s ease-out 0.15s forwards; /* Delay after modal transition */
  opacity: 0;
}
@keyframes modalContentFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
</style>