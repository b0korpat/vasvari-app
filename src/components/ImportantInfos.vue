<template>
  <div class="page-container">

    <div class="page-load-animation">

      <div class="section-container">
        <div class="section-header">
          <ion-icon :icon="calendarOutline" class="section-icon"></ion-icon>
          <span>Nyitvatartás</span>
        </div>

        <transition-group name="list-anim" tag="div" class="hours-grid" appear>
          <div
              v-for="(day, index) in officeHours"
              :key="day.day" class="hours-item"
              :style="{ '--i': index }" >
            <div :class="{ 'today-badge': isToday(day.day) }" class="day-badge">
              {{ day.day }}
            </div>
            <div class="hours-time">{{ day.hours }}</div>
          </div>
        </transition-group>
      </div>

      <div class="section-container">
        <div class="section-header">
          <ion-icon :icon="timeOutline" class="section-icon"></ion-icon>
          <span>Csengetési rend</span>
        </div>

        <div class="schedule-tabs">
          <ion-segment v-model="selectedScheduleType" mode="ios" swipe-gesture> <ion-segment-button value="normal"> <ion-label>Normál</ion-label>
          </ion-segment-button>
            <ion-segment-button value="adult"> <ion-label>Felnőtt</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <div v-show="selectedScheduleType === 'normal'">
          <transition-group name="list-anim" tag="div" class="schedule-list-normal" appear>
            <div v-for="(item, index) in normalSchedule" :key="'normal-' + index" class="schedule-item" :style="{ '--i': index }">
              <div class="schedule-number">{{ index + 1 }}</div> <div class="schedule-details">
              <span class="schedule-name">{{ item.time }}</span>
            </div>
            </div>
          </transition-group>
        </div>

        <div v-show="selectedScheduleType === 'adult'">
          <div class="adult-schedule-header">
            <ion-icon :icon="schoolOutline" class="schedule-icon"></ion-icon>
            <span>Hétfő és szerda</span>
          </div>
          <transition-group name="list-anim" tag="div" class="schedule-list-adult" appear>
            <div v-for="(item, index) in adultSchedule" :key="'adult-' + index" class="schedule-item" :style="{ '--i': index }">
              <div class="schedule-number">{{ index + 1 }}</div> <div class="schedule-details">
              <span class="schedule-name">{{ item.time }}</span>
            </div>
            </div>
          </transition-group>
        </div>

      </div>

      <div class="section-container">
        <div class="section-header">
          <ion-icon :icon="peopleOutline" class="section-icon"></ion-icon>
          <span>Kapcsolat</span>
        </div>

        <transition-group name="list-anim" tag="div" class="contact-list" appear>
          <div
              v-for="(contact, index) in contacts"
              :key="contact.name" class="contact-item"
              @click="openContact(contact)"
              :style="{ '--i': index }" :class="{ 'clickable': contact.type !== 'info' }" >
            <ion-icon :icon="getIconForContact(contact.type)" class="contact-icon"></ion-icon>
            <div class="contact-details">
              <div class="contact-name">{{ contact.name }}</div>
              <div class="contact-info">
                {{ contact.info }}
                <ion-icon v-if="contact.name === 'OM azonosító'" :icon="clipboard" class="copy-icon" @click.stop="copyOmId(contact.action)"></ion-icon>
              </div>
            </div>
            <ion-icon v-if="contact.type !== 'info'" :icon="chevronForward" class="forward-icon"></ion-icon>
          </div>
        </transition-group>
      </div>

    </div> </div> </template>

<script lang="ts" setup>
import {
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
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
import { ref, } from "vue";

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
  { time: '7:10 - 7:55' },
  { time: '8:00 - 8:45' },
  { time: '8:55 - 9:40' },
  { time: '9:50 - 10:40' },
  { time: '10:50 - 11:35' },
  { time: '11:45 - 12:30' },
  { time: '12:45 - 13:30' },
  { time: '13:40 - 14:25' },
  { time: '14:30 - 15:15' },
  { time: '15:20 - 16:05' },
]);

const adultSchedule = ref<ScheduleItem[]>([
  { time: '15:30 - 16:15' },
  { time: '16:20 - 17:05' },
  { time: '17:10 - 17:55' },
  { time: '18:00 - 18:45' },
  { time: '18:50 - 19:35' },
  { time: '19:40 - 20:25' },
  { time: '20:30 - 21:15' },
]);

