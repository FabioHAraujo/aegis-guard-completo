import { Alert } from "react-native";

export const triggerPanic = async (user_id) => {
  if (!user_id) {
    console.warn("ID de usuário não fornecido.");
    Alert.alert("Erro interno: usuário não encontrado.");
    return;
  } else {
    console.log("ID de usuário:", user_id);
    console.log("URL_PANIC:", process.env.EXPO_PUBLIC_URL_PANIC);
    console.log("API_KEY_PANIC:", process.env.EXPO_PUBLIC_API_KEY_PANIC);
  }

  try {
    const response = await fetch(process.env.EXPO_PUBLIC_URL_PANIC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: process.env.EXPO_PUBLIC_API_KEY_PANIC,
      },
      body: JSON.stringify({ user_id }),
    });

    if (response.ok) {
      Alert.alert("🚨 Botão de pânico acionado com sucesso!");
    } else {
      console.error("Erro:", await response.text());
      Alert.alert("Erro ao acionar o botão de pânico.");
    }
  } catch (err) {
    console.error("Erro de rede:", err);
    Alert.alert("Erro de rede ao acionar o botão de pânico.");
  }
};
