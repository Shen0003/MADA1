import React, { useContext, useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated,
  Dimensions,
  ImageBackground,
  ScrollView, 
  AppState,
} from 'react-native';
import SoundPlayer from 'react-native-sound-player';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import Icon from '../ui/Icon';


const HomeScreen = ({ navigation }) => {
  const { playerName, progressScore } = useContext(AppContext);
  const [bounce] = useState(new Animated.Value(0));
  const appState = useRef(AppState.currentState);
  const soundInitialized = useRef(false);
  
  // Initialize and play background music
  const playBackgroundMusic = () => {
    try {
      if (!soundInitialized.current) {
        SoundPlayer.loadAsset(require('../assets/bgm.mp3'));
        SoundPlayer.setVolume(1);
        SoundPlayer.setNumberOfLoops(-1); // Loop infinitely
        soundInitialized.current = true;
      }
      
      // Play the sound
      SoundPlayer.play();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  // Animation for module buttons
  useEffect(() => {
    playBackgroundMusic();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start();

    // sound event listeners
    const onFinishedLoadingSubscription = SoundPlayer.addEventListener('FinishedLoading', () => {
      console.log('Sound loaded successfully');
    });
    
    const onFinishedPlayingSubscription = SoundPlayer.addEventListener('FinishedPlaying', () => {
      console.log('Sound finished playing');
      playBackgroundMusic(); // Restart the sound if it finishes playing
    });
    
    const onFinishedLoadingFileSubscription = SoundPlayer.addEventListener('FinishedLoadingFile', () => {
      console.log('File loaded successfully');
    });
    
    const onFinishedLoadingURLSubscription = SoundPlayer.addEventListener('FinishedLoadingURL', () => {
      console.log('URL loaded successfully');
    });

    // AppState listener
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App has gone to background, pause music
        try {
          SoundPlayer.pause();
        } catch (error) {
          console.log('Error pausing sound:', error);
        }
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground, resume music
        try {
          SoundPlayer.resume();
        } catch (error) {
          console.log('Error resuming sound:', error);
          // Try playing again if resuming fails
          playBackgroundMusic();
        }
      }
      
      appState.current = nextAppState;
    });
    
    // Cleanup function
    return () => {
      try {
        SoundPlayer.stop();
        onFinishedLoadingSubscription.remove();
        onFinishedPlayingSubscription.remove();
        onFinishedLoadingFileSubscription.remove();
        onFinishedLoadingURLSubscription.remove();
        appStateSubscription.remove();
      } catch (error) {
        console.log('Error in cleanup:', error);
      }
    };
  }, []);

  const translateY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });

  return (
    <ImageBackground 
    source={require("../assets/home_bg.png")}
    style={styles.backgroundImage}>
      <SafeAreaView style={styles.container}>
          <View style={styles.topContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Mathdu</Text>
                <View style={styles.starContainer}>
                  <Icon name="star" size={24} color="#f8b400" />
                  <Text style={styles.starCount}>{progressScore['comparison'] + progressScore['ordering'] + progressScore['composition']}</Text>
                </View>
            </View>
            <View style={styles.greeting}>
                <Text style={styles.greetingText}>
                {playerName ? `Hello, ${playerName}!` : 'Hello, Explorer!'}
                </Text>
                <Text style={styles.subtitle}>Choose your adventure:</Text>
            </View>
          </View>
          <ScrollView>
            <View style={styles.modulesContainer}>
                <Animated.View style={[{transform: [{translateY}]}]}>
                  <TouchableOpacity 
                      style={[styles.moduleButton, styles.comparisonButton]}
                      onPress={() => navigation.navigate('Comparison')}
                  >
                    <Image source={require('../assets/comparison_icon.png')} style={styles.moduleIcon} />
                    <Text style={styles.moduleText}>Compare Numbers</Text>
                    <Text style={styles.moduleDesc}>Greater than or less than?</Text>
                    <View style={styles.starContainer}>
                      <Icon name="star" size={24} color="#f8b400" />
                      <Text style={styles.starCount}>{progressScore['comparison']}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
                
                <Animated.View style={[{transform: [{translateY: translateY}]}]}>
                  <TouchableOpacity 
                      style={[styles.moduleButton, styles.orderingButton]}
                      onPress={() => navigation.navigate('Ordering')}
                  >
                    <Image source={require('../assets/ordering_icon.png')} style={styles.moduleIcon} />
                    <Text style={styles.moduleText}>Order Numbers</Text>
                    <Text style={styles.moduleDesc}>Put numbers in order</Text>
                    <View style={styles.starContainer}>
                      <Icon name="star" size={24} color="#f8b400" />
                      <Text style={styles.starCount}>{progressScore['ordering']}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
                
                <Animated.View style={[{transform: [{translateY}]}]}>
                  <TouchableOpacity 
                      style={[styles.moduleButton, styles.compositionButton]}
                      onPress={() => navigation.navigate('Composition')}
                  >
                    <Image source={require('../assets/composition_icon.png')} style={styles.moduleIcon} />
                    <Text style={styles.moduleText}>Compose Numbers</Text>
                    <Text style={styles.moduleDesc}>Find parts that make a whole</Text>
                    <View style={styles.starContainer}>
                      <Icon name="star" size={24} color="#f8b400" />
                      <Text style={styles.starCount}>{progressScore['composition']}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[{transform: [{translateY}]}]}>
                  <TouchableOpacity 
                      style={[styles.moduleButton, styles.mathStoryButton]}
                      onPress={() => navigation.navigate('MathStory')}
                  >
                      <Image source={require('../assets/math_story_icon.png')} style={styles.moduleIcon} />
                      <Text style={styles.moduleText}>Math Story</Text>
                      <Text style={styles.moduleDesc}>Solve some interesting math</Text>
                  </TouchableOpacity>
                </Animated.View>
            </View>
          </ScrollView>
          
          <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
          >
              <Icon name="settings" size={24} color="#333" />
          </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  topContainer: {
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    borderColor: 'black',
    borderWidth: 10,
    padding: 20,
    paddingTop: 30,
    marginBottom: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
    gap: 10,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5b3e90',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginTop: 2
  },
  starIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  starCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8b400',
  },
  greeting: {
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  modulesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 30,
  },
  moduleButton: {
    width: Dimensions.get('window').width - 60,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  comparisonButton: {
    backgroundColor: '#7a5cf0',
  },
  orderingButton: {
    backgroundColor: '#f06292',
  },
  compositionButton: {
    backgroundColor: 'brown',
  },
  mathStoryButton: {
    backgroundColor: '#5B8E7D',
  },
  moduleIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 30,
  },
  moduleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  moduleDesc: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 5,
  },
  settingsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  settingsIcon: {
    width: 30,
    height: 30,
  },
});

export default HomeScreen;