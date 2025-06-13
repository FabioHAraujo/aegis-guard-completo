import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { supabase } from "@/bases/supabase";

const MapTab = () => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchLocationHistory = async () => {
      try {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}${String(
          today.getMonth() + 1
        ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

        const { data, error } = await supabase
          .from("locations_users")
          .select("latitude, longitude, timestamp")
          .eq("user_id", userId)
          .eq("date", formattedDate);

        if (error) throw error;

        const sorted = data.sort((a, b) => a.timestamp - b.timestamp);
        setLocationHistory(sorted);
        if (sorted.length > 0) {
          const last = sorted[sorted.length - 1];
          setCurrentLocation({ latitude: last.latitude, longitude: last.longitude });
        }
      } catch (e) {
        console.error("Erro ao buscar histórico de localização: ", e);
      }
    };

    fetchLocationHistory(); // chamada inicial

    const intervalId = setInterval(fetchLocationHistory, 2000); // atualiza a cada 5s

    return () => clearInterval(intervalId); // limpeza
  }, [userId]);

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : (
        currentLocation && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={currentLocation}
              title="Você está aqui"
              description="Localização atual"
              pinColor="#8244cd"
            />

            {locationHistory.length > 1 &&
              locationHistory.map((point, index) => {
                if (index === 0) return null;
                return (
                  <Polyline
                    key={index}
                    coordinates={[locationHistory[index - 1], point]}
                    strokeWidth={3}
                    strokeColor="blue"
                  />
                );
              })}
          </MapView>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default MapTab;
