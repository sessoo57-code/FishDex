import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'index') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'cattura') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'collezioni') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'profilo') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#1e40af',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Enciclopedia',
          headerTitle: 'FishDex Italia'
        }} 
      />
      <Tabs.Screen 
        name="cattura" 
        options={{ 
          title: 'Cattura',
          headerTitle: 'Registra Cattura'
        }} 
      />
      <Tabs.Screen 
        name="collezioni" 
        options={{ 
          title: 'Collezioni',
          headerTitle: 'Collezioni Speciali'
        }} 
      />
      <Tabs.Screen 
        name="profilo" 
        options={{ 
          title: 'Profilo',
          headerTitle: 'Il Mio Profilo'
        }} 
      />
    </Tabs>
  );
}