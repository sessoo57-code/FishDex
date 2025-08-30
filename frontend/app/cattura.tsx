import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFishStore } from '../stores/fishStore';

export default function CatchScreen() {
  const [selectedFish, setSelectedFish] = useState<string>('');
  const [photo, setPhoto] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [equipment, setEquipment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  const { fish, unlockFish } = useFishStore();
  const lockedFish = fish.filter(f => !f.isUnlocked);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso richiesto', 'Abbiamo bisogno del permesso per accedere alla camera');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso richiesto', 'Abbiamo bisogno del permesso per accedere alla galleria');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Aggiungi Foto',
      'Come vuoi aggiungere la foto della tua cattura?',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Galleria', onPress: pickFromGallery },
        { text: 'Annulla', style: 'cancel' },
      ]
    );
  };

  const handleSubmitCatch = async () => {
    if (!selectedFish || !photo || !location || !equipment) {
      Alert.alert('Errore', 'Compila tutti i campi obbligatori');
      return;
    }

    setSubmitting(true);
    try {
      const success = await unlockFish(selectedFish, {
        photo,
        location,
        equipment,
        date: new Date().toLocaleDateString('it-IT'),
      });

      if (success) {
        Alert.alert(
          'Congratulazioni!',
          'Hai sbloccato un nuovo pesce nella tua enciclopedia!',
          [{ text: 'OK', onPress: resetForm }]
        );
      } else {
        Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio');
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedFish('');
    setPhoto('');
    setLocation('');
    setEquipment('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="camera" size={32} color="#2563eb" />
          <Text style={styles.title}>Registra una Cattura</Text>
          <Text style={styles.subtitle}>
            Sblocca i pesci nella tua enciclopedia
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seleziona il Pesce *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fishSelector}>
              {lockedFish.map((fish) => (
                <TouchableOpacity
                  key={fish._id}
                  style={[
                    styles.fishOption,
                    selectedFish === fish._id && styles.fishOptionSelected
                  ]}
                  onPress={() => setSelectedFish(fish._id)}
                >
                  <Ionicons name="fish" size={24} color="#6b7280" />
                  <Text style={styles.fishOptionText}>{fish.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Foto della Cattura *</Text>
            <TouchableOpacity style={styles.photoButton} onPress={showPhotoOptions}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={32} color="#9ca3af" />
                  <Text style={styles.photoPlaceholderText}>Tocca per aggiungere foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Luogo di Cattura *</Text>
            <TextInput
              style={styles.input}
              placeholder="Es: Lago di Garda, Rimini, Fiume Po..."
              value={location}
              onChangeText={setLocation}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attrezzatura Usata *</Text>
            <TextInput
              style={styles.input}
              placeholder="Es: Canna da spinning, esca artificiale..."
              value={equipment}
              onChangeText={setEquipment}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmitCatch}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Salvando...' : 'Registra Cattura'}
            </Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  fishSelector: {
    flexDirection: 'row',
  },
  fishOption: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 100,
  },
  fishOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  fishOptionText: {
    marginTop: 4,
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  photoButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    marginTop: 8,
    color: '#9ca3af',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});