const contacts = ref<Contact[]>([
  { name: 'Iskola', info: 'info@vasvari.org', type: 'email', action: 'mailto:info@vasvari.org' },
  { name: 'Titkárság', info: '+36-62/425-322', type: 'phone', action: 'tel:+36-62/425-322' },
  { name: 'Cím', info: 'Szeged, Gutenberg u. 11.', type: 'location', action: 'https://maps.google.com/?q=Szeged,+Gutenberg+u.+11.' }, // Use standard maps link
  { name: 'OM azonosító', info: '203052/010', type: 'info', action: '203052/010' }, // Action holds the value to copy
]);

const officeHours = ref<DayHours[]>([
  { day: 'H', hours: '6:00 - 21:00' },
  { day: 'K', hours: '6:00 - 18:00' },
  { day: 'Sz', hours: '6:00 - 21:00' },
  { day: 'Cs', hours: '9:00 - 18:00' }, // Assuming office hours might differ from building hours
  { day: 'P', hours: '9:00 - 18:00' },
]);

const getIconForContact = (type: string) => {
  switch (type) {
    case 'email': return mailOutline;
    case 'phone': return callOutline;
    case 'location': return locationOutline;
    case 'info': return informationCircleOutline;
    default: return peopleOutline; // Fallback
  }
};

const isToday = (dayAbbreviation: string): boolean => {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
  const daysMap: { [key: string]: number } = { 'H': 1, 'K': 2, 'Sz': 3, 'Cs': 4, 'P': 5, 'Szo': 6, 'V': 0 };
  return daysMap[dayAbbreviation] === today;
};


const openContact = (contact: Contact) => {
  // Prevent action if it's just info type (copy handled by icon click)
  if (contact.type === 'info') {
    // Maybe show a toast "Kattints a másolás ikonra"
    return;
  }
  // Open link for other types if action exists
  if (contact.action) {
    try {
      // Use '_system' for Capacitor to open externally if possible
      window.open(contact.action, '_system');
    } catch (e) {
      console.error("Failed to open link:", e);
      window.open(contact.action, '_blank'); // Fallback to _blank
    }
  }
};

// Specific function for copying OM ID, called by icon click
const copyOmId = async (omId: string | undefined) => {
  if (!omId) return;
  try {
    await navigator.clipboard.writeText(omId);
    await showToast('OM azonosító másolva');
  } catch (err) {
    console.error('Failed to copy OM ID:', err);
    await showToast('Másolás sikertelen', 'danger');
  }
};


const showToast = async (message: string, color: string = 'success') => {
  const toast = await toastController.create({
    message: message,
    duration: 1500, // Slightly longer duration
    position: 'bottom',
    color: color, // Use dynamic color
    cssClass: 'custom-toast' // Optional: for custom styling
  });
  await toast.present();
};

</script>

<style scoped>
/* --- Base & Layout --- */
.page-container {
  padding: 16px; /* Padding for the whole page */
}
.page-load-animation {
  /* Applied animation */
  opacity: 0;
}

/* --- Section Styling --- */
.section-container {
  margin-bottom: 28px; /* Space between sections */
  /* padding: 0 10px; Removed, handled by page-container */
  /* Animation properties */
  animation: sectionFadeInUp 0.5s ease-out forwards;
  opacity: 0;
}
.section-container:nth-of-type(1) { animation-delay: 0.1s; }
.section-container:nth-of-type(2) { animation-delay: 0.2s; }
.section-container:nth-of-type(3) { animation-delay: 0.3s; }
/* Add more if needed */

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--ion-text-color);
  /* padding-left: 5px; Removed, handled by section container padding */
}
.section-icon {
  margin-right: 10px;
  font-size: 1.3rem;
  color: var(--ion-color-primary);
}

