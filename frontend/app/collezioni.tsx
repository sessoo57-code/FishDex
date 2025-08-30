import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFishStore } from '../stores/fishStore';

interface Collection {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  fishIds: string[];
  badge?: string;
}

export default function CollectionsScreen() {
  const { fish } = useFishStore();
  
  const collections: Collection[] = [
    {
      id: 'predators',
      name: 'Predatori',
      description: 'Tutti i pesci predatori italiani',
      icon: 'flash',
      color: '#dc2626',
      fishIds: fish.filter(f => ['Spigola', 'Luccio', 'Pesce serra', 'Tonno', 'Ricciola'].includes(f.name)).map(f => f._id),
      badge: 'Cacciatore Supremo'
    },
    {
      id: 'cyprinids',
      name: 'Ciprinidi',
      description: 'Famiglia dei Ciprinidi',
      icon: 'leaf',
      color: '#059669',
      fishIds: fish.filter(f => ['Carpa', 'Cavedano', 'Barbo', 'Tinca', 'Alborella'].includes(f.name)).map(f => f._id),
      badge: 'Esperto di Ciprinidi'
    },
    {
      id: 'marine-top10',
      name: 'Top 10 Marini',
      description: 'I 10 pesci marini più ambiti',
      icon: 'water',
      color: '#2563eb',
      fishIds: fish.filter(f => f.habitat === 'mare').slice(0, 10).map(f => f._id),
      badge: 'Maestro del Mare'
    },
    {
      id: 'freshwater-complete',
      name: 'Acqua Dolce Completa',
      description: 'Tutti i pesci di fiume e lago',
      icon: 'trail-sign',
      color: '#7c3aed',
      fishIds: fish.filter(f => f.habitat === 'fiume' || f.habitat === 'lago').map(f => f._id),
      badge: 'Re delle Acque Dolci'
    }
  ];

  const getCollectionProgress = (collection: Collection) => {
    const unlockedFish = fish.filter(f => 
      collection.fishIds.includes(f._id) && f.isUnlocked
    );
    return {
      unlocked: unlockedFish.length,
      total: collection.fishIds.length,
      percentage: Math.round((unlockedFish.length / collection.fishIds.length) * 100)
    };
  };

  const renderCollection = (collection: Collection) => {
    const progress = getCollectionProgress(collection);
    const isCompleted = progress.unlocked === progress.total;

    return (
      <TouchableOpacity key={collection.id} style={styles.collectionCard}>
        <View style={[styles.collectionIcon, { backgroundColor: collection.color }]}>
          <Ionicons name={collection.icon} size={32} color="#ffffff" />
        </View>
        
        <View style={styles.collectionInfo}>
          <Text style={styles.collectionName}>{collection.name}</Text>
          <Text style={styles.collectionDescription}>{collection.description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress.percentage}%`, backgroundColor: collection.color }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {progress.unlocked}/{progress.total} ({progress.percentage}%)
            </Text>
          </View>

          {isCompleted && collection.badge && (
            <View style={styles.badgeContainer}>
              <Ionicons name="trophy" size={16} color="#f59e0b" />
              <Text style={styles.badgeText}>{collection.badge}</Text>
            </View>
          )}
        </View>

        {isCompleted && (
          <View style={styles.completedIndicator}>
            <Ionicons name="checkmark-circle" size={32} color="#10b981" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const totalUnlocked = fish.filter(f => f.isUnlocked).length;
  const totalFish = fish.length;
  const overallProgress = Math.round((totalUnlocked / totalFish) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collezioni Speciali</Text>
        <Text style={styles.subtitle}>
          Completa le collezioni per sbloccare badge esclusivi
        </Text>
        
        <View style={styles.overallProgress}>
          <Text style={styles.overallProgressTitle}>Progress Totale</Text>
          <View style={styles.overallProgressBar}>
            <View style={[styles.overallProgressFill, { width: `${overallProgress}%` }]} />
          </View>
          <Text style={styles.overallProgressText}>
            {totalUnlocked}/{totalFish} pesci sbloccati ({overallProgress}%)
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {collections.map(renderCollection)}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Continua a pescare per completare tutte le collezioni!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  overallProgress: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  overallProgressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  overallProgressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  overallProgressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  collectionCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  collectionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  completedIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});