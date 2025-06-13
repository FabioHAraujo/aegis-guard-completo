import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/bases/supabase";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoadingSession(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (loadingSession) return;

    const currentRoute = segments[0] ?? "";
    const isAuthRoute = currentRoute === "login" || currentRoute === "registro";

    if (!user && !isAuthRoute) {
      router.replace("/login");
    }

    if (user && isAuthRoute) {
      router.replace("/(tabs)");
    }
  }, [segments, user, loadingSession]);

  if (loadingSession) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
