// screens/SettingsScreen.js
import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Switch,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';

const SettingsScreen = ({ navigation }) => {
  const { 
    playerName, 
    setPlayerName, 
    soundEnabled, 
    setSoundEnabled, 
    stars 
  } = useContext(AppContext);
  
  const [tempName, setTempName] = useState(playerName);
  
  // Save changes
  const saveChanges = () => {
    setPlayerName(tempName);
    Alert.alert(
      'Settings Saved',
      'Your settings have been updated!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };
  
  // Reset progress (with confirmation)
  const confirmResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure you want to reset all progress? This cannot be undone!',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetProgress,
        },
      ]
    );
  };
  
  const resetProgress = () => {
    // This would be handled in the AppContext
    // For now, just show a message
    Alert.alert(
      'Progress Reset',
      'All progress has been reset.',
      [{ text: 'OK' }]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={require('../assets/back_icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Player Profile</Text>
          
          <View style={styles.profileSection}>
            <Image 
              source={require('../assets/avatar_placeholder.png')} 
              style={styles.avatar} 
            />
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Image source={require('../assets/star.png')} style={styles.statIcon} />
                <Text style={styles.statValue}>{stars}</Text>
                <Text style={styles.statLabel}>Stars</Text>
              </View>
              {/* Additional stats could go here */}
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Player Name:</Text>
            <TextInput
              style={styles.textInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your name"
              maxLength={20}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#d0d0d0', true: '#a18cd1' }}
              thumbColor={soundEnabled ? '#7a5cf0' : '#f4f3f4'}
            />
          </View>
          
          {/* Additional settings could go here */}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutContainer}>
            <Text style={styles.appName}>Math Explorers</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              A fun educational game to help children learn number concepts.
            </Text>
            
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Features:</Text>
              <Text style={styles.featureItem}>• Compare Numbers</Text>
              <Text style={styles.featureItem}>• Order Numbers</Text>
              <Text style={styles.featureItem}>• Compose Numbers</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={confirmResetProgress}
          >
            <Text style={styles.resetButtonText}>Reset Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveChanges}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7a5cf0',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  statIcon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  aboutContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  appDescription: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 15,
  },
  featuresContainer: {
    alignSelf: 'stretch',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 15,
    color: '#666',
    marginBottom: 5,
  },
  buttonSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  resetButton: {
    backgroundColor: '#ff7f7f',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#7a5cf0',
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SettingsScreen;