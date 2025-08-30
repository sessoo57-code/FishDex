import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Screens
import EncyclopediaScreen from '../screens/EncyclopediaScreen';
import CatchScreen from '../screens/CatchScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function Index() {
  return (
    <SafeAreaProvider>
      <NavigationContainer independent={true}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Enciclopedia') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Cattura') {
                iconName = focused ? 'camera' : 'camera-outline';
              } else if (route.name === 'Collezioni') {
                iconName = focused ? 'trophy' : 'trophy-outline';
              } else if (route.name === 'Profilo') {
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
          <Tab.Screen name="Enciclopedia" component={EncyclopediaScreen} />
          <Tab.Screen name="Cattura" component={CatchScreen} />
          <Tab.Screen name="Collezioni" component={CollectionsScreen} />
          <Tab.Screen name="Profilo" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}