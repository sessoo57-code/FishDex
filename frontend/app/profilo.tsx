import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFishStore } from '../stores/fishStore';

export default function ProfileScreen() {
  const { fish } = useFishStore();
  
  const totalFish = fish.length;
  const unlockedFish = fish.filter(f => f.isUnlocked).length;
  const marineFish = fish.filter(f => f.habitat === 'mare' && f.isUnlocked).length;
  const freshwaterFish = fish.filter(f => (f.habitat === 'fiume' || f.habitat === 'lago') && f.isUnlocked).length;
  
  const completionPercentage = Math.round((unlockedFish / totalFish) * 100);
  
  const getAchievementLevel = () => {
    if (completionPercentage >= 90) return { title: 'Maestro Pescatore', color: '#f59e0b', icon: 'trophy' };
    if (completionPercentage >= 70) return { title: 'Pescatore Esperto', color: '#8b5cf6', icon: 'star' };
    if (completionPercentage >= 50) return { title: 'Pescatore Avanzato', color: '#10b981', icon: 'trending-up' };
    if (completionPercentage >= 25) return { title: 'Pescatore Intermedio', color: '#3b82f6', icon: 'fish' };
    return { title: 'Pescatore Novizio', color: '#6b7280', icon: 'leaf' };
  };

  const achievement = getAchievementLevel();

  const handleUpgradeToPremium = () => {
    Alert.alert(
      'Upgrade a Premium',
      'Sblocca l\'accesso completo a tutti i 150+ pesci, collezioni avanzate e badge esclusivi!',
      [
        { text: 'Forse più tardi', style: 'cancel' },
        { text: 'Upgrade ora', onPress: () => {
          Alert.alert('Demo', 'Funzionalità premium in arrivo!');
        }},
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progresso',
      'Sei sicuro di voler cancellare tutti i tuoi progressi? Questa azione non può essere annullata.',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          Alert.alert('Demo', 'Funzionalità di reset in arrivo!');
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: achievement.color }]}>
            <Ionicons name={achievement.icon as any} size={48} color="#ffffff" />
          </View>
          <Text style={styles.username}>Pescatore</Text>
          <Text style={[styles.achievementTitle, { color: achievement.color }]}>
            {achievement.title}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{unlockedFish}</Text>
            <Text style={styles.statLabel}>Pesci Sbloccati</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completionPercentage}%</Text>
            <Text style={styles.statLabel}>Completamento</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{marineFish}</Text>
            <Text style={styles.statLabel}>Pesci Marini</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{freshwaterFish}</Text>
            <Text style={styles.statLabel}>Acqua Dolce</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progresso Enciclopedia</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {unlockedFish} di {totalFish} pesci sbloccati
          </Text>
        </View>

        <View style={styles.premiumSection}>
          <View style={styles.premiumCard}>
            <Ionicons name="star" size={32} color="#f59e0b" />
            <Text style={styles.premiumTitle}>Upgrade a Premium</Text>
            <Text style={styles.premiumDescription}>
              {`• Accesso a tutti i 150+ pesci
• Collezioni avanzate
• Badge esclusivi
• Statistiche dettagliate`}
            </Text>
            <TouchableOpacity style={styles.premiumButton} onPress={handleUpgradeToPremium}>
              <Text style={styles.premiumButtonText}>Upgrade Ora</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#6b7280" />
            <Text style={styles.actionButtonText}>Condividi Progressi</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={24} color="#6b7280" />
            <Text style={styles.actionButtonText}>Impostazioni</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
            <Text style={styles.actionButtonText}>Aiuto e Supporto</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={handleResetProgress}
          >
            <Ionicons name="refresh-outline" size={24} color="#dc2626" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Reset Progresso</Text>
            <Ionicons name="chevron-forward" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>FishDex Italia v1.0</Text>
          <Text style={styles.footerSubtext}>
            La tua enciclopedia personalizzata dei pesci italiani
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
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  progressSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  premiumSection: {
    padding: 16,
    marginTop: 8,
  },
  premiumCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fde68a',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400e',
    marginTop: 8,
    marginBottom: 12,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#a16207',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  premiumButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  premiumButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#dc2626',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});