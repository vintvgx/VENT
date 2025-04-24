// components/onboarding/questions/TextQuestion.tsx
import { AssessmentQuestion } from '@/types/user/onboardModel';
import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';

interface TextQuestionProps {
  question: AssessmentQuestion;
  value: string | null;
  onChange: (value: string) => void;
}

const TextQuestion: React.FC<TextQuestionProps> = ({ question, value, onChange }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={value || ''}
        onChangeText={onChange}
        placeholder="Enter your answer here..."
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
        accessibilityLabel={`Answer field for question: ${question.question}`}
       maxLength={500}
       returnKeyType="done"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: 'white',
  },
});

export default TextQuestion;