import { useUserStore } from '@/stores/user';
import { ref } from 'vue';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
export const fullName = ref<string>(`${userStore.firstName} ${userStore.lastName}`);
export const first_name = ref<string>(`${userStore.firstName}`);
export const last_name = ref<string>(`${userStore.lastName}`);

export const fetchFullName = async () => {
  if (!userStore.firstName || !userStore.lastName) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('Error fetching user data:', error.message);
      } else {
        userStore.setFirstName(data.first_name);
        userStore.setLastName(data.last_name);
        first_name.value = `${data.first_name}`;
        last_name.value = `${data.last_name}`;
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

export default { fullName, fetchFullName, logout };