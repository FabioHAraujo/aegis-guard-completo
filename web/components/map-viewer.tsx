"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  Polyline,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface MapViewerProps {
  jwtToken: string;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

export function MapViewer({ jwtToken }: MapViewerProps) {
  const [locationData, setLocationData] = useState<LocationPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const hasCenteredMap = useRef(false);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
  });

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      if (currentLocation && !hasCenteredMap.current) {
        map.setCenter({
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        });
        map.setZoom(15);
        hasCenteredMap.current = true;
      }
    },
    [currentLocation]
  );

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    hasCenteredMap.current = false;
  }, []);

  useEffect(() => {
    if (!jwtToken) {
      setError("Token de acesso não encontrado.");
      setLoading(false);
      return;
    }

    const fetchLocationData = async () => {
      try {
        setError(null);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) throw new Error("URL do backend não configurada.");

        const response = await fetch(`${backendUrl}/map-data`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.message || "Erro ao buscar dados de localização."
          );

        const sortedData = data.sort(
          (a: LocationPoint, b: LocationPoint) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setLocationData(sortedData);

        if (sortedData.length > 0) {
          const last = sortedData[sortedData.length - 1];
          setCurrentLocation({
            latitude: last.latitude,
            longitude: last.longitude,
          });
        } else {
          setError("Nenhum dado de localização encontrado para hoje.");
        }
      } catch (err: unknown) {
        console.error("Erro ao buscar dados de localização:", err);
        if (err instanceof Error) {
          setError(err.message || "Falha ao carregar dados de localização.");
        } else {
          setError("Falha ao carregar dados de localização.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData(); // chamada inicial
    const interval = setInterval(fetchLocationData, 2000); // atualização periódica
    return () => clearInterval(interval); // limpeza no unmount
  }, [jwtToken]);

  if (loadError)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro no Mapa</AlertTitle>
          <AlertDescription>
            Erro ao carregar o Google Maps: {loadError.message}. Verifique sua
            chave API.
          </AlertDescription>
        </Alert>
      </div>
    );

  if (!isLoaded)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
        <Card className="max-w-md text-center">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <CardTitle className="mb-2">Carregando Mapa</CardTitle>
            <CardDescription>
              Aguarde enquanto o mapa é carregado...
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
        <Card className="max-w-md text-center">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <CardTitle className="mb-2">Carregando Dados</CardTitle>
            <CardDescription>Buscando dados de localização...</CardDescription>
          </CardContent>
        </Card>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro de Acesso</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );

  if (!currentLocation && !loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Nenhum Dado</AlertTitle>
          <AlertDescription>
            Nenhum dado de localização encontrado para hoje.
          </AlertDescription>
        </Alert>
      </div>
    );

  const path = locationData.map((point) => ({
    lat: point.latitude,
    lng: point.longitude,
  }));
  const currentLatLng = currentLocation
    ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
    : null;

  return (
    <div className="flex flex-col h-full font-inter">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-4 shadow-lg flex items-center justify-between rounded-b-lg">
        <h1 className="text-xl font-bold">Rastreamento de Localização</h1>
        <span className="text-sm">Acesso temporário: 2 horas</span>
      </header>
      <main className="flex-grow">
        {currentLatLng && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            <Marker
              position={currentLatLng}
              title="Localização Atual"
              icon={{
                url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238244cd' width='32px' height='32px'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z'/%3E%3C/svg%3E",
                scaledSize: new window.google.maps.Size(32, 32),
              }}
            />
            {path.length > 1 && (
              <Polyline
                path={path}
                options={{
                  strokeColor: "#4A90E2",
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  geodesic: true,
                }}
              />
            )}
          </GoogleMap>
        )}
      </main>
      <footer className="bg-gray-100 p-2 text-center text-gray-600 text-sm rounded-t-lg shadow-inner">
        Dados de rastreamento em tempo real.
      </footer>
    </div>
  );
}
