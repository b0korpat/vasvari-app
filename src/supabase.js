import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://macqjgwphnifoaxxkfch.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY3FqZ3dwaG5pZm9heHhrZmNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NDg3OTUsImV4cCI6MjA1MjUyNDc5NX0.QAoeNQsoZYjXHHkEDpBH70jGF8J887CrZ1GRAZLslr8';
export const supabase = createClient(supabaseUrl, supabaseKey);
