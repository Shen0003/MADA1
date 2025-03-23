// screens/ComparisonScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import Icon from '../ui/Icon';

const ComparisonScreen = ({ navigation, route }) => {
  const { updateProgressScore, awardStars, soundEnabled } = useContext(AppContext);
  
  // Game state
  const [level, setLevel] = useState(1);
  const [leftNumber, setLeftNumber] = useState(0);
  const [rightNumber, setRightNumber] = useState(0);
  const [targetRelation, setTargetRelation] = useState('greater'); // 'greater' or 'less'
  const [score, setScore] = useState(0);
  const [answeredWrong, setAnsweredWrong] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [alligatorDirection, setAlligatorDirection] = useState('right');
  const [alligatorAnimation] = useState(new Animated.Value(0));
  const [countdown, setCountdown] = useState(3); // Countdown from 3
  const [gameStarted, setGameStarted] = useState(false); // Track if game has started
  const wrongAnswers = 3;
  
  // Generate random numbers based on level
  function generateNumbers(newLevel) {
    let left, right;
    
    switch(newLevel) {
      case 1: // Single-digit numbers
        left = Math.floor(Math.random() * 9) + 1;
        right = Math.floor(Math.random() * 9) + 1;
        while (left === right) { // Ensure different numbers
          right = Math.floor(Math.random() * 9) + 1;
        }
        break;
      case 2: // Two-digit numbers
        left = Math.floor(Math.random() * 90) + 10;
        right = Math.floor(Math.random() * 90) + 10;
        while (left === right) {
          right = Math.floor(Math.random() * 90) + 10;
        }
        break;
      case 3: // Different place values
        if (Math.random() < 0.5) {
          left = Math.floor(Math.random() * 9) + 1;
          right = Math.floor(Math.random() * 90) + 10;
        } else {
          left = Math.floor(Math.random() * 90) + 10;
          right = Math.floor(Math.random() * 9) + 1;
        }
        break;
      default:
        left = Math.floor(Math.random() * 9) + 1;
        right = Math.floor(Math.random() * 9) + 1;
    }
    
    setLeftNumber(left);
    setRightNumber(right);
    
    // Randomly set the target relation
    setTargetRelation(Math.random() < 0.5 ? 'greater' : 'less');
  };
  

  // Initialize the game
  useEffect(() => {
    generateNumbers(1); // set level as 1 directly, because we dont want everytime level state changed, it call the generateNumbers function second time at here
  }, []); // only call this when initialise (include state initialisation too, that make state change)
  
  // Handle answer
  const handleAnswer = (answer) => {
    let newQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newQuestionsAnswered);
    let correct = false;
    
    if (targetRelation === 'greater') {
      if ((answer === 'left' && leftNumber > rightNumber) ||
          (answer === 'right' && rightNumber > leftNumber)) {
        correct = true;
      }
    } else { // 'less'
      if ((answer === 'left' && leftNumber < rightNumber) ||
          (answer === 'right' && rightNumber < leftNumber)) {
        correct = true;
      }
    }
    
    // Set animation direction
    const direction = (answer === 'left') ? 'left' : 'right';
    setAlligatorDirection(direction);
    
    // Play animation
    setIsCorrect(correct);
    Animated.timing(alligatorAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      // Reset animation
      alligatorAnimation.setValue(0);
      
      let newScore = score;
      let newAnsweredWrong = answeredWrong;
      // Update score and question count
      if (correct) {
        newScore += 1;
        setScore(newScore); // **will only change state value to NEW one after the whole handleAnswer function is executed!
      } else {
        newAnsweredWrong += 1;
        setAnsweredWrong(newAnsweredWrong); // **will only change state value to NEW one after the whole handleAnswer function is executed!
      }

      // Determine new level based on questions answered

      let newLevel = level;

      if (newQuestionsAnswered >= 3) {  // Change level at exactly 3 tries
        newLevel = 2;
      } else {
        newLevel = 1;
      }
      setLevel(newLevel);
      
      
      
      // Check if game is over
      if (newAnsweredWrong >= wrongAnswers) { // because state didnt update immediately, so use this manual for immediate check
        // Update progress
        updateProgressScore('comparison', score);
        
        // Show some alert or navigate to results screen
        Alert.alert(
          'Game Over!',
          `Your score: ${score}`,
          [
            { 
              text: 'Try Again', 
              onPress: () => resetGame() 
            },
            { 
              text: 'Level Select', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        // Generate new numbers for next question
        setTimeout(() => {
          setIsCorrect(null);
          generateNumbers(newLevel);
        }, 500);
      }
    });
  };
  
  // Reset the game
  const resetGame = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setAnsweredWrong(0);
    setLevel(1);
    setIsCorrect(null);
    generateNumbers(1);
    setGameStarted(false);
    setCountdown(3);
  };

  // Initialize the game with countdown
  useEffect(() => {
    // Start the countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval);
          setGameStarted(true);
          generateNumbers(1);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    // Cleanup interval if component unmounts
    return () => clearInterval(countdownInterval);
  }, []); // only call this when initializing



  // Animation interpolation for alligator
  const alligatorTranslateX = alligatorAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: 
      alligatorDirection === 'left' 
        ? [0, -50, 0] 
        : [0, 50, 0]
  });
  
  const alligatorScale = alligatorAnimation.interpolate({
    inputRange: [0, 0.2, 0.5, 0.8, 1],
    outputRange: [1, 1.2, 1.5, 1.2, 1]
  });

  // Render countdown or game based on gameStarted state
  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.levelTitle}>Level {level}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>
        
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>Get Ready!</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownInstructions}>
            You will need to pick the number that is correct!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
            <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.levelTitle}>Level {level}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          Which number is {targetRelation} than the other?
        </Text>
        
        <View style={styles.numbersContainer}>
          <TouchableOpacity
            style={[
              styles.numberButton,
              isCorrect === true && 
                ((targetRelation === 'greater' && leftNumber > rightNumber) || 
                 (targetRelation === 'less' && leftNumber < rightNumber)) 
                ? styles.correctButton : null,
              isCorrect === false && 
                ((targetRelation === 'greater' && leftNumber < rightNumber) || 
                 (targetRelation === 'less' && leftNumber > rightNumber))
                ? styles.incorrectButton : null
            ]}
            onPress={() => handleAnswer('left')}
            disabled={isCorrect !== null}
          >
            <Text style={styles.numberText}>{leftNumber}</Text>
          </TouchableOpacity>
          
          <Animated.View
            style={[
              styles.alligatorContainer,
              {
                transform: [
                  { translateX: alligatorTranslateX },
                  { scale: alligatorScale }
                ]
              }
            ]}
          >
            <Image 
              source={require('../assets/alligator.png')} 
              style={[
                styles.alligatorImage,
                { transform: [{ scaleX: targetRelation === 'greater' ? 1 : -1 }] }
              ]} 
            />
          </Animated.View>
          
          <TouchableOpacity
            style={[
              styles.numberButton,
              isCorrect === true && 
                ((targetRelation === 'greater' && rightNumber > leftNumber) || 
                 (targetRelation === 'less' && rightNumber < leftNumber)) 
                ? styles.correctButton : null,
              isCorrect === false && 
                ((targetRelation === 'greater' && rightNumber < leftNumber) || 
                 (targetRelation === 'less' && rightNumber > leftNumber))
                ? styles.incorrectButton : null
            ]}
            onPress={() => handleAnswer('right')}
            disabled={isCorrect !== null}
          >
            <Text style={styles.numberText}>{rightNumber}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            {targetRelation === 'greater' 
              ? 'Remember: The greater number is bigger!' 
              : 'Remember: The less number is smaller!'}
          </Text>
          <Image 
            source={
              targetRelation === 'greater' 
                ? require('../assets/greater_symbol.png') 
                : require('../assets/less_symbol.png')
            } 
            style={styles.symbolImage} 
          />
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min((questionsAnswered / 10) * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {questionsAnswered} Questions Answered!
        </Text>
      </View>
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
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7a5cf0',
  },
  scoreContainer: {
    backgroundColor: '#7a5cf0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  numberButton: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 60,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  numberText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  correctButton: {
    backgroundColor: '#7fd67f',
  },
  incorrectButton: {
    backgroundColor: '#ff7f7f',
  },
  alligatorContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  alligatorImage: {
    width: 80,
    height: 50,
    resizeMode: 'contain',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(122, 92, 240, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  hintText: {
    fontSize: 16,
    color: '#7a5cf0',
    marginRight: 10,
  },
  symbolImage: {
    width: 30,
    height: 30,
  },
  progressContainer: {
    padding: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7a5cf0',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  countdownText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7a5cf0',
    marginBottom: 20,
  },
  countdownNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#ff9500',
    marginBottom: 30,
  },
  countdownInstructions: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    maxWidth: '80%',
  },
});

export default ComparisonScreen;