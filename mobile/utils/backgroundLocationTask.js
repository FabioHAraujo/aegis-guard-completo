// utils/backgroundLocationTask.js
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/bases/supabase';

const LOCATION_TASK_NAME = 'background-location-task';

// Definir a task que será executada em background
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location) {
      const { latitude, longitude } = location.coords;
      const timestamp = Date.now();
      const today = new Date();
      const formattedDate = `${today.getFullYear()}${String(
        today.getMonth() + 1
      ).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

      try {
        // Salvar no Supabase
        await supabase.from('realtime_locations').upsert({
          latitude,
          longitude,
          timestamp,
        });

        // Salvar histórico
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          await supabase.from('locations_users').insert([
            {
              user_id: userId,
              latitude,
              longitude,
              timestamp,
              date: formattedDate,
            },
          ]);
        }

        console.log('Location saved in background:', { latitude, longitude });
      } catch (error) {
        console.error('Error saving location in background:', error);
      }
    }
  }
});

export { LOCATION_TASK_NAME };