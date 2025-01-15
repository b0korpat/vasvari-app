import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovezaiwpnicjbetgymbt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZXphaXdwbmljamJldGd5bWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NjU2MTUsImV4cCI6MjA1MjQ0MTYxNX0.BaXYZ-QG8hwimFISmjnqHpMFTJh60xt_IA3MEO-6-38';
export const supabase = createClient(supabaseUrl, supabaseKey);
