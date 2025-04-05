import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [playerName, setPlayerName] = useState('');
  const [progressScore, setProgressScore] = useState({
    comparison: 0,
    ordering: 0,
    composition: 0,
  });
  // * note that: the Progress Score is also Star Collected in the game!!

  // Load data from storage on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedName = await AsyncStorage.getItem('playerName');
        const savedProgressScore = await AsyncStorage.getItem('progressScore');
        
        if (savedName) setPlayerName(savedName);
        if (savedProgressScore) setProgressScore(JSON.parse(savedProgressScore));
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
        await AsyncStorage.setItem('progressScore', JSON.stringify(progressScore));
      } catch (error) {
        console.log('Error saving data:', error);
      }
    };
    
    saveData();
  }, [playerName, progressScore]);

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

  function resetProgressScore(module, score) {
    setProgressScore((prevProgressScore) => ({
      ...prevProgressScore,
      [module]: score
    }));
  }


  const value = {
    playerName,
    setPlayerName,
    progressScore,
    updateProgressScore,
    resetProgressScore
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