/* --- Hours Grid --- */
.hours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(65px, 1fr)); /* Responsive */
  gap: 12px;
}
.hours-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px;
  background-color: var(--ion-card-background);
  box-shadow: 0 2px 5px rgba(0,0,0,0.07);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  /* Animation handled by transition-group */
}
.hours-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.day-badge {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 6px;
  font-weight: bold;
  font-size: 0.85rem;
  border: 1px solid var(--ion-color-medium-tint); /* Softer border */
  color: var(--ion-color-medium-shade);
  background-color: transparent;
}
.today-badge {
  background-color: var(--ion-color-primary);
  border-color: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  /* animation: todayPulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1); */
}
.hours-time {
  font-size: 0.75rem;
  color: var(--ion-color-medium-shade);
  text-align: center; /* Center time text */
}

/* --- Schedule --- */
.schedule-tabs ion-segment {
  --background: rgba(var(--ion-color-medium-rgb), 0.1);
  border-radius: 10px;
  margin-bottom: 20px;
}
.schedule-tabs ion-segment-button {
  --color: var(--ion-color-medium-shade);
  --color-checked: var(--ion-color-primary-contrast);
  --indicator-color: var(--ion-color-primary);
  --indicator-box-shadow: 0 2px 5px rgba(var(--ion-color-primary-rgb), 0.3);
  text-transform: none;
  font-weight: 500;
  border-radius: 8px;
  margin: 2px;
  --padding-top: 10px;
  --padding-bottom: 10px;
}
.schedule-tabs ion-segment-button::part(indicator),
.schedule-tabs ion-segment-button::part(indicator-background) {
  border-radius: 8px;
}


.schedule-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  background-color: var(--ion-card-background);
  box-shadow: 0 2px 5px rgba(0,0,0,0.07);
  margin: 0 0 10px 0; /* Margin only bottom */
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  /* Animation handled by transition-group */
}
.schedule-item:hover {
  transform: translateY(-2px); /* Subtle hover */
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.09);
}
.schedule-number {
  width: 28px;
  height: 28px;
  flex-shrink: 0; /* Prevent shrinking */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border-radius: 50%;
  margin-right: 15px;
  font-weight: bold;
  font-size: 0.9rem;
}
.schedule-details {
  overflow: hidden;
}
.schedule-name {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--ion-text-color);
  white-space: nowrap;
}

.adult-schedule-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  margin: 0 0 12px 0; /* Margin bottom only */
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ion-color-primary);
  background-color: rgba(var(--ion-color-primary-rgb), 0.1);
  border-radius: 8px;
}
.schedule-icon {
  font-size: 1.1rem;
  margin-right: 8px;
}

/* --- Contact --- */
.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 10px;
  background-color: var(--ion-card-background);
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.07);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out;
  /* Animation handled by transition-group */
}
.contact-item.clickable {
  cursor: pointer;
}
.contact-item.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.contact-item.clickable:active {
  transform: scale(0.98);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background-color: rgba(var(--ion-color-primary-rgb), 0.05);
}

.contact-icon {
  font-size: 1.3rem;
  color: var(--ion-color-primary);
  margin-right: 16px;
  flex-shrink: 0;
}
.contact-details {
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
}
.contact-name {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 2px;
  color: var(--ion-text-color);
}
.contact-info {
  font-size: 0.85rem;
  color: var(--ion-color-medium-shade);
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.copy-icon {
  color: var(--ion-color-primary); /* Make copy icon noticeable */
  font-size: 1.1rem;
  margin-left: 6px; /* Space before icon */
  vertical-align: middle;
  cursor: pointer;
  padding: 2px; /* Increase clickable area */
}
.forward-icon {
  font-size: 1rem;
  color: var(--ion-color-medium);
  opacity: 0.7;
  flex-shrink: 0;
}


/* --- Animation Definitions --- */
@keyframes pageFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes sectionFadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Apply page load animation */
.page-load-animation {
  animation: pageFadeIn 0.4s ease-out forwards;
}


/* General List/Grid Item Animation */
.list-anim-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* Smoother ease */
  transition-delay: calc(0.06s * var(--i));
}
.list-anim-leave-active {
  transition: all 0.2s ease-in;
  position: absolute;
  opacity: 0;
  /* width adjustment might be needed depending on parent */
}
.list-anim-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(15px); /* Subtle start */
}
.list-anim-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Today Badge Pulse (Optional) */
@keyframes todayPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--ion-color-primary-rgb), 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 5px rgba(var(--ion-color-primary-rgb), 0); }
}



</style>