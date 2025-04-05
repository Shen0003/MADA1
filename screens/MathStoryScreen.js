import React, { useState, useEffect } from "react";
import * as GoogleGenerativeAI from "@google/generative-ai";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import * as Speech from "expo-speech";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SoundPlayer from "react-native-sound-player";
import Icon from "../ui/Icon";


const SYSTEM_INSTRUCTION = `
You are a friendly and fun math tutor for 5-year-old children. Your job is to create engaging and simple math story problems that follow these rules:

1. Use only numbers between 1 and 10.
2. Focus on simple addition and subtraction.
3. Use familiar, fun, and relatable objects like animals, toys, food, and friends.
4. Keep sentences very short and easy to understand.
5. Ensure the story is interactive and engaging.
6. Each problem should have exactly **three sentences**.
7. **Do not** provide the answer.
8. The problem should feel like part of a story rather than a direct math question.
`;

const MathStoryScreen = ({ navigation }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isNextMessage, setIsNextMessage] = useState(false);

  const API_KEY = "AIzaSyCXw6LbdoLmlzfu31AnYg-eaWJn6XkrMek";

  useEffect(() => {
    generateNewProblem();
    SoundPlayer.setVolume(0.6);
  }, []);

  const generateNewProblem = async () => {
    setLoading(true);
    setIsNextMessage(false);
    try {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const prompt = `
      Create a fun and simple math story problem for a 5-year-old. 
      Make it about **addition or subtraction** and follow these rules:

      - Use only numbers from 1 to 10.
      - Use familiar things like animals, toys, or snacks.
      - Keep it short (exactly three sentences).
      - Do **not** give the answer.

      Example: 
      "Bobby has 3 red balloons. His friend gives him 2 more. How many balloons does Bobby have now?"
      `;
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      setCurrentMessage(text);
    } catch (error) {
      console.error("Error generating problem:", error);
      showMessage({
        message: "Oops!",
        description: "We couldn't create a new problem. Let's try again!",
        type: "danger",
      });
    } finally {
      setLoading(false);
      setUserInput("");
    }
  };

  const checkAnswer = async () => {
    if (!userInput.trim()) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const prompt = `
      The math story problem was: "${currentMessage}"  
      The child answered: "${userInput}".  

      Please check if the answer is correct and give a short, **friendly, and encouraging** response.  
      Do **not** say the correct answer. Instead, use phrases like "Great job!" or "Try again, you are so close!".
      `;
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      setCurrentMessage(responseText);
    } catch (error) {
      console.error("Error checking answer:", error);
      showMessage({
        message: "Oops!",
        description: "We couldn't check your answer. Let's try again!",
        type: "danger",
      });
    } finally {
      setLoading(false);
      setUserInput("");
      setIsNextMessage(true);
    }
  };

  const speakText = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else if (currentMessage) {
      Speech.speak(currentMessage, {
        rate: 2.5,
        volume: 1.0,
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onStart: () => setIsSpeaking(true),
      });
    }
  };

  const renderNumpadButton = (number) => (
    <TouchableOpacity
      style={styles.numpadButton}
      onPress={() => setUserInput((prev) => prev + number.toString())}
    >
      <Text style={styles.numpadButtonText}>{number}</Text>
    </TouchableOpacity>
  );

  const renderNumpad = 
      <View>
        <Text style={styles.inputLabel}>Your Answer:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your answer..."
            onChangeText={setUserInput}
            value={userInput}
            style={styles.input}
            maxLength={2}
            editable={false}
          />
          <TouchableOpacity
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <TouchableOpacity
                style={[styles.speechButton, styles.speakButton]}
                onPress={speakText}
              >
                <FontAwesome 
                  name={isSpeaking ? "pause" : "volume-up"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.numpad}>
          <View style={styles.numpadRow}>
            {renderNumpadButton(1)}
            {renderNumpadButton(2)}
            {renderNumpadButton(3)}
          </View>
          <View style={styles.numpadRow}>
            {renderNumpadButton(4)}
            {renderNumpadButton(5)}
            {renderNumpadButton(6)}
          </View>
          <View style={styles.numpadRow}>
            {renderNumpadButton(7)}
            {renderNumpadButton(8)}
            {renderNumpadButton(9)}
          </View>
          <View style={styles.numpadRow}>
            <TouchableOpacity
              style={styles.numpadButton}
              onPress={() => setUserInput("")}
            >
              <Text style={styles.numpadButtonText}>Clear</Text>
            </TouchableOpacity>
            {renderNumpadButton(0)}
            <TouchableOpacity
              style={[styles.numpadButton, styles.submitNumpadButton]}
              onPress={checkAnswer}
            >
              <Text style={[styles.numpadButtonText, { color: "#fff" }]}>
                ✓
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


  const renderNextButton =
      <TouchableOpacity
        style={styles.nextButton}
        onPress={generateNewProblem}
      >
        <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
      </TouchableOpacity>


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Math Story</Text>
        <TouchableOpacity
          style={styles.newProblemButton}
          onPress={generateNewProblem}
        >
          <Text style={styles.newProblemButtonText}>New Problem</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.problemSection}>
        <View style={styles.problemTextContainer}>
          <Text style={styles.problemText}>
            {loading ? "Thinking..." : currentMessage}
          </Text>

        </View>
      </View>

      <View style={styles.inputSection}>
        {isNextMessage ? renderNextButton : renderNumpad }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FFF7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#5B8E7D",
    padding: 15,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  newProblemButton: {
    backgroundColor: "#F4A259",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newProblemButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  problemSection: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  problemContainer: {
    backgroundColor: "#E6F3F0",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#E6F3F0",
    marginHorizontal: 5,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  speakButton: {
    backgroundColor: "#F4A259",
    width: 50,
    height: 50,
  },
  problemTextContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
  },
  problemText: {
    fontSize: 20,
    color: "#333333",
    lineHeight: 28,
  },
  inputSection: {
    backgroundColor: "#E6F3F0",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5B8E7D",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 12,
    fontSize: 20,
    marginRight: 10,
    color: "#333333",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#5B8E7D",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    backgroundColor: "#F4A259",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
  },
  numpad: {
    marginTop: 15,
  },
  numpadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  numpadButton: {
    backgroundColor: "#FFFFFF",
    width: "30%",
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  submitNumpadButton: {
    backgroundColor: "#5B8E7D",
  },
  numpadButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
});

export default MathStoryScreen;