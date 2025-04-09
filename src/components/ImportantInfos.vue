<template>
  <div>

    <div class="page-load-animation">


      <div class="section-container">
        <div class="section-header">
          <ion-icon :icon="calendarOutline" class="section-icon"></ion-icon>
          <span>Nyitvatartás</span>
        </div>


        <div class="hours-grid">
          <div
              v-for="(day, index) in officeHours"
              :key="index"
              class="hours-item"
          >
            <div :class="{ 'today-badge': isToday(day.day) }" class="day-badge">
              {{ day.day }}
            </div>
            <div class="hours-time">{{ day.hours }}</div>
          </div>
        </div>
      </div>

      <div class="section-container">
        <div class="section-header">
          <ion-icon :icon="timeOutline" class="section-icon"></ion-icon>
          <span>Csengetési rend</span>
        </div>

        <div class="schedule-tabs">
          <ion-segment v-model="selectedScheduleType">
            <ion-segment-button content-id="normal" value="normal">
              <ion-label>Normál</ion-label>
            </ion-segment-button>
            <ion-segment-button content-id="adult" value="adult">
              <ion-label>Felnőtt</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <ion-segment-view>
          <ion-segment-content id="normal">
            <div v-for="(item, index) in normalSchedule" :key="'normal-' + index" class="schedule-item">
              <div class="schedule-number">{{ index}}</div>
              <div class="schedule-details">
                <span class="schedule-name">{{ item.time }}</span>
              </div>
            </div>
          </ion-segment-content>
          <ion-segment-content id="adult">
            <div class="adult-schedule-header">
              <ion-icon :icon="schoolOutline" class="schedule-icon"></ion-icon>
              <span>Hétfő és szerda</span>
            </div>
            <div v-for="(item, index) in adultSchedule" :key="index" class="schedule-item">
              <div class="schedule-number">{{ index }}</div>
              <div class="schedule-details">
                <span class="schedule-name">{{ item.time }}</span>
              </div>
            </div>
          </ion-segment-content>


        </ion-segment-view>


      </div>

      <div class="section-container">
        <div class="section-header">
          <ion-icon :icon="peopleOutline" class="section-icon"></ion-icon>
          <span>Kapcsolat</span>
        </div>

        <div v-for="(contact, index) in contacts" :key="index" class="contact-item" @click="openContact(contact)">
          <ion-icon :icon="getIconForContact(contact.type)" class="contact-icon"></ion-icon>
          <div class="contact-details">
            <div class="contact-name">{{ contact.name }}</div>
            <div class="contact-info">
              {{ contact.info }}
              <ion-icon v-if="contact.name === 'OM azonosító'" :icon="clipboard" class="copy-icon"></ion-icon>
            </div>
          </div>
          <ion-icon :icon="chevronForward" class="forward-icon"></ion-icon>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  toastController
} from '@ionic/vue';
import {
  calendarOutline,
  callOutline,
  chevronForward,
  clipboard,
  informationCircleOutline,
  locationOutline,
  mailOutline,
  peopleOutline,
  schoolOutline,
  timeOutline
} from 'ionicons/icons';
import {ref} from "vue";

interface ScheduleItem {
  time: string;
}

interface Contact {
  name: string;
  info: string;
  type: string;
  action: string;
}

interface DayHours {
  day: string;
  hours: string;
}

const selectedScheduleType = ref('normal');

const normalSchedule = ref<ScheduleItem[]>([
  {time: '7:10 - 7:55'},
  {time: '8:00 - 8:45'},
  {time: '8:55 - 9:40'},
  {time: '9:50 - 10:40'},
  {time: '10:50 - 11:35'},
  {time: '11:45 - 12:30'},
  {time: '12:45 - 13:30'},
  {time: '13:40 - 14:25'},
  {time: '14:30 - 15:15'},
  {time: '15:20 - 16:05'},
]);

