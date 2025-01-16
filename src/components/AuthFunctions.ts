import { useUserStore } from '@/stores/user';
import { ref } from 'vue';
import { supabase } from '@/supabase';

const userStore = useUserStore();
export const fullName = ref<string>(`${userStore.firstName} ${userStore.lastName}`);
export const first_name = ref<string>(`${userStore.firstName}`);
export const last_name = ref<string>(`${userStore.lastName}`);
export const email = ref<string>(`${userStore.email}`);

export const fetchUser = async () => {
  if (!userStore.firstName || !userStore.lastName || !userStore.email) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('Error fetching user data:', error.message);
      } else {
        userStore.setFirstName(data.first_name);
        userStore.setLastName(data.last_name);
        userStore.setEmail(data.email);
        first_name.value = `${data.first_name}`;
        last_name.value = `${data.last_name}`;
        email.value = `${data.email}`;
        fullName.value = `${data.first_name} ${data.last_name}`;
      }
    } else {
      console.error('No user is logged in');
    }
  }
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error.message);
  } else {
    userStore.clearUser();
  }
};

export default { fullName, fetchUser, logout };