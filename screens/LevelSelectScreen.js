// screens/LevelSelectScreen.js
import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ImageBackground 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';

const LevelSelectScreen = ({ navigation, route }) => {
  const { module } = route.params;
  const { progress } = useContext(AppContext);
  
  const moduleLevels = {
    comparison: [
      { id: 1, title: 'Basic Comparison', description: 'Compare single-digit numbers' },
      { id: 2, title: 'Medium Comparison', description: 'Compare two-digit numbers' },
      { id: 3, title: 'Advanced Comparison', description: 'Compare numbers with different place values' },
      { id: 4, title: 'Challenge Mode', description: 'Timed challenges', locked: true },
    ],
    ordering: [
      { id: 1, title: 'Simple Sequences', description: 'Order 3-5 single-digit numbers' },
      { id: 2, title: 'Mixed Sequences', description: 'Order single and double-digit numbers' },
      { id: 3, title: 'Reverse Order', description: 'Practice ascending and descending ordering' },
      { id: 4, title: 'Missing Numbers', description: 'Find missing numbers in a sequence', locked: true },
      { id: 5, title: 'Challenge Mode', description: 'Arrange larger sets with time constraints', locked: true },
    ],
    composition: [
      { id: 1, title: 'Basic Addition Pairs', description: 'Find number pairs that make up to 10' },
      { id: 2, title: 'Multiple Combinations', description: 'Find different ways to make a number' },
      { id: 3, title: 'Missing Addend', description: 'Find the missing number in a sum' },
      { id: 4, title: 'Challenge Mode', description: 'Compose larger numbers quickly', locked: true },
    ],
  };
  
  const levels = moduleLevels[module] || [];
  
  // Get module title and background
  const moduleInfo = {
    comparison: {
      title: 'Compare Numbers',
      background: require('../assets/comparison_bg.png'),
      color: '#7a5cf0',
    },
    ordering: {
      title: 'Order Numbers',
      background: require('../assets/ordering_bg.png'),
      color: '#f06292',
    },
    composition: {
      title: 'Make Numbers',
      background: require('../assets/composition_bg.png'),
      color: '#4fc3f7',
    },
  };
  
  // Function to calculate stars for progress display
  const calculateStars = (levelProgress) => {
    if (levelProgress >= 90) return 3;
    if (levelProgress >= 70) return 2;
    if (levelProgress >= 50) return 1;
    return 0;
  };
  
  // Render stars based on progress
  const renderStars = (level) => {
    const levelProgress = progress[module][`level${level}`] || 0;
    const stars = calculateStars(levelProgress);
    
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3].map((i) => (
          <Image 
            key={i}
            source={i <= stars ? require('../assets/star_filled.png') : require('../assets/star_empty.png')} 
            style={styles.levelStar} 
          />
        ))}
      </View>
    );
  };

  return (
    <ImageBackground
      source={moduleInfo[module].background}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={require('../assets/back_icon.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>{moduleInfo[module].title}</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.levelsContainer}>
          {levels.map((level) => {
            const isLocked = level.locked && calculateStars(progress[module][`level${level.id - 1}`] || 0) < 2;
            
            return (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelCard,
                  { backgroundColor: isLocked ? '#ccc' : '#fff' }
                ]}
                onPress={() => {
                  if (!isLocked) {
                    navigation.navigate(
                      module.charAt(0).toUpperCase() + module.slice(1),
                      { level: level.id }
                    );
                  }
                }}
                disabled={isLocked}
              >
                <View style={styles.levelHeader}>
                  <View style={[styles.levelBadge, { backgroundColor: moduleInfo[module].color }]}>
                    <Text style={styles.levelNumber}>{level.id}</Text>
                  </View>
                  <Text style={styles.levelTitle}>{level.title}</Text>
                </View>
                
                <Text style={styles.levelDescription}>{level.description}</Text>
                
                {isLocked ? (
                  <View style={styles.lockedContainer}>
                    <Image source={require('../assets/lock_icon.png')} style={styles.lockIcon} />
                    <Text style={styles.lockedText}>Complete previous level</Text>
                  </View>
                ) : (
                  renderStars(level.id)
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  placeholder: {
    width: 44,
  },
  levelsContainer: {
    flex: 1,
    padding: 15,
  },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  levelNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  levelStar: {
    width: 24,
    height: 24,
    marginHorizontal: 2,
  },
  lockedContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  lockIcon: {
    width: 18,
    height: 18,
    marginRight: 5,
  },
  lockedText: {
    fontSize: 14,
    color: '#999',
  },
});

export default LevelSelectScreen;