const adultSchedule = ref<ScheduleItem[]>([
  {time: '15:30 - 16:15'},
  {time: '16:20 - 17:05'},
  {time: '17:10 - 17:55'},
  {time: '18:00 - 18:45'},
  {time: '18:50 - 19:35'},
  {time: '19:40 - 20:25'},
  {time: '20:30 - 21:15'},
]);

const contacts = ref<Contact[]>([
  {name: 'Iskola', info: 'info@vasvari.org', type: 'email', action: 'mailto:info@vasvari.org'},
  {name: 'Titkárság', info: '+36-62/425-322', type: 'phone', action: 'tel:+36-62/425-322'},
  {
    name: 'Cím',
    info: 'Szeged, Gutenberg u. 11.',
    type: 'location',
    action: 'https://maps.google.com/?q=6722+Szeged,+Gutenberg+utca+11'
  },
  {name: 'OM azonosító', info: '203052/010', type: 'info', action: '203052/010'},
]);

const officeHours = ref<DayHours[]>([
  {day: 'H', hours: '6:00 - 21:00'},
  {day: 'K', hours: '6:00 - 18:00'},
  {day: 'Sz', hours: '6:00 - 21:00'},
  {day: 'Cs', hours: '9:00 - 18:00'},
  {day: 'P', hours: '9:00 - 18:00'}
]);

const getIconForContact = (type: string) => {
  switch (type) {
    case 'email':
      return mailOutline;
    case 'phone':
      return callOutline;
    case 'location':
      return locationOutline;
    case 'info':
      return informationCircleOutline;
    default:
      return peopleOutline;
  }
};

const isToday = (day: string) => {
  const days = ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Szo'];
  return days[new Date().getDay()] === day;
};

const openContact = (contact: Contact) => {
  if (contact.type === 'info' || contact.name === 'OM azonosító') {
    navigator.clipboard.writeText(contact.action || '')
        .then(() => {
          showToast('OM azonosító másolva a vágólapra');
        })
        .catch(err => {
          console.error('Failed to copy:', err);
        });
    return;
  }
  if (contact.action) {
    window.open(contact.action, '_blank');
  }
};

const showToast = async (message: string) => {
  const toast = await toastController.create({
    message: message,
    duration: 1000,
    position: 'bottom',
    color: 'success',
  });
  await toast.present();
};

</script>

<style scoped>

.section-container {
  margin-bottom: 24px;
  padding: 0 12px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ion-text-color);
}

.section-icon {
  margin-right: 8px;
  font-size: 1.3rem;
  color: var(--ion-color-primary);
}


.hours-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.hours-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.day-badge {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ion-color-medium);
  color: white;
  border-radius: 50%;
  margin-bottom: 8px;
  font-weight: bold;
}

.today-badge {
  background-color: var(--ion-color-primary);
}

.hours-time {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
}


.schedule-tabs {
  margin-bottom: 16px;
}


.adult-schedule-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(var(--ion-color-primary-rgb), 0.1);
  border-radius: 8px;
  margin: 0 10px 10px 10px;
  font-weight: 500;
}

.schedule-icon {
  margin-right: 8px;
  color: var(--ion-color-primary);
}

.schedule-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.1);
  border-radius: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  margin: 0 10px 10px 10px;
}

.schedule-number {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ion-color-primary);
  color: white;
  border-radius: 50%;
  margin-right: 12px;
  font-weight: bold;
}

.schedule-details {
  display: flex;
  flex-direction: column;
}

.schedule-name {
  font-weight: 600;
  color: var(--ion-text-color);
}


.contact-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 10px;
  background-color: rgba(var(--ion-color-medium-rgb), 0.1);
  border-radius: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.contact-icon {
  font-size: 1.4rem;
  color: var(--ion-color-primary);
  margin-right: 16px;
}

.contact-details {
  flex: 1;
}

.contact-name {
  font-weight: 600;
  color: var(--ion-text-color);
}

.contact-info {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  display: flex;
  align-items: center;
}

.forward-icon {
  color: var(--ion-color-medium);
}

.copy-icon {
  color: var(--ion-color-medium);
  font-size: 1.1rem;
  margin-left: 2px;
}
</style>