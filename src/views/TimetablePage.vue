<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-toolbar class="seamless-toolbar">
        <ion-buttons slot="start">
          <ion-label class="large-text">Szia, {{ first_name }}!</ion-label>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon
              slot="icon-only"
              :icon="notifications"
              class="large-icon"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <div class="page-load-animation">
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
          <div
            v-for="(day, index) in daysOfWeek"
            :key="day"
            class="day-button-container"
          >
            <ion-button
              :fill="selectedDayIndex === index ? 'solid' : 'outline'"
              @click="goToSlide(index)"
              class="day-button"
            >
              {{ getDayAbbreviation(new Date(day).getDay()) }}
            </ion-button>
            <div
              class="day-number"
              :class="{ 'current-day': isCurrentDay(day) }"
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
            <div class="teszt">
            <div>{{ day }}</div>
            <ion-content class="lessons-container">
              <ion-refresher slot="fixed" @ionRefresh="doRefresh">
                <ion-refresher-content />
              </ion-refresher>
              <div
                v-for="lesson in lessonsByDay[day]"
                :key="lesson.id"
                class="lesson-box"
              >
                <div>Subject: {{ lesson.name }}</div>
                <div>Teacher: {{ lesson.teachername }}</div>
                <div>Classroom: {{ lesson.room }}</div>
                <div>Start Time: {{ lesson.starttime }}</div>
              </div>
            </ion-content>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonButtons,
  IonToolbar,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import {
  arrowBackOutline,
  arrowForwardOutline,
  notifications,
} from "ionicons/icons";
import { first_name, fetchUser } from "@/components/AuthFunctions";
import { supabase } from "@/supabase";

const currentWeek = ref("");
const daysOfWeek = ref<string[]>([]);
const selectedDayIndex = ref(0);
const lessonsByDay = ref<Record<string, any[]>>({});
const swiperRef = ref<any>(null); // Ref for Swiper instance

const doRefresh = (event: any) => {
  console.log("Begin async operation");

  setTimeout(async () => {
    await fetchLessons(); // Refresh lessons data
    event.target.complete(); // Signal the refresher to close
    console.log("Async operation has ended");
  }, 1000); // Simulate a short delay for loading
};

const isCurrentDay = (day: string) => {
  const today = new Date();
  const dayOfMonth = new Date(day).getDate();
  return (
    today.getDate() === dayOfMonth &&
    today.getMonth() === new Date(day).getMonth() &&
    today.getFullYear() === new Date(day).getFullYear()
  );
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const getDayAbbreviation = (day: number) => {
  const days = ["V", "H", "K", "Sz", "Cs", "P", "Szo"];
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
    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("id, name, teachername, room, starttime");

    if (error) {
      throw new Error(error.message);
    }

    const groupedLessons: Record<string, any[]> = {};
    daysOfWeek.value.forEach((day) => {
      groupedLessons[day] = lessons
        .filter((lesson: any) => formatDate(new Date(lesson.starttime)) === day)
        .map((lesson: any) => ({
          ...lesson,
          starttime: formatTime(new Date(lesson.starttime)),
        }));
    });
    lessonsByDay.value = groupedLessons;
    console.log("Lessons by day:", lessonsByDay.value);
  } catch (error) {
    console.error("Error fetching lessons:", error);
  }
};
const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const prevWeek = () => {
  const [start, end] = currentWeek.value
    .split(" - ")
    .map((date) => new Date(date.replace(/\./g, "-")));
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
    .split(" - ")
    .map((date) => new Date(date.replace(/\./g, "-")));
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
  fetchUser();
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
  color: var(
    --ion-color-primary
  ); /* Highlight current day in ionic primary color */
  font-weight: bold; /* Optional: Make the text bold for better visibility */
}

.lessons-container {
  border: 1px solid red;
height: calc(100vh - 267px);;
text-align: center;


}

.lesson-box {
  width: 80%;
  margin: 8px auto ;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

}
.test {
  border: 1px solid red;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
