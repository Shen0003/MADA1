// App.js - Main Application Structure
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './screens/HomeScreen';
import ComparisonScreen from './screens/ComparisonScreen';
import OrderingScreen from './screens/OrderingScreen';
import CompositionScreen from './screens/CompositionScreen';
import SettingsScreen from './screens/SettingsScreen';
import LevelSelectScreen from './screens/LevelSelectScreen';
// Import context for global state management
import { AppContextProvider } from './context/AppContext';
import GeminiChat from './screens/GeminiChat';


const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContextProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#f8f6ff' }
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
            <Stack.Screen name="Comparison" component={ComparisonScreen} />
            <Stack.Screen name="Ordering" component={OrderingScreen} />
            <Stack.Screen name="Composition" component={CompositionScreen} />
            <Stack.Screen name="GeminiChat" component={GeminiChat} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppContextProvider>
    </SafeAreaProvider>
  );
}