

// components/onboarding/questions/MultipleChoiceQuestion.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { AssessmentQuestion } from '@/types/user/onboardModel';

interface MultipleChoiceQuestionProps {
  question: AssessmentQuestion;
  value: string | null;
  onChange: (value: string) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ 
  question, 
  value, 
  onChange 
}) => {
  return (
    <View style={styles.container}>
      {question.options?.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            value === option ? styles.selectedOption : null
          ]}
          onPress={() => onChange(option)}
          activeOpacity={0.7}
        >
          <View style={styles.radioContainer}>
            <View 
              style={[
                styles.radioOuter,
                value === option ? styles.radioOuterSelected : null
              ]}
            >
              {value === option && <View style={styles.radioInner} />}
            </View>
          </View>
          <ThemedText style={styles.optionText}>{option}</ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#007AFF',
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
});

export default MultipleChoiceQuestion;