import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const firstName = ref<string>('');
  const lastName = ref<string>('');
  const email = ref<string>('');

  const setFirstName = (newFirstName: string) => {
    firstName.value = newFirstName;
  };

  const setLastName = (newLastName: string) => {
    lastName.value = newLastName;
  };

  const setEmail = (newEmail: string) => {
    email.value = newEmail;
  };

  const clearUser = () => {
    firstName.value = '';
    lastName.value = '';
    email.value = '';
  };

  return { firstName, lastName, email, setFirstName, setLastName, setEmail, clearUser };
});