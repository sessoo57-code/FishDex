import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Fish {
  _id: string;
  name: string;
  scientificName: string;
  habitat: 'mare' | 'fiume' | 'lago';
  description: string;
  referenceImage: string;
  isUnlocked: boolean;
  userCatch?: {
    photo: string;
    location: string;
    equipment: string;
    date: string;
  };
}

interface FishStore {
  fish: Fish[];
  loading: boolean;
  error: string | null;
  loadFish: () => Promise<void>;
  unlockFish: (fishId: string, catchData: NonNullable<Fish['userCatch']>) => Promise<boolean>;
  resetProgress: () => Promise<void>;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const useFishStore = create<FishStore>((set, get) => ({
  fish: [],
  loading: false,
  error: null,

  loadFish: async () => {
    set({ loading: true, error: null });
    try {
      // Carica pesci dal server
      const response = await fetch(`${API_BASE_URL}/api/fish`);
      if (!response.ok) throw new Error('Errore nel caricamento dei pesci');
      
      const serverFish = await response.json();
      
      // Carica progressi dell'utente da AsyncStorage
      const savedProgress = await AsyncStorage.getItem('fishProgress');
      const userProgress = savedProgress ? JSON.parse(savedProgress) : {};
      
      // Combina dati server con progressi utente
      const combinedFish = serverFish.map((fish: Fish) => ({
        ...fish,
        isUnlocked: userProgress[fish._id]?.isUnlocked || false,
        userCatch: userProgress[fish._id]?.userCatch || null,
      }));
      
      set({ fish: combinedFish, loading: false });
    } catch (error) {
      console.error('Errore caricamento pesci:', error);
      set({ error: 'Errore nel caricamento dei pesci', loading: false });
    }
  },

  unlockFish: async (fishId: string, catchData: NonNullable<Fish['userCatch']>) => {
    try {
      const { fish } = get();
      
      // Aggiorna lo stato locale
      const updatedFish = fish.map(f =>
        f._id === fishId
          ? { ...f, isUnlocked: true, userCatch: catchData }
          : f
      );
      
      set({ fish: updatedFish });
      
      // Salva progresso in AsyncStorage
      const savedProgress = await AsyncStorage.getItem('fishProgress');
      const userProgress = savedProgress ? JSON.parse(savedProgress) : {};
      
      userProgress[fishId] = {
        isUnlocked: true,
        userCatch: catchData,
      };
      
      await AsyncStorage.setItem('fishProgress', JSON.stringify(userProgress));
      
      // Salva anche sul server
      await fetch(`${API_BASE_URL}/api/fish/${fishId}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(catchData),
      });
      
      return true;
    } catch (error) {
      console.error('Errore sblocco pesce:', error);
      return false;
    }
  },

  resetProgress: async () => {
    try {
      await AsyncStorage.removeItem('fishProgress');
      const { fish } = get();
      const resetFish = fish.map(f => ({
        ...f,
        isUnlocked: false,
        userCatch: undefined,
      }));
      set({ fish: resetFish });
    } catch (error) {
      console.error('Errore reset:', error);
    }
  },
}));