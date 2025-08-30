import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFishStore } from '../stores/fishStore';

interface Fish {
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

export default function EncyclopediaScreen() {
  const [selectedHabitat, setSelectedHabitat] = useState<'all' | 'mare' | 'fiume' | 'lago'>('all');
  const { fish, loading, loadFish } = useFishStore();

  useEffect(() => {
    loadFish();
  }, []);

  const filteredFish = fish.filter(f => 
    selectedHabitat === 'all' || f.habitat === selectedHabitat
  );

  const renderFishCard = ({ item }: { item: Fish }) => (
    <TouchableOpacity 
      style={styles.fishCard} 
      onPress={() => handleFishPress(item)}
    >
      <View style={styles.fishImageContainer}>
        {item.isUnlocked ? (
          <Image 
            source={{ uri: item.userCatch?.photo || item.referenceImage }} 
            style={styles.fishImage}
          />
        ) : (
          <View style={styles.lockedFishContainer}>
            <Ionicons name="fish" size={40} color="#9ca3af" />
            <Text style={styles.lockedText}>???</Text>
          </View>
        )}
      </View>
      
      <View style={styles.fishInfo}>
        <Text style={styles.fishName}>
          {item.isUnlocked ? item.name : '???'}
        </Text>
        <Text style={styles.fishScientific}>
          {item.isUnlocked ? item.scientificName : 'Specie sconosciuta'}
        </Text>
        <View style={styles.habitatBadge}>
          <Text style={[styles.habitatText, { color: getHabitatColor(item.habitat) }]}>
            {item.habitat.toUpperCase()}
          </Text>
        </View>
      </View>
      
      {item.isUnlocked && (
        <View style={styles.unlockedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
        </View>
      )}
    </TouchableOpacity>
  );

  const handleFishPress = (fish: Fish) => {
    if (fish.isUnlocked) {
      Alert.alert(
        fish.name,
        `${fish.description}\n\nCatturato in: ${fish.userCatch?.location || 'N/A'}\nAttrezzatura: ${fish.userCatch?.equipment || 'N/A'}\nData: ${fish.userCatch?.date || 'N/A'}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Pesce Bloccato',
        'Cattura questo pesce per sbloccarlo nell\'enciclopedia!',
        [{ text: 'OK' }]
      );
    }
  };

  const getHabitatColor = (habitat: string) => {
    switch (habitat) {
      case 'mare': return '#2563eb';
      case 'fiume': return '#059669';
      case 'lago': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Caricamento enciclopedia...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FishDex Italia</Text>
        <Text style={styles.subtitle}>
          Sbloccati: {fish.filter(f => f.isUnlocked).length}/{fish.length}
        </Text>
      </View>

      <View style={styles.filterContainer}>
        {['all', 'mare', 'fiume', 'lago'].map((habitat) => (
          <TouchableOpacity
            key={habitat}
            style={[
              styles.filterButton,
              selectedHabitat === habitat && styles.filterButtonActive
            ]}
            onPress={() => setSelectedHabitat(habitat as any)}
          >
            <Text style={[
              styles.filterText,
              selectedHabitat === habitat && styles.filterTextActive
            ]}>
              {habitat === 'all' ? 'Tutti' : habitat.charAt(0).toUpperCase() + habitat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredFish}
        renderItem={renderFishCard}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.fishGrid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  fishGrid: {
    padding: 16,
  },
  fishCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fishImageContainer: {
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fishImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lockedFishContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  lockedText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  fishInfo: {
    flex: 1,
  },
  fishName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  fishScientific: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  habitatBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  habitatText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  unlockedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});