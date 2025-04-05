import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppContextProvider } from './context/AppContext';
import HomeScreen from './screens/HomeScreen';
import ComparisonScreen from './screens/ComparisonScreen';
import OrderingScreen from './screens/OrderingScreen';
import CompositionScreen from './screens/CompositionScreen';
import SettingsScreen from './screens/SettingsScreen';
import MathStoryScreen from './screens/MathStoryScreen';



const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaProvider>
        <AppContextProvider>
          <NavigationContainer>
            <Stack.Navigator 
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#f8f6ff' },
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Comparison" component={ComparisonScreen} />
              <Stack.Screen name="Ordering" component={OrderingScreen} />
              <Stack.Screen name="Composition" component={CompositionScreen} />
              <Stack.Screen name="MathStory" component={MathStoryScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AppContextProvider>
      </SafeAreaProvider>
    </>
  );
}