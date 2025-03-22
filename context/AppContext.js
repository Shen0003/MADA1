// context/AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [progress, setProgress] = useState({
    comparison: { level1: 0, level2: 0, level3: 0 },
    ordering: { level1: 0, level2: 0, level3: 0 },
    composition: { level1: 0, level2: 0, level3: 0 },
  });
  const [stars, setStars] = useState(0);

  // Load data from storage on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedName = await AsyncStorage.getItem('playerName');
        const savedSound = await AsyncStorage.getItem('soundEnabled');
        const savedProgress = await AsyncStorage.getItem('progress');
        const savedStars = await AsyncStorage.getItem('stars');
        
        if (savedName) setPlayerName(savedName);
        if (savedSound) setSoundEnabled(savedSound === 'true');
        if (savedProgress) setProgress(JSON.parse(savedProgress));
        if (savedStars) setStars(parseInt(savedStars, 10));
      } catch (error) {
        console.log('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Save data to storage whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('playerName', playerName);
        await AsyncStorage.setItem('soundEnabled', soundEnabled.toString());
        await AsyncStorage.setItem('progress', JSON.stringify(progress));
        await AsyncStorage.setItem('stars', stars.toString());
      } catch (error) {
        console.log('Error saving data:', error);
      }
    };
    
    saveData();
  }, [playerName, soundEnabled, progress, stars]);

  // Update progress for a specific module and level
  const updateProgress = (module, level, score) => {
    setProgress(prevProgress => {
      const currentProgress = prevProgress[module][`level${level}`];
      const newProgress = Math.max(currentProgress, score);
      
      return {
        ...prevProgress,
        [module]: {
          ...prevProgress[module],
          [`level${level}`]: newProgress
        }
      };
    });
  };

  // Award stars based on performance
  const awardStars = (amount) => {
    setStars(prevStars => prevStars + amount);
  };

  const value = {
    playerName,
    setPlayerName,
    soundEnabled,
    setSoundEnabled,
    progress,
    updateProgress,
    stars,
    awardStars
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
