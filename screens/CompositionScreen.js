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

const CompositionScreen = ({ navigation }) => {
  const { updateProgressScore } = useContext(AppContext);
  const [level, setLevel] = useState(1);
  const [targetNumber, setTargetNumber] = useState(0);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [answeredWrong, setAnsweredWrong] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const [bubbleAnimation] = useState(new Animated.Value(0));
  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const wrongAnswers = 3;
  
  // Generate numbers based on level
  function generateNumbers(newLevel) {
    let target, correctFirst, correctSecond, incorrectFirst, incorrectSecond;
    
    switch(newLevel) {
      case 1: // Single-digit numbers (sum up to 10)
        target = Math.floor(Math.random() * 9) + 5; // Ensure target is at least 5
        
        // Correct option
        correctFirst = Math.floor(Math.random() * (target - 1)) + 1;
        correctSecond = target - correctFirst;
        
        // Incorrect option
        do {
          incorrectFirst = Math.floor(Math.random() * (target + 3)) + 1;
          incorrectSecond = Math.floor(Math.random() * (target + 3)) + 1;
        } while (
          incorrectFirst + incorrectSecond === target || 
          incorrectFirst === correctFirst || 
          incorrectSecond === correctSecond
        );
        break;
      
      case 2: // Numbers up to 20
        target = Math.floor(Math.random() * 15) + 10; // Targets between 10-25
        
        // Correct option
        correctFirst = Math.floor(Math.random() * (target - 2)) + 1;
        correctSecond = target - correctFirst;
        
        // Incorrect option
        do {
          incorrectFirst = Math.floor(Math.random() * (target + 5)) + 1;
          incorrectSecond = Math.floor(Math.random() * (target + 5)) + 1;
        } while (
          incorrectFirst + incorrectSecond === target || 
          incorrectFirst === correctFirst || 
          incorrectSecond === correctSecond
        );
        break;
      
      case 3: // More challenging combinations
        target = Math.floor(Math.random() * 20) + 15; // Targets between 15-35
        
        // Correct option
        correctFirst = Math.floor(Math.random() * (target - 3)) + 1;
        correctSecond = target - correctFirst;
        
        // Incorrect option
        do {
          incorrectFirst = Math.floor(Math.random() * (target + 7)) + 1;
          incorrectSecond = Math.floor(Math.random() * (target + 7)) + 1;
        } while (
          incorrectFirst + incorrectSecond === target || 
          incorrectFirst === correctFirst || 
          incorrectSecond === correctSecond
        );
        break;
      
      default:
        target = Math.floor(Math.random() * 10) + 5;
        correctFirst = Math.floor(Math.random() * (target - 1)) + 1;
        correctSecond = target - correctFirst;
        
        // Incorrect option
        do {
          incorrectFirst = Math.floor(Math.random() * (target + 3)) + 1;
          incorrectSecond = Math.floor(Math.random() * (target + 3)) + 1;
        } while (incorrectFirst + incorrectSecond === target);
    }
    
    // Randomize the order of correct and incorrect options
    const options = [
      { 
        first: correctFirst, 
        second: correctSecond, 
        isCorrect: true 
      },
      { 
        first: incorrectFirst, 
        second: incorrectSecond, 
        isCorrect: false 
      }
    ];
    
    // Shuffle the options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    setTargetNumber(target);
    setOptions(options);
  }
  

  const handleAnswer = (first, second, isCorrect) => {
    setShowBar(true);
    let newQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newQuestionsAnswered);
    
    // Play animation
    setIsCorrect(isCorrect);
    Animated.timing(bubbleAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      // Reset animation
      bubbleAnimation.setValue(0);
      
      let newScore = score;
      let newAnsweredWrong = answeredWrong;
      
      if (isCorrect) {
        newScore += 1;
        setScore(newScore);
      } else {
        newAnsweredWrong += 1;
        setAnsweredWrong(newAnsweredWrong);
      }
  
      // Determine new level
      let newLevel = level;
      if (newQuestionsAnswered >= 20) { // Change level at exactly 20 tries
        newLevel = 3;
      } 
      if (newQuestionsAnswered >= 10) { // Change level at exactly 10 tries
        newLevel = 2;
      } else {
        newLevel = 1;
      }
      
      setLevel(newLevel);
      
      // Check if game is over
      if (newAnsweredWrong >= wrongAnswers) {
        updateProgressScore('composition', score);
        
        Alert.alert(
          'Game Over!',
          `Your score: ${score}`,
          [
            { 
              text: 'Try Again', 
              onPress: () => resetGame() 
            },
            { 
              text: 'Home', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        // Generate new numbers for next question
        setTimeout(() => {
          setIsCorrect(null);
          generateNumbers(newLevel);
          setShowBar(false);
        }, 500);
      }
    });
  };
  

  // Initialize the game
  useEffect(() => {
    generateNumbers(1);
  }, []);
  

  
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
    setShowBar(false);
  };

  // Initialize the game with countdown
  useEffect(() => {
    if (gameStarted) return; // this skip this effect if game has already started

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
    
    return () => clearInterval(countdownInterval);
  }, [gameStarted]);

  // Bubble animation
  const bubbleScale = bubbleAnimation.interpolate({
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
            <Icon name="star" size={24} color="#f8b400" />
          </View>
        </View>
        
        <View style={styles.countdownContainer}>
          <Image 
            source={require('../assets/composition_icon.png')} 
            style={styles.symbolImage} 
          />
          <Text style={styles.countdownText}>Get Ready!</Text>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownInstructions}>
            You will need to combine two numbers to match the target!
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
          <Icon name="star" size={24} color="#f8b400" />
        </View>
      </View>
      
      <View style={styles.questionContainer}>
        <View style={styles.questionTextContainer}>
          <Image 
            source={require('../assets/composition_icon.png')} 
            style={styles.symbolImage} 
          />
          <Text style={styles.questionText}>
            Make the number
          </Text>
        </View>
        
        <View style={styles.targetContainer}>
          <Text style={styles.targetNumberText}>{targetNumber}</Text>
        </View>
        
        <View style={styles.numbersContainer}>
          {options.map((numSet, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.numberButton,
                isCorrect === true && numSet.isCorrect 
                  ? styles.correctButton 
                  : null,
                isCorrect === false && !numSet.isCorrect 
                  ? styles.incorrectButton 
                  : null
              ]}
              onPress={() => handleAnswer(numSet.first, numSet.second, numSet.isCorrect)}
              disabled={isCorrect !== null}
            >
              <Animated.View 
                style={[
                  styles.numberBubble,
                  { transform: [{ scale: bubbleScale }] }
                ]}
              >
                <Text style={styles.numberText}>{numSet.first}</Text>
                <Text style={styles.plusText}>and</Text>
                <Text style={styles.numberText}>{numSet.second}</Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            Combine the two numbers to match the target!
          </Text>
          <Icon name="bulb" size={24} color="brown" />
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: showBar ? 'brown' : '#eee' }]}></View>
        <Text style={styles.progressText}>
          {questionsAnswered} Questions Answered!
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Most styles are similar to the Comparison Screen
  // with some modifications specific to Composition Screen
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
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'brown',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'brown',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  starIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  questionTextContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  targetNumberText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#ff9500',
    marginRight: 15,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  numberButton: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 75,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  numberBubble: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  numberText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  plusText: {
    fontSize: 20,
    color: 'brown',
    marginVertical: 5,
  },
  correctButton: {
    backgroundColor: '#7fd67f',
  },
  incorrectButton: {
    backgroundColor: '#ff7f7f',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(186, 41, 15, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  hintText: {
    fontSize: 16,
    color: 'brown',
    marginRight: 10,
  },
  symbolImage: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  progressContainer: {
    padding: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'brown',
    borderRadius: 5,
    marginBottom: 5,
    overflow: 'hidden',
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
    color: 'brown',
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

export default CompositionScreen;