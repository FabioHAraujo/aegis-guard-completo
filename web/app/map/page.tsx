// frontend/app/map/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapViewer } from '@/components/map-viewer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

function MapPageContent() {
  const searchParams = useSearchParams();
  const jwtToken = searchParams.get('token');

  if (!jwtToken) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-red-700 p-4 text-center font-inter">
        <Alert variant="destructive" className="max-w-lg">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Por favor, use um link de rastreamento válido. Este link deve ser fornecido por quem te convidou para o rastreamento.
            <br /><br />
            Exemplo de uso: <code>seuapp.com/map?token=eyJ...</code>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <MapViewer jwtToken={jwtToken} />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Carregando...</div>}>
      <MapPageContent />
    </Suspense>
  );
}