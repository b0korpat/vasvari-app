import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const username = ref<string>('');

  const setUsername = (newUsername: string) => {
    username.value = newUsername;
  };

  const clearUser = () => {
    username.value = '';
  };

  return { username, setUsername, clearUser };
});
