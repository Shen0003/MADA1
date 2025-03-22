// screens/OrderingScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated,
  PanResponder,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';
import Icon from '../ui/Icon';

const { width } = Dimensions.get('window');
const NUMBER_ITEM_WIDTH = 60;
const NUMBER_ITEM_MARGIN = 5;

const OrderingScreen = ({ navigation, route }) => {
  const { level = 1 } = route.params;
  const { updateProgress, awardStars, soundEnabled } = useContext(AppContext);
  
  // Game state
  const [numbers, setNumbers] = useState([]);
  const [orderedNumbers, setOrderedNumbers] = useState([]);
  const [orderDirection, setOrderDirection] = useState('ascending');
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [animations, setAnimations] = useState([]);
  
  // Generate random numbers based on level
  const generateNumbers = () => {
    let numberSet = [];
    let count = 3;
    
    // Determine number count and range based on level
    switch(level) {
      case 1: // Simple sequences (3-5 single-digit numbers)
        count = Math.floor(Math.random() * 3) + 3; // 3 to 5 numbers
        for (let i = 0; i < count; i++) {
          let num;
          do {
            num = Math.floor(Math.random() * 9) + 1;
          } while (numberSet.includes(num));
          numberSet.push(num);
        }
        break;
        
      case 2: // Mixed sequences (single and double-digit numbers)
        count = Math.floor(Math.random() * 2) + 4; // 4 to 5 numbers
        for (let i = 0; i < count; i++) {
          let num;
          do {
            if (i < 2) {
              num = Math.floor(Math.random() * 9) + 1; // Single digit
            } else {
              num = Math.floor(Math.random() * 90) + 10; // Double digit
            }
          } while (numberSet.includes(num));
          numberSet.push(num);
        }
        break;
        
      case 3: // Reverse order (practice with both ascending and descending)
        count = Math.floor(Math.random() * 2) + 4; // 4 to 5 numbers
        for (let i = 0; i < count; i++) {
          let num;
          do {
            num = Math.floor(Math.random() * 50) + 1;
          } while (numberSet.includes(num));
          numberSet.push(num);
        }
        // Randomly choose ordering direction
        setOrderDirection(Math.random() < 0.5 ? 'ascending' : 'descending');
        break;
        
      default:
        count = 3;
        for (let i = 0; i < count; i++) {
          let num;
          do {
            num = Math.floor(Math.random() * 9) + 1;
          } while (numberSet.includes(num));
          numberSet.push(num);
        }
    }
    
    // Shuffle the array
    for (let i = numberSet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numberSet[i], numberSet[j]] = [numberSet[j], numberSet[i]];
    }
    
    setNumbers(numberSet);
    setOrderedNumbers([...numberSet]);
    
    // Initialize animations array
    const newAnimations = numberSet.map(() => new Animated.ValueXY());
    setAnimations(newAnimations);
  };
  
  // Initialize the game
  useEffect(() => {
    generateNumbers();
  }, [level]);
  
  // Create pan responders for draggable number items
  const createPanResponder = (index) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !submitted,
      onMoveShouldSetPanResponder: () => !submitted,
      onPanResponderGrant: () => {
        animations[index].setOffset({
          x: animations[index].x._value,
          y: animations[index].y._value
        });
        animations[index].setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: animations[index].x, dy: animations[index].y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        animations[index].flattenOffset();
        
        // Calculate positions for reordering
        const newOrder = [...orderedNumbers];
        const movingItem = newOrder[index];
        
        // Calculate the new position based on gesture
        const itemWidth = NUMBER_ITEM_WIDTH + NUMBER_ITEM_MARGIN * 2;
        const newPosition = Math.round(gesture.dx / itemWidth);
        
        let newIndex = index + newPosition;
        newIndex = Math.max(0, Math.min(newIndex, orderedNumbers.length - 1));
        
        if (newIndex !== index) {
          // Remove item from old position
          newOrder.splice(index, 1);
          // Insert at new position
          newOrder.splice(newIndex, 0, movingItem);
          
          // Update state
          setOrderedNumbers(newOrder);
          
          // Reset all animations
          animations.forEach(anim => anim.setValue({ x: 0, y: 0 }));
        } else {
          // Snap back to position
          Animated.spring(animations[index], {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false
          }).start();
        }
      }
    });
  };
  
  // Handle submission of answer
  const handleSubmit = () => {
    // Check if ordering is correct
    let correct = true;
    const sortedNumbers = [...numbers].sort((a, b) => 
      orderDirection === 'ascending' ? a - b : b - a
    );
    
    for (let i = 0; i < sortedNumbers.length; i++) {
      if (sortedNumbers[i] !== orderedNumbers[i]) {
        correct = false;
        break;
      }
    }
    
    setSubmitted(true);
    setIsCorrect(correct);
    
    // Update score
    if (correct) {
      setScore(prevScore => prevScore + 1);
    }
    
    // Wait before proceeding to next question or ending game
    setTimeout(() => {
      const newQuestionsAnswered = questionsAnswered + 1;
      setQuestionsAnswered(newQuestionsAnswered);
      
      // Check if game is over
      if (newQuestionsAnswered >= totalQuestions) {
        const finalScore = correct ? score + 1 : score;
        const percentage = Math.round((finalScore / totalQuestions) * 100);
        
        // Update progress
        updateProgress('ordering', level, percentage);
        
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
        setSubmitted(false);
        setIsCorrect(null);
        generateNumbers();
      }
    }, 1500);
  };
  
  // Reset the game
  const resetGame = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setSubmitted(false);
    setIsCorrect(null);
    generateNumbers();
  };
  
  // Render individual draggable number item
  const renderNumberItem = (number, index) => {
    const panResponder = createPanResponder(index);
    
    return (
      <Animated.View
        key={index}
        style={[
          styles.numberItem,
          {
            transform: [
              { translateX: animations[index]?.x || 0 },
              { translateY: animations[index]?.y || 0 }
            ]
          },
          submitted && {
            backgroundColor: isCorrect ? '#7fd67f' : '#ff7f7f'
          }
        ]}
        {...panResponder?.panHandlers}
      >
        <Text style={styles.numberItemText}>{number}</Text>
      </Animated.View>
    );
  };

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
          <Text style={styles.scoreText}>{score}/{totalQuestions}</Text>
        </View>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          Arrange the numbers in {orderDirection} order
        </Text>
        
        <View style={styles.directionsContainer}>
          <Image 
            source={
              orderDirection === 'ascending' 
                ? require('../assets/ascending_icon.png') 
                : require('../assets/descending_icon.png')
            } 
            style={styles.directionIcon} 
          />
          <Text style={styles.directionText}>
            {orderDirection === 'ascending' 
              ? 'Smallest to Largest' 
              : 'Largest to Smallest'}
          </Text>
        </View>
        
        <View style={styles.numbersContainer}>
          {orderedNumbers.map((number, index) => renderNumberItem(number, index))}
        </View>
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitted && { 
              backgroundColor: isCorrect ? '#7fd67f' : '#ff7f7f' 
            }
          ]}
          onPress={handleSubmit}
          disabled={submitted}
        >
          <Text style={styles.submitButtonText}>
            {submitted 
              ? (isCorrect ? 'Correct!' : 'Try Again!') 
              : 'Check Order'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            {orderDirection === 'ascending' 
              ? 'Tip: Drag to arrange from smallest to largest' 
              : 'Tip: Drag to arrange from largest to smallest'}
          </Text>
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
    color: '#f06292',
  },
  scoreContainer: {
    backgroundColor: '#f06292',
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
    marginBottom: 20,
  },
  directionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 98, 146, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 30,
  },
  directionIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  directionText: {
    fontSize: 16,
    color: '#f06292',
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  numberItem: {
    width: NUMBER_ITEM_WIDTH,
    height: NUMBER_ITEM_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    margin: NUMBER_ITEM_MARGIN,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  numberItemText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#f06292',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hintContainer: {
    backgroundColor: 'rgba(240, 98, 146, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  hintText: {
    fontSize: 16,
    color: '#f06292',
    textAlign: 'center',
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
    backgroundColor: '#f06292',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default OrderingScreen;