import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/bases/supabase";
import {
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from "@/utils/locationTracking";
import "@/utils/backgroundLocationTask";

export default function TabsLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndStartTracking = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        setUser(session.user);

        await startBackgroundLocationTracking(session.user.id, (error) => {
          if (error) {
            setErrorMsg(error);
            console.error("Erro no rastreamento:", error);
          }
        });
      } catch (err) {
        console.error("Erro inesperado:", err);
        setErrorMsg("Erro ao verificar sessão.");
      } finally {
        setLoading(false);
      }
    };

    checkSessionAndStartTracking();

    return () => {
      stopBackgroundLocationTracking();
    };
  }, []);

  if (loading) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {errorMsg && (
        <Text style={{ color: "red", textAlign: "center", margin: 5 }}>
          {errorMsg}
        </Text>
      )}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#8244cd",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: "Início",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mapa"
          options={{
            tabBarLabel: "Mapa",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="contatos"
          options={{
            tabBarLabel: "Contatos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="seguranca"
          options={{
            tabBarLabel: "Segurança",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shield" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
