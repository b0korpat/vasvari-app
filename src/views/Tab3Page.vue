<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div v-if="loading" class="pink-text">Loading...</div>
      <pre v-else class="pink-text">{{ jsonData }}</pre>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';

const loading = ref(true);
const jsonData = ref(null);

const fetchData = async () => {
  try {
    const response = await fetch('https://7ffc-188-157-38-153.ngrok-free.app/Lesson');
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      jsonData.value = data;
    } else {
      const text = await response.text();
      console.error('Unexpected response format:', text);
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.pink-text {
  color: pink;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f8f8f8;
  padding: 16px;
  border-radius: 8px;
}
</style>