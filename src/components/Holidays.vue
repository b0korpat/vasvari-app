<template>
  <div>
    <div v-if="holidayStore.loading" class="loading-container">
      <ion-spinner name="crescent"></ion-spinner>
    </div>
    <div v-else class="page-load-animation">
      <ion-refresher slot="fixed" @ionRefresh="doRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-card :class="currentHoliday ? 'current-holiday-card' : 'next-holiday-card'">
        <ion-card-header>
          <div class="header-row">
            <ion-chip :color="currentHoliday ? 'success' : 'primary'">
              {{ currentHoliday ? '🎉Most' : 'Következő' }}
            </ion-chip>
            <ion-card-title>{{ (currentHoliday || nextHoliday)?.holiday_name }}</ion-card-title>
          </div>
          <ion-card-subtitle>
            {{ formatDate(new Date((currentHoliday || nextHoliday)?.holiday_date || '')) }} -
            {{ formatDate(new Date((currentHoliday || nextHoliday)?.end_date || '')) }}
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="date-bar-container">
            <template v-if="currentHoliday">
              <span>{{ formatDate(new Date(currentHoliday.holiday_date)) }}</span>
              <div class="loading-bar hero-holiday-bar">
                <div :style="{ width: calculateCurrentHolidayProgress(currentHoliday) + '%' }"
                     class="loading-bar-progress success-progress"></div>
              </div>
              <span>{{ formatDate(new Date(currentHoliday.end_date)) }}</span>
            </template>
            <template v-else-if="nextHoliday">
              <span>{{ formatDate(new Date()) }}</span>
              <div class="loading-bar hero-holiday-bar">
                <div :style="{ width: holidayStore.calculateProgress(nextHoliday.holiday_date) + '%' }"
                     class="loading-bar-progress"></div>
              </div>
              <span>{{ formatDate(new Date(nextHoliday.holiday_date)) }}</span>
            </template>
          </div>
          <div :class="{ 'current-holiday-info': currentHoliday }" class="holiday-info">
            <div class="info-item">
              <ion-icon :icon="timeOutline" class="info-icon"></ion-icon>
              <p :class="{ 'current-days-left': currentHoliday }" class="days-left">
                {{
                  currentHoliday ? `${daysUntilHolidayEnd(currentHoliday)} nap a szünet végéig` : nextHoliday ? `${holidayStore.countdown[nextHoliday.id]?.days} nap hátra` : ''
                }}
              </p>
            </div>
            <div class="info-item">
              <ion-icon :icon="calendarOutline" class="info-icon"></ion-icon>
              <p class="holiday-duration">{{ holidayStore.calculateDuration(currentHoliday || nextHoliday!) }} nap
                hosszú</p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-accordion-group>
        <ion-accordion>
          <ion-item slot="header" class="section-header-content">
            <ion-label>Összes szünet</ion-label>
          </ion-item>

          <div slot="content" class="holiday-list">
            <ion-card v-for="holiday in sortedHolidays" :key="holiday.id" :class="getHolidayCardClass(holiday)">
              <ion-card-header>
                <div class="header-row">
                  <ion-chip :color="getHolidayStatusColor(holiday)">
                    {{ getHolidayStatus(holiday) }}
                  </ion-chip>
                  <ion-card-title>{{ holiday.holiday_name }}</ion-card-title>
                </div>
                <ion-card-subtitle>
                  {{ formatDate(new Date(holiday.holiday_date)) }} - {{ formatDate(new Date(holiday.end_date)) }}
                </ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div v-if="!isPastHoliday(holiday)" class="date-bar-container">
                  <template v-if="isCurrentHoliday(holiday)">
                    <span>{{ formatDate(new Date(holiday.holiday_date)) }}</span>
                    <div class="loading-bar">
                      <div :style="{ width: calculateCurrentHolidayProgress(holiday) + '%' }"
                           class="loading-bar-progress success-progress"></div>
                    </div>
                    <span>{{ formatDate(new Date(holiday.end_date)) }}</span>
                  </template>
                </div>
                <div v-if="holidayStore.loadingCountdown[holiday.id]" class="spinner-container">
                  <ion-spinner name="dots"></ion-spinner>
                </div>
                <div v-else class="holiday-info">
                  <div class="info-item">
                    <ion-icon :icon="timeOutline" class="info-icon"></ion-icon>
                    <p :class="{ 'past-days': isPastHoliday(holiday), 'current-days-left': isCurrentHoliday(holiday) }"
                       class="days-left">
                      {{ getHolidayTimeText(holiday) }}
                    </p>
                  </div>
                  <div class="info-item">
                    <ion-icon :icon="calendarOutline" class="info-icon"></ion-icon>
                    <p class="holiday-duration">{{ holidayStore.calculateDuration(holiday) }} nap hosszú</p>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </ion-accordion>
      </ion-accordion-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted} from 'vue';
