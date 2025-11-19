import React, { createContext, useContext, useState } from 'react';

interface VelaContextType {
  isVelaActive: boolean;
  setIsVelaActive: (active: boolean) => void;
  velaResponse: string | null;
  setVelaResponse: (response: string | null) => void;
  processVelaCommand: (command: string) => Promise<void>;
}

const VelaContext = createContext<VelaContextType | undefined>(undefined);

export function VelaProvider({ children }: { children: React.ReactNode }) {
  const [isVelaActive, setIsVelaActive] = useState(false);
  const [velaResponse, setVelaResponse] = useState<string | null>(null);

  const processVelaCommand = async (command: string) => {
    setIsVelaActive(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVelaResponse(`Processed: ${command}`);
    } catch (error) {
      console.error('Vela command error:', error);
      setVelaResponse('Error processing command');
    } finally {
      setIsVelaActive(false);
    }
  };

  return (
    <VelaContext.Provider value={{
      isVelaActive,
      setIsVelaActive,
      velaResponse,
      setVelaResponse,
      processVelaCommand
    }}>
      {children}
    </VelaContext.Provider>
  );
}

export const useVela = () => {
  const context = useContext(VelaContext);
  if (!context) throw new Error('useVela must be used within VelaProvider');
  return context;
};
