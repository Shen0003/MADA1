// screens/CompositionScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../context/AppContext';

const CompositionScreen = ({ navigation, route }) => {
  const { level = 1 } = route.params;
  const { updateProgress, awardStars, soundEnabled } = useContext(AppContext);
  
  // Game state
  const [targetNumber, setTargetNumber] = useState(0);
  const [numberOptions, setNumberOptions] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [isCorrect, setIsCorrect] = useState(null);
  const [foundCombinations, setFoundCombinations] = useState([]);
  const [requiredCombinations, setRequiredCombinations] = useState(2);
  const [bubbleAnimations, setBubbleAnimations] = useState([]);
  
  // Generate a new question
  const generateQuestion = () => {
    let target, options, combinations;
    
    switch(level) {
      case 1: // Basic addition pairs (up to 10)
        target = Math.floor(Math.random() * 8) + 3; // 3 to 10
        options = [];
        
        // Generate number options that can make the target
        for (let i = 1; i <= target - 1; i++) {
          options.push(i);
        }
        
        // Add a few random numbers that don't work
        for (let i = 0; i < 3; i++) {
          let extraNum;
          do {
            extraNum = Math.floor(Math.random() * 10) + 1;
          } while (extraNum >= target || options.includes(extraNum));
          options.push(extraNum);
        }
        
        // Random sort
        options.sort(() => Math.random() - 0.5);
        
        setRequiredCombinations(2);
        break;
        
      case 2: // Multiple combinations
        target = Math.floor(Math.random() * 10) + 6; // 6 to 15
        options = [];
        combinations = [];
        
        // Generate options to ensure multiple valid combinations
        for (let i = 1; i <= target - 1; i++) {
          if (i !== target - i) { // Avoid duplicates like [3,3] for target 6
            options.push(i);
            
            // Keep track of valid combinations
            if (i < target - i) {
              combinations.push([i, target - i]);
            }
          }
        }
        
        // Add a few random numbers that don't work
        for (let i = 0; i < 3; i++) {
          let extraNum;
          do {
            extraNum = Math.floor(Math.random() * 10) + 1;
            // Check that this number doesn't inadvertently create another valid pair
            const complement = target - extraNum;
            const createsValidPair = options.includes(complement);
          } while (extraNum >= target || options.includes(extraNum) || 
                  options.includes(target - extraNum));
          options.push(extraNum);
        }
        
        // Random sort
        options.sort(() => Math.random() - 0.5);
        
        // Set required combinations based on how many are possible
        setRequiredCombinations(Math.min(3, combinations.length));
        break;
        
      case 3: // Missing addend focus
        target = Math.floor(Math.random() * 15) + 6; // 6 to 20
        options = [];
        
        // Generate first numbers and their complements
        for (let i = 0; i < 4; i++) {
          const firstNum = Math.floor(Math.random() * (target - 1)) + 1;
          const complement = target - firstNum;
          
          // Ensure we don't have duplicates
          if (!options.includes(firstNum) && !options.includes(complement)) {
            options.push(firstNum);
            options.push(complement);
          }
        }
        
        // Add a few distractors
        for (let i = 0; i < 2; i++) {
          let extraNum;
          do {
            extraNum = Math.floor(Math.random() * 15) + 1;
          } while (options.includes(extraNum) || options.includes(target - extraNum));
          options.push(extraNum);
        }
        
        // Random sort
        options.sort(() => Math.random() - 0.5);
        
        setRequiredCombinations(3);
        break;
        
      default:
        target = Math.floor(Math.random() * 8) + 3;
        options = [];
        for (let i = 1; i <= target - 1; i++) {
          options.push(i);
        }
        options.sort(() => Math.random() - 0.5);
        setRequiredCombinations(2);
    }
    
    setTargetNumber(target);
    setNumberOptions(options);
    setSelectedNumbers([]);
    setFoundCombinations([]);
    setIsCorrect(null);
    
    // Set up animations for number bubbles
    const animations = options.map(() => new Animated.Value(0));
    
    // Start animation sequence for bubbles
    animations.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        })
      ]).start();
    });
    
    setBubbleAnimations(animations);
  };
  
  // Initialize the game
  useEffect(() => {
    generateQuestion();
  }, [level]);
  
  // Handle number selection
  const handleNumberSelect = (number) => {
    if (isCorrect !== null) return;
    
    // Add the number to selected numbers
    const newSelectedNumbers = [...selectedNumbers, number];
    setSelectedNumbers(newSelectedNumbers);
    
    // Check if sum equals target
    const sum = newSelectedNumbers.reduce((a, b) => a + b, 0);
    
    if (sum === targetNumber) {
      // Check if this combination was already found
      const sortedCombo = [...newSelectedNumbers].sort((a, b) => a - b);
      const comboKey = sortedCombo.join(',');
      
      if (!foundCombinations.find(combo => combo.key === comboKey)) {
        // Add to found combinations
        const newFoundCombinations = [
          ...foundCombinations, 
          { numbers: newSelectedNumbers, key: comboKey }
        ];
        setFoundCombinations(newFoundCombinations);
        
        // Play success sound if enabled
        if (soundEnabled) {
          // Play sound here
        }
        
        // Check if enough combinations found
        if (newFoundCombinations.length >= requiredCombinations) {
          setIsCorrect(true);
          setScore(prevScore => prevScore + 1);
          
          // Wait before proceeding
          setTimeout(() => {
            const newQuestionsAnswered = questionsAnswered + 1;
            setQuestionsAnswered(newQuestionsAnswered);
            
            // Check if game is over
            if (newQuestionsAnswered >= totalQuestions) {
              const percentage = Math.round((score + 1) / totalQuestions * 100);
              
              // Update progress
              updateProgress('composition', level, percentage);
              
              // Award stars based on performance
              let starsEarned = 0;
              if (percentage >= 90) starsEarned = 3;
              else if (percentage >= 70) starsEarned = 2;
              else if (percentage >= 50) starsEarned = 1;
              
              awardStars(starsEarned);
              
              // Show results
              Alert.alert(
                'Level Complete!',
                `You found ${score + 1} out of ${totalQuestions} number combinations!\n\nYou earned ${starsEarned} stars!`,
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
              // Next question
              generateQuestion();
            }
          }, 1500);
        }
      }
      
      // Reset selection regardless
      setSelectedNumbers([]);
    } else if (sum > targetNumber) {
      // Reset if sum exceeds target
      setSelectedNumbers([]);
    }
  };
  
  // Reset the game
  const resetGame = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setIsCorrect(null);
    generateQuestion();
  };
  
  // Handle the Next button
  const handleNext = () => {
    if (foundCombinations.length > 0) {
      // Skip to next question with partial credit
      const newQuestionsAnswered = questionsAnswered + 1;
      setQuestionsAnswered(newQuestionsAnswered);
      
      // If they found at least one combination, give half credit
      if (foundCombinations.length > 0 && foundCombinations.length < requiredCombinations) {
        setScore(prevScore => prevScore + 0.5);
      }
      
      // Check if game is over
      if (newQuestionsAnswered >= totalQuestions) {
        const percentage = Math.round(score / totalQuestions * 100);
        
        // Update progress
        updateProgress('composition', level, percentage);
        
        // Award stars based on performance
        let starsEarned = 0;
        if (percentage >= 90) starsEarned = 3;
        else if (percentage >= 70) starsEarned = 2;
        else if (percentage >= 50) starsEarned = 1;
        
        awardStars(starsEarned);
        
        // Show results
        Alert.alert(
          'Level Complete!',
          `You found ${Math.round(score)} out of ${totalQuestions} number combinations!\n\nYou earned ${starsEarned} stars!`,
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
        // Next question
        generateQuestion();
      }
    }
  };
  
  // Render animated number bubble
  const renderNumberBubble = ({ item, index }) => {
    const scale = bubbleAnimations[index]?.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1]
    });
    
    const opacity = bubbleAnimations[index]?.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });
    
    return (
      <Animated.View 
        style={[
          styles.numberBubble,
          { 
            transform: [{ scale: scale || 1 }],
            opacity: opacity || 1
          }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleNumberSelect(item)}
          style={styles.bubbleTouchable}
          disabled={selectedNumbers.includes(item) || isCorrect !== null}
        >
          <Text style={styles.numberBubbleText}>{item}</Text>
        </TouchableOpacity>
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
          <Image source={require('../assets/back_icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.levelTitle}>Level {level}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{totalQuestions}</Text>
        </View>
      </View>
      
      <View style={styles.questionContainer}>
        <View style={styles.targetContainer}>
          <Text style={styles.targetLabel}>Make this number:</Text>
          <View style={styles.targetNumberContainer}>
            <Text style={styles.targetNumber}>{targetNumber}</Text>
          </View>
          
          <View style={styles.combinationsContainer}>
            <Text style={styles.foundLabel}>
              Found: {foundCombinations.length}/{requiredCombinations}
            </Text>
            <View style={styles.combinations}>
              {foundCombinations.map((combo, index) => (
                <View key={index} style={styles.combinationItem}>
                  <Text style={styles.combinationText}>
                    {combo.numbers.join(' + ')} = {targetNumber}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionLabel}>Current selection:</Text>
          <View style={styles.selectionDisplay}>
            {selectedNumbers.length > 0 ? (
              <Text style={styles.selectionText}>
                {selectedNumbers.join(' + ')} 
                {selectedNumbers.reduce((a, b) => a + b, 0) <= targetNumber && 
                  ` = ${selectedNumbers.reduce((a, b) => a + b, 0)}`}
              </Text>
            ) : (
              <Text style={styles.selectionPlaceholder}>
                Select number bubbles below
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.bubblesContainer}>
          <FlatList
            data={numberOptions}
            renderItem={renderNumberBubble}
            keyExtractor={(item, index) => `bubble-${index}`}
            numColumns={4}
            contentContainerStyle={styles.bubbleList}
          />
        </View>
        
        {foundCombinations.length > 0 && foundCombinations.length < requiredCombinations && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              Next Number
            </Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            {level === 1 
              ? 'Find pairs of numbers that add up to the target number'
              : level === 2
                ? 'Find different combinations that make the target number'
                : 'Find the missing number to complete each sum'}
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
    color: '#4fc3f7',
  },
  scoreContainer: {
    backgroundColor: '#4fc3f7',
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
    padding: 20,
  },
  targetContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  targetLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  targetNumberContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4fc3f7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 20,
  },
  targetNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  combinationsContainer: {
    alignItems: 'center',
    width: '100%',
  },
  foundLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4fc3f7',
    marginBottom: 5,
  },
  combinations: {
    width: '100%',
  },
  combinationItem: {
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  combinationText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectionContainer: {
    marginBottom: 20,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  selectionDisplay: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 50,
    justifyContent: 'center',
  },
  selectionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  selectionPlaceholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bubblesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  bubbleList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  numberBubble: {
    margin: 8,
  },
  bubbleTouchable: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  numberBubbleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4fc3f7',
  },
  nextButton: {
    backgroundColor: '#4fc3f7',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 15,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintContainer: {
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  hintText: {
    fontSize: 14,
    color: '#4fc3f7',
    textAlign: 'center',
  },
  progressContainer: {
    padding: 20,
    paddingTop: 0,
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
    backgroundColor: '#4fc3f7',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default CompositionScreen;