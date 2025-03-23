// context/AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [progressScore, setProgressScore] = useState({
    comparison: 0,
    ordering: 0,
    composition: 0,
  });
  const [stars, setStars] = useState(0);

  // Load data from storage on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedName = await AsyncStorage.getItem('playerName');
        const savedSound = await AsyncStorage.getItem('soundEnabled');
        const savedProgressScore = await AsyncStorage.getItem('progressScore');
        const savedStars = await AsyncStorage.getItem('stars');
        
        if (savedName) setPlayerName(savedName);
        if (savedSound) setSoundEnabled(savedSound === 'true');
        if (savedProgressScore) setProgressScore(JSON.parse(savedProgressScore));
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
        await AsyncStorage.setItem('progressScore', JSON.stringify(progressScore));
        await AsyncStorage.setItem('stars', stars.toString());
      } catch (error) {
        console.log('Error saving data:', error);
      }
    };
    
    saveData();
  }, [playerName, soundEnabled, progressScore, stars]);

  // Update progress for a specific module and level
  function updateProgressScore(module, score) {
    setProgressScore((prevProgressScore) => {
      const currentProgressScore = prevProgressScore[module];
      const newProgressScore = Math.max(currentProgressScore, score);
      
      return {
        ...prevProgressScore,
        [module]: newProgressScore
      }
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
    progressScore,
    updateProgressScore,
    stars,
    awardStars
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