import {
  IonAccordion,
  IonAccordionGroup,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSpinner
} from '@ionic/vue';
import {calendarOutline, timeOutline} from 'ionicons/icons';
import {Holiday, useHolidayStore} from '@/stores/holiday';

const holidayStore = useHolidayStore();

const doRefresh = async (event: CustomEvent) => {
  await holidayStore.fetchHolidays();
  await (event.target as HTMLIonRefresherElement).complete();
};

const formatDate = (date: Date) => date.toLocaleDateString('hu-HU', {month: 'short', day: 'numeric'});

const sortedHolidays = computed(() => [...holidayStore.holidays].sort((a, b) => new Date(a.holiday_date).getTime() - new Date(b.holiday_date).getTime()));

const isCurrentHoliday = (holiday: Holiday) => {
  const now = new Date().getTime();
  return now >= new Date(holiday.holiday_date).getTime() && now <= new Date(holiday.end_date).getTime();
};

const currentHoliday = computed(() => sortedHolidays.value.find(isCurrentHoliday));

const daysUntilHolidayEnd = (holiday: Holiday) => Math.ceil((new Date(holiday.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

const calculateCurrentHolidayProgress = (holiday: Holiday) => {
  const startDate = new Date(holiday.holiday_date).getTime();
  const endDate = new Date(holiday.end_date).getTime();
  return Math.min(100, Math.max(0, ((new Date().getTime() - startDate) / (endDate - startDate)) * 100));
};

const nextHoliday = computed(() => sortedHolidays.value.find(holiday => new Date(holiday.holiday_date).getTime() > new Date().getTime()));

const isNextHoliday = (holiday: Holiday) => nextHoliday.value?.id === holiday.id;

const isPastHoliday = (holiday: Holiday) => new Date(holiday.end_date).getTime() < new Date().getTime();

const isFutureHoliday = (holiday: Holiday) => {
  const now = new Date().getTime();
  const holidayDate = new Date(holiday.holiday_date).getTime();
  return !isCurrentHoliday(holiday) && !isPastHoliday(holiday) && !isNextHoliday(holiday) && holidayDate > now;
};

const getHolidayTimeText = (holiday: Holiday) => {
  if (isCurrentHoliday(holiday)) return `${daysUntilHolidayEnd(holiday)} nap a szünet végéig`;
  if (isPastHoliday(holiday)) return 'Eltelt';
  return `${holidayStore.countdown[holiday.id]?.days} nap hátra`;
};

const getHolidayStatus = (holiday: Holiday) => {
  if (isCurrentHoliday(holiday)) return '🎉Most';
  if (isNextHoliday(holiday)) return 'Következő';
  if (isPastHoliday(holiday)) return 'Elmúlt';
  return 'Jövő';
};

const getHolidayStatusColor = (holiday: Holiday) => {
  if (isCurrentHoliday(holiday)) return 'success';
  if (isNextHoliday(holiday)) return 'primary';
  if (isPastHoliday(holiday)) return 'medium';
  return 'tertiary';
};

const getHolidayCardClass = (holiday: Holiday) => ({
  'current-holiday-card': isCurrentHoliday(holiday),
  'next-holiday-card': isNextHoliday(holiday),
  'past-holiday-card': isPastHoliday(holiday),
  'future-holiday-card': isFutureHoliday(holiday)
});

onMounted(async () => {
  await holidayStore.initialize();
});
</script>

<style scoped>
ion-card {
  border-radius: 12px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.hero-holiday-bar {
  height: 14px;
}

.success-progress {
  background-color: var(--ion-color-success);
}

.next-holiday-card {
  border-left: 4px solid var(--ion-color-primary);
}

.current-holiday-card {
  border-left: 4px solid var(--ion-color-success);
  background-color: rgba(var(--ion-color-success-rgb), 0.05);
}

.past-holiday-card {
  border-left: 4px solid var(--ion-color-medium);
  opacity: 0.85;
}

.future-holiday-card {
  border-left: 4px solid var(--ion-color-tertiary);
}

.header-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.date-bar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 15px;
}

.loading-bar {
  flex-grow: 1;
  height: 10px;
  background-color: #e0e0e0;
  margin: 0 10px;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
}

.loading-bar-progress {
  height: 100%;
  background-color: var(--ion-color-primary);
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 5px;
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
}

.holiday-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.current-holiday-info {
  background-color: rgba(var(--ion-color-success-rgb), 0.1);
  padding: 10px;
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-icon {
  font-size: 1.2rem;
  margin-right: 5px;
  color: var(--ion-color-medium);
}

.days-left {
  margin: 0;
  font-weight: bold;
  color: var(--ion-color-primary);
}

.current-days-left {
  color: var(--ion-color-success);
}

.past-days {
  color: var(--ion-color-medium);
}

.holiday-duration {
  margin: 0;
  color: var(--ion-color-medium);
}

.section-header-content {
  --background: transparent;
  --border-style: none;
}


.holiday-list {
  overflow: hidden;
}
</style>