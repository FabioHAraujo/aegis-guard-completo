import { Alert } from "react-native";

const URL_AUDIO = process.env.EXPO_PUBLIC_URL_AUDIO;
const API_KEY_AUDIO = process.env.EXPO_PUBLIC_API_KEY_AUDIO;

export const sendAudio = async (user_id, base64Audio) => {
  if (!user_id || !base64Audio) {
    console.warn("Faltando dados para envio de áudio.");
    return;
  }

  try {
    const response = await fetch(URL_AUDIO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "token": API_KEY_AUDIO,
      },
      body: JSON.stringify({
        user_id,
        audio: base64Audio,
      }),
    });

    if (response.ok) {
      Alert.alert("🎤 Áudio enviado com sucesso!");
    } else {
      console.error("Erro:", await response.text());
      Alert.alert("Erro ao enviar áudio.");
    }
  } catch (err) {
    console.error("Erro de rede:", err);
    Alert.alert("Erro de rede ao enviar áudio.");
  }
};
