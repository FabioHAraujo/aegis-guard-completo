// utils/locationTracking.js
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/bases/supabase';
import { LOCATION_TASK_NAME } from './backgroundLocationTask';

export async function startBackgroundLocationTracking(userId, onError) {
  if (!userId) {
    onError && onError('Usuário não definido');
    return;
  }

  // Salvar userId no AsyncStorage para usar na background task
  await AsyncStorage.setItem('userId', userId);

  // Solicitar permissões de foreground
  let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    onError && onError('Permissão para acessar a localização foi negada');
    return;
  }

  // Solicitar permissão de background (necessário para iOS)
  let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    onError && onError('Permissão para localização em background foi negada');
    return;
  }

  // Verificar se a task já está rodando
  const isTaskRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (isTaskRunning) {
    console.log('Background location task já está rodando');
    return;
  }

  // Iniciar o rastreamento em background
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 10000, // 10 segundos
    distanceInterval: 0,
    foregroundService: {
      notificationTitle: 'Rastreando localização',
      notificationBody: 'Seu app está rastreando sua localização em segundo plano.',
    },
  });

  console.log('Background location tracking iniciado');
}

export async function stopBackgroundLocationTracking() {
  const isTaskRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (isTaskRunning) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log('Background location tracking parado');
  }
}

// Manter a função original para compatibilidade (foreground only)
export async function startLocationTracking(userId, onError, onLocationUpdate) {
  if (!userId) {
    onError && onError("Usuário não definido");
    return;
  }

  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    onError && onError("Permissão para acessar a localização foi negada");
    return;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  onLocationUpdate && onLocationUpdate({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  });

  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000,
      distanceInterval: 0,
    },
    async (location) => {
      const { latitude, longitude } = location.coords;
      const timestamp = Date.now();
      const today = new Date();
      const formattedDate = `${today.getFullYear()}${String(
        today.getMonth() + 1
      ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

      await supabase
        .from("realtime_locations")
        .upsert({
          latitude,
          longitude,
          timestamp,
        });

      const { error } = await supabase.from("locations_users").insert([
        {
          user_id: userId,
          latitude,
          longitude,
          timestamp,
          date: formattedDate,
        },
      ]);

      if (error) {
        onError && onError("Erro ao salvar histórico: " + error.message);
        return;
      }

      onLocationUpdate && onLocationUpdate({ latitude, longitude, timestamp });
    }
  );

  return subscription;
}