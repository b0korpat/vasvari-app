import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const firstName = ref<string>('');
  const lastName = ref<string>('');

  const setFirstName = (newFirstName: string) => {
    firstName.value = newFirstName;
  };

  const setLastName = (newLastName: string) => {
    lastName.value = newLastName;
  };

  const clearUser = () => {
    firstName.value = '';
    lastName.value = '';
  };

  return { firstName, lastName, setFirstName, setLastName, clearUser };
});
