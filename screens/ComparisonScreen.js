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

const ComparisonScreen = ({ navigation, route }) => {
  const { level = 1 } = route.params;
  const { updateProgress, awardStars, soundEnabled } = useContext(AppContext);
  
  // Game state
  const [leftNumber, setLeftNumber] = useState(0);
  const [rightNumber, setRightNumber] = useState(0);
  const [targetRelation, setTargetRelation] = useState('greater'); // 'greater' or 'less'
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [isCorrect, setIsCorrect] = useState(null);
  const [alligatorDirection, setAlligatorDirection] = useState('right');
  const [alligatorAnimation] = useState(new Animated.Value(0));
  
  // Generate random numbers based on level
  const generateNumbers = () => {
    let left, right;
    
    switch(level) {
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
    generateNumbers();
  }, [level]);
  
  // Handle answer
  const handleAnswer = (answer) => {
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
      
      // Update score and question count
      if (correct) {
        setScore(prevScore => prevScore + 1);
      }
      
      const newQuestionsAnswered = questionsAnswered + 1;
      setQuestionsAnswered(newQuestionsAnswered);
      
      // Check if game is over
      if (newQuestionsAnswered >= totalQuestions) {
        const finalScore = correct ? score + 1 : score;
        const percentage = Math.round((finalScore / totalQuestions) * 100);
        
        // Update progress
        updateProgress('comparison', level, percentage);
        
        // Award stars based on performance
        let starsEarned = 0;
        if (percentage >= 90) starsEarned = 3;
        else if (percentage >= 70) starsEarned = 2;
        else if (percentage >= 50) starsEarned = 1;
        
        awardStars(starsEarned);
        
        // Show results
        Alert.alert(
          'Level Complete!',
          `You got ${finalScore} out of ${totalQuestions} correct!\n\nYou earned ${starsEarned} stars!`,
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
          generateNumbers();
        }, 500);
      }
    });
  };
  
  // Reset the game
  const resetGame = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setIsCorrect(null);
    generateNumbers();
  };
  
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={require('../assets/back_icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.levelTitle}>Level {level}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{totalQuestions}</Text>
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
              { width: `${(questionsAnswered / totalQuestions) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {questionsAnswered}/{totalQuestions} Questions
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
});

export default ComparisonScreen;