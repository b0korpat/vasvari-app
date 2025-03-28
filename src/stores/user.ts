import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const truncateName = (name: string, maxLength = 13) =>
    name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;

export const useUserStore = defineStore('user', () => {
  const firstName = ref('');
  const lastName = ref('');
  const email = ref('');
  const uid = ref('');
  const token = ref('');

  const initializeFromLocalStorage = () => {
    firstName.value = localStorage.getItem('firstName') || '';
    lastName.value = localStorage.getItem('lastName') || '';
    email.value = localStorage.getItem('email') || '';
    uid.value = localStorage.getItem('uid') || '';
    token.value = localStorage.getItem('token') || '';
  };

  initializeFromLocalStorage();

  const displayFirstName = computed(() => truncateName(firstName.value));
  const displayLastName = computed(() => truncateName(lastName.value));
  const fullName = computed(() => `${firstName.value} ${lastName.value}`);
  const isAuthenticated = computed(() => !!token.value);

  const setUser = (userData: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    firstName.value = userData.firstName;
    lastName.value = userData.lastName;
    email.value = userData.email;

    localStorage.setItem('firstName', userData.firstName);
    localStorage.setItem('lastName', userData.lastName);
    localStorage.setItem('email', userData.email);
  };

  const setAuthData = (authData: { uid: string; token: string }) => {
    uid.value = authData.uid;
    token.value = authData.token;

    localStorage.setItem('uid', authData.uid);
    localStorage.setItem('token', authData.token);
  };

  const clearUser = () => {
    firstName.value = '';
    lastName.value = '';
    email.value = '';
    uid.value = '';
    token.value = '';

    // Remove from localStorage
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
    localStorage.removeItem('uid');
    localStorage.removeItem('token');

  };

  return {
    firstName,
    lastName,
    email,
    uid,
    token,
    displayFirstName,
    displayLastName,
    fullName,
    isAuthenticated,
    setUser,
    setAuthData,
    clearUser,
  };
});