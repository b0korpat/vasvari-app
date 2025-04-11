import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const truncateName = (name: string, maxLength = 13) =>
    name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;

export const useUserStore = defineStore('user', () => {
  const firstName = ref('');
  const lastName = ref('');
  const email = ref('');
  const uid = ref('');
  const isAuthenticated = ref(true);


  const initializeFromLocalStorage = () => {
    firstName.value = localStorage.getItem('firstName') || '';
    lastName.value = localStorage.getItem('lastName') || '';
    email.value = localStorage.getItem('email') || '';
    uid.value = localStorage.getItem('uid') || '';
  };

  initializeFromLocalStorage();

  const displayFirstName = computed(() => truncateName(firstName.value));
  const displayLastName = computed(() => truncateName(lastName.value));
  const fullName = computed(() => `${firstName.value} ${lastName.value}`);


  const setUser = (userData: {
    firstName: string;
    lastName: string;
    email: string;
    uid: string;
  }) => {
    firstName.value = userData.firstName;
    lastName.value = userData.lastName;
    email.value = userData.email;
    uid.value = userData.uid;

    localStorage.setItem('firstName', userData.firstName);
    localStorage.setItem('lastName', userData.lastName);
    localStorage.setItem('email', userData.email);
    localStorage.setItem('uid', userData.uid);
  };

  const clearUser = () => {
    firstName.value = '';
    lastName.value = '';
    email.value = '';
    uid.value = '';
    isAuthenticated.value = false;

    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
    localStorage.removeItem('uid');

  };

  return {
    firstName,
    lastName,
    email,
    uid,
    isAuthenticated,
    displayFirstName,
    displayLastName,
    fullName,
    setUser,
    clearUser,
  };
});