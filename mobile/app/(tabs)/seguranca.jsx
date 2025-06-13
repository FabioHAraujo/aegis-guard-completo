import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import { supabase } from "@/bases/supabase";
import { triggerPanic } from "@/utils/panicAction";
import { sendAudio } from "@/utils/sendAudio"; // novo

const SecurityResourcesTab = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (user) setUserId(user.id);
    });
  }, []);

  const handlePanicPress = () => {
    if (userId) triggerPanic(userId);
    else Alert.alert("Usuário não autenticado.");
  };

  const handleAudioRecord = async () => {
    if (!userId) {
      Alert.alert("Usuário não autenticado.");
      return;
    }

    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permissão de microfone negada.");
        return;
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();

      Alert.alert("Gravando por 10 segundos...");

      setTimeout(async () => {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        const file = await fetch(uri);
        const blob = await file.blob();

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result.split(",")[1]; // remove header do b64
          sendAudio(userId, base64Audio);
        };
        reader.readAsDataURL(blob);
      }, 10000); // 10 segundos
    } catch (error) {
      console.error("Erro ao gravar:", error);
      Alert.alert("Erro ao gravar áudio.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recursos de Segurança</Text>

      <TouchableOpacity style={styles.panicButton} onPress={handlePanicPress}>
        <Text style={styles.panicText}>✋ Botão de Pânico</Text>
        <Text style={styles.panicSubtext}>Pressione em caso de emergência.</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.audioButton} onPress={handleAudioRecord}>
        <Text style={styles.audioText}>🎤 Gravar Áudio (10s)</Text>
        <Text style={styles.audioSubtext}>O áudio será enviado automaticamente.</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
  },
  panicButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  panicText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  panicSubtext: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  audioButton: {
    backgroundColor: "#007aff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  audioText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  audioSubtext: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
});

export default SecurityResourcesTab